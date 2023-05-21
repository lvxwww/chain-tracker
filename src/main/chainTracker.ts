/*
 * @LastEditors: lvxw lv81567395@vip.qq.com
 * @LastEditTime: 2023-05-20 18:32:12
 */
import Plugin from "./plugin";
import HASH_ROUTE, {
  PAGE_VIEW_SHOW,
  PAGE_VIEW_HIDE,
  CLICK,
  REQUEST,
  PERFORMANCE,
  ROUTE,
} from "../utils/actionType";
import { checkArray, checkUrl } from "../utils/checkType";
import { compareUrl, cleanUrl, checkProtocol } from "../utils/checkType";

interface TrackerParamsType {
  [propName: string]: any;
}

class ChainTracker {
  sendDataFn: () => {};
  chainList: Array<object>;
  constructor(params) {
    const { sendDataFn = () => {}, chainList = [] } = params || {};
    this.sendDataFn = sendDataFn;
    this.chainList = chainList;
    this.startPluginlistener();
  }
  //开始plugin的监听
  startPluginlistener() {
    const chainPlugin = new Plugin(this.handleListener.bind(this));
  }
  //监听捕获到事件
  handleListener(type, data) {
    this.traverseChainList(type, data);
  }
  //遍历chainList内的埋点
  traverseChainList(type, listenData) {
    if (checkArray(this.chainList)) {
      for (let _item of this.chainList) {
        const { pointList } = _item as TrackerParamsType;
        if (checkArray(pointList)) {
          for (let pointItem of pointList) {
            if (pointItem["type"] === type) {
              this.handleDivide(pointItem, listenData);
            }
          }
        }
      }
    }
  }

  //分别处理不同类事件
  handleDivide(pointItem, listenData) {
    const { type } = pointItem;
    switch (type) {
      case PAGE_VIEW_SHOW:
      case PAGE_VIEW_HIDE:
        this.handlePageView(pointItem);
        break;
      case CLICK:
        this.handleClick(pointItem, listenData);
        break;
      case REQUEST:
        this.handleRequest(pointItem, listenData);
        break;
      case PERFORMANCE:
        this.handlePerformance(pointItem, listenData);
        break;
      case ROUTE:
        this.handleRoute(pointItem, listenData);
        break;
      default:
        console.warn("设置的type不正确,请再次检查！！");
    }
  }

  //页面展示或者隐藏
  handlePageView(pointItem) {
    const { rule: { to = "", url = "" } = {}, handler } = pointItem;
    this.handleCallback(handler, pointItem?.rule, to || url);
  }

  //点击事件
  handleClick(pointItem, listenData) {
    const { rule: { selectors = "", url = "" } = {}, handler } = pointItem;
    const { selectorDOM } = listenData;
    if (!selectors) return console.warn("请设置selectors!!!");
    let isClick = false;
    //直接是原本节点上触发
    if (getDomById(selectors) === selectorDOM) {
      isClick = true;
    }
    //在子节点上触发
    const childNode: Array<any> = Array.from(getDomById(selectors).childNodes);
    const isChild = childNode.includes(selectorDOM);
    if (isChild) {
      isClick = true;
    }
    if (checkUrl(url) && isClick) {
      this.partial(handler, pointItem?.rule);
    }
  }

  //请求事件
  handleRequest(pointItem, listenData) {
    const { rule: { state = "", url = "" } = {}, handler } = pointItem;
    const { type: listenType, url: listenUrl } = listenData;
    if (state === listenType) {
      let flag = false;
      const new_listenUrl = cleanUrl(listenUrl);
      //传入配置,是绝对路径时
      if (checkProtocol(url)) {
        if (url === new_listenUrl) {
          flag = true;
        }
      } else {
        if (compareUrl(url, new_listenUrl)) {
          flag = true;
        }
      }
      if (flag) this.partial(handler, pointItem?.rule);
    }
  }

  //性能参数
  handlePerformance(pointItem, listenData) {
    const { rule: { url = "" } = {}, handler } = pointItem;
    const trackData = {
      ...pointItem?.rule,
      ...listenData,
    };
    this.handleCallback(handler, trackData, url);
  }

  //路由变化处理
  handleRoute(pointItem, listenData) {
    const { rule: { to = "", url = "" } = {}, handler } = pointItem;
    const { type } = listenData;
    let targetUrl = to || url;
    //hash模式
    if (type === HASH_ROUTE) {
      targetUrl = location.pathname + "#" + targetUrl;
    }
    this.handleCallback(handler, pointItem?.rule, targetUrl);
  }

  //函数 固定参数
  partial(fn, trackData) {
    return fn.call(this, trackData, this.sendDataFn);
  }

  // 检查url并 调用handler
  handleCallback(handler, listenData, url = "") {
    if (!handler) return console.warn("请设置handler函数！！！");
    if (checkUrl(url)) {
      this.partial(handler, listenData);
    }
  }
}

function getDomById(id) {
  return document.querySelector(`#${id}`);
}

export default ChainTracker;
