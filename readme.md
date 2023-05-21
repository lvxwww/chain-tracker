<!--
 * @LastEditors: lvxianwen
 * @LastEditTime: 2023-05-18 17:51:48
-->

## 下载

```sh
npm install lxw0v0-chain-tracker
```

## 示例

```js
//initChainTracker.js
import ChainTracker from "lxw0v0-chain-tracker";
import demoChain from "./demo-chain";

const initChainTracker = () => {
  new ChainTracker({
    sendDataFn: (trackerData) => {
      //发送给埋点系统
      tracksendxxxxxx(trackerData);
    },
    chainList: [demoChain],
  });
};

// demo-chain
import {AbstractChain,ActionType,RequestState} from'chain-tracker';

class DemoChain extends AbstractChain {
  constructor() {
    super();
    this.operationTime = 0;
    this.pointList = [
      {
        type: CLICK,
        rule: {
          selectors: "J-test-box",
          url: "",
        },
        handler: (trackData, sendDataFn) => {
          sendDataFn({
            event_name: "点击埋点", //自定义的埋点上报数据
            id:'J-test-box'
          });
        },
      },
      {
        type: PAGE_VIEW_SHOW,
        rule: {
          to:'/page1'
        },
        handler: (trackData, sendDataFn) => {
          sendDataFn({
            event_name:'page_show埋点'
            page:'/page1'
          });
        },
      },
      {
        type: REQUEST,
        rule: { url: "api", state: RequestState.Before },
        handler: (trackData, sendDataFn) => {
           console.log("请求前埋点");
           this.operationTime = Date.now();
        },
      },
      {
        type: REQUEST,
        rule: { url: "api", state: RequestState.After },
        handler: (trackData, sendDataFn) => {
           this.operationTime = Date.now() - this.operationTime;
           // api 花费的时间 this.operationTime
           sendDataFn({
            event_name:'api'
            operationTime:this.operationTime
           })
        },
      },
    ];
  }
}
```

## API

### ChainTracker

在初始化埋点时,实例化该类

#### ChainTracker 参数

##### sendDataFn

Type:`function`

可以用于接入不同业务埋点系统,可以自定义 chain 内使用

##### chainList

Type:`array`

自定义 chain 的实例组成的数组

### DIYChain

#### DIYChain 参数

##### type

Value: ActionType

##### rule

Type:`object`  
Value:

- url  
  Value: string|reg
  页面 url,传 string 时基于 pathname+hash 的完全匹配，也可传正则。

  **特殊注意 REQUEST 事件**  
  只支持传 string 相对路径（/api/getList) 或 绝对路径(https:xxx/api/getList)

- to (PAGE_VIEW_SHOW PAGE_VIEW_HIDE ROUTE 特有 )  
  Value: string|reg
  上一页面 url,规则和 url 相同。优先级高于 url

- selectors (CLICK 特有 且必传)  
  Value: 点击元素的 id

- state (REQUEST 特有)  
  Value:RequestState

##### handler

埋点触发时会执行函数

- 参数
  trackData  
   rule 的值+性能指标(PERFORMANCE 特有)
  sendDataFn  
   用于接入不同业务埋点系统

### 各种类型

#### 埋点类型 ActionType

```sh
  ClICK           //点击
  PAGE_VIEW_SHOW  //页面展示
  PAGE_VIEW_HIDE  //页面隐藏
  REQUEST         //请求
  ROUTE           //路由变化
  PERFORMANCE     //性能相关
```

#### 请求时机类型 RequestState

```sh
  Before    //请求前
  After     //请求后
  Error     //请求出错
```

## 目录

- rollup.config.js rollup 打包配置
- src/main
  - chainTracker 连接 plugin 和 chain
  - plugin 各类事件的劫持监听
  - chain chain 的父类
- utils 工具方法
