/*
 * @LastEditors: lvxw lv81567395@vip.qq.com
 * @LastEditTime: 2023-05-21 22:01:58
 */
import queryString from "query-string";

const ARRAY = "Array",
  REGEXP = "RegExp";

function getType(_v) {
  return Object.prototype.toString.call(_v).slice(8, -1);
}

function compareUrl(originUrl: string, newUrl: string) {
  return checkProtocol(originUrl) === checkProtocol(newUrl);
}

function checkProtocol(urlString: string) {
  if (
    urlString.indexOf("http://") === 0 ||
    urlString.indexOf("https://") === 0
  ) {
    return urlString;
  }
  return location.origin + urlString;
}

function checkArray(arr) {
  return getType(arr) === ARRAY && arr.length;
}

function checkReg(reg) {
  return getType(reg) === REGEXP;
}

function cleanUrl(url: string) {
  const newUrl = queryString.parseUrl(url) ? queryString.parseUrl(url).url : "";
  return newUrl;
}

//检查url是否目标
// url 为空 则全匹配
function checkUrl(url: any) {
  const currentUrl = location.pathname + location.hash;
  //如果是正则
  if (checkReg(url)) {
    return url.test(currentUrl);
  }
  return !url || url === currentUrl;
}

export { checkArray, checkReg, cleanUrl, compareUrl, checkUrl, checkProtocol };
