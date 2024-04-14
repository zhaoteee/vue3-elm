# 前言

[基于vue2-elm项目改造](https://github.com/bailicangdu/vue2-elm)

## 改造目的
  1. vue2升级vue3
  2. webpack版本从1.0版本升级为最新版本5.0以上
  3. 提升处理改造升级旧版项目流程的能力

## 升级流程
1. vue相关技术栈升级,安装新的相关依赖
  ```js
      "vue": "^2.1.0" => "^3.4.21",
      "vue-router": "^2.1.1" => "^4.0.0-0",
      "vuex": "^2.0.0" => "^4.0.0"
   ```
2. 使用新版vue3，到store文件夹,router文件夹,main.js对相关库使用方式升级
3. 安装新的打包依赖
  ```js
    "@vue/cli-service": "^5.0.0",
    "@vue/compiler-sfc": "^3.4.21",
    "sass": "^1.75.0",
    "sass-loader": "^14.2.0",
    "webpack": "^5.91.0"
   ```
4. 到`package.json`替换以下新的打包命令
  ```js
    "dev": "vue-cli-service serve",
    "build": "vue-cli-service build"
   ```
5. 新建 `vue.config.js` 文件配置目录别名alias
6. 后续需对各个页面进行vue3语法改造

