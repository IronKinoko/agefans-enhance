export function genUserScriptInfo(pkg) {
  return `// ==UserScript==
// @name         agefans Enhance
// @namespace    https://github.com/IronKinoko/agefans-enhance
// @version      ${pkg.version}
// @description  ${pkg.description}
// @author       IronKinoko
// @include      https://www.age.tv/*
// @include      https://www.agefans.*
// @include      https://www.agemys.*
// @include      http://www.yhdm.so/v/*
// @include      http://www.yinghuacd.com/v/*
// @include      https://www.yhdmp.cc/vp/*
// @include      http://www.imomoe.live/player/*
// @include      http://www.88dmw.com/*
// @run-at       document-body
// @require      https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js
// @require      https://cdn.jsdelivr.net/npm/plyr@3.6.4/dist/plyr.min.js
// @require      https://cdn.jsdelivr.net/npm/hls.js@1.0.9/dist/hls.min.js
// @grant        GM_getValue
// @grant        GM_setValue
// @license      MIT
// ==/UserScript==
`
}
