/*
 * @LastEditors: lvxw lv81567395@vip.qq.com
 * @LastEditTime: 2023-05-21 23:13:01
 */
//解析外部引入的插件
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import serve from "rollup-plugin-serve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";
import alias from "@rollup/plugin-alias";
import eslint from "@rollup/plugin-eslint";
import rollupTypescript from "@rollup/plugin-typescript";

export default {
  input: "./src/index.ts",
  output: {
    file: "./lib/bundle.js",
    format: "es",
    name: "MyBundle",
    plugins: [terser()],
  },
  plugins: [
    resolve(),
    eslint({
      include: ["src/**"],
    }),
    //依赖
    commonjs({
      include: /node_modules/,
      requireReturnsDefault: "auto",
    }),
    //TS
    rollupTypescript(),
    alias({
      resolve: [".js", ".ts"],
    }),
    babel({ babelHelpers: "bundled" }),
    // serve({
    //   port: 3000,
    //   contentBase: "", // 表示起的服务是在根目录下
    //   openPage: "/index.html", // 打开的是哪个文件
    //   open: false, // 默认打开浏览器
    // }),

    json(),
  ],
};
