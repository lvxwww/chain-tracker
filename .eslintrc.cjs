/*
 * @LastEditors: lvxianwen
 * @LastEditTime: 2023-05-18 17:36:14
 */
module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 6, // 支持es6
    sourceType: "module", // 使用 es6 模块化
  },
  env: {
    // 设置环境
    browser: true, // 支持浏览器环境： 能够使用window上的全局变量
    node: true, // 支持服务器环境:  能够使用node上global的全局变量
  },
  extends: "eslint:recommended", // 使用 eslint 推荐的默认规则 https://cn.eslint.org/docs/rules/
  globals: {
    // 声明使用的全局变量, 这样即使没有定义也不会报错了
  },
  rules: {
    // eslint检查的规则  0 忽略 1 警告 2 错误
    "no-console": 0, // 不检查 console
    eqeqeq: 1, // 用 == 而不用 === 就警告
    "no-alert": 2, // 不能使用 alert
    "no-unused-vars": 0,
    "no-undef": 0,
    "no-unsafe-optional-chaining": 0,
  },
  parser: "@babel/eslint-parser",
};
