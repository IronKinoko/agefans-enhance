function genUserScriptInfo(pkg) {
  return `// ==UserScript==
// @name         agefans Enhance
// @namespace    https://github.com/IronKinoko/agefans-enhance
// @version      ${pkg.version}
// @description  ${pkg.description}
// @author       IronKinoko
// @match        https://www.agefans.net/*
// @match        https://www.agefans.net/play/*
// @match        https://www.agefans.net/detail/*
// @match        *.yhdm.so/v/*
// @resource     plyrCSS https://cdn.jsdelivr.net/npm/plyr@3.6.4/dist/plyr.min.css
// @require      https://cdn.jsdelivr.net/npm/jquery@1.12.4/dist/jquery.min.js
// @require      https://cdn.jsdelivr.net/npm/plyr@3.6.4/dist/plyr.min.js
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @license      MIT
// ==/UserScript==

(function() {
  'use strict';
  try {
    let plyrCSS = GM_getResourceText('plyrCSS')  
    GM_addStyle(plyrCSS)
  } catch(e) { /* empty */ }
})();

`
}

module.exports = {
  genUserScriptInfo,
}
