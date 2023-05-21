/*
 * @LastEditors: lvxw lv81567395@vip.qq.com
 * @LastEditTime: 2023-05-20 18:32:51
 */
import HASH_ROUTE, {
  PAGE_VIEW_SHOW,
  PAGE_VIEW_HIDE,
  CLICK,
  REQUEST,
  ROUTE,
  PERFORMANCE,
} from "../utils/actionType.js";
import RequestState from "../utils/requestState.js";
import { cleanUrl } from "../utils/checkType.js";

interface PluginParamsType {
  [propName: string]: any;
}

declare var window: any;

export default class Plugin {
  handleListener: (...PluginParamsType) => {};
  constructor(handleListener: (...PluginParamsType: any[]) => {}) {
    //chain的事件回调
    this.handleListener = handleListener;
    //开启点击事件监听
    this.listenEvent();
    //开启请求监听
    this.listenApi();
    //开启页面变化
    this.listenPage();
    //开启路由监听
    this.listenRoute();
    //绑定事件
    this.bindEvent();
  }
  listenEvent() {
    this.listenClick();
  }
  listenApi() {
    this.listenAjax();
    this.listenFetch();
  }
  listenPage() {
    //页面展示
    window.addEventListener("pageshow", (e: any) => {
      this.handleListener(PAGE_VIEW_SHOW, { type: "pageshow" });
    });

    //页面隐藏
    window.addEventListener(
      "pagehide",
      (event: any) => {
        this.handleListener(PAGE_VIEW_HIDE, { type: "pagehide" });
      },
      false
    );
  }
  listenRoute() {
    //hash模式
    window.addEventListener("hashchange", (e: PluginParamsType) => {
      this.handleListener(ROUTE, { type: HASH_ROUTE });
    });

    //History模式
    //常见的前进后退
    window.addEventListener("popstate", (e: PluginParamsType) => {
      this.handleListener(ROUTE, { type: "route" });
    });
    //history.push等
    // 重写history.pushState和history.replaceState
    history.pushState = produceState("pushState");
    history.replaceState = produceState("replaceState");

    function produceState(type: string) {
      const originState = history[type];
      return function () {
        const _func = originState.apply(this, arguments);
        //创建自定义事件
        const event = new Event(type);
        window.dispatchEvent(event);
        return _func;
      };
    }

    //自定义事件
    window.addEventListener("replaceState", (e: any) => {
      this.handleListener(ROUTE, { type: "route" });
    });
    window.addEventListener("pushState", (e: any) => {
      this.handleListener(ROUTE, { type: "route" });
    });
  }
  bindEvent() {
    window.addEventListener("load", () => {
      setTimeout(async () => {
        const performanceTime: object = await this.getPerformanceTime();
        this.handleListener(PERFORMANCE, {
          type: "pageshow",
          ...performanceTime,
        });
      }, 200);
    });
  }
  listenClick() {
    // 点击事件的监听
    window.addEventListener("click", (e: { target: { id: any } }) => {
      const { id } = e.target;
      this.handleListener(CLICK, { selectorDOM: e.target });
    });
  }
  //监听ajax
  listenAjax() {
    const that = this;
    const originXHR = window.XMLHttpRequest,
      xhrProto = window.XMLHttpRequest.prototype,
      originOpen = xhrProto.open;
    window.XMLHttpRequest = function () {
      const xhr = new originXHR();
      let _url: string, _handle: (arg0: string) => void;
      xhrProto.open = function (method: any, url: string) {
        _url = cleanUrl(url);
        _handle = partial.call(that, that.handleRequest, _url);
        return originOpen.apply(this, arguments);
      };
      xhr.addEventListener("loadstart", (target: any) => {
        _handle && _handle(RequestState.Before);
      });
      xhr.addEventListener("loadend", () => {
        _handle && _handle(RequestState.After);
      });
      xhr.addEventListener("error", () => {
        _handle && _handle(RequestState.Error);
      });
      return xhr;
    };
  }
  //监听fetch
  listenFetch() {
    const originFetch = window.fetch;
    const that = this;
    window.fetch = async function (...args: [any]) {
      //请求开始
      let res = "请求开始",
        err: any;
      const [url] = args;
      const _handle = partial.call(that, that.handleRequest, cleanUrl(url));
      _handle(RequestState.Before);
      const resp = await originFetch(...args)
        .then((response: string) => {
          _handle(RequestState.After);
          res = response;
        })
        .catch((err_msg: any) => {
          _handle(RequestState.Error);
          err = err_msg;
        });
      return new Promise((resolve, reject) => {
        if (res) {
          resolve(res);
        } else {
          reject(err);
        }
      });
    };
  }
  //获取页面性能参数指标
  getPerformanceTime(): object {
    return new Promise((resolve) => {
      let performanceTime = {
        FP: 0,
        FCP: 0,
        LCP: 0,
        HTTPTIME: 0,
        TTFB: 0,
      };
      if (window.performance) {
        // 获取FP,FCP
        const performancePaintEntries = performance.getEntriesByType("paint");
        performancePaintEntries.forEach((performanceEntry) => {
          const { name, startTime } = performanceEntry;
          if (name === "first-paint") {
            performanceTime["FP"] = startTime;
          }
          if (name === "first-contentful-paint") {
            performanceTime["FCP"] = startTime;
          }
        });
        // 获取TTFB,请求等时间
        const performanceNavigationEntries =
          performance.getEntriesByType("navigation");
        const { fetchStart, requestStart, responseStart, responseEnd } =
          performanceNavigationEntries[0] as PluginParamsType;
        performanceTime["HTTPTIME"] = responseEnd - requestStart;
        //首个字节到达时间
        performanceTime["TTFB"] = responseStart - fetchStart;

        // 获取LCP
        const LCP_TYPE = "largest-contentful-paint";
        const entryTypes: any = PerformanceObserver.supportedEntryTypes;
        if (entryTypes.includes(LCP_TYPE)) {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1]; // Use the latest LCP candidate
            performanceTime["LCP"] = lastEntry.startTime;
            resolve(performanceTime);
          });
          observer.observe({ type: LCP_TYPE, buffered: true });
        } else {
          resolve(performanceTime);
        }
      } else {
        resolve(void 0);
      }
    });
  }

  handleRequest(url: any, type: any) {
    this.handleListener(REQUEST, { type, url });
  }
}

function partial(fn: { apply: (arg0: any, arg1: any[]) => any }) {
  const args = [].slice.call(arguments, 1);
  const that = this;
  return function () {
    const newArgs = [...args, ...arguments];
    return fn.apply(that, newArgs);
  };
}
