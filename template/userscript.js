export function genUserScriptInfo(pkg) {
  return `// ==UserScript==
// @name         agefans Enhance
// @namespace    https://github.com/IronKinoko/agefans-enhance
// @icon         https://www.agemys.com/favicon.ico
// @version      ${pkg.version}
// @description  ${pkg.description}
// @author       IronKinoko
// @include      https://www.age.tv/*
// @include      https://www.agefans.*
// @include      https://www.agemys.*
// @include      *://*.yhdm.so/*
// @include      *://*.yinghuacd.com/*
// @include      https://www.yhdmp.cc/vp/*
// @include      http://www.imomoe.live/player/*
// @include      http://www.88dmw.com/*
// @include      https://new-ani.me/*
// @include      https://bangumi.online/*
// @include      https://danmu.4dm.cc/m3u8.php*
// @include      http*://www.ntyou.*
// @include      https://www.dm233.*
// @include      https://www.olevod.com*
// @run-at       document-body
// @require      https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js
// @require      https://cdn.jsdelivr.net/npm/plyr@3.6.4/dist/plyr.min.js
// @require      https://cdn.jsdelivr.net/npm/hls.js@1.0.9/dist/hls.min.js
// @require      https://cdn.jsdelivr.net/npm/@ironkinoko/danmaku@1.2.3/dist/danmaku.umd.min.js
// @resource     plyrCSS https://cdn.jsdelivr.net/npm/plyr@3.6.4/dist/plyr.min.css
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @connect      api.acplay.net
// @connect      chinacloudsites.cn
// @license      MIT
// ==/UserScript==

/**
 * 权限声明:
 * 1. GM_xmlhttpRequest
 *    脚本会请求有限的网络权限。仅用于访问弹幕查询功能需要链接到的 api.acplay.net 与 chinacloudsites.cn 第三方域名
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
`
}
