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
// @include      https://danmu.4dm.cc/m3u8.php*
// @include      http*://www.ntyou.*
// @include      https://www.dm233.*
// @include      https://www.olevod.com*
// @run-at       document-body
// @require      https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js
// @require      https://cdn.jsdelivr.net/npm/plyr@3.6.4/dist/plyr.min.js
// @require      https://cdn.jsdelivr.net/npm/hls.js@1.0.9/dist/hls.min.js
// @resource     plyrCSS https://cdn.jsdelivr.net/npm/plyr@3.6.4/dist/plyr.min.css
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @license      MIT
// ==/UserScript==

(function() {
    let plyrCSS = GM_getResourceText('plyrCSS')  
    GM_addStyle(plyrCSS)
})();
`
}
