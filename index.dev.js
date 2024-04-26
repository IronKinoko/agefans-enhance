// ==UserScript==
// @name         agefans Enhance - Dev
// @namespace    https://github.com/IronKinoko/agefans-enhance
// @icon         https://www.agemys.com/favicon.ico
// @version      1.39.8
// @description  增强agefans播放功能，实现自动换集、无缝换集、画中画、历史记录、断点续播、弹幕等功能
// @author       IronKinoko
// @include      https://www.age.tv/*
// @include      https://www.agefans.*
// @include      https://www.agemys.*
// @include      https://www.agedm.*
// @include      https://bangumi.online/*
// @include      http*://www.ntdm9.*
// @include      http*://www.bimiacg1*.net*
// @include      https://www.acgnya.com/*
// @include      https://pro.ascepan.top/*
// @include      https://danmu.yhdmjx.com/*
// @include      https://*.sp-flv.com*
// @include      https://*43.240.74.134*
// @include      https://*43.240.156.118*
// @include      https://anime1.me/*
// @run-at       document-end
// @require      https://registry.npmmirror.com/jquery/3.6.0/files/dist/jquery.min.js
// @require      https://registry.npmmirror.com/plyr/3.6.4/files/dist/plyr.min.js
// @require      https://registry.npmmirror.com/hls.js/1.0.9/files/dist/hls.min.js
// @require      https://registry.npmmirror.com/@ironkinoko/danmaku/1.4.1/files/dist/danmaku.umd.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @connect      dandanplay.net
// @license      MIT
// @downloadURL  https://github.com/IronKinoko/agefans-enhance/raw/gh-pages/index.user.js
// @updateURL    https://github.com/IronKinoko/agefans-enhance/raw/gh-pages/index.user.js
// @require      file://C:\GitHub\agefans-enhance\dist\index.user.js
// ==/UserScript==

/**
 * 权限声明:
 * 1. GM_xmlhttpRequest
 *    脚本会请求有限的网络权限。仅用于访问弹幕查询功能需要链接到的 dandanplay.net 第三方域名
 *    你可以从 脚本编辑/设置/XHR安全 中管理网络权限
 *
 * 2. GM_getValue, GM_setValue
 *    脚本会使用本地存储功能，用于在不同页面间保存“播放器配置”与“agefans 历史浏览记录”。
 *
 * 3. @include
 *    脚本还匹配了 agefans 以外的一些链接，用于提供相同视频资源搜索功能
 */
