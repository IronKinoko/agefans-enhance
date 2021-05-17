// ==UserScript==
// @name         agefans Enhance
// @namespace    https://github.com/IronKinoko/agefans-enhance
// @version      1.5.0
// @description  增强agefans播放功能，实现自动换集、无缝换集、画中画、历史记录、断点续播、显示视频源、获取当前页面全部视频等功能
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


/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 705:
/***/ ((module) => {


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names

module.exports = function (cssWithMappingToString) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item);

      if (item[2]) {
        return "@media ".concat(item[2], " {").concat(content, "}");
      }

      return content;
    }).join("");
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery, dedupe) {
    if (typeof modules === "string") {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, ""]];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var i = 0; i < this.length; i++) {
        // eslint-disable-next-line prefer-destructuring
        var id = this[i][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = [].concat(modules[_i]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (mediaQuery) {
        if (!item[2]) {
          item[2] = mediaQuery;
        } else {
          item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
        }
      }

      list.push(item);
    }
  };

  return list;
};

/***/ }),

/***/ 453:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(705);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__);
// Imports

var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default()(function(i){return i[1]});
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".agefans-wrapper #history{background:#202020;border:4px solid #303030}.agefans-wrapper #history .history-list{padding:16px;display:flex;flex-wrap:wrap}.agefans-wrapper #history .history-item{width:115px;display:inline-block;margin:4px}.agefans-wrapper #history .history-item img{width:100%;border-radius:2px}.agefans-wrapper #history .history-item .desc .title{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:14px;margin:4px 0}.agefans-wrapper #history .history-item .desc .position{font-size:14px}", ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 242:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(705);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__);
// Imports

var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default()(function(i){return i[1]});
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".agefans-wrapper .nav_button{cursor:pointer}", ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 90:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(705);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__);
// Imports

var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default()(function(i){return i[1]});
// Module
___CSS_LOADER_EXPORT___.push([module.id, "#k-player-wrapper{position:relative;width:100%;height:100%;background:#000}#k-player-wrapper.k-player-widescreen{position:fixed;left:0;top:0;z-index:100}#k-player-wrapper .k-player-contianer{width:100%;height:100%}#k-player-wrapper #k-player-loading,#k-player-wrapper #k-player-error{position:absolute;left:0;top:0;right:0;bottom:0;z-index:10;font-size:88px;color:#fff}#k-player-wrapper .k-player-center{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center}#k-player-wrapper .error-info{text-align:center;padding:24px;font-size:18px}#k-player-wrapper .plyr{width:100%;height:100%}#k-player-wrapper video{display:block}#k-player-wrapper .plyr__next svg{transform:scale(1.7)}#k-player-wrapper .plyr__widescreen svg{transform:scale(1.3)}#k-player-wrapper .plyr__fullscreen svg{transform:scale(1.3)}#k-player-wrapper .plyr--hide-cursor{cursor:none}#k-player-wrapper .plyr__control span{color:inherit}.lds-spinner{color:official;display:inline-block;position:relative;width:80px;height:80px}.lds-spinner div{transform-origin:40px 40px;animation:lds-spinner 1.2s linear infinite}.lds-spinner div:after{content:\" \";display:block;position:absolute;top:3px;left:37px;width:6px;height:18px;border-radius:20%;background:#fff}.lds-spinner div:nth-child(1){transform:rotate(0deg);animation-delay:-1.1s}.lds-spinner div:nth-child(2){transform:rotate(30deg);animation-delay:-1s}.lds-spinner div:nth-child(3){transform:rotate(60deg);animation-delay:-0.9s}.lds-spinner div:nth-child(4){transform:rotate(90deg);animation-delay:-0.8s}.lds-spinner div:nth-child(5){transform:rotate(120deg);animation-delay:-0.7s}.lds-spinner div:nth-child(6){transform:rotate(150deg);animation-delay:-0.6s}.lds-spinner div:nth-child(7){transform:rotate(180deg);animation-delay:-0.5s}.lds-spinner div:nth-child(8){transform:rotate(210deg);animation-delay:-0.4s}.lds-spinner div:nth-child(9){transform:rotate(240deg);animation-delay:-0.3s}.lds-spinner div:nth-child(10){transform:rotate(270deg);animation-delay:-0.2s}.lds-spinner div:nth-child(11){transform:rotate(300deg);animation-delay:-0.1s}.lds-spinner div:nth-child(12){transform:rotate(330deg);animation-delay:0s}@keyframes lds-spinner{0%{opacity:1}100%{opacity:0}}.script-info{width:100%}.script-info tbody tr td:first-child{white-space:nowrap}.script-info td{padding:8px;border-bottom:1px solid #f1f1f1;word-wrap:break-word;word-break:break-all}.script-info .info-title{font-weight:600;padding-top:24px}.script-info a{color:#2af;padding:4px 8px;border-radius:4px}.script-info a:hover{background-color:#f1f1f1}", ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 162:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(705);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__);
// Imports

var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default()(function(i){return i[1]});
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".k-modal{position:fixed;left:0;right:0;top:0;bottom:0;display:flex;align-items:center;justify-content:center;z-index:1000;text-align:left;animation:fadeIn .3s ease forwards}@keyframes fadeIn{from{opacity:0}to{opacity:1}}.k-modal *{color:rgba(0,0,0,.85)}.k-modal .k-modal-mask{position:absolute;width:100%;height:100%;background:rgba(0,0,0,.45);cursor:pointer}.k-modal .k-modal-container{position:absolute;width:520px;min-height:100px;background:#fff;border-radius:2px}.k-modal .k-modal-header{font-size:16px;padding:16px;border-bottom:1px solid #f1f1f1;display:flex;justify-content:space-between;align-items:center}.k-modal .k-modal-close{cursor:pointer}.k-modal .k-modal-body,.k-modal .k-modal-footer{padding:16px;font-size:14px}.k-modal .k-modal-footer{border-top:1px solid #f1f1f1;display:flex;justify-content:flex-end}.k-modal .k-modal-btn{display:flex;align-items:center;justify-content:center;height:32px;border-radius:2px;border:1px solid #2af;background:#2af;color:#fff;min-width:64px;cursor:pointer}", ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 55:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(705);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__);
// Imports

var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default()(function(i){return i[1]});
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".yhdm-wrapper{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji}.yhdm-wrapper .play,.yhdm-wrapper #playbox,.yhdm-wrapper .bofang{height:540px}", ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 379:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



var isOldIE = function isOldIE() {
  var memo;
  return function memorize() {
    if (typeof memo === 'undefined') {
      // Test for IE <= 9 as proposed by Browserhacks
      // @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
      // Tests for existence of standard globals is to allow style-loader
      // to operate correctly into non-standard environments
      // @see https://github.com/webpack-contrib/style-loader/issues/177
      memo = Boolean(window && document && document.all && !window.atob);
    }

    return memo;
  };
}();

var getTarget = function getTarget() {
  var memo = {};
  return function memorize(target) {
    if (typeof memo[target] === 'undefined') {
      var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

      if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
        try {
          // This will throw an exception if access to iframe is blocked
          // due to cross-origin restrictions
          styleTarget = styleTarget.contentDocument.head;
        } catch (e) {
          // istanbul ignore next
          styleTarget = null;
        }
      }

      memo[target] = styleTarget;
    }

    return memo[target];
  };
}();

var stylesInDom = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDom.length; i++) {
    if (stylesInDom[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var index = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3]
    };

    if (index !== -1) {
      stylesInDom[index].references++;
      stylesInDom[index].updater(obj);
    } else {
      stylesInDom.push({
        identifier: identifier,
        updater: addStyle(obj, options),
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function insertStyleElement(options) {
  var style = document.createElement('style');
  var attributes = options.attributes || {};

  if (typeof attributes.nonce === 'undefined') {
    var nonce =  true ? __webpack_require__.nc : 0;

    if (nonce) {
      attributes.nonce = nonce;
    }
  }

  Object.keys(attributes).forEach(function (key) {
    style.setAttribute(key, attributes[key]);
  });

  if (typeof options.insert === 'function') {
    options.insert(style);
  } else {
    var target = getTarget(options.insert || 'head');

    if (!target) {
      throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
    }

    target.appendChild(style);
  }

  return style;
}

function removeStyleElement(style) {
  // istanbul ignore if
  if (style.parentNode === null) {
    return false;
  }

  style.parentNode.removeChild(style);
}
/* istanbul ignore next  */


var replaceText = function replaceText() {
  var textStore = [];
  return function replace(index, replacement) {
    textStore[index] = replacement;
    return textStore.filter(Boolean).join('\n');
  };
}();

function applyToSingletonTag(style, index, remove, obj) {
  var css = remove ? '' : obj.media ? "@media ".concat(obj.media, " {").concat(obj.css, "}") : obj.css; // For old IE

  /* istanbul ignore if  */

  if (style.styleSheet) {
    style.styleSheet.cssText = replaceText(index, css);
  } else {
    var cssNode = document.createTextNode(css);
    var childNodes = style.childNodes;

    if (childNodes[index]) {
      style.removeChild(childNodes[index]);
    }

    if (childNodes.length) {
      style.insertBefore(cssNode, childNodes[index]);
    } else {
      style.appendChild(cssNode);
    }
  }
}

function applyToTag(style, options, obj) {
  var css = obj.css;
  var media = obj.media;
  var sourceMap = obj.sourceMap;

  if (media) {
    style.setAttribute('media', media);
  } else {
    style.removeAttribute('media');
  }

  if (sourceMap && typeof btoa !== 'undefined') {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    while (style.firstChild) {
      style.removeChild(style.firstChild);
    }

    style.appendChild(document.createTextNode(css));
  }
}

var singleton = null;
var singletonCounter = 0;

function addStyle(obj, options) {
  var style;
  var update;
  var remove;

  if (options.singleton) {
    var styleIndex = singletonCounter++;
    style = singleton || (singleton = insertStyleElement(options));
    update = applyToSingletonTag.bind(null, style, styleIndex, false);
    remove = applyToSingletonTag.bind(null, style, styleIndex, true);
  } else {
    style = insertStyleElement(options);
    update = applyToTag.bind(null, style, options);

    remove = function remove() {
      removeStyleElement(style);
    };
  }

  update(obj);
  return function updateStyle(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap) {
        return;
      }

      update(obj = newObj);
    } else {
      remove();
    }
  };
}

module.exports = function (list, options) {
  options = options || {}; // Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
  // tags it will allow on a page

  if (!options.singleton && typeof options.singleton !== 'boolean') {
    options.singleton = isOldIE();
  }

  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    if (Object.prototype.toString.call(newList) !== '[object Array]') {
      return;
    }

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDom[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDom[_index].references === 0) {
        stylesInDom[_index].updater();

        stylesInDom.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {

// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js
var injectStylesIntoStyleTag = __webpack_require__(379);
var injectStylesIntoStyleTag_default = /*#__PURE__*/__webpack_require__.n(injectStylesIntoStyleTag);
// EXTERNAL MODULE: ./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/agefans/index.scss
var agefans = __webpack_require__(242);
;// CONCATENATED MODULE: ./src/agefans/index.scss

            

var options = {};

options.insert = "head";
options.singleton = false;

var update = injectStylesIntoStyleTag_default()(agefans/* default */.Z, options);



/* harmony default export */ const src_agefans = (agefans/* default.locals */.Z.locals || {});
;// CONCATENATED MODULE: ./src/agefans/detail.js
function renderHistroyStyle() {
  // add a tag visited style
  let styleDom = document.createElement('style');
  styleDom.innerHTML = `.movurl li a:visited { color: red; }`;
  document.head.appendChild(styleDom);
}

function detailModule() {
  renderHistroyStyle();
}
// EXTERNAL MODULE: ./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/agefans/history.scss
var agefans_history = __webpack_require__(453);
;// CONCATENATED MODULE: ./src/agefans/history.scss

            

var history_options = {};

history_options.insert = "head";
history_options.singleton = false;

var history_update = injectStylesIntoStyleTag_default()(agefans_history/* default */.Z, history_options);



/* harmony default export */ const src_agefans_history = (agefans_history/* default.locals */.Z.locals || {});
;// CONCATENATED MODULE: ./src/agefans/history.js


class History {
  constructor() {
    this.cacheKey = 'v-his';
  }

  get his() {
    return JSON.parse(localStorage.getItem(this.cacheKey) || '[]');
  }

  set his(value) {
    if (Array.isArray(value)) {
      localStorage.setItem(this.cacheKey, JSON.stringify(value.slice(0, 100)));
    }
  }

  getAll() {
    return this.his;
  }

  get(id) {
    return this.his.find(o => o.id === id);
  }

  setTime(id, time = 0) {
    const his = this.his;
    his.find(o => o.id === id).time = time;
    this.his = his;
  }

  log(item) {
    const his = this.his;
    his.unshift(item);
    this.his = his;
  }

  refresh(id, data) {
    const his = this.his;
    const index = his.findIndex(o => o.id === id);
    const item = his.splice(index, 1)[0];
    his.unshift(data || item);
    this.his = his;
  }

  has(id) {
    return Boolean(this.his.find(o => o.id === id));
  }

  logHistory() {
    var _location$pathname$ma;

    const id = (_location$pathname$ma = location.pathname.match(/\/play\/(\d*)/)) === null || _location$pathname$ma === void 0 ? void 0 : _location$pathname$ma[1];
    if (!id) return;
    const hisItem = {};
    hisItem.id = id;
    hisItem.title = $('#detailname a').text();
    hisItem.href = location.href;
    hisItem.section = $('li a[style*="color: rgb(238, 0, 0);"]').text();
    hisItem.time = 0;
    hisItem.logo = $('#play_poster_img').attr('src');

    if (this.has(id)) {
      const oldItem = this.get(id);

      if (oldItem.href !== hisItem.href) {
        this.refresh(id, hisItem);
      } else {
        this.refresh(id);
      }
    } else {
      this.log(hisItem);
    }
  }

}

const his = new History();

function parseTime(time = 0) {
  return `${Math.floor(time / 60).toString().padStart(2, '0')}:${(time % 60).toString().padStart(2, '0')}`;
}

function renderHistoryList() {
  $('#history').html('').append(() => {
    /** @type {any[]} */
    const histories = his.getAll();
    let html = '';
    histories.forEach(o => {
      html += `<a class="history-item" href="${o.href}">
        <img
          referrerpolicy="no-referrer"
          src="${o.logo}"
          alt="${o.title}"
          title="${o.title}"
        />
        <div class="desc">
          <div class="title">${o.title}</div>
          <div class="position">${o.section} ${parseTime(o.time)}</div>
        </div>
      </a>
      `;
    });
    return `<div class="history-list">${html || '<center>暂无数据</center>'}</div>`;
  });
}

function renderHistoryPage() {
  const currentDom = $('.nav_button_current');
  $('<div id="history"></div>').insertBefore('#footer').hide();
  $(`<a class="nav_button">历史</a>`).appendTo('#nav').on('click', e => {
    if ($('#history').is(':visible')) {
      $('#container').show();
      $('#history').hide();
      changeActive(currentDom);
    } else {
      renderHistoryList();
      $('#container').hide();
      $('#history').show();
      changeActive($(e.currentTarget));
    }
  });
  $('.nav_button_current').on('click', e => {
    $('#container').show();
    $('#history').hide();
    changeActive(e.currentTarget);
  }).removeAttr('href');
}

function changeActive(dom) {
  $('.nav_button_current').removeClass('nav_button_current');
  $(dom).addClass('nav_button_current');
}

function historyModule() {
  renderHistoryPage();
  renderHistoryList();
}
;// CONCATENATED MODULE: ./src/utils/copy.js
function copyToClipboard(element) {
  var $temp = $("<textarea>");
  $("body").append($temp);
  $temp.val($(element).text()).trigger('select');
  document.execCommand("copy");
  $temp.remove();
}
// EXTERNAL MODULE: ./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/utils/modal.scss
var modal = __webpack_require__(162);
;// CONCATENATED MODULE: ./src/utils/modal.scss

            

var modal_options = {};

modal_options.insert = "head";
modal_options.singleton = false;

var modal_update = injectStylesIntoStyleTag_default()(modal/* default */.Z, modal_options);



/* harmony default export */ const utils_modal = (modal/* default.locals */.Z.locals || {});
;// CONCATENATED MODULE: ./src/utils/modal.js

function modal_modal({
  title,
  content,
  onClose,
  onOk
}) {
  const ID = Math.random().toString(16).slice(2);
  $(`
<div class="k-modal" role="dialog" id="${ID}">
  <div class="k-modal-mask"></div>
  <div class="k-modal-container">
    <div class="k-modal-header">
      <div class="k-modal-title"></div>
      <a class="k-modal-close">X</a>
    </div>
    <div class="k-modal-body">
    </div>
  </div>
</div>`).appendTo('body');
  $(`#${ID} .k-modal-title`).append(title);
  $(`#${ID} .k-modal-body`).append(content);
  $(`#${ID} .k-modal-close`).on('click', () => {
    handleClose();
  });
  $(`#${ID} .k-modal-mask`).on('click', () => {
    handleClose();
  });

  function reset() {
    $(`#${ID}`).remove();
    $('body').css('overflow', '');
    window.removeEventListener('keydown', fn, {
      capture: true
    });
  }

  function handleClose() {
    onClose === null || onClose === void 0 ? void 0 : onClose();
    reset();
  }

  function handleOk() {
    onOk();
    reset();
  }

  function fn(e) {
    if (['Escape', '?', '？'].includes(e.key)) {
      handleClose();
    }

    e.stopPropagation();
  }

  window.addEventListener('keydown', fn, {
    capture: true
  });
  $('body').css('overflow', 'hidden');

  if (onOk) {
    $(`#${ID} .k-modal-container`).append(`
      <div class="k-modal-footer">
        <button class="k-modal-btn k-modal-ok">确 定</button>
      </div>
    `);
    $(`#${ID} .k-modal-ok`).on('click', () => {
      handleOk();
    });
  }
}
;// CONCATENATED MODULE: ./src/agefans/playURL.js
function __setCookie(name, value, _in_days) {
  var Days = _in_days;
  var exp = new Date();
  exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
  document.cookie = name + '=' + escape(value) + ';expires=' + exp.toGMTString() + ';path=/';
}

function __getCookie(name) {
  var arr,
      reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');

  if (arr = document.cookie.match(reg)) {
    return unescape(arr[2]);
  } else {
    return null;
  }
}

function getCookie2(name) {
  return __getCookie(name);
}

function FEI2(in_epi) {
  //
  var hf_epi = Number(in_epi);
  const time_curr = new Date().getTime();
  var fa_t = Number(getCookie2('fa_t'));

  if (!fa_t) {
    fa_t = time_curr;
  }

  var fa_c = Number(getCookie2('fa_c'));

  if (!fa_c) {
    fa_c = 0;
  } //


  if (time_curr - fa_t > 6000) {
    fa_t = 0;
    fa_c = 0;
  } //


  fa_c += 1;
  fa_t = time_curr; //

  if (fa_c > 10) {
    fa_t = 0;
    fa_c = 0; //

    if (hf_epi > 1) {
      hf_epi = time_curr % hf_epi;

      if (!hf_epi) {
        hf_epi = 1;
      }
    }
  }

  __setCookie('fa_t', fa_t, 1);

  __setCookie('fa_c', fa_c, 1);

  return hf_epi;
}

function getPlayUrl(_url) {
  const _rand = Math.random();

  var _getplay_url = _url.replace(/.*\/play\/(\d+?)\?playid=(\d+)_(\d+).*/, '/_getplay?aid=$1&playindex=$2&epindex=$3') + '&r=' + _rand;

  var re_resl = _getplay_url.match(/[&?]+epindex=(\d+)/);

  const hf_epi = '' + FEI2(re_resl[1]);
  const t_epindex_ = 'epindex=';
  _getplay_url = _getplay_url.replace(t_epindex_ + re_resl[1], t_epindex_ + hf_epi);
  return _getplay_url;
}
;// CONCATENATED MODULE: ./src/agefans/getAllVideoURL.js



/**
 * @typedef {{title:string,href:string}} ATag
 */

function insertBtn() {
  $(`
  <div class="baseblock">
    <div class="blockcontent">
      <div id="wangpan-div" class="baseblock2">
        <div class="blocktitle">获取全部视频链接：</div>
        <div class="blockcontent">
          <a id="open-modal" class="res_links_a" style="cursor:pointer">获取全部视频链接</a>
          <span>｜</span>
          <a id="all-select" class="res_links_a" style="cursor:pointer">复制内容</a>
          <span>｜</span>
          <a id="thunder-link" target="_blank" class="res_links_a" style="cursor:pointer">导出迅雷链接</a>
          <div id="url-list" style="width:100%; max-height:400px; overflow:auto;"></div>
        </div>
      </div>
    </div>
  </div>
`).insertAfter($('.baseblock:contains(网盘资源)'));
  $('#all-select').on('click', function () {
    copyToClipboard($('#url-list'));
    $(this).text('已复制');
    setTimeout(() => {
      $(this).text('复制内容');
    }, 1000);
  });
  $('#open-modal').on('click', function () {
    modal_modal({
      title: '选择需要的链接',
      content: insertModalForm(),
      onOk: () => {
        let list = [];
        $('#modal-form input').each(function (_, el) {
          if (el.checked) {
            list.push({
              title: $(this).data('title'),
              href: $(this).attr('name')
            });
          }
        });
        insertResult(list);
      }
    });
  });
  $('#thunder-link').attr('href', () => {
    const map = getLocal();
    const list = getAllVideoUrlList();
    const tasks = [];
    const taskGroupName = $('#detailname a').text();
    list.forEach(item => {
      if (map[item.href]) {
        tasks.push({
          url: map[item.href].url,
          baseName: `${item.title}.mp4`
        });
      }
    });
    const params = {
      taskGroupName,
      tasks
    };
    const baseURL =  false ? 0 : 'https://ironkinoko.github.io/agefans-enhance/thunder.html';
    const url = new URL(baseURL);
    url.searchParams.append('params', JSON.stringify(params));
    return url.toString();
  });
}
/**
 * @return {ATag[]}
 */


function getAllVideoUrlList() {
  const $aTagList = $('.movurl:visible li a');
  const aTags = [];
  $aTagList.each(function (index, aTag) {
    aTags.push({
      title: aTag.textContent,
      href: aTag.dataset.href
    });
  });
  return aTags;
}

function insertModalForm() {
  const list = getAllVideoUrlList();
  let $dom = $(`
  <div id="modal-form">
    <ul>
      ${list.map(aTag => `
        <li>
          <label><input type="checkbox" name="${aTag.href}" data-title="${aTag.title}" checked />${aTag.title}</label>
        </li>`).join('')}
    </ul>
  </div>
  `);
  return $dom;
}

function genUrlItem(title, content = '加载中...') {
  return `<div>
  <div style="white-space: nowrap;">[${title}]</div>
  <div class="url" data-status='0' style="word-break:break-all; word-wrap:break-word;">${content}</div>
</div>`;
}
/**
 * @param {ATag[]} list
 */


function insertResult(list) {
  const $parent = $('#url-list');
  $parent.empty();
  list.forEach(item => {
    let $dom = $(genUrlItem(item.title)).appendTo($parent);
    let $msg = $dom.find('.url');

    function _getUrl() {
      getVurl(item.href).then(vurl => {
        const url = decodeURIComponent(vurl);
        saveLocal(item.href, url);
        $msg.text(url);
        $msg.data('status', '1');
      }).catch(error => {
        console.error(error);
        $msg.empty();
        $msg.data('status', '2');
        $(`<a style="cursor:pointer">加载出错，重试</a>`).appendTo($msg).on('click', () => {
          _getUrl();
        });
      });
    }

    _getUrl();
  });
}

const PLAY_URL_KEY = 'play-url-key';
/**
 * @return {Record<string,{url:string}>}
 */

function getLocal() {
  return JSON.parse(window.localStorage.getItem(PLAY_URL_KEY) || '{}');
}

function saveLocal(href, url) {
  const map = getLocal();
  map[href] = {
    url
  };
  window.localStorage.setItem(PLAY_URL_KEY, JSON.stringify(map));
}

function insertLocal() {
  const map = getLocal();
  const list = getAllVideoUrlList();
  const $parent = $('#url-list');
  $(list.map(item => {
    if (map[item.href]) {
      return genUrlItem(item.title, map[item.href].url);
    } else {
      return '';
    }
  }).join('')).appendTo($parent);
}

async function getVurl(href) {
  const res = await fetch(getPlayUrl(href)).then(res => res.json());
  return decodeURIComponent(res.vurl);
}

async function getVurlWithLocal(href) {
  const map = getLocal();

  if (map[href]) {
    return map[href].url;
  }

  const vurl = await getVurl(href);
  saveLocal(href, vurl);
  return vurl;
}
function initGetAllVideoURL() {
  insertBtn();
  insertLocal();
}
// EXTERNAL MODULE: ./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/player/index.scss
var player = __webpack_require__(90);
;// CONCATENATED MODULE: ./src/player/index.scss

            

var player_options = {};

player_options.insert = "head";
player_options.singleton = false;

var player_update = injectStylesIntoStyleTag_default()(player/* default */.Z, player_options);



/* harmony default export */ const src_player = (player/* default.locals */.Z.locals || {});
;// CONCATENATED MODULE: ./src/player/html.js
const icons = `
<svg
xmlns="http://www.w3.org/2000/svg"
style="position: absolute; width: 0px; height: 0px; overflow: hidden"
aria-hidden="true"
>
<symbol id="next" viewBox="0 0 22 22">
  <path
    d="M16 5a1 1 0 00-1 1v4.615a1.431 1.431 0 00-.615-.829L7.21 5.23A1.439 1.439 0 005 6.445v9.11a1.44 1.44 0 002.21 1.215l7.175-4.555a1.436 1.436 0 00.616-.828V16a1 1 0 002 0V6C17 5.448 16.552 5 16 5z"
  ></path>
</symbol>
<symbol
  id="widescreen"
  viewBox="0 0 88 88"
  preserveAspectRatio="xMidYMid meet"
>
  <defs>
    <clipPath id="__lottie_element_117">
      <rect width="88" height="88" x="0" y="0"></rect>
    </clipPath>
  </defs>
  <g clip-path="url(#__lottie_element_117)">
    <g
      transform="matrix(1,0,0,1,44,44)"
      opacity="1"
      style="display: block"
    >
      <g opacity="1" transform="matrix(1,0,0,1,0,0)">
        <path
          fill="rgb(255,255,255)"
          fill-opacity="1"
          d=" M12.437999725341797,-12.70199966430664 C12.437999725341797,-12.70199966430664 9.618000030517578,-9.881999969482422 9.618000030517578,-9.881999969482422 C8.82800006866455,-9.092000007629395 8.82800006866455,-7.831999778747559 9.618000030517578,-7.052000045776367 C9.618000030517578,-7.052000045776367 16.687999725341797,0.017999999225139618 16.687999725341797,0.017999999225139618 C16.687999725341797,0.017999999225139618 9.618000030517578,7.0879998207092285 9.618000030517578,7.0879998207092285 C8.82800006866455,7.877999782562256 8.82800006866455,9.137999534606934 9.618000030517578,9.918000221252441 C9.618000030517578,9.918000221252441 12.437999725341797,12.748000144958496 12.437999725341797,12.748000144958496 C13.227999687194824,13.527999877929688 14.48799991607666,13.527999877929688 15.267999649047852,12.748000144958496 C15.267999649047852,12.748000144958496 26.58799934387207,1.437999963760376 26.58799934387207,1.437999963760376 C27.368000030517578,0.6579999923706055 27.368000030517578,-0.6119999885559082 26.58799934387207,-1.3919999599456787 C26.58799934387207,-1.3919999599456787 15.267999649047852,-12.70199966430664 15.267999649047852,-12.70199966430664 C14.48799991607666,-13.491999626159668 13.227999687194824,-13.491999626159668 12.437999725341797,-12.70199966430664z M-12.442000389099121,-12.70199966430664 C-13.182000160217285,-13.442000389099121 -14.362000465393066,-13.482000350952148 -15.142000198364258,-12.821999549865723 C-15.142000198364258,-12.821999549865723 -15.272000312805176,-12.70199966430664 -15.272000312805176,-12.70199966430664 C-15.272000312805176,-12.70199966430664 -26.582000732421875,-1.3919999599456787 -26.582000732421875,-1.3919999599456787 C-27.32200050354004,-0.6520000100135803 -27.36199951171875,0.5180000066757202 -26.70199966430664,1.3079999685287476 C-26.70199966430664,1.3079999685287476 -26.582000732421875,1.437999963760376 -26.582000732421875,1.437999963760376 C-26.582000732421875,1.437999963760376 -15.272000312805176,12.748000144958496 -15.272000312805176,12.748000144958496 C-14.531999588012695,13.48799991607666 -13.362000465393066,13.527999877929688 -12.571999549865723,12.868000030517578 C-12.571999549865723,12.868000030517578 -12.442000389099121,12.748000144958496 -12.442000389099121,12.748000144958496 C-12.442000389099121,12.748000144958496 -9.612000465393066,9.918000221252441 -9.612000465393066,9.918000221252441 C-8.871999740600586,9.178000450134277 -8.831999778747559,8.008000373840332 -9.501999855041504,7.2179999351501465 C-9.501999855041504,7.2179999351501465 -9.612000465393066,7.0879998207092285 -9.612000465393066,7.0879998207092285 C-9.612000465393066,7.0879998207092285 -16.68199920654297,0.017999999225139618 -16.68199920654297,0.017999999225139618 C-16.68199920654297,0.017999999225139618 -9.612000465393066,-7.052000045776367 -9.612000465393066,-7.052000045776367 C-8.871999740600586,-7.791999816894531 -8.831999778747559,-8.961999893188477 -9.501999855041504,-9.751999855041504 C-9.501999855041504,-9.751999855041504 -9.612000465393066,-9.881999969482422 -9.612000465393066,-9.881999969482422 C-9.612000465393066,-9.881999969482422 -12.442000389099121,-12.70199966430664 -12.442000389099121,-12.70199966430664z M28,-28 C32.41999816894531,-28 36,-24.420000076293945 36,-20 C36,-20 36,20 36,20 C36,24.420000076293945 32.41999816894531,28 28,28 C28,28 -28,28 -28,28 C-32.41999816894531,28 -36,24.420000076293945 -36,20 C-36,20 -36,-20 -36,-20 C-36,-24.420000076293945 -32.41999816894531,-28 -28,-28 C-28,-28 28,-28 28,-28z"
        ></path>
      </g>
    </g>
  </g>
</symbol>
<symbol
  id="fullscreen"
  viewBox="0 0 88 88"
  preserveAspectRatio="xMidYMid meet"
>
  <defs>
    <clipPath id="__lottie_element_127">
      <rect width="88" height="88" x="0" y="0"></rect>
    </clipPath>
  </defs>
  <g clip-path="url(#__lottie_element_127)">
    <g
      transform="matrix(1,0,0,1,44,44)"
      opacity="1"
      style="display: block"
    >
      <g opacity="1" transform="matrix(1,0,0,1,0,0)">
        <path
          fill="rgb(255,255,255)"
          fill-opacity="1"
          d=" M-14,-20 C-14,-20 -26,-20 -26,-20 C-27.049999237060547,-20 -27.920000076293945,-19.18000030517578 -27.989999771118164,-18.149999618530273 C-27.989999771118164,-18.149999618530273 -28,-18 -28,-18 C-28,-18 -28,-6 -28,-6 C-28,-4.949999809265137 -27.18000030517578,-4.079999923706055 -26.149999618530273,-4.010000228881836 C-26.149999618530273,-4.010000228881836 -26,-4 -26,-4 C-26,-4 -22,-4 -22,-4 C-20.950000762939453,-4 -20.079999923706055,-4.820000171661377 -20.010000228881836,-5.849999904632568 C-20.010000228881836,-5.849999904632568 -20,-6 -20,-6 C-20,-6 -20,-12 -20,-12 C-20,-12 -14,-12 -14,-12 C-12.949999809265137,-12 -12.079999923706055,-12.819999694824219 -12.010000228881836,-13.850000381469727 C-12.010000228881836,-13.850000381469727 -12,-14 -12,-14 C-12,-14 -12,-18 -12,-18 C-12,-19.049999237060547 -12.819999694824219,-19.920000076293945 -13.850000381469727,-19.989999771118164 C-13.850000381469727,-19.989999771118164 -14,-20 -14,-20z M26,-20 C26,-20 14,-20 14,-20 C12.949999809265137,-20 12.079999923706055,-19.18000030517578 12.010000228881836,-18.149999618530273 C12.010000228881836,-18.149999618530273 12,-18 12,-18 C12,-18 12,-14 12,-14 C12,-12.949999809265137 12.819999694824219,-12.079999923706055 13.850000381469727,-12.010000228881836 C13.850000381469727,-12.010000228881836 14,-12 14,-12 C14,-12 20,-12 20,-12 C20,-12 20,-6 20,-6 C20,-4.949999809265137 20.81999969482422,-4.079999923706055 21.850000381469727,-4.010000228881836 C21.850000381469727,-4.010000228881836 22,-4 22,-4 C22,-4 26,-4 26,-4 C27.049999237060547,-4 27.920000076293945,-4.820000171661377 27.989999771118164,-5.849999904632568 C27.989999771118164,-5.849999904632568 28,-6 28,-6 C28,-6 28,-18 28,-18 C28,-19.049999237060547 27.18000030517578,-19.920000076293945 26.149999618530273,-19.989999771118164 C26.149999618530273,-19.989999771118164 26,-20 26,-20z M-22,4 C-22,4 -26,4 -26,4 C-27.049999237060547,4 -27.920000076293945,4.820000171661377 -27.989999771118164,5.849999904632568 C-27.989999771118164,5.849999904632568 -28,6 -28,6 C-28,6 -28,18 -28,18 C-28,19.049999237060547 -27.18000030517578,19.920000076293945 -26.149999618530273,19.989999771118164 C-26.149999618530273,19.989999771118164 -26,20 -26,20 C-26,20 -14,20 -14,20 C-12.949999809265137,20 -12.079999923706055,19.18000030517578 -12.010000228881836,18.149999618530273 C-12.010000228881836,18.149999618530273 -12,18 -12,18 C-12,18 -12,14 -12,14 C-12,12.949999809265137 -12.819999694824219,12.079999923706055 -13.850000381469727,12.010000228881836 C-13.850000381469727,12.010000228881836 -14,12 -14,12 C-14,12 -20,12 -20,12 C-20,12 -20,6 -20,6 C-20,4.949999809265137 -20.81999969482422,4.079999923706055 -21.850000381469727,4.010000228881836 C-21.850000381469727,4.010000228881836 -22,4 -22,4z M26,4 C26,4 22,4 22,4 C20.950000762939453,4 20.079999923706055,4.820000171661377 20.010000228881836,5.849999904632568 C20.010000228881836,5.849999904632568 20,6 20,6 C20,6 20,12 20,12 C20,12 14,12 14,12 C12.949999809265137,12 12.079999923706055,12.819999694824219 12.010000228881836,13.850000381469727 C12.010000228881836,13.850000381469727 12,14 12,14 C12,14 12,18 12,18 C12,19.049999237060547 12.819999694824219,19.920000076293945 13.850000381469727,19.989999771118164 C13.850000381469727,19.989999771118164 14,20 14,20 C14,20 26,20 26,20 C27.049999237060547,20 27.920000076293945,19.18000030517578 27.989999771118164,18.149999618530273 C27.989999771118164,18.149999618530273 28,18 28,18 C28,18 28,6 28,6 C28,4.949999809265137 27.18000030517578,4.079999923706055 26.149999618530273,4.010000228881836 C26.149999618530273,4.010000228881836 26,4 26,4z M28,-28 C32.41999816894531,-28 36,-24.420000076293945 36,-20 C36,-20 36,20 36,20 C36,24.420000076293945 32.41999816894531,28 28,28 C28,28 -28,28 -28,28 C-32.41999816894531,28 -36,24.420000076293945 -36,20 C-36,20 -36,-20 -36,-20 C-36,-24.420000076293945 -32.41999816894531,-28 -28,-28 C-28,-28 28,-28 28,-28z"
        ></path>
      </g>
    </g>
  </g>
</symbol>

<symbol
  id="fullscreen-quit"
  viewBox="0 0 88 88"
  preserveAspectRatio="xMidYMid meet"
>
  <defs>
    <clipPath id="__lottie_element_132">
      <rect width="88" height="88" x="0" y="0"></rect>
    </clipPath>
  </defs>
  <g clip-path="url(#__lottie_element_132)">
    <g
      transform="matrix(1,0,0,1,44,44)"
      opacity="1"
      style="display: block"
    >
      <g opacity="1" transform="matrix(1,0,0,1,0,0)">
        <path
          fill="rgb(255,255,255)"
          fill-opacity="1"
          d=" M-14,-20 C-14,-20 -18,-20 -18,-20 C-19.049999237060547,-20 -19.920000076293945,-19.18000030517578 -19.989999771118164,-18.149999618530273 C-19.989999771118164,-18.149999618530273 -20,-18 -20,-18 C-20,-18 -20,-12 -20,-12 C-20,-12 -26,-12 -26,-12 C-27.049999237060547,-12 -27.920000076293945,-11.180000305175781 -27.989999771118164,-10.149999618530273 C-27.989999771118164,-10.149999618530273 -28,-10 -28,-10 C-28,-10 -28,-6 -28,-6 C-28,-4.949999809265137 -27.18000030517578,-4.079999923706055 -26.149999618530273,-4.010000228881836 C-26.149999618530273,-4.010000228881836 -26,-4 -26,-4 C-26,-4 -14,-4 -14,-4 C-12.949999809265137,-4 -12.079999923706055,-4.820000171661377 -12.010000228881836,-5.849999904632568 C-12.010000228881836,-5.849999904632568 -12,-6 -12,-6 C-12,-6 -12,-18 -12,-18 C-12,-19.049999237060547 -12.819999694824219,-19.920000076293945 -13.850000381469727,-19.989999771118164 C-13.850000381469727,-19.989999771118164 -14,-20 -14,-20z M18,-20 C18,-20 14,-20 14,-20 C12.949999809265137,-20 12.079999923706055,-19.18000030517578 12.010000228881836,-18.149999618530273 C12.010000228881836,-18.149999618530273 12,-18 12,-18 C12,-18 12,-6 12,-6 C12,-4.949999809265137 12.819999694824219,-4.079999923706055 13.850000381469727,-4.010000228881836 C13.850000381469727,-4.010000228881836 14,-4 14,-4 C14,-4 26,-4 26,-4 C27.049999237060547,-4 27.920000076293945,-4.820000171661377 27.989999771118164,-5.849999904632568 C27.989999771118164,-5.849999904632568 28,-6 28,-6 C28,-6 28,-10 28,-10 C28,-11.050000190734863 27.18000030517578,-11.920000076293945 26.149999618530273,-11.989999771118164 C26.149999618530273,-11.989999771118164 26,-12 26,-12 C26,-12 20,-12 20,-12 C20,-12 20,-18 20,-18 C20,-19.049999237060547 19.18000030517578,-19.920000076293945 18.149999618530273,-19.989999771118164 C18.149999618530273,-19.989999771118164 18,-20 18,-20z M-14,4 C-14,4 -26,4 -26,4 C-27.049999237060547,4 -27.920000076293945,4.820000171661377 -27.989999771118164,5.849999904632568 C-27.989999771118164,5.849999904632568 -28,6 -28,6 C-28,6 -28,10 -28,10 C-28,11.050000190734863 -27.18000030517578,11.920000076293945 -26.149999618530273,11.989999771118164 C-26.149999618530273,11.989999771118164 -26,12 -26,12 C-26,12 -20,12 -20,12 C-20,12 -20,18 -20,18 C-20,19.049999237060547 -19.18000030517578,19.920000076293945 -18.149999618530273,19.989999771118164 C-18.149999618530273,19.989999771118164 -18,20 -18,20 C-18,20 -14,20 -14,20 C-12.949999809265137,20 -12.079999923706055,19.18000030517578 -12.010000228881836,18.149999618530273 C-12.010000228881836,18.149999618530273 -12,18 -12,18 C-12,18 -12,6 -12,6 C-12,4.949999809265137 -12.819999694824219,4.079999923706055 -13.850000381469727,4.010000228881836 C-13.850000381469727,4.010000228881836 -14,4 -14,4z M26,4 C26,4 14,4 14,4 C12.949999809265137,4 12.079999923706055,4.820000171661377 12.010000228881836,5.849999904632568 C12.010000228881836,5.849999904632568 12,6 12,6 C12,6 12,18 12,18 C12,19.049999237060547 12.819999694824219,19.920000076293945 13.850000381469727,19.989999771118164 C13.850000381469727,19.989999771118164 14,20 14,20 C14,20 18,20 18,20 C19.049999237060547,20 19.920000076293945,19.18000030517578 19.989999771118164,18.149999618530273 C19.989999771118164,18.149999618530273 20,18 20,18 C20,18 20,12 20,12 C20,12 26,12 26,12 C27.049999237060547,12 27.920000076293945,11.180000305175781 27.989999771118164,10.149999618530273 C27.989999771118164,10.149999618530273 28,10 28,10 C28,10 28,6 28,6 C28,4.949999809265137 27.18000030517578,4.079999923706055 26.149999618530273,4.010000228881836 C26.149999618530273,4.010000228881836 26,4 26,4z M28,-28 C32.41999816894531,-28 36,-24.420000076293945 36,-20 C36,-20 36,20 36,20 C36,24.420000076293945 32.41999816894531,28 28,28 C28,28 -28,28 -28,28 C-32.41999816894531,28 -36,24.420000076293945 -36,20 C-36,20 -36,-20 -36,-20 C-36,-24.420000076293945 -32.41999816894531,-28 -28,-28 C-28,-28 28,-28 28,-28z"
        ></path>
      </g>
    </g>
  </g>
</symbol>
</svg>

<template id="plyr__next">
  <button
    class="plyr__controls__item plyr__control plyr__next plyr__custom"
    type="button"
    data-plyr="next"
    aria-label="Next"
  >
    <svg focusable="false">
      <use xlink:href="#next"></use>
    </svg>
    <span class="plyr__sr-only">Next</span>
  </button>
</template>

<template id="plyr__fullscreen">
  <button
    class="plyr__controls__item plyr__control plyr__fullscreen plyr__custom"
    type="button"
    data-plyr="next"
    aria-label="fullscreen"
  >
    <svg focusable="false">
      <use xlink:href="#fullscreen"></use>
    </svg>
    <span class="plyr__sr-only">Next</span>
  </button>
</template>
`;
$('body').append(icons);
const loadingHTML = `
<div id="k-player-loading" style="display: none">
  <div class="k-player-center">
    <div class="lds-spinner">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>  
  </div>
</div>
`;
const errorHTML = `
<div id="k-player-error" style="display: none">
  <div class="k-player-center">
    <div>视频加载失败</div><div class="error-info"></div>
  </div>
</div>`;
const scriptInfo = (video, githubIssueURL) => `
<table class="script-info">
  <tbody>
  <tr><td>脚本版本</td><td>${"1.5.0"}</td></tr>
  <tr>
    <td>脚本源码</td>
    <td>
      <a target="_blank" href="https://github.com/IronKinoko/agefans-enhance">GitHub</a>
    </td>
  </tr>
  <tr>
    <td>报错/意见</td>
    <td>
      <a target="_blank" href="${githubIssueURL}">GitHub Issues</a>
      <a target="_blank" href="https://greasyfork.org/zh-CN/scripts/424023-agefans-enhance/feedback">Greasy Fork 反馈</a>
    </td>
  </tr>
  <tr><td colspan="2" class="info-title">视频信息</td></tr>
  <tr><td>视频链接</td><td>${video.src}</td></tr>
  <tr><td>视频信息</td><td>${video.videoWidth} x ${video.videoHeight}</td></tr>
  <tr><td colspan="2" class="info-title">快捷键</td></tr>
  <tr><td>[w]</td><td>宽屏</td></tr>
  <tr><td>[f]</td><td>全屏</td></tr>
  <tr><td>[←]</td><td>后退10s</td></tr>
  <tr><td>[→]</td><td>前进10s</td></tr>
  <tr><td>[↑]</td><td>音量+</td></tr>
  <tr><td>[↓]</td><td>音量-</td></tr>
  <tr><td>[m]</td><td>静音</td></tr>
  <tr><td>[esc]</td><td>退出全屏/宽屏</td></tr>
  <tr><td>[?]</td><td>脚本信息</td></tr>
  </tbody>
</table>
`;
const issueBody = src => `# 文字描述
<!-- 如果有需要额外描述，或者提意见可以写在下面空白处 -->


# 网址链接
${window.location.href}

# 视频链接
${src}

# 环境
userAgent: ${navigator.userAgent}
脚本版本: ${"1.5.0"}
`;
;// CONCATENATED MODULE: ./src/utils/debounce.js
function debounce(fn, delay = 300) {
  if (typeof fn !== 'function') {
    throw new TypeError('fn is not a function');
  }

  let timeID = null;
  return function (...rest) {
    if (timeID) {
      clearTimeout(timeID);
    }

    timeID = setTimeout(() => {
      timeID = null;
      fn.apply(this, rest);
    }, delay);
  };
}
;// CONCATENATED MODULE: ./src/utils/genIssueURL.js
function genIssueURL({
  title,
  body
}) {
  const url = new URL(`https://github.com/IronKinoko/agefans-enhance/issues/new`);
  url.searchParams.set('title', title);
  url.searchParams.set('body', body);
  return url.toString();
}
;// CONCATENATED MODULE: ./src/player/index.js






class KPlayer {
  /**
   * Creates an instance of KPlayer.
   * @param {stromg} selector
   * @param {Plyr.Options} opts
   */
  constructor(selector, opts) {
    const $wrapper = $('<div id="k-player-wrapper"/>').replaceAll(selector);
    const $loading = $(loadingHTML);
    const $error = $(errorHTML);
    const $video = $('<video id="k-player-contianer" />');
    $wrapper.append($loading).append($error).append($video);
    this.plyr = new Plyr('#k-player-contianer', {
      autoplay: true,
      keyboard: {
        global: true
      },
      controls: [// 'play-large', // The large play button in the center
      'play', // Play/pause playback
      'progress', // The progress bar and scrubber for playback and buffering
      'current-time', // The current time of playback
      'duration', // The full duration of the media
      'mute', // Toggle mute
      'volume', // Volume control
      'settings', // Settings menu
      'pip', // Picture-in-picture (currently Safari only)
      'fullscreen' // Toggle fullscreen
      ],
      ...opts
    });
    this.$wrapper = $wrapper;
    this.$loading = $loading;
    this.$error = $error;
    this.$video = $video;
    this.$videoWrapper = $wrapper.find('.plyr');
    this.eventMap = {};
    this.isWideScreen = false;

    this._injectNext();

    this._injectSreen();

    this._initEvent();
    /** @private */


    this.isHoverControls = false;
    /** @private */

    this.hideCursorDebounced = debounce(() => {
      const dom = document.querySelector('.plyr');
      dom.classList.add('plyr--hide-cursor');
    }, 1000);
    /** @private */

    this.hideControlsDebounced = debounce(() => {
      const dom = document.querySelector('.plyr');
      if (!this.isHoverControls) dom.classList.add('plyr--hide-controls');
    }, 1000);
  }
  /** @private */


  _initEvent() {
    this.on('loadstart', () => {
      this.$loading.show();
      this.hideError();
    });
    this.on('canplay', () => {
      this.$loading.hide();
      this.$videoWrapper.show();
      this.plyr.play();
    });
    this.on('error', () => {
      this.$loading.hide();
      this.$videoWrapper.hide();
      this.showError(this.src);
    });
    this.on('pause', () => {
      this.hideControlsDebounced();
    });
    $(window).on('keydown', e => {
      if ((e.key === '?' || e.key === '？') && !this.plyr.fullscreen.active) {
        const video = this.$video[0];
        const githubIssueURL = genIssueURL({
          title: '无法正常播放',
          body: issueBody(video.src)
        });
        modal_modal({
          title: '脚本信息',
          content: scriptInfo(video, githubIssueURL)
        });
      }

      if (e.key === 'w' && !this.plyr.fullscreen.active) {
        this._toggleFullscreen();
      }

      if (e.key === 'Escape' && !this.plyr.fullscreen.active && this.isWideScreen) {
        this._toggleFullscreen(false);
      }
    });
    document.querySelectorAll('.plyr__controls .plyr__control').forEach(dom => {
      dom.addEventListener('click', e => {
        e.currentTarget.blur();
      });
    });
    const playerEl = document.querySelector('.plyr');
    playerEl.addEventListener('mousemove', () => {
      playerEl.classList.remove('plyr--hide-cursor');
      this.hideCursorDebounced();

      if (this.plyr.paused) {
        this.hideControlsDebounced();
      }
    });
    const controlsEl = document.querySelector('.plyr__controls');
    controlsEl.addEventListener('mouseenter', () => {
      this.isHoverControls = true;
    });
    controlsEl.addEventListener('mouseleave', () => {
      this.isHoverControls = false;
    });
  }
  /** @typedef {'next'|'enterwidescreen'|'exitwidescreen'} CustomEventMap */

  /**
   * @param {CustomEventMap | keyof Plyr.PlyrEventMap} event
   * @param {function} callback
   * @private
   */


  on(event, callback) {
    if (['next', 'enterwidescreen', 'exitwidescreen'].includes(event)) {
      if (!this.eventMap[event]) this.eventMap[event] = [];
      this.eventMap[event].push(callback);
    } else {
      this.plyr.on(event, callback);
    }
  }
  /**
   * @param {CustomEventMap} event
   * @param {*} [params]
   */


  trigger(event, params) {
    const fnList = this.eventMap[event] || [];
    fnList.forEach(fn => {
      fn(this, params);
    });
  }
  /** @private */


  _injectNext() {
    $($('#plyr__next').html()).insertBefore('.plyr__controls__item.plyr__progress__container').on('click', () => {
      this.trigger('next');
    });
  }
  /** @private */


  _injectSreen() {
    $($('#plyr__fullscreen').html()).insertBefore('[data-plyr="fullscreen"]').on('click', () => {
      this._toggleFullscreen();
    });
  }
  /** @private */


  _toggleFullscreen(bool = !this.isWideScreen) {
    if (this.isWideScreen === bool) return;
    this.isWideScreen = bool;

    this._setFullscreenIcon(this.isWideScreen);

    if (this.isWideScreen) {
      $('body').css('overflow', 'hidden');
      this.$wrapper.addClass('k-player-widescreen');
    } else {
      $('body').css('overflow', '');
      this.$wrapper.removeClass('k-player-widescreen');
    }

    this.trigger(this.isWideScreen ? 'enterwidescreen' : 'exitwidescreen');
  }
  /** @private */


  _setFullscreenIcon(bool = this.isWideScreen) {
    const $use = $('.plyr__fullscreen.plyr__custom use');
    $use.attr('xlink:href', bool ? '#fullscreen-quit' : '#fullscreen');
  }
  /**
   * video src
   * @param {string} src
   */


  set src(src) {
    this.$video.attr('src', src);
  }

  get src() {
    return this.$video.attr('src');
  }

  set currentTime(value) {
    this.plyr.currentTime = value;
  }

  get currentTime() {
    return this.plyr.currentTime;
  }

  showError(text) {
    this.$error.show().find('.error-info').text(text);
  }

  hideError() {
    this.$error.hide();
  }

}


;// CONCATENATED MODULE: ./src/agefans/play.js




function replacePlayer() {
  const dom = document.getElementById('age_playfram');

  const fn = () => {
    let url = new URL(dom.src);

    if (url.hostname.includes('agefans')) {
      let videoURL = url.searchParams.get('url');

      if (videoURL) {
        initPlayer(videoURL);
        mutationOb.disconnect();
      }
    }
  };

  const mutationOb = new MutationObserver(fn);
  mutationOb.observe(dom, {
    attributes: true
  });
  fn();
}

function showCurrentLink(vurl) {
  if ($('#current-link').length) {
    return $('#current-link').text(vurl);
  }

  $(`
  <div class="baseblock">
    <div class="blockcontent">
      <div id="wangpan-div" class="baseblock2">
        <div class="blocktitle">本集链接：</div>
        <div class="blockcontent">
          <span class="res_links" id="current-link">
            ${decodeURIComponent(vurl)}
          </span>
          <br>
        </div>
      </div>
    </div>
  </div>
`).insertBefore($('.baseblock:contains(网盘资源)'));
}

function gotoNextPart() {
  const dom = $("li a[style*='color: rgb(238, 0, 0)']").parent().next().find('a');

  if (dom.length) {
    switchPart(dom.data('href'), dom);
  }
}

function getActivedom() {
  return $("li a[style*='color: rgb(238, 0, 0)']");
}
/**
 *
 * @param {string} href
 * @param {JQuery<HTMLAnchorElement>} $dom
 * @param {boolean} [push]
 */


async function switchPart(href, $dom, push = true) {
  try {
    const vurl = await getVurlWithLocal(href);
    play_player.src = vurl;
    showCurrentLink(vurl);
    const $active = getActivedom();
    $active.css('color', '');
    $active.css('border', '');
    const title = document.title.replace($active.text(), $dom.text());
    push && history.pushState({}, title, href);
    document.title = title;
    $dom.css('color', 'rgb(238, 0, 0)');
    $dom.css('border', '1px solid rgb(238, 0, 0)');
    his.logHistory();
  } catch (error) {
    console.error(error);
    window.location.href = href;
  }
}

function initPlayPageStyle() {
  let dom = document.querySelector('.fullscn');
  dom.remove();
  let ageframediv = document.getElementById('ageframediv');
  let {
    width
  } = ageframediv.getBoundingClientRect();
  ageframediv.style.height = width / 16 * 9 + 'px';
}

function updateTime(time = 0) {
  var _location$pathname$ma;

  const id = (_location$pathname$ma = location.pathname.match(/\/play\/(\d*)/)) === null || _location$pathname$ma === void 0 ? void 0 : _location$pathname$ma[1];
  if (!id) return;
  his.setTime(id, Math.floor(time));
}

function videoJumpHistoryPosition() {
  var _location$pathname$ma2, _his$get;

  const id = (_location$pathname$ma2 = location.pathname.match(/\/play\/(\d*)/)) === null || _location$pathname$ma2 === void 0 ? void 0 : _location$pathname$ma2[1];
  if (!id) return;

  if (((_his$get = his.get(id)) === null || _his$get === void 0 ? void 0 : _his$get.time) > 3) {
    play_player.currentTime = his.get(id).time;
  }
}

function addListener() {
  play_player.on('next', () => {
    gotoNextPart();
  });
  play_player.on('ended', () => {
    gotoNextPart();
  });
  play_player.plyr.once('canplay', () => {
    videoJumpHistoryPosition();
  });
  play_player.on('timeupdate', () => {
    if (Math.floor(play_player.currentTime) % 3 === 0) {
      updateTime(play_player.currentTime);
    }
  });
  window.addEventListener('popstate', () => {
    const href = location.pathname + location.search;
    const $dom = $(`[data-href='${href}']`);

    if ($dom.length) {
      switchPart(href, $dom, false);
    } else {
      location.reload();
    }
  });
}

function replaceHref() {
  $('.movurl:visible li a').each(function () {
    const href = $(this).attr('href');
    $(this).removeAttr('href').attr('data-href', href).on('click', e => {
      e.preventDefault();
      switchPart(href, $(this));
    });
  });
}
/** @type {KPlayer} */


let play_player;

function initPlayer(vurl) {
  play_player = new KPlayer('#age_playfram');
  showCurrentLink(vurl);
  addListener();
  play_player.src = vurl;
}

function removeCpraid() {
  $('#cpraid').remove();
}

function playModule() {
  his.logHistory();
  initPlayPageStyle();
  replaceHref();
  replacePlayer();
  removeCpraid();
  initGetAllVideoURL();
}
;// CONCATENATED MODULE: ./src/agefans/index.js




function agefans_agefans() {
  $('body').addClass('agefans-wrapper');

  if (false) {}

  historyModule(); // log page to history

  if (location.pathname.startsWith('/play')) {
    playModule();
  } // in detail pages show view history


  if (location.pathname.startsWith('/detail')) {
    detailModule();
  }
}
;// CONCATENATED MODULE: ./src/yhdm/play.js

/** @type {KPlayer} */

let yhdm_play_player;

function play_replacePlayer() {
  const vurl = $('#playbox').data('vid');
  yhdm_play_player = new KPlayer('.bofang iframe');
  yhdm_play_player.src = vurl.split('$')[0];
}

function play_gotoNextPart() {
  let directionRight = true;
  const re = /\/v\/\d+-(\d+)/;
  let prevID;
  Array.from($('.movurls a')).forEach(a => {
    if (re.test(a.href)) {
      const [, id] = a.href.match(re);
      if (prevID) directionRight = +prevID < +id;
      prevID = id;
    }
  });

  if (directionRight) {
    $('.movurls .sel').next().find('a')[0].click();
  } else {
    $('.movurls .sel').prev().find('a')[0].click();
  }
}

function initEvent() {
  yhdm_play_player.on('next', play_gotoNextPart);
}

function playmodule() {
  play_replacePlayer();
  initEvent();
}
// EXTERNAL MODULE: ./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/yhdm/index.scss
var yhdm = __webpack_require__(55);
;// CONCATENATED MODULE: ./src/yhdm/index.scss

            

var yhdm_options = {};

yhdm_options.insert = "head";
yhdm_options.singleton = false;

var yhdm_update = injectStylesIntoStyleTag_default()(yhdm/* default */.Z, yhdm_options);



/* harmony default export */ const src_yhdm = (yhdm/* default.locals */.Z.locals || {});
;// CONCATENATED MODULE: ./src/yhdm/index.js


function yhdm_yhdm() {
  $('body').addClass('yhdm-wrapper');

  if (window.location.pathname.includes('/v/')) {
    playmodule();
  }
}
;// CONCATENATED MODULE: ./src/index.js



if (window.location.href.includes('agefans')) {
  agefans_agefans();
}

if (window.location.href.includes('yhdm')) {
  yhdm_yhdm();
}
})();

/******/ })()
;