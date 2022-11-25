// ==UserScript==
// @name         agefans Enhance - Dev
// @namespace    https://github.com/IronKinoko/agefans-enhance
// @icon         https://www.agemys.com/favicon.ico
// @version      1.34.1
// @description  增强agefans播放功能，实现自动换集、无缝换集、画中画、历史记录、断点续播、弹幕等功能
// @author       IronKinoko
// @include      https://www.age.tv/*
// @include      https://www.agefans.*
// @include      https://www.agemys.*
// @include      http://www.yinghuacd.com/*
// @include      https://www.yhdmp.cc/vp/*
// @include      https://bangumi.online/*
// @include      http*://www.ntyou.*
// @include      https://www.dm233.*
// @include      https://www.bimiacg4.net*
// @include      https://omofun.tv/*
// @include      https://www.acgnya.com/*
// @include      https://pro.ascepan.top/*
// @include      https://danmu.yhdmjx.com/*
// @include      https://www.odcoc.com/*
// @run-at       document-body
// @require      https://unpkg.com/jquery@3.6.0/dist/jquery.min.js
// @require      https://unpkg.com/plyr@3.6.4/dist/plyr.min.js
// @require      https://unpkg.com/hls.js@1.0.9/dist/hls.min.js
// @require      https://unpkg.com/@ironkinoko/danmaku@1.4.1/dist/danmaku.umd.js
// @resource     plyrCSS https://unpkg.com/plyr@3.6.4/dist/plyr.css
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @connect      dandanplay.net
// @license      MIT
// @require      file://D:\Github\agefans-enhance\dist\index.user.js
// ==/UserScript==

/**
 * 权限声明:
 * 1. GM_xmlhttpRequest
 *    脚本会请求有限的网络权限。仅用于访问弹幕查询功能需要链接到的 dandanplay.net 第三方域名
 *    你可以从 脚本编辑/设置/XHR安全 中管理网络权限
 *
 * 2. GM_getResourceText, GM_addStyle
 *    获取播放器样式文件，用于播放器样式渲染
 *
 * 3. GM_getValue, GM_setValue
 *    脚本会使用本地存储功能，用于在不同页面间保存“播放器配置”与“agefans 历史浏览记录”。
 *
 * 4. @include
 *    脚本还匹配了 agefans 以外的一些链接，用于提供相同视频资源搜索功能
 */

(function() {
    let plyrCSS = GM_getResourceText('plyrCSS')  
    GM_addStyle(plyrCSS)
})();