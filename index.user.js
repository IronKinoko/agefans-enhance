// ==UserScript==
// @name         agefans Enhance
// @namespace    https://github.com/IronKinoko/agefans-enhance
// @icon         https://www.age.tv/favicon.ico
// @version      1.54.5
// @description  增强播放功能，实现自动换集、无缝换集、画中画、历史记录、断点续播、弹幕等功能。适配agefans、NT动漫、bimiacg、mutefun、次元城、稀饭动漫
// @author       IronKinoko
// @include      https://www.age.tv/*
// @include      https://www.agefans.*
// @include      https://www.agedm.*
// @include      http*://www.bimiacg*.net*
// @include      https://pro.ascepan.top/*
// @include      https://jx.ejtsyc.com*
// @include      https://danmu.yhdmjx.com/*
// @include      https://*.sp-flv.com*
// @include      https://*43.240.74.134*
// @include      https://*43.240.156.118*
// @include      https://www.mutedm.com/*
// @include      https://www.mutean.com/*
// @include      https://www.mute01.com/*
// @include      https://www.cycanime.com/*
// @include      https://www.cyc-anime.net/*
// @include      https://www.cycani.org/*
// @include      https://www.ciyuancheng.net/*
// @include      https://player.cycanime.com/*
// @include      https://dm.xifanacg.com/*
// @include      https://player.moedot.net/*
// @include      https://www.anime1.me/*
// @include      https://anime1.me/*
// @include      https://www.gugu3.com/*
// @include      https://player.gugu3.com/*
// @include      https://*.girigirilove.com/*
// @include      http://127.0.0.1:5500/public/index.html*
// @include      https://ironkinoko.github.io/agefans-enhance/*
// @run-at       document-end
// @require      https://unpkg.com/jquery@3.6.0/dist/jquery.min.js
// @require      https://unpkg.com/plyr@3.6.4/dist/plyr.min.js
// @require      https://unpkg.com/hls.js@1.6.15/dist/hls.min.js
// @require      https://unpkg.com/@ironkinoko/danmaku@1.4.5/dist/danmaku.umd.js
// @require      https://unpkg.com/opencc-js@1.0.5/dist/umd/full.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @connect      dandanplay.net
// @license      MIT
// @downloadURL  https://github.com/IronKinoko/agefans-enhance/raw/gh-pages/index.user.js
// @updateURL    https://github.com/IronKinoko/agefans-enhance/raw/gh-pages/index.user.js
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

(function(opencc_js, hls_js, plyr, _ironkinoko_danmaku) {

//#region \0rolldown/runtime.js
	var __create = Object.create;
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __getProtoOf = Object.getPrototypeOf;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") {
			for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) {
					__defProp(to, key, {
						get: ((k) => from[k]).bind(null, key),
						enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
					});
				}
			}
		}
		return to;
	};
	var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
		value: mod,
		enumerable: true
	}) : target, mod));

//#endregion
opencc_js = __toESM(opencc_js);
hls_js = __toESM(hls_js);
plyr = __toESM(plyr);
_ironkinoko_danmaku = __toESM(_ironkinoko_danmaku);

//#region \0virtual:bocchi-style-runtime
	function injectStyle(css) {
		if (typeof document === "undefined") return;
		const style = document.createElement("style");
		style.setAttribute("data-bocchi", "");
		document.head.append(style);
		style.textContent = css;
	}

//#endregion
//#region node_modules/.pnpm/plyr@3.6.4/node_modules/plyr/dist/plyr.css
	injectStyle("@keyframes plyr-progress{to{background-position:25px 0;background-position:var(--plyr-progress-loading-size,25px) 0}}@keyframes plyr-popup{0%{opacity:.5;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes plyr-fade-in{from{opacity:0}to{opacity:1}}.plyr{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;align-items:center;direction:ltr;display:flex;flex-direction:column;font-family:inherit;font-family:var(--plyr-font-family,inherit);font-variant-numeric:tabular-nums;font-weight:400;font-weight:var(--plyr-font-weight-regular,400);line-height:1.7;line-height:var(--plyr-line-height,1.7);max-width:100%;min-width:200px;position:relative;text-shadow:none;transition:box-shadow .3s ease;z-index:0}.plyr audio,.plyr iframe,.plyr video{display:block;height:100%;width:100%}.plyr button{font:inherit;line-height:inherit;width:auto}.plyr:focus{outline:0}.plyr--full-ui{box-sizing:border-box}.plyr--full-ui *,.plyr--full-ui ::after,.plyr--full-ui ::before{box-sizing:inherit}.plyr--full-ui a,.plyr--full-ui button,.plyr--full-ui input,.plyr--full-ui label{touch-action:manipulation}.plyr__badge{background:#4a5464;background:var(--plyr-badge-background,#4a5464);border-radius:2px;border-radius:var(--plyr-badge-border-radius,2px);color:#fff;color:var(--plyr-badge-text-color,#fff);font-size:9px;font-size:var(--plyr-font-size-badge,9px);line-height:1;padding:3px 4px}.plyr--full-ui ::-webkit-media-text-track-container{display:none}.plyr__captions{animation:plyr-fade-in .3s ease;bottom:0;display:none;font-size:13px;font-size:var(--plyr-font-size-small,13px);left:0;padding:10px;padding:var(--plyr-control-spacing,10px);position:absolute;text-align:center;transition:transform .4s ease-in-out;width:100%}.plyr__captions span:empty{display:none}@media (min-width:480px){.plyr__captions{font-size:15px;font-size:var(--plyr-font-size-base,15px);padding:calc(10px * 2);padding:calc(var(--plyr-control-spacing,10px) * 2)}}@media (min-width:768px){.plyr__captions{font-size:18px;font-size:var(--plyr-font-size-large,18px)}}.plyr--captions-active .plyr__captions{display:block}.plyr:not(.plyr--hide-controls) .plyr__controls:not(:empty)~.plyr__captions{transform:translateY(calc(10px * -4));transform:translateY(calc(var(--plyr-control-spacing,10px) * -4))}.plyr__caption{background:rgba(0,0,0,.8);background:var(--plyr-captions-background,rgba(0,0,0,.8));border-radius:2px;-webkit-box-decoration-break:clone;box-decoration-break:clone;color:#fff;color:var(--plyr-captions-text-color,#fff);line-height:185%;padding:.2em .5em;white-space:pre-wrap}.plyr__caption div{display:inline}.plyr__control{background:0 0;border:0;border-radius:3px;border-radius:var(--plyr-control-radius,3px);color:inherit;cursor:pointer;flex-shrink:0;overflow:visible;padding:calc(10px * .7);padding:calc(var(--plyr-control-spacing,10px) * .7);position:relative;transition:all .3s ease}.plyr__control svg{display:block;fill:currentColor;height:18px;height:var(--plyr-control-icon-size,18px);pointer-events:none;width:18px;width:var(--plyr-control-icon-size,18px)}.plyr__control:focus{outline:0}.plyr__control.plyr__tab-focus{outline-color:#00b3ff;outline-color:var(--plyr-tab-focus-color,var(--plyr-color-main,var(--plyr-color-main,#00b3ff)));outline-offset:2px;outline-style:dotted;outline-width:3px}a.plyr__control{text-decoration:none}a.plyr__control::after,a.plyr__control::before{display:none}.plyr__control.plyr__control--pressed .icon--not-pressed,.plyr__control.plyr__control--pressed .label--not-pressed,.plyr__control:not(.plyr__control--pressed) .icon--pressed,.plyr__control:not(.plyr__control--pressed) .label--pressed{display:none}.plyr--full-ui ::-webkit-media-controls{display:none}.plyr__controls{align-items:center;display:flex;justify-content:flex-end;text-align:center}.plyr__controls .plyr__progress__container{flex:1;min-width:0}.plyr__controls .plyr__controls__item{margin-left:calc(10px / 4);margin-left:calc(var(--plyr-control-spacing,10px)/ 4)}.plyr__controls .plyr__controls__item:first-child{margin-left:0;margin-right:auto}.plyr__controls .plyr__controls__item.plyr__progress__container{padding-left:calc(10px / 4);padding-left:calc(var(--plyr-control-spacing,10px)/ 4)}.plyr__controls .plyr__controls__item.plyr__time{padding:0 calc(10px / 2);padding:0 calc(var(--plyr-control-spacing,10px)/ 2)}.plyr__controls .plyr__controls__item.plyr__progress__container:first-child,.plyr__controls .plyr__controls__item.plyr__time+.plyr__time,.plyr__controls .plyr__controls__item.plyr__time:first-child{padding-left:0}.plyr__controls:empty{display:none}.plyr [data-plyr=airplay],.plyr [data-plyr=captions],.plyr [data-plyr=fullscreen],.plyr [data-plyr=pip]{display:none}.plyr--airplay-supported [data-plyr=airplay],.plyr--captions-enabled [data-plyr=captions],.plyr--fullscreen-enabled [data-plyr=fullscreen],.plyr--pip-supported [data-plyr=pip]{display:inline-block}.plyr__menu{display:flex;position:relative}.plyr__menu .plyr__control svg{transition:transform .3s ease}.plyr__menu .plyr__control[aria-expanded=true] svg{transform:rotate(90deg)}.plyr__menu .plyr__control[aria-expanded=true] .plyr__tooltip{display:none}.plyr__menu__container{animation:plyr-popup .2s ease;background:rgba(255,255,255,.9);background:var(--plyr-menu-background,rgba(255,255,255,.9));border-radius:4px;bottom:100%;box-shadow:0 1px 2px rgba(0,0,0,.15);box-shadow:var(--plyr-menu-shadow,0 1px 2px rgba(0,0,0,.15));color:#4a5464;color:var(--plyr-menu-color,#4a5464);font-size:15px;font-size:var(--plyr-font-size-base,15px);margin-bottom:10px;position:absolute;right:-3px;text-align:left;white-space:nowrap;z-index:3}.plyr__menu__container>div{overflow:hidden;transition:height .35s cubic-bezier(.4,0,.2,1),width .35s cubic-bezier(.4,0,.2,1)}.plyr__menu__container::after{border:4px solid transparent;border:var(--plyr-menu-arrow-size,4px) solid transparent;border-top-color:rgba(255,255,255,.9);border-top-color:var(--plyr-menu-background,rgba(255,255,255,.9));content:'';height:0;position:absolute;right:calc(((18px / 2) + calc(10px * .7)) - (4px / 2));right:calc(((var(--plyr-control-icon-size,18px)/ 2) + calc(var(--plyr-control-spacing,10px) * .7)) - (var(--plyr-menu-arrow-size,4px)/ 2));top:100%;width:0}.plyr__menu__container [role=menu]{padding:calc(10px * .7);padding:calc(var(--plyr-control-spacing,10px) * .7)}.plyr__menu__container [role=menuitem],.plyr__menu__container [role=menuitemradio]{margin-top:2px}.plyr__menu__container [role=menuitem]:first-child,.plyr__menu__container [role=menuitemradio]:first-child{margin-top:0}.plyr__menu__container .plyr__control{align-items:center;color:#4a5464;color:var(--plyr-menu-color,#4a5464);display:flex;font-size:13px;font-size:var(--plyr-font-size-menu,var(--plyr-font-size-small,13px));padding-bottom:calc(calc(10px * .7)/ 1.5);padding-bottom:calc(calc(var(--plyr-control-spacing,10px) * .7)/ 1.5);padding-left:calc(calc(10px * .7) * 1.5);padding-left:calc(calc(var(--plyr-control-spacing,10px) * .7) * 1.5);padding-right:calc(calc(10px * .7) * 1.5);padding-right:calc(calc(var(--plyr-control-spacing,10px) * .7) * 1.5);padding-top:calc(calc(10px * .7)/ 1.5);padding-top:calc(calc(var(--plyr-control-spacing,10px) * .7)/ 1.5);-webkit-user-select:none;-ms-user-select:none;user-select:none;width:100%}.plyr__menu__container .plyr__control>span{align-items:inherit;display:flex;width:100%}.plyr__menu__container .plyr__control::after{border:4px solid transparent;border:var(--plyr-menu-item-arrow-size,4px) solid transparent;content:'';position:absolute;top:50%;transform:translateY(-50%)}.plyr__menu__container .plyr__control--forward{padding-right:calc(calc(10px * .7) * 4);padding-right:calc(calc(var(--plyr-control-spacing,10px) * .7) * 4)}.plyr__menu__container .plyr__control--forward::after{border-left-color:#728197;border-left-color:var(--plyr-menu-arrow-color,#728197);right:calc((calc(10px * .7) * 1.5) - 4px);right:calc((calc(var(--plyr-control-spacing,10px) * .7) * 1.5) - var(--plyr-menu-item-arrow-size,4px))}.plyr__menu__container .plyr__control--forward.plyr__tab-focus::after,.plyr__menu__container .plyr__control--forward:hover::after{border-left-color:currentColor}.plyr__menu__container .plyr__control--back{font-weight:400;font-weight:var(--plyr-font-weight-regular,400);margin:calc(10px * .7);margin:calc(var(--plyr-control-spacing,10px) * .7);margin-bottom:calc(calc(10px * .7)/ 2);margin-bottom:calc(calc(var(--plyr-control-spacing,10px) * .7)/ 2);padding-left:calc(calc(10px * .7) * 4);padding-left:calc(calc(var(--plyr-control-spacing,10px) * .7) * 4);position:relative;width:calc(100% - (calc(10px * .7) * 2));width:calc(100% - (calc(var(--plyr-control-spacing,10px) * .7) * 2))}.plyr__menu__container .plyr__control--back::after{border-right-color:#728197;border-right-color:var(--plyr-menu-arrow-color,#728197);left:calc((calc(10px * .7) * 1.5) - 4px);left:calc((calc(var(--plyr-control-spacing,10px) * .7) * 1.5) - var(--plyr-menu-item-arrow-size,4px))}.plyr__menu__container .plyr__control--back::before{background:#dcdfe5;background:var(--plyr-menu-back-border-color,#dcdfe5);box-shadow:0 1px 0 #fff;box-shadow:0 1px 0 var(--plyr-menu-back-border-shadow-color,#fff);content:'';height:1px;left:0;margin-top:calc(calc(10px * .7)/ 2);margin-top:calc(calc(var(--plyr-control-spacing,10px) * .7)/ 2);overflow:hidden;position:absolute;right:0;top:100%}.plyr__menu__container .plyr__control--back.plyr__tab-focus::after,.plyr__menu__container .plyr__control--back:hover::after{border-right-color:currentColor}.plyr__menu__container .plyr__control[role=menuitemradio]{padding-left:calc(10px * .7);padding-left:calc(var(--plyr-control-spacing,10px) * .7)}.plyr__menu__container .plyr__control[role=menuitemradio]::after,.plyr__menu__container .plyr__control[role=menuitemradio]::before{border-radius:100%}.plyr__menu__container .plyr__control[role=menuitemradio]::before{background:rgba(0,0,0,.1);content:'';display:block;flex-shrink:0;height:16px;margin-right:10px;margin-right:var(--plyr-control-spacing,10px);transition:all .3s ease;width:16px}.plyr__menu__container .plyr__control[role=menuitemradio]::after{background:#fff;border:0;height:6px;left:12px;opacity:0;top:50%;transform:translateY(-50%) scale(0);transition:transform .3s ease,opacity .3s ease;width:6px}.plyr__menu__container .plyr__control[role=menuitemradio][aria-checked=true]::before{background:#00b3ff;background:var(--plyr-control-toggle-checked-background,var(--plyr-color-main,var(--plyr-color-main,#00b3ff)))}.plyr__menu__container .plyr__control[role=menuitemradio][aria-checked=true]::after{opacity:1;transform:translateY(-50%) scale(1)}.plyr__menu__container .plyr__control[role=menuitemradio].plyr__tab-focus::before,.plyr__menu__container .plyr__control[role=menuitemradio]:hover::before{background:rgba(35,40,47,.1)}.plyr__menu__container .plyr__menu__value{align-items:center;display:flex;margin-left:auto;margin-right:calc((calc(10px * .7) - 2) * -1);margin-right:calc((calc(var(--plyr-control-spacing,10px) * .7) - 2) * -1);overflow:hidden;padding-left:calc(calc(10px * .7) * 3.5);padding-left:calc(calc(var(--plyr-control-spacing,10px) * .7) * 3.5);pointer-events:none}.plyr--full-ui input[type=range]{-webkit-appearance:none;background:0 0;border:0;border-radius:calc(13px * 2);border-radius:calc(var(--plyr-range-thumb-height,13px) * 2);color:#00b3ff;color:var(--plyr-range-fill-background,var(--plyr-color-main,var(--plyr-color-main,#00b3ff)));display:block;height:calc((3px * 2) + 13px);height:calc((var(--plyr-range-thumb-active-shadow-width,3px) * 2) + var(--plyr-range-thumb-height,13px));margin:0;min-width:0;padding:0;transition:box-shadow .3s ease;width:100%}.plyr--full-ui input[type=range]::-webkit-slider-runnable-track{background:0 0;border:0;border-radius:calc(5px / 2);border-radius:calc(var(--plyr-range-track-height,5px)/ 2);height:5px;height:var(--plyr-range-track-height,5px);-webkit-transition:box-shadow .3s ease;transition:box-shadow .3s ease;-webkit-user-select:none;user-select:none;background-image:linear-gradient(to right,currentColor 0,transparent 0);background-image:linear-gradient(to right,currentColor var(--value,0),transparent var(--value,0))}.plyr--full-ui input[type=range]::-webkit-slider-thumb{background:#fff;background:var(--plyr-range-thumb-background,#fff);border:0;border-radius:100%;box-shadow:0 1px 1px rgba(35,40,47,.15),0 0 0 1px rgba(35,40,47,.2);box-shadow:var(--plyr-range-thumb-shadow,0 1px 1px rgba(35,40,47,.15),0 0 0 1px rgba(35,40,47,.2));height:13px;height:var(--plyr-range-thumb-height,13px);position:relative;-webkit-transition:all .2s ease;transition:all .2s ease;width:13px;width:var(--plyr-range-thumb-height,13px);-webkit-appearance:none;margin-top:calc(((13px - 5px)/ 2) * -1);margin-top:calc(((var(--plyr-range-thumb-height,13px) - var(--plyr-range-track-height,5px))/ 2) * -1)}.plyr--full-ui input[type=range]::-moz-range-track{background:0 0;border:0;border-radius:calc(5px / 2);border-radius:calc(var(--plyr-range-track-height,5px)/ 2);height:5px;height:var(--plyr-range-track-height,5px);-moz-transition:box-shadow .3s ease;transition:box-shadow .3s ease;user-select:none}.plyr--full-ui input[type=range]::-moz-range-thumb{background:#fff;background:var(--plyr-range-thumb-background,#fff);border:0;border-radius:100%;box-shadow:0 1px 1px rgba(35,40,47,.15),0 0 0 1px rgba(35,40,47,.2);box-shadow:var(--plyr-range-thumb-shadow,0 1px 1px rgba(35,40,47,.15),0 0 0 1px rgba(35,40,47,.2));height:13px;height:var(--plyr-range-thumb-height,13px);position:relative;-moz-transition:all .2s ease;transition:all .2s ease;width:13px;width:var(--plyr-range-thumb-height,13px)}.plyr--full-ui input[type=range]::-moz-range-progress{background:currentColor;border-radius:calc(5px / 2);border-radius:calc(var(--plyr-range-track-height,5px)/ 2);height:5px;height:var(--plyr-range-track-height,5px)}.plyr--full-ui input[type=range]::-ms-track{background:0 0;border:0;border-radius:calc(5px / 2);border-radius:calc(var(--plyr-range-track-height,5px)/ 2);height:5px;height:var(--plyr-range-track-height,5px);-ms-transition:box-shadow .3s ease;transition:box-shadow .3s ease;-ms-user-select:none;user-select:none;color:transparent}.plyr--full-ui input[type=range]::-ms-fill-upper{background:0 0;border:0;border-radius:calc(5px / 2);border-radius:calc(var(--plyr-range-track-height,5px)/ 2);height:5px;height:var(--plyr-range-track-height,5px);-ms-transition:box-shadow .3s ease;transition:box-shadow .3s ease;-ms-user-select:none;user-select:none}.plyr--full-ui input[type=range]::-ms-fill-lower{background:0 0;border:0;border-radius:calc(5px / 2);border-radius:calc(var(--plyr-range-track-height,5px)/ 2);height:5px;height:var(--plyr-range-track-height,5px);-ms-transition:box-shadow .3s ease;transition:box-shadow .3s ease;-ms-user-select:none;user-select:none;background:currentColor}.plyr--full-ui input[type=range]::-ms-thumb{background:#fff;background:var(--plyr-range-thumb-background,#fff);border:0;border-radius:100%;box-shadow:0 1px 1px rgba(35,40,47,.15),0 0 0 1px rgba(35,40,47,.2);box-shadow:var(--plyr-range-thumb-shadow,0 1px 1px rgba(35,40,47,.15),0 0 0 1px rgba(35,40,47,.2));height:13px;height:var(--plyr-range-thumb-height,13px);position:relative;-ms-transition:all .2s ease;transition:all .2s ease;width:13px;width:var(--plyr-range-thumb-height,13px);margin-top:0}.plyr--full-ui input[type=range]::-ms-tooltip{display:none}.plyr--full-ui input[type=range]:focus{outline:0}.plyr--full-ui input[type=range]::-moz-focus-outer{border:0}.plyr--full-ui input[type=range].plyr__tab-focus::-webkit-slider-runnable-track{outline-color:#00b3ff;outline-color:var(--plyr-tab-focus-color,var(--plyr-color-main,var(--plyr-color-main,#00b3ff)));outline-offset:2px;outline-style:dotted;outline-width:3px}.plyr--full-ui input[type=range].plyr__tab-focus::-moz-range-track{outline-color:#00b3ff;outline-color:var(--plyr-tab-focus-color,var(--plyr-color-main,var(--plyr-color-main,#00b3ff)));outline-offset:2px;outline-style:dotted;outline-width:3px}.plyr--full-ui input[type=range].plyr__tab-focus::-ms-track{outline-color:#00b3ff;outline-color:var(--plyr-tab-focus-color,var(--plyr-color-main,var(--plyr-color-main,#00b3ff)));outline-offset:2px;outline-style:dotted;outline-width:3px}.plyr__poster{background-color:#000;background-color:var(--plyr-video-background,var(--plyr-video-background,#000));background-position:50% 50%;background-repeat:no-repeat;background-size:contain;height:100%;left:0;opacity:0;position:absolute;top:0;transition:opacity .2s ease;width:100%;z-index:1}.plyr--stopped.plyr__poster-enabled .plyr__poster{opacity:1}.plyr__time{font-size:13px;font-size:var(--plyr-font-size-time,var(--plyr-font-size-small,13px))}.plyr__time+.plyr__time::before{content:'\\2044';margin-right:10px;margin-right:var(--plyr-control-spacing,10px)}@media (max-width:767px){.plyr__time+.plyr__time{display:none}}.plyr__tooltip{background:rgba(255,255,255,.9);background:var(--plyr-tooltip-background,rgba(255,255,255,.9));border-radius:3px;border-radius:var(--plyr-tooltip-radius,3px);bottom:100%;box-shadow:0 1px 2px rgba(0,0,0,.15);box-shadow:var(--plyr-tooltip-shadow,0 1px 2px rgba(0,0,0,.15));color:#4a5464;color:var(--plyr-tooltip-color,#4a5464);font-size:13px;font-size:var(--plyr-font-size-small,13px);font-weight:400;font-weight:var(--plyr-font-weight-regular,400);left:50%;line-height:1.3;margin-bottom:calc(calc(10px / 2) * 2);margin-bottom:calc(calc(var(--plyr-control-spacing,10px)/ 2) * 2);opacity:0;padding:calc(10px / 2) calc(calc(10px / 2) * 1.5);padding:calc(var(--plyr-control-spacing,10px)/ 2) calc(calc(var(--plyr-control-spacing,10px)/ 2) * 1.5);pointer-events:none;position:absolute;transform:translate(-50%,10px) scale(.8);transform-origin:50% 100%;transition:transform .2s .1s ease,opacity .2s .1s ease;white-space:nowrap;z-index:2}.plyr__tooltip::before{border-left:4px solid transparent;border-left:var(--plyr-tooltip-arrow-size,4px) solid transparent;border-right:4px solid transparent;border-right:var(--plyr-tooltip-arrow-size,4px) solid transparent;border-top:4px solid rgba(255,255,255,.9);border-top:var(--plyr-tooltip-arrow-size,4px) solid var(--plyr-tooltip-background,rgba(255,255,255,.9));bottom:calc(4px * -1);bottom:calc(var(--plyr-tooltip-arrow-size,4px) * -1);content:'';height:0;left:50%;position:absolute;transform:translateX(-50%);width:0;z-index:2}.plyr .plyr__control.plyr__tab-focus .plyr__tooltip,.plyr .plyr__control:hover .plyr__tooltip,.plyr__tooltip--visible{opacity:1;transform:translate(-50%,0) scale(1)}.plyr .plyr__control:hover .plyr__tooltip{z-index:3}.plyr__controls>.plyr__control:first-child .plyr__tooltip,.plyr__controls>.plyr__control:first-child+.plyr__control .plyr__tooltip{left:0;transform:translate(0,10px) scale(.8);transform-origin:0 100%}.plyr__controls>.plyr__control:first-child .plyr__tooltip::before,.plyr__controls>.plyr__control:first-child+.plyr__control .plyr__tooltip::before{left:calc((18px / 2) + calc(10px * .7));left:calc((var(--plyr-control-icon-size,18px)/ 2) + calc(var(--plyr-control-spacing,10px) * .7))}.plyr__controls>.plyr__control:last-child .plyr__tooltip{left:auto;right:0;transform:translate(0,10px) scale(.8);transform-origin:100% 100%}.plyr__controls>.plyr__control:last-child .plyr__tooltip::before{left:auto;right:calc((18px / 2) + calc(10px * .7));right:calc((var(--plyr-control-icon-size,18px)/ 2) + calc(var(--plyr-control-spacing,10px) * .7));transform:translateX(50%)}.plyr__controls>.plyr__control:first-child .plyr__tooltip--visible,.plyr__controls>.plyr__control:first-child+.plyr__control .plyr__tooltip--visible,.plyr__controls>.plyr__control:first-child+.plyr__control.plyr__tab-focus .plyr__tooltip,.plyr__controls>.plyr__control:first-child+.plyr__control:hover .plyr__tooltip,.plyr__controls>.plyr__control:first-child.plyr__tab-focus .plyr__tooltip,.plyr__controls>.plyr__control:first-child:hover .plyr__tooltip,.plyr__controls>.plyr__control:last-child .plyr__tooltip--visible,.plyr__controls>.plyr__control:last-child.plyr__tab-focus .plyr__tooltip,.plyr__controls>.plyr__control:last-child:hover .plyr__tooltip{transform:translate(0,0) scale(1)}.plyr__progress{left:calc(13px * .5);left:calc(var(--plyr-range-thumb-height,13px) * .5);margin-right:13px;margin-right:var(--plyr-range-thumb-height,13px);position:relative}.plyr__progress input[type=range],.plyr__progress__buffer{margin-left:calc(13px * -.5);margin-left:calc(var(--plyr-range-thumb-height,13px) * -.5);margin-right:calc(13px * -.5);margin-right:calc(var(--plyr-range-thumb-height,13px) * -.5);width:calc(100% + 13px);width:calc(100% + var(--plyr-range-thumb-height,13px))}.plyr__progress input[type=range]{position:relative;z-index:2}.plyr__progress .plyr__tooltip{font-size:13px;font-size:var(--plyr-font-size-time,var(--plyr-font-size-small,13px));left:0}.plyr__progress__buffer{-webkit-appearance:none;background:0 0;border:0;border-radius:100px;height:5px;height:var(--plyr-range-track-height,5px);left:0;margin-top:calc((5px / 2) * -1);margin-top:calc((var(--plyr-range-track-height,5px)/ 2) * -1);padding:0;position:absolute;top:50%}.plyr__progress__buffer::-webkit-progress-bar{background:0 0}.plyr__progress__buffer::-webkit-progress-value{background:currentColor;border-radius:100px;min-width:5px;min-width:var(--plyr-range-track-height,5px);-webkit-transition:width .2s ease;transition:width .2s ease}.plyr__progress__buffer::-moz-progress-bar{background:currentColor;border-radius:100px;min-width:5px;min-width:var(--plyr-range-track-height,5px);-moz-transition:width .2s ease;transition:width .2s ease}.plyr__progress__buffer::-ms-fill{border-radius:100px;-ms-transition:width .2s ease;transition:width .2s ease}.plyr--loading .plyr__progress__buffer{animation:plyr-progress 1s linear infinite;background-image:linear-gradient(-45deg,rgba(35,40,47,.6) 25%,transparent 25%,transparent 50%,rgba(35,40,47,.6) 50%,rgba(35,40,47,.6) 75%,transparent 75%,transparent);background-image:linear-gradient(-45deg,var(--plyr-progress-loading-background,rgba(35,40,47,.6)) 25%,transparent 25%,transparent 50%,var(--plyr-progress-loading-background,rgba(35,40,47,.6)) 50%,var(--plyr-progress-loading-background,rgba(35,40,47,.6)) 75%,transparent 75%,transparent);background-repeat:repeat-x;background-size:25px 25px;background-size:var(--plyr-progress-loading-size,25px) var(--plyr-progress-loading-size,25px);color:transparent}.plyr--video.plyr--loading .plyr__progress__buffer{background-color:rgba(255,255,255,.25);background-color:var(--plyr-video-progress-buffered-background,rgba(255,255,255,.25))}.plyr--audio.plyr--loading .plyr__progress__buffer{background-color:rgba(193,200,209,.6);background-color:var(--plyr-audio-progress-buffered-background,rgba(193,200,209,.6))}.plyr__volume{align-items:center;display:flex;max-width:110px;min-width:80px;position:relative;width:20%}.plyr__volume input[type=range]{margin-left:calc(10px / 2);margin-left:calc(var(--plyr-control-spacing,10px)/ 2);margin-right:calc(10px / 2);margin-right:calc(var(--plyr-control-spacing,10px)/ 2);position:relative;z-index:2}.plyr--is-ios .plyr__volume{min-width:0;width:auto}.plyr--audio{display:block}.plyr--audio .plyr__controls{background:#fff;background:var(--plyr-audio-controls-background,#fff);border-radius:inherit;color:#4a5464;color:var(--plyr-audio-control-color,#4a5464);padding:10px;padding:var(--plyr-control-spacing,10px)}.plyr--audio .plyr__control.plyr__tab-focus,.plyr--audio .plyr__control:hover,.plyr--audio .plyr__control[aria-expanded=true]{background:#00b3ff;background:var(--plyr-audio-control-background-hover,var(--plyr-color-main,var(--plyr-color-main,#00b3ff)));color:#fff;color:var(--plyr-audio-control-color-hover,#fff)}.plyr--full-ui.plyr--audio input[type=range]::-webkit-slider-runnable-track{background-color:rgba(193,200,209,.6);background-color:var(--plyr-audio-range-track-background,var(--plyr-audio-progress-buffered-background,rgba(193,200,209,.6)))}.plyr--full-ui.plyr--audio input[type=range]::-moz-range-track{background-color:rgba(193,200,209,.6);background-color:var(--plyr-audio-range-track-background,var(--plyr-audio-progress-buffered-background,rgba(193,200,209,.6)))}.plyr--full-ui.plyr--audio input[type=range]::-ms-track{background-color:rgba(193,200,209,.6);background-color:var(--plyr-audio-range-track-background,var(--plyr-audio-progress-buffered-background,rgba(193,200,209,.6)))}.plyr--full-ui.plyr--audio input[type=range]:active::-webkit-slider-thumb{box-shadow:0 1px 1px rgba(35,40,47,.15),0 0 0 1px rgba(35,40,47,.2),0 0 0 3px rgba(35,40,47,.1);box-shadow:var(--plyr-range-thumb-shadow,0 1px 1px rgba(35,40,47,.15),0 0 0 1px rgba(35,40,47,.2)),0 0 0 var(--plyr-range-thumb-active-shadow-width,3px) var(--plyr-audio-range-thumb-active-shadow-color,rgba(35,40,47,.1))}.plyr--full-ui.plyr--audio input[type=range]:active::-moz-range-thumb{box-shadow:0 1px 1px rgba(35,40,47,.15),0 0 0 1px rgba(35,40,47,.2),0 0 0 3px rgba(35,40,47,.1);box-shadow:var(--plyr-range-thumb-shadow,0 1px 1px rgba(35,40,47,.15),0 0 0 1px rgba(35,40,47,.2)),0 0 0 var(--plyr-range-thumb-active-shadow-width,3px) var(--plyr-audio-range-thumb-active-shadow-color,rgba(35,40,47,.1))}.plyr--full-ui.plyr--audio input[type=range]:active::-ms-thumb{box-shadow:0 1px 1px rgba(35,40,47,.15),0 0 0 1px rgba(35,40,47,.2),0 0 0 3px rgba(35,40,47,.1);box-shadow:var(--plyr-range-thumb-shadow,0 1px 1px rgba(35,40,47,.15),0 0 0 1px rgba(35,40,47,.2)),0 0 0 var(--plyr-range-thumb-active-shadow-width,3px) var(--plyr-audio-range-thumb-active-shadow-color,rgba(35,40,47,.1))}.plyr--audio .plyr__progress__buffer{color:rgba(193,200,209,.6);color:var(--plyr-audio-progress-buffered-background,rgba(193,200,209,.6))}.plyr--video{background:#000;background:var(--plyr-video-background,var(--plyr-video-background,#000));overflow:hidden}.plyr--video.plyr--menu-open{overflow:visible}.plyr__video-wrapper{background:#000;background:var(--plyr-video-background,var(--plyr-video-background,#000));height:100%;margin:auto;overflow:hidden;position:relative;width:100%}.plyr__video-embed,.plyr__video-wrapper--fixed-ratio{height:0;padding-bottom:56.25%}.plyr__video-embed iframe,.plyr__video-wrapper--fixed-ratio video{border:0;left:0;position:absolute;top:0}.plyr--full-ui .plyr__video-embed>.plyr__video-embed__container{padding-bottom:240%;position:relative;transform:translateY(-38.28125%)}.plyr--video .plyr__controls{background:linear-gradient(rgba(0,0,0,0),rgba(0,0,0,.75));background:var(--plyr-video-controls-background,linear-gradient(rgba(0,0,0,0),rgba(0,0,0,.75)));border-bottom-left-radius:inherit;border-bottom-right-radius:inherit;bottom:0;color:#fff;color:var(--plyr-video-control-color,#fff);left:0;padding:calc(10px / 2);padding:calc(var(--plyr-control-spacing,10px)/ 2);padding-top:calc(10px * 2);padding-top:calc(var(--plyr-control-spacing,10px) * 2);position:absolute;right:0;transition:opacity .4s ease-in-out,transform .4s ease-in-out;z-index:3}@media (min-width:480px){.plyr--video .plyr__controls{padding:10px;padding:var(--plyr-control-spacing,10px);padding-top:calc(10px * 3.5);padding-top:calc(var(--plyr-control-spacing,10px) * 3.5)}}.plyr--video.plyr--hide-controls .plyr__controls{opacity:0;pointer-events:none;transform:translateY(100%)}.plyr--video .plyr__control.plyr__tab-focus,.plyr--video .plyr__control:hover,.plyr--video .plyr__control[aria-expanded=true]{background:#00b3ff;background:var(--plyr-video-control-background-hover,var(--plyr-color-main,var(--plyr-color-main,#00b3ff)));color:#fff;color:var(--plyr-video-control-color-hover,#fff)}.plyr__control--overlaid{background:#00b3ff;background:var(--plyr-video-control-background-hover,var(--plyr-color-main,var(--plyr-color-main,#00b3ff)));border:0;border-radius:100%;color:#fff;color:var(--plyr-video-control-color,#fff);display:none;left:50%;opacity:.9;padding:calc(10px * 1.5);padding:calc(var(--plyr-control-spacing,10px) * 1.5);position:absolute;top:50%;transform:translate(-50%,-50%);transition:.3s;z-index:2}.plyr__control--overlaid svg{left:2px;position:relative}.plyr__control--overlaid:focus,.plyr__control--overlaid:hover{opacity:1}.plyr--playing .plyr__control--overlaid{opacity:0;visibility:hidden}.plyr--full-ui.plyr--video .plyr__control--overlaid{display:block}.plyr--full-ui.plyr--video input[type=range]::-webkit-slider-runnable-track{background-color:rgba(255,255,255,.25);background-color:var(--plyr-video-range-track-background,var(--plyr-video-progress-buffered-background,rgba(255,255,255,.25)))}.plyr--full-ui.plyr--video input[type=range]::-moz-range-track{background-color:rgba(255,255,255,.25);background-color:var(--plyr-video-range-track-background,var(--plyr-video-progress-buffered-background,rgba(255,255,255,.25)))}.plyr--full-ui.plyr--video input[type=range]::-ms-track{background-color:rgba(255,255,255,.25);background-color:var(--plyr-video-range-track-background,var(--plyr-video-progress-buffered-background,rgba(255,255,255,.25)))}.plyr--full-ui.plyr--video input[type=range]:active::-webkit-slider-thumb{box-shadow:0 1px 1px rgba(35,40,47,.15),0 0 0 1px rgba(35,40,47,.2),0 0 0 3px rgba(255,255,255,.5);box-shadow:var(--plyr-range-thumb-shadow,0 1px 1px rgba(35,40,47,.15),0 0 0 1px rgba(35,40,47,.2)),0 0 0 var(--plyr-range-thumb-active-shadow-width,3px) var(--plyr-audio-range-thumb-active-shadow-color,rgba(255,255,255,.5))}.plyr--full-ui.plyr--video input[type=range]:active::-moz-range-thumb{box-shadow:0 1px 1px rgba(35,40,47,.15),0 0 0 1px rgba(35,40,47,.2),0 0 0 3px rgba(255,255,255,.5);box-shadow:var(--plyr-range-thumb-shadow,0 1px 1px rgba(35,40,47,.15),0 0 0 1px rgba(35,40,47,.2)),0 0 0 var(--plyr-range-thumb-active-shadow-width,3px) var(--plyr-audio-range-thumb-active-shadow-color,rgba(255,255,255,.5))}.plyr--full-ui.plyr--video input[type=range]:active::-ms-thumb{box-shadow:0 1px 1px rgba(35,40,47,.15),0 0 0 1px rgba(35,40,47,.2),0 0 0 3px rgba(255,255,255,.5);box-shadow:var(--plyr-range-thumb-shadow,0 1px 1px rgba(35,40,47,.15),0 0 0 1px rgba(35,40,47,.2)),0 0 0 var(--plyr-range-thumb-active-shadow-width,3px) var(--plyr-audio-range-thumb-active-shadow-color,rgba(255,255,255,.5))}.plyr--video .plyr__progress__buffer{color:rgba(255,255,255,.25);color:var(--plyr-video-progress-buffered-background,rgba(255,255,255,.25))}.plyr:-webkit-full-screen{background:#000;border-radius:0!important;height:100%;margin:0;width:100%}.plyr:-ms-fullscreen{background:#000;border-radius:0!important;height:100%;margin:0;width:100%}.plyr:fullscreen{background:#000;border-radius:0!important;height:100%;margin:0;width:100%}.plyr:-webkit-full-screen video{height:100%}.plyr:-ms-fullscreen video{height:100%}.plyr:fullscreen video{height:100%}.plyr:-webkit-full-screen .plyr__video-wrapper{height:100%;position:static}.plyr:-ms-fullscreen .plyr__video-wrapper{height:100%;position:static}.plyr:fullscreen .plyr__video-wrapper{height:100%;position:static}.plyr:-webkit-full-screen.plyr--vimeo .plyr__video-wrapper{height:0;position:relative}.plyr:-ms-fullscreen.plyr--vimeo .plyr__video-wrapper{height:0;position:relative}.plyr:fullscreen.plyr--vimeo .plyr__video-wrapper{height:0;position:relative}.plyr:-webkit-full-screen .plyr__control .icon--exit-fullscreen{display:block}.plyr:-ms-fullscreen .plyr__control .icon--exit-fullscreen{display:block}.plyr:fullscreen .plyr__control .icon--exit-fullscreen{display:block}.plyr:-webkit-full-screen .plyr__control .icon--exit-fullscreen+svg{display:none}.plyr:-ms-fullscreen .plyr__control .icon--exit-fullscreen+svg{display:none}.plyr:fullscreen .plyr__control .icon--exit-fullscreen+svg{display:none}.plyr:-webkit-full-screen.plyr--hide-controls{cursor:none}.plyr:-ms-fullscreen.plyr--hide-controls{cursor:none}.plyr:fullscreen.plyr--hide-controls{cursor:none}@media (min-width:1024px){.plyr:-webkit-full-screen .plyr__captions{font-size:21px;font-size:var(--plyr-font-size-xlarge,21px)}.plyr:-ms-fullscreen .plyr__captions{font-size:21px;font-size:var(--plyr-font-size-xlarge,21px)}.plyr:fullscreen .plyr__captions{font-size:21px;font-size:var(--plyr-font-size-xlarge,21px)}}.plyr:-webkit-full-screen{background:#000;border-radius:0!important;height:100%;margin:0;width:100%}.plyr:-webkit-full-screen video{height:100%}.plyr:-webkit-full-screen .plyr__video-wrapper{height:100%;position:static}.plyr:-webkit-full-screen.plyr--vimeo .plyr__video-wrapper{height:0;position:relative}.plyr:-webkit-full-screen .plyr__control .icon--exit-fullscreen{display:block}.plyr:-webkit-full-screen .plyr__control .icon--exit-fullscreen+svg{display:none}.plyr:-webkit-full-screen.plyr--hide-controls{cursor:none}@media (min-width:1024px){.plyr:-webkit-full-screen .plyr__captions{font-size:21px;font-size:var(--plyr-font-size-xlarge,21px)}}.plyr:-moz-full-screen{background:#000;border-radius:0!important;height:100%;margin:0;width:100%}.plyr:-moz-full-screen video{height:100%}.plyr:-moz-full-screen .plyr__video-wrapper{height:100%;position:static}.plyr:-moz-full-screen.plyr--vimeo .plyr__video-wrapper{height:0;position:relative}.plyr:-moz-full-screen .plyr__control .icon--exit-fullscreen{display:block}.plyr:-moz-full-screen .plyr__control .icon--exit-fullscreen+svg{display:none}.plyr:-moz-full-screen.plyr--hide-controls{cursor:none}@media (min-width:1024px){.plyr:-moz-full-screen .plyr__captions{font-size:21px;font-size:var(--plyr-font-size-xlarge,21px)}}.plyr:-ms-fullscreen{background:#000;border-radius:0!important;height:100%;margin:0;width:100%}.plyr:-ms-fullscreen video{height:100%}.plyr:-ms-fullscreen .plyr__video-wrapper{height:100%;position:static}.plyr:-ms-fullscreen.plyr--vimeo .plyr__video-wrapper{height:0;position:relative}.plyr:-ms-fullscreen .plyr__control .icon--exit-fullscreen{display:block}.plyr:-ms-fullscreen .plyr__control .icon--exit-fullscreen+svg{display:none}.plyr:-ms-fullscreen.plyr--hide-controls{cursor:none}@media (min-width:1024px){.plyr:-ms-fullscreen .plyr__captions{font-size:21px;font-size:var(--plyr-font-size-xlarge,21px)}}.plyr--fullscreen-fallback{background:#000;border-radius:0!important;height:100%;margin:0;width:100%;bottom:0;display:block;left:0;position:fixed;right:0;top:0;z-index:10000000}.plyr--fullscreen-fallback video{height:100%}.plyr--fullscreen-fallback .plyr__video-wrapper{height:100%;position:static}.plyr--fullscreen-fallback.plyr--vimeo .plyr__video-wrapper{height:0;position:relative}.plyr--fullscreen-fallback .plyr__control .icon--exit-fullscreen{display:block}.plyr--fullscreen-fallback .plyr__control .icon--exit-fullscreen+svg{display:none}.plyr--fullscreen-fallback.plyr--hide-controls{cursor:none}@media (min-width:1024px){.plyr--fullscreen-fallback .plyr__captions{font-size:21px;font-size:var(--plyr-font-size-xlarge,21px)}}.plyr__ads{border-radius:inherit;bottom:0;cursor:pointer;left:0;overflow:hidden;position:absolute;right:0;top:0;z-index:-1}.plyr__ads>div,.plyr__ads>div iframe{height:100%;position:absolute;width:100%}.plyr__ads::after{background:#23282f;border-radius:2px;bottom:10px;bottom:var(--plyr-control-spacing,10px);color:#fff;content:attr(data-badge-text);font-size:11px;padding:2px 6px;pointer-events:none;position:absolute;right:10px;right:var(--plyr-control-spacing,10px);z-index:3}.plyr__ads::after:empty{display:none}.plyr__cues{background:currentColor;display:block;height:5px;height:var(--plyr-range-track-height,5px);left:0;margin:-var(--plyr-range-track-height,5px)/2 0 0;opacity:.8;position:absolute;top:50%;width:3px;z-index:3}.plyr__preview-thumb{background-color:rgba(255,255,255,.9);background-color:var(--plyr-tooltip-background,rgba(255,255,255,.9));border-radius:3px;bottom:100%;box-shadow:0 1px 2px rgba(0,0,0,.15);box-shadow:var(--plyr-tooltip-shadow,0 1px 2px rgba(0,0,0,.15));margin-bottom:calc(calc(10px / 2) * 2);margin-bottom:calc(calc(var(--plyr-control-spacing,10px)/ 2) * 2);opacity:0;padding:3px;padding:var(--plyr-tooltip-radius,3px);pointer-events:none;position:absolute;transform:translate(0,10px) scale(.8);transform-origin:50% 100%;transition:transform .2s .1s ease,opacity .2s .1s ease;z-index:2}.plyr__preview-thumb--is-shown{opacity:1;transform:translate(0,0) scale(1)}.plyr__preview-thumb::before{border-left:4px solid transparent;border-left:var(--plyr-tooltip-arrow-size,4px) solid transparent;border-right:4px solid transparent;border-right:var(--plyr-tooltip-arrow-size,4px) solid transparent;border-top:4px solid rgba(255,255,255,.9);border-top:var(--plyr-tooltip-arrow-size,4px) solid var(--plyr-tooltip-background,rgba(255,255,255,.9));bottom:calc(4px * -1);bottom:calc(var(--plyr-tooltip-arrow-size,4px) * -1);content:'';height:0;left:50%;position:absolute;transform:translateX(-50%);width:0;z-index:2}.plyr__preview-thumb__image-container{background:#c1c8d1;border-radius:calc(3px - 1px);border-radius:calc(var(--plyr-tooltip-radius,3px) - 1px);overflow:hidden;position:relative;z-index:0}.plyr__preview-thumb__image-container img{height:100%;left:0;max-height:none;max-width:none;position:absolute;top:0;width:100%}.plyr__preview-thumb__time-container{bottom:6px;left:0;position:absolute;right:0;white-space:nowrap;z-index:3}.plyr__preview-thumb__time-container span{background-color:rgba(0,0,0,.55);border-radius:calc(3px - 1px);border-radius:calc(var(--plyr-tooltip-radius,3px) - 1px);color:#fff;font-size:13px;font-size:var(--plyr-font-size-time,var(--plyr-font-size-small,13px));padding:3px 6px}.plyr__preview-scrubbing{bottom:0;filter:blur(1px);height:100%;left:0;margin:auto;opacity:0;overflow:hidden;pointer-events:none;position:absolute;right:0;top:0;transition:opacity .3s ease;width:100%;z-index:1}.plyr__preview-scrubbing--is-shown{opacity:1}.plyr__preview-scrubbing img{height:100%;left:0;max-height:none;max-width:none;object-fit:contain;position:absolute;top:0;width:100%}.plyr--no-transition{transition:none!important}.plyr__sr-only{clip:rect(1px,1px,1px,1px);overflow:hidden;border:0!important;height:1px!important;padding:0!important;position:absolute!important;width:1px!important}.plyr [hidden]{display:none!important}");

//#endregion
//#region src/global.scss
	injectStyle(":root {\n  --k-player-background-highlight: rgba(95, 95, 95, 0.65);\n  --k-player-background: rgba(0, 0, 0, 0.65);\n  --k-player-color: white;\n  --k-player-primary-color: #00b3ff;\n  --k-player-primary-color-highlight: rgba(0, 179, 255, 0.1);\n}\n\n.k-menu {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n  border-radius: 4px;\n  overflow: hidden;\n}\n.k-menu-item {\n  padding: 0 16px;\n  line-height: 36px;\n  height: 36px;\n  cursor: pointer;\n  width: 100%;\n  white-space: nowrap;\n  color: white;\n  transition: all 0.3s;\n  text-align: center;\n}\n.k-menu-item:hover {\n  background: var(--k-player-background-highlight);\n}\n\n.k-btn, .k-capsule div {\n  color: var(--k-player-primary-color);\n  padding: 4px 8px;\n  border-radius: 4px;\n  cursor: pointer;\n  white-space: nowrap;\n  transition: all 0.15s;\n  user-select: none;\n  text-decoration: none;\n}\n.k-btn:hover, .k-capsule div:hover {\n  color: var(--k-player-primary-color);\n  background: var(--k-player-primary-color-highlight);\n}\n\n.k-capsule div {\n  background: var(--k-player-primary-color-highlight);\n}\n.k-capsule input:not(:checked) + div {\n  color: #999;\n  background: #ddd;\n}\n\n.k-menu-item.k-menu-active {\n  color: var(--k-player-primary-color);\n}\n\n.k-input, .k-input-number,\n.k-select {\n  background: white;\n  border: 1px solid #d9d9d9;\n  color: black;\n  outline: 0;\n  border-radius: 2px;\n  transition: all 0.15s ease;\n}\n.k-input:focus, .k-input-number:focus, .k-input:hover, .k-input-number:hover,\n.k-select:focus,\n.k-select:hover {\n  border-color: var(--k-player-primary-color);\n}\n.k-input::placeholder, .k-input-number::placeholder,\n.k-select::placeholder {\n  color: #999;\n}\n\n.k-checkbox {\n  display: inline-flex;\n  align-items: center;\n  cursor: pointer;\n}\n.k-checkbox input {\n  margin: 0;\n  margin-right: 4px;\n}\n\n.k-settings-list {\n  margin: 0;\n  padding: 8px;\n  text-align: left;\n}\n.k-settings-list label {\n  cursor: pointer;\n}\n.k-settings-item {\n  width: 100%;\n  white-space: nowrap;\n  color: white;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.k-settings-list > .k-settings-item + .k-settings-item {\n  margin-top: 8px;\n}\n\n.k-table {\n  width: 100%;\n  border-spacing: 0;\n  border-collapse: separate;\n}\n.k-table th,\n.k-table td {\n  padding: 8px;\n  border: none;\n  border-bottom: 1px solid #f1f1f1;\n  word-wrap: break-word;\n  word-break: break-all;\n}\n\n.k-input-number {\n  height: 32px;\n  width: 100px;\n  border-radius: 4px;\n  padding: 0 8px;\n  box-sizing: border-box;\n  font-size: 14px;\n  -webkit-appearance: none;\n  appearance: none;\n}\n.k-input-number[type=number]::-webkit-outer-spin-button, .k-input-number[type=number]::-webkit-inner-spin-button {\n  -webkit-appearance: none;\n  margin: 0;\n}");

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_freeGlobal.js
/** Detect free variable `global` from Node.js. */
	var freeGlobal = typeof global == "object" && global && global.Object === Object && global;

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_root.js
/** Detect free variable `self`. */
	var freeSelf = typeof self == "object" && self && self.Object === Object && self;
	/** Used as a reference to the global object. */
	var root = freeGlobal || freeSelf || Function("return this")();

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_Symbol.js
/** Built-in value references. */
	var Symbol$1 = root.Symbol;

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_getRawTag.js
/** Used for built-in method references. */
	var objectProto$5 = Object.prototype;
	/** Used to check objects for own properties. */
	var hasOwnProperty$11 = objectProto$5.hasOwnProperty;
	/**
	* Used to resolve the
	* [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	* of values.
	*/
	var nativeObjectToString$1 = objectProto$5.toString;
	/** Built-in value references. */
	var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : void 0;
	/**
	* A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
	*
	* @private
	* @param {*} value The value to query.
	* @returns {string} Returns the raw `toStringTag`.
	*/
	function getRawTag(value) {
		var isOwn = hasOwnProperty$11.call(value, symToStringTag$1), tag = value[symToStringTag$1];
		try {
			value[symToStringTag$1] = void 0;
			var unmasked = true;
		} catch (e) {}
		var result = nativeObjectToString$1.call(value);
		if (unmasked) if (isOwn) value[symToStringTag$1] = tag;
		else delete value[symToStringTag$1];
		return result;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_objectToString.js
/**
	* Used to resolve the
	* [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	* of values.
	*/
	var nativeObjectToString = Object.prototype.toString;
	/**
	* Converts `value` to a string using `Object.prototype.toString`.
	*
	* @private
	* @param {*} value The value to convert.
	* @returns {string} Returns the converted string.
	*/
	function objectToString(value) {
		return nativeObjectToString.call(value);
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_baseGetTag.js
/** `Object#toString` result references. */
	var nullTag = "[object Null]", undefinedTag = "[object Undefined]";
	/** Built-in value references. */
	var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : void 0;
	/**
	* The base implementation of `getTag` without fallbacks for buggy environments.
	*
	* @private
	* @param {*} value The value to query.
	* @returns {string} Returns the `toStringTag`.
	*/
	function baseGetTag(value) {
		if (value == null) return value === void 0 ? undefinedTag : nullTag;
		return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/isObjectLike.js
/**
	* Checks if `value` is object-like. A value is object-like if it's not `null`
	* and has a `typeof` result of "object".
	*
	* @static
	* @memberOf _
	* @since 4.0.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	* @example
	*
	* _.isObjectLike({});
	* // => true
	*
	* _.isObjectLike([1, 2, 3]);
	* // => true
	*
	* _.isObjectLike(_.noop);
	* // => false
	*
	* _.isObjectLike(null);
	* // => false
	*/
	function isObjectLike(value) {
		return value != null && typeof value == "object";
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/isSymbol.js
/** `Object#toString` result references. */
	var symbolTag = "[object Symbol]";
	/**
	* Checks if `value` is classified as a `Symbol` primitive or object.
	*
	* @static
	* @memberOf _
	* @since 4.0.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
	* @example
	*
	* _.isSymbol(Symbol.iterator);
	* // => true
	*
	* _.isSymbol('abc');
	* // => false
	*/
	function isSymbol(value) {
		return typeof value == "symbol" || isObjectLike(value) && baseGetTag(value) == symbolTag;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_arrayMap.js
/**
	* A specialized version of `_.map` for arrays without support for iteratee
	* shorthands.
	*
	* @private
	* @param {Array} [array] The array to iterate over.
	* @param {Function} iteratee The function invoked per iteration.
	* @returns {Array} Returns the new mapped array.
	*/
	function arrayMap(array, iteratee) {
		var index = -1, length = array == null ? 0 : array.length, result = Array(length);
		while (++index < length) result[index] = iteratee(array[index], index, array);
		return result;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/isArray.js
/**
	* Checks if `value` is classified as an `Array` object.
	*
	* @static
	* @memberOf _
	* @since 0.1.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is an array, else `false`.
	* @example
	*
	* _.isArray([1, 2, 3]);
	* // => true
	*
	* _.isArray(document.body.children);
	* // => false
	*
	* _.isArray('abc');
	* // => false
	*
	* _.isArray(_.noop);
	* // => false
	*/
	var isArray = Array.isArray;

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_baseToString.js
/** Used as references for various `Number` constants. */
	var INFINITY$1 = Infinity;
	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol$1 ? Symbol$1.prototype : void 0, symbolToString = symbolProto ? symbolProto.toString : void 0;
	/**
	* The base implementation of `_.toString` which doesn't convert nullish
	* values to empty strings.
	*
	* @private
	* @param {*} value The value to process.
	* @returns {string} Returns the string.
	*/
	function baseToString(value) {
		if (typeof value == "string") return value;
		if (isArray(value)) return arrayMap(value, baseToString) + "";
		if (isSymbol(value)) return symbolToString ? symbolToString.call(value) : "";
		var result = value + "";
		return result == "0" && 1 / value == -INFINITY$1 ? "-0" : result;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_trimmedEndIndex.js
/** Used to match a single whitespace character. */
	var reWhitespace = /\s/;
	/**
	* Used by `_.trim` and `_.trimEnd` to get the index of the last non-whitespace
	* character of `string`.
	*
	* @private
	* @param {string} string The string to inspect.
	* @returns {number} Returns the index of the last non-whitespace character.
	*/
	function trimmedEndIndex(string) {
		var index = string.length;
		while (index-- && reWhitespace.test(string.charAt(index)));
		return index;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_baseTrim.js
/** Used to match leading whitespace. */
	var reTrimStart = /^\s+/;
	/**
	* The base implementation of `_.trim`.
	*
	* @private
	* @param {string} string The string to trim.
	* @returns {string} Returns the trimmed string.
	*/
	function baseTrim(string) {
		return string ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, "") : string;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/isObject.js
/**
	* Checks if `value` is the
	* [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
	* of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	*
	* @static
	* @memberOf _
	* @since 0.1.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is an object, else `false`.
	* @example
	*
	* _.isObject({});
	* // => true
	*
	* _.isObject([1, 2, 3]);
	* // => true
	*
	* _.isObject(_.noop);
	* // => true
	*
	* _.isObject(null);
	* // => false
	*/
	function isObject(value) {
		var type = typeof value;
		return value != null && (type == "object" || type == "function");
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/toNumber.js
/** Used as references for various `Number` constants. */
	var NAN = NaN;
	/** Used to detect bad signed hexadecimal string values. */
	var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
	/** Used to detect binary string values. */
	var reIsBinary = /^0b[01]+$/i;
	/** Used to detect octal string values. */
	var reIsOctal = /^0o[0-7]+$/i;
	/** Built-in method references without a dependency on `root`. */
	var freeParseInt = parseInt;
	/**
	* Converts `value` to a number.
	*
	* @static
	* @memberOf _
	* @since 4.0.0
	* @category Lang
	* @param {*} value The value to process.
	* @returns {number} Returns the number.
	* @example
	*
	* _.toNumber(3.2);
	* // => 3.2
	*
	* _.toNumber(Number.MIN_VALUE);
	* // => 5e-324
	*
	* _.toNumber(Infinity);
	* // => Infinity
	*
	* _.toNumber('3.2');
	* // => 3.2
	*/
	function toNumber(value) {
		if (typeof value == "number") return value;
		if (isSymbol(value)) return NAN;
		if (isObject(value)) {
			var other = typeof value.valueOf == "function" ? value.valueOf() : value;
			value = isObject(other) ? other + "" : other;
		}
		if (typeof value != "string") return value === 0 ? value : +value;
		value = baseTrim(value);
		var isBinary = reIsBinary.test(value);
		return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/identity.js
/**
	* This method returns the first argument it receives.
	*
	* @static
	* @since 0.1.0
	* @memberOf _
	* @category Util
	* @param {*} value Any value.
	* @returns {*} Returns `value`.
	* @example
	*
	* var object = { 'a': 1 };
	*
	* console.log(_.identity(object) === object);
	* // => true
	*/
	function identity(value) {
		return value;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/isFunction.js
/** `Object#toString` result references. */
	var asyncTag = "[object AsyncFunction]", funcTag$1 = "[object Function]", genTag = "[object GeneratorFunction]", proxyTag = "[object Proxy]";
	/**
	* Checks if `value` is classified as a `Function` object.
	*
	* @static
	* @memberOf _
	* @since 0.1.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is a function, else `false`.
	* @example
	*
	* _.isFunction(_);
	* // => true
	*
	* _.isFunction(/abc/);
	* // => false
	*/
	function isFunction(value) {
		if (!isObject(value)) return false;
		var tag = baseGetTag(value);
		return tag == funcTag$1 || tag == genTag || tag == asyncTag || tag == proxyTag;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_coreJsData.js
/** Used to detect overreaching core-js shims. */
	var coreJsData = root["__core-js_shared__"];

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_isMasked.js
/** Used to detect methods masquerading as native. */
	var maskSrcKey = function() {
		var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
		return uid ? "Symbol(src)_1." + uid : "";
	}();
	/**
	* Checks if `func` has its source masked.
	*
	* @private
	* @param {Function} func The function to check.
	* @returns {boolean} Returns `true` if `func` is masked, else `false`.
	*/
	function isMasked(func) {
		return !!maskSrcKey && maskSrcKey in func;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_toSource.js
/** Used to resolve the decompiled source of functions. */
	var funcToString$2 = Function.prototype.toString;
	/**
	* Converts `func` to its source code.
	*
	* @private
	* @param {Function} func The function to convert.
	* @returns {string} Returns the source code.
	*/
	function toSource(func) {
		if (func != null) {
			try {
				return funcToString$2.call(func);
			} catch (e) {}
			try {
				return func + "";
			} catch (e) {}
		}
		return "";
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_baseIsNative.js
/**
	* Used to match `RegExp`
	* [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
	*/
	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
	/** Used to detect host constructors (Safari). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;
	/** Used for built-in method references. */
	var funcProto$1 = Function.prototype, objectProto$4 = Object.prototype;
	/** Used to resolve the decompiled source of functions. */
	var funcToString$1 = funcProto$1.toString;
	/** Used to check objects for own properties. */
	var hasOwnProperty$10 = objectProto$4.hasOwnProperty;
	/** Used to detect if a method is native. */
	var reIsNative = RegExp("^" + funcToString$1.call(hasOwnProperty$10).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
	/**
	* The base implementation of `_.isNative` without bad shim checks.
	*
	* @private
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is a native function,
	*  else `false`.
	*/
	function baseIsNative(value) {
		if (!isObject(value) || isMasked(value)) return false;
		return (isFunction(value) ? reIsNative : reIsHostCtor).test(toSource(value));
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_getValue.js
/**
	* Gets the value at `key` of `object`.
	*
	* @private
	* @param {Object} [object] The object to query.
	* @param {string} key The key of the property to get.
	* @returns {*} Returns the property value.
	*/
	function getValue(object, key) {
		return object == null ? void 0 : object[key];
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_getNative.js
/**
	* Gets the native function at `key` of `object`.
	*
	* @private
	* @param {Object} object The object to query.
	* @param {string} key The key of the method to get.
	* @returns {*} Returns the function if it's native, else `undefined`.
	*/
	function getNative(object, key) {
		var value = getValue(object, key);
		return baseIsNative(value) ? value : void 0;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_apply.js
/**
	* A faster alternative to `Function#apply`, this function invokes `func`
	* with the `this` binding of `thisArg` and the arguments of `args`.
	*
	* @private
	* @param {Function} func The function to invoke.
	* @param {*} thisArg The `this` binding of `func`.
	* @param {Array} args The arguments to invoke `func` with.
	* @returns {*} Returns the result of `func`.
	*/
	function apply(func, thisArg, args) {
		switch (args.length) {
			case 0: return func.call(thisArg);
			case 1: return func.call(thisArg, args[0]);
			case 2: return func.call(thisArg, args[0], args[1]);
			case 3: return func.call(thisArg, args[0], args[1], args[2]);
		}
		return func.apply(thisArg, args);
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_shortOut.js
/** Used to detect hot functions by number of calls within a span of milliseconds. */
	var HOT_COUNT = 800, HOT_SPAN = 16;
	var nativeNow = Date.now;
	/**
	* Creates a function that'll short out and invoke `identity` instead
	* of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
	* milliseconds.
	*
	* @private
	* @param {Function} func The function to restrict.
	* @returns {Function} Returns the new shortable function.
	*/
	function shortOut(func) {
		var count = 0, lastCalled = 0;
		return function() {
			var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
			lastCalled = stamp;
			if (remaining > 0) {
				if (++count >= HOT_COUNT) return arguments[0];
			} else count = 0;
			return func.apply(void 0, arguments);
		};
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/constant.js
/**
	* Creates a function that returns `value`.
	*
	* @static
	* @memberOf _
	* @since 2.4.0
	* @category Util
	* @param {*} value The value to return from the new function.
	* @returns {Function} Returns the new constant function.
	* @example
	*
	* var objects = _.times(2, _.constant({ 'a': 1 }));
	*
	* console.log(objects);
	* // => [{ 'a': 1 }, { 'a': 1 }]
	*
	* console.log(objects[0] === objects[1]);
	* // => true
	*/
	function constant(value) {
		return function() {
			return value;
		};
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_defineProperty.js
	var defineProperty = function() {
		try {
			var func = getNative(Object, "defineProperty");
			func({}, "", {});
			return func;
		} catch (e) {}
	}();

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_baseSetToString.js
/**
	* The base implementation of `setToString` without support for hot loop shorting.
	*
	* @private
	* @param {Function} func The function to modify.
	* @param {Function} string The `toString` result.
	* @returns {Function} Returns `func`.
	*/
	var baseSetToString = !defineProperty ? identity : function(func, string) {
		return defineProperty(func, "toString", {
			"configurable": true,
			"enumerable": false,
			"value": constant(string),
			"writable": true
		});
	};

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_setToString.js
/**
	* Sets the `toString` method of `func` to return `string`.
	*
	* @private
	* @param {Function} func The function to modify.
	* @param {Function} string The `toString` result.
	* @returns {Function} Returns `func`.
	*/
	var setToString = shortOut(baseSetToString);

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_isIndex.js
/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER$1 = 9007199254740991;
	/** Used to detect unsigned integer values. */
	var reIsUint = /^(?:0|[1-9]\d*)$/;
	/**
	* Checks if `value` is a valid array-like index.
	*
	* @private
	* @param {*} value The value to check.
	* @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	* @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	*/
	function isIndex(value, length) {
		var type = typeof value;
		length = length == null ? MAX_SAFE_INTEGER$1 : length;
		return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_baseAssignValue.js
/**
	* The base implementation of `assignValue` and `assignMergeValue` without
	* value checks.
	*
	* @private
	* @param {Object} object The object to modify.
	* @param {string} key The key of the property to assign.
	* @param {*} value The value to assign.
	*/
	function baseAssignValue(object, key, value) {
		if (key == "__proto__" && defineProperty) defineProperty(object, key, {
			"configurable": true,
			"enumerable": true,
			"value": value,
			"writable": true
		});
		else object[key] = value;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/eq.js
/**
	* Performs a
	* [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	* comparison between two values to determine if they are equivalent.
	*
	* @static
	* @memberOf _
	* @since 4.0.0
	* @category Lang
	* @param {*} value The value to compare.
	* @param {*} other The other value to compare.
	* @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	* @example
	*
	* var object = { 'a': 1 };
	* var other = { 'a': 1 };
	*
	* _.eq(object, object);
	* // => true
	*
	* _.eq(object, other);
	* // => false
	*
	* _.eq('a', 'a');
	* // => true
	*
	* _.eq('a', Object('a'));
	* // => false
	*
	* _.eq(NaN, NaN);
	* // => true
	*/
	function eq(value, other) {
		return value === other || value !== value && other !== other;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_assignValue.js
/** Used to check objects for own properties. */
	var hasOwnProperty$9 = Object.prototype.hasOwnProperty;
	/**
	* Assigns `value` to `key` of `object` if the existing value is not equivalent
	* using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	* for equality comparisons.
	*
	* @private
	* @param {Object} object The object to modify.
	* @param {string} key The key of the property to assign.
	* @param {*} value The value to assign.
	*/
	function assignValue(object, key, value) {
		var objValue = object[key];
		if (!(hasOwnProperty$9.call(object, key) && eq(objValue, value)) || value === void 0 && !(key in object)) baseAssignValue(object, key, value);
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_copyObject.js
/**
	* Copies properties of `source` to `object`.
	*
	* @private
	* @param {Object} source The object to copy properties from.
	* @param {Array} props The property identifiers to copy.
	* @param {Object} [object={}] The object to copy properties to.
	* @param {Function} [customizer] The function to customize copied values.
	* @returns {Object} Returns `object`.
	*/
	function copyObject(source, props, object, customizer) {
		var isNew = !object;
		object || (object = {});
		var index = -1, length = props.length;
		while (++index < length) {
			var key = props[index];
			var newValue = customizer ? customizer(object[key], source[key], key, object, source) : void 0;
			if (newValue === void 0) newValue = source[key];
			if (isNew) baseAssignValue(object, key, newValue);
			else assignValue(object, key, newValue);
		}
		return object;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_overRest.js
	var nativeMax$1 = Math.max;
	/**
	* A specialized version of `baseRest` which transforms the rest array.
	*
	* @private
	* @param {Function} func The function to apply a rest parameter to.
	* @param {number} [start=func.length-1] The start position of the rest parameter.
	* @param {Function} transform The rest array transform.
	* @returns {Function} Returns the new function.
	*/
	function overRest(func, start, transform) {
		start = nativeMax$1(start === void 0 ? func.length - 1 : start, 0);
		return function() {
			var args = arguments, index = -1, length = nativeMax$1(args.length - start, 0), array = Array(length);
			while (++index < length) array[index] = args[start + index];
			index = -1;
			var otherArgs = Array(start + 1);
			while (++index < start) otherArgs[index] = args[index];
			otherArgs[start] = transform(array);
			return apply(func, this, otherArgs);
		};
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_baseRest.js
/**
	* The base implementation of `_.rest` which doesn't validate or coerce arguments.
	*
	* @private
	* @param {Function} func The function to apply a rest parameter to.
	* @param {number} [start=func.length-1] The start position of the rest parameter.
	* @returns {Function} Returns the new function.
	*/
	function baseRest(func, start) {
		return setToString(overRest(func, start, identity), func + "");
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/isLength.js
/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;
	/**
	* Checks if `value` is a valid array-like length.
	*
	* **Note:** This method is loosely based on
	* [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
	*
	* @static
	* @memberOf _
	* @since 4.0.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	* @example
	*
	* _.isLength(3);
	* // => true
	*
	* _.isLength(Number.MIN_VALUE);
	* // => false
	*
	* _.isLength(Infinity);
	* // => false
	*
	* _.isLength('3');
	* // => false
	*/
	function isLength(value) {
		return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/isArrayLike.js
/**
	* Checks if `value` is array-like. A value is considered array-like if it's
	* not a function and has a `value.length` that's an integer greater than or
	* equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
	*
	* @static
	* @memberOf _
	* @since 4.0.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	* @example
	*
	* _.isArrayLike([1, 2, 3]);
	* // => true
	*
	* _.isArrayLike(document.body.children);
	* // => true
	*
	* _.isArrayLike('abc');
	* // => true
	*
	* _.isArrayLike(_.noop);
	* // => false
	*/
	function isArrayLike(value) {
		return value != null && isLength(value.length) && !isFunction(value);
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_isIterateeCall.js
/**
	* Checks if the given arguments are from an iteratee call.
	*
	* @private
	* @param {*} value The potential iteratee value argument.
	* @param {*} index The potential iteratee index or key argument.
	* @param {*} object The potential iteratee object argument.
	* @returns {boolean} Returns `true` if the arguments are from an iteratee call,
	*  else `false`.
	*/
	function isIterateeCall(value, index, object) {
		if (!isObject(object)) return false;
		var type = typeof index;
		if (type == "number" ? isArrayLike(object) && isIndex(index, object.length) : type == "string" && index in object) return eq(object[index], value);
		return false;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_createAssigner.js
/**
	* Creates a function like `_.assign`.
	*
	* @private
	* @param {Function} assigner The function to assign values.
	* @returns {Function} Returns the new assigner function.
	*/
	function createAssigner(assigner) {
		return baseRest(function(object, sources) {
			var index = -1, length = sources.length, customizer = length > 1 ? sources[length - 1] : void 0, guard = length > 2 ? sources[2] : void 0;
			customizer = assigner.length > 3 && typeof customizer == "function" ? (length--, customizer) : void 0;
			if (guard && isIterateeCall(sources[0], sources[1], guard)) {
				customizer = length < 3 ? void 0 : customizer;
				length = 1;
			}
			object = Object(object);
			while (++index < length) {
				var source = sources[index];
				if (source) assigner(object, source, index, customizer);
			}
			return object;
		});
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_isPrototype.js
/** Used for built-in method references. */
	var objectProto$3 = Object.prototype;
	/**
	* Checks if `value` is likely a prototype object.
	*
	* @private
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
	*/
	function isPrototype(value) {
		var Ctor = value && value.constructor;
		return value === (typeof Ctor == "function" && Ctor.prototype || objectProto$3);
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_baseTimes.js
/**
	* The base implementation of `_.times` without support for iteratee shorthands
	* or max array length checks.
	*
	* @private
	* @param {number} n The number of times to invoke `iteratee`.
	* @param {Function} iteratee The function invoked per iteration.
	* @returns {Array} Returns the array of results.
	*/
	function baseTimes(n, iteratee) {
		var index = -1, result = Array(n);
		while (++index < n) result[index] = iteratee(index);
		return result;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_baseIsArguments.js
/** `Object#toString` result references. */
	var argsTag$1 = "[object Arguments]";
	/**
	* The base implementation of `_.isArguments`.
	*
	* @private
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is an `arguments` object,
	*/
	function baseIsArguments(value) {
		return isObjectLike(value) && baseGetTag(value) == argsTag$1;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/isArguments.js
/** Used for built-in method references. */
	var objectProto$2 = Object.prototype;
	/** Used to check objects for own properties. */
	var hasOwnProperty$8 = objectProto$2.hasOwnProperty;
	/** Built-in value references. */
	var propertyIsEnumerable = objectProto$2.propertyIsEnumerable;
	/**
	* Checks if `value` is likely an `arguments` object.
	*
	* @static
	* @memberOf _
	* @since 0.1.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is an `arguments` object,
	*  else `false`.
	* @example
	*
	* _.isArguments(function() { return arguments; }());
	* // => true
	*
	* _.isArguments([1, 2, 3]);
	* // => false
	*/
	var isArguments = baseIsArguments(function() {
		return arguments;
	}()) ? baseIsArguments : function(value) {
		return isObjectLike(value) && hasOwnProperty$8.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
	};

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/stubFalse.js
/**
	* This method returns `false`.
	*
	* @static
	* @memberOf _
	* @since 4.13.0
	* @category Util
	* @returns {boolean} Returns `false`.
	* @example
	*
	* _.times(2, _.stubFalse);
	* // => [false, false]
	*/
	function stubFalse() {
		return false;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/isBuffer.js
/** Detect free variable `exports`. */
	var freeExports$1 = typeof exports == "object" && exports && !exports.nodeType && exports;
	/** Detect free variable `module`. */
	var freeModule$1 = freeExports$1 && typeof module == "object" && module && !module.nodeType && module;
	/** Built-in value references. */
	var Buffer$1 = freeModule$1 && freeModule$1.exports === freeExports$1 ? root.Buffer : void 0;
	/**
	* Checks if `value` is a buffer.
	*
	* @static
	* @memberOf _
	* @since 4.3.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
	* @example
	*
	* _.isBuffer(new Buffer(2));
	* // => true
	*
	* _.isBuffer(new Uint8Array(2));
	* // => false
	*/
	var isBuffer = (Buffer$1 ? Buffer$1.isBuffer : void 0) || stubFalse;

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_baseIsTypedArray.js
/** `Object#toString` result references. */
	var argsTag = "[object Arguments]", arrayTag = "[object Array]", boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag$1 = "[object Error]", funcTag = "[object Function]", mapTag = "[object Map]", numberTag = "[object Number]", objectTag$1 = "[object Object]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", weakMapTag = "[object WeakMap]";
	var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
	/** Used to identify `toStringTag` values of typed arrays. */
	var typedArrayTags = {};
	typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
	typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag$1] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag$1] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
	/**
	* The base implementation of `_.isTypedArray` without Node.js optimizations.
	*
	* @private
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	*/
	function baseIsTypedArray(value) {
		return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_baseUnary.js
/**
	* The base implementation of `_.unary` without support for storing metadata.
	*
	* @private
	* @param {Function} func The function to cap arguments for.
	* @returns {Function} Returns the new capped function.
	*/
	function baseUnary(func) {
		return function(value) {
			return func(value);
		};
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_nodeUtil.js
/** Detect free variable `exports`. */
	var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
	/** Detect free variable `module`. */
	var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
	/** Detect free variable `process` from Node.js. */
	var freeProcess = freeModule && freeModule.exports === freeExports && freeGlobal.process;
	/** Used to access faster Node.js helpers. */
	var nodeUtil = function() {
		try {
			var types = freeModule && freeModule.require && freeModule.require("util").types;
			if (types) return types;
			return freeProcess && freeProcess.binding && freeProcess.binding("util");
		} catch (e) {}
	}();

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/isTypedArray.js
	var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
	/**
	* Checks if `value` is classified as a typed array.
	*
	* @static
	* @memberOf _
	* @since 3.0.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	* @example
	*
	* _.isTypedArray(new Uint8Array);
	* // => true
	*
	* _.isTypedArray([]);
	* // => false
	*/
	var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_arrayLikeKeys.js
/** Used to check objects for own properties. */
	var hasOwnProperty$7 = Object.prototype.hasOwnProperty;
	/**
	* Creates an array of the enumerable property names of the array-like `value`.
	*
	* @private
	* @param {*} value The value to query.
	* @param {boolean} inherited Specify returning inherited property names.
	* @returns {Array} Returns the array of property names.
	*/
	function arrayLikeKeys(value, inherited) {
		var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
		for (var key in value) if ((inherited || hasOwnProperty$7.call(value, key)) && !(skipIndexes && (key == "length" || isBuff && (key == "offset" || key == "parent") || isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || isIndex(key, length)))) result.push(key);
		return result;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_overArg.js
/**
	* Creates a unary function that invokes `func` with its argument transformed.
	*
	* @private
	* @param {Function} func The function to wrap.
	* @param {Function} transform The argument transform.
	* @returns {Function} Returns the new function.
	*/
	function overArg(func, transform) {
		return function(arg) {
			return func(transform(arg));
		};
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_nativeKeys.js
	var nativeKeys = overArg(Object.keys, Object);

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_baseKeys.js
/** Used to check objects for own properties. */
	var hasOwnProperty$6 = Object.prototype.hasOwnProperty;
	/**
	* The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
	*
	* @private
	* @param {Object} object The object to query.
	* @returns {Array} Returns the array of property names.
	*/
	function baseKeys(object) {
		if (!isPrototype(object)) return nativeKeys(object);
		var result = [];
		for (var key in Object(object)) if (hasOwnProperty$6.call(object, key) && key != "constructor") result.push(key);
		return result;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/keys.js
/**
	* Creates an array of the own enumerable property names of `object`.
	*
	* **Note:** Non-object values are coerced to objects. See the
	* [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
	* for more details.
	*
	* @static
	* @since 0.1.0
	* @memberOf _
	* @category Object
	* @param {Object} object The object to query.
	* @returns {Array} Returns the array of property names.
	* @example
	*
	* function Foo() {
	*   this.a = 1;
	*   this.b = 2;
	* }
	*
	* Foo.prototype.c = 3;
	*
	* _.keys(new Foo);
	* // => ['a', 'b'] (iteration order is not guaranteed)
	*
	* _.keys('hi');
	* // => ['0', '1']
	*/
	function keys(object) {
		return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_nativeKeysIn.js
/**
	* This function is like
	* [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
	* except that it includes inherited enumerable properties.
	*
	* @private
	* @param {Object} object The object to query.
	* @returns {Array} Returns the array of property names.
	*/
	function nativeKeysIn(object) {
		var result = [];
		if (object != null) for (var key in Object(object)) result.push(key);
		return result;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_baseKeysIn.js
/** Used to check objects for own properties. */
	var hasOwnProperty$5 = Object.prototype.hasOwnProperty;
	/**
	* The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
	*
	* @private
	* @param {Object} object The object to query.
	* @returns {Array} Returns the array of property names.
	*/
	function baseKeysIn(object) {
		if (!isObject(object)) return nativeKeysIn(object);
		var isProto = isPrototype(object), result = [];
		for (var key in object) if (!(key == "constructor" && (isProto || !hasOwnProperty$5.call(object, key)))) result.push(key);
		return result;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/keysIn.js
/**
	* Creates an array of the own and inherited enumerable property names of `object`.
	*
	* **Note:** Non-object values are coerced to objects.
	*
	* @static
	* @memberOf _
	* @since 3.0.0
	* @category Object
	* @param {Object} object The object to query.
	* @returns {Array} Returns the array of property names.
	* @example
	*
	* function Foo() {
	*   this.a = 1;
	*   this.b = 2;
	* }
	*
	* Foo.prototype.c = 3;
	*
	* _.keysIn(new Foo);
	* // => ['a', 'b', 'c'] (iteration order is not guaranteed)
	*/
	function keysIn(object) {
		return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/assignInWith.js
/**
	* This method is like `_.assignIn` except that it accepts `customizer`
	* which is invoked to produce the assigned values. If `customizer` returns
	* `undefined`, assignment is handled by the method instead. The `customizer`
	* is invoked with five arguments: (objValue, srcValue, key, object, source).
	*
	* **Note:** This method mutates `object`.
	*
	* @static
	* @memberOf _
	* @since 4.0.0
	* @alias extendWith
	* @category Object
	* @param {Object} object The destination object.
	* @param {...Object} sources The source objects.
	* @param {Function} [customizer] The function to customize assigned values.
	* @returns {Object} Returns `object`.
	* @see _.assignWith
	* @example
	*
	* function customizer(objValue, srcValue) {
	*   return _.isUndefined(objValue) ? srcValue : objValue;
	* }
	*
	* var defaults = _.partialRight(_.assignInWith, customizer);
	*
	* defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
	* // => { 'a': 1, 'b': 2 }
	*/
	var assignInWith = createAssigner(function(object, source, srcIndex, customizer) {
		copyObject(source, keysIn(source), object, customizer);
	});

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_isKey.js
/** Used to match property names within property paths. */
	var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, reIsPlainProp = /^\w*$/;
	/**
	* Checks if `value` is a property name and not a property path.
	*
	* @private
	* @param {*} value The value to check.
	* @param {Object} [object] The object to query keys on.
	* @returns {boolean} Returns `true` if `value` is a property name, else `false`.
	*/
	function isKey(value, object) {
		if (isArray(value)) return false;
		var type = typeof value;
		if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol(value)) return true;
		return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_nativeCreate.js
	var nativeCreate = getNative(Object, "create");

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_hashClear.js
/**
	* Removes all key-value entries from the hash.
	*
	* @private
	* @name clear
	* @memberOf Hash
	*/
	function hashClear() {
		this.__data__ = nativeCreate ? nativeCreate(null) : {};
		this.size = 0;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_hashDelete.js
/**
	* Removes `key` and its value from the hash.
	*
	* @private
	* @name delete
	* @memberOf Hash
	* @param {Object} hash The hash to modify.
	* @param {string} key The key of the value to remove.
	* @returns {boolean} Returns `true` if the entry was removed, else `false`.
	*/
	function hashDelete(key) {
		var result = this.has(key) && delete this.__data__[key];
		this.size -= result ? 1 : 0;
		return result;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_hashGet.js
/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED$1 = "__lodash_hash_undefined__";
	/** Used to check objects for own properties. */
	var hasOwnProperty$4 = Object.prototype.hasOwnProperty;
	/**
	* Gets the hash value for `key`.
	*
	* @private
	* @name get
	* @memberOf Hash
	* @param {string} key The key of the value to get.
	* @returns {*} Returns the entry value.
	*/
	function hashGet(key) {
		var data = this.__data__;
		if (nativeCreate) {
			var result = data[key];
			return result === HASH_UNDEFINED$1 ? void 0 : result;
		}
		return hasOwnProperty$4.call(data, key) ? data[key] : void 0;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_hashHas.js
/** Used to check objects for own properties. */
	var hasOwnProperty$3 = Object.prototype.hasOwnProperty;
	/**
	* Checks if a hash value for `key` exists.
	*
	* @private
	* @name has
	* @memberOf Hash
	* @param {string} key The key of the entry to check.
	* @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	*/
	function hashHas(key) {
		var data = this.__data__;
		return nativeCreate ? data[key] !== void 0 : hasOwnProperty$3.call(data, key);
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_hashSet.js
/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = "__lodash_hash_undefined__";
	/**
	* Sets the hash `key` to `value`.
	*
	* @private
	* @name set
	* @memberOf Hash
	* @param {string} key The key of the value to set.
	* @param {*} value The value to set.
	* @returns {Object} Returns the hash instance.
	*/
	function hashSet(key, value) {
		var data = this.__data__;
		this.size += this.has(key) ? 0 : 1;
		data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
		return this;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_Hash.js
/**
	* Creates a hash object.
	*
	* @private
	* @constructor
	* @param {Array} [entries] The key-value pairs to cache.
	*/
	function Hash(entries) {
		var index = -1, length = entries == null ? 0 : entries.length;
		this.clear();
		while (++index < length) {
			var entry = entries[index];
			this.set(entry[0], entry[1]);
		}
	}
	Hash.prototype.clear = hashClear;
	Hash.prototype["delete"] = hashDelete;
	Hash.prototype.get = hashGet;
	Hash.prototype.has = hashHas;
	Hash.prototype.set = hashSet;

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_listCacheClear.js
/**
	* Removes all key-value entries from the list cache.
	*
	* @private
	* @name clear
	* @memberOf ListCache
	*/
	function listCacheClear() {
		this.__data__ = [];
		this.size = 0;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_assocIndexOf.js
/**
	* Gets the index at which the `key` is found in `array` of key-value pairs.
	*
	* @private
	* @param {Array} array The array to inspect.
	* @param {*} key The key to search for.
	* @returns {number} Returns the index of the matched value, else `-1`.
	*/
	function assocIndexOf(array, key) {
		var length = array.length;
		while (length--) if (eq(array[length][0], key)) return length;
		return -1;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_listCacheDelete.js
/** Built-in value references. */
	var splice = Array.prototype.splice;
	/**
	* Removes `key` and its value from the list cache.
	*
	* @private
	* @name delete
	* @memberOf ListCache
	* @param {string} key The key of the value to remove.
	* @returns {boolean} Returns `true` if the entry was removed, else `false`.
	*/
	function listCacheDelete(key) {
		var data = this.__data__, index = assocIndexOf(data, key);
		if (index < 0) return false;
		if (index == data.length - 1) data.pop();
		else splice.call(data, index, 1);
		--this.size;
		return true;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_listCacheGet.js
/**
	* Gets the list cache value for `key`.
	*
	* @private
	* @name get
	* @memberOf ListCache
	* @param {string} key The key of the value to get.
	* @returns {*} Returns the entry value.
	*/
	function listCacheGet(key) {
		var data = this.__data__, index = assocIndexOf(data, key);
		return index < 0 ? void 0 : data[index][1];
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_listCacheHas.js
/**
	* Checks if a list cache value for `key` exists.
	*
	* @private
	* @name has
	* @memberOf ListCache
	* @param {string} key The key of the entry to check.
	* @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	*/
	function listCacheHas(key) {
		return assocIndexOf(this.__data__, key) > -1;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_listCacheSet.js
/**
	* Sets the list cache `key` to `value`.
	*
	* @private
	* @name set
	* @memberOf ListCache
	* @param {string} key The key of the value to set.
	* @param {*} value The value to set.
	* @returns {Object} Returns the list cache instance.
	*/
	function listCacheSet(key, value) {
		var data = this.__data__, index = assocIndexOf(data, key);
		if (index < 0) {
			++this.size;
			data.push([key, value]);
		} else data[index][1] = value;
		return this;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_ListCache.js
/**
	* Creates an list cache object.
	*
	* @private
	* @constructor
	* @param {Array} [entries] The key-value pairs to cache.
	*/
	function ListCache(entries) {
		var index = -1, length = entries == null ? 0 : entries.length;
		this.clear();
		while (++index < length) {
			var entry = entries[index];
			this.set(entry[0], entry[1]);
		}
	}
	ListCache.prototype.clear = listCacheClear;
	ListCache.prototype["delete"] = listCacheDelete;
	ListCache.prototype.get = listCacheGet;
	ListCache.prototype.has = listCacheHas;
	ListCache.prototype.set = listCacheSet;

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_Map.js
	var Map$1 = getNative(root, "Map");

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_mapCacheClear.js
/**
	* Removes all key-value entries from the map.
	*
	* @private
	* @name clear
	* @memberOf MapCache
	*/
	function mapCacheClear() {
		this.size = 0;
		this.__data__ = {
			"hash": new Hash(),
			"map": new (Map$1 || ListCache)(),
			"string": new Hash()
		};
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_isKeyable.js
/**
	* Checks if `value` is suitable for use as unique object key.
	*
	* @private
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is suitable, else `false`.
	*/
	function isKeyable(value) {
		var type = typeof value;
		return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_getMapData.js
/**
	* Gets the data for `map`.
	*
	* @private
	* @param {Object} map The map to query.
	* @param {string} key The reference key.
	* @returns {*} Returns the map data.
	*/
	function getMapData(map, key) {
		var data = map.__data__;
		return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_mapCacheDelete.js
/**
	* Removes `key` and its value from the map.
	*
	* @private
	* @name delete
	* @memberOf MapCache
	* @param {string} key The key of the value to remove.
	* @returns {boolean} Returns `true` if the entry was removed, else `false`.
	*/
	function mapCacheDelete(key) {
		var result = getMapData(this, key)["delete"](key);
		this.size -= result ? 1 : 0;
		return result;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_mapCacheGet.js
/**
	* Gets the map value for `key`.
	*
	* @private
	* @name get
	* @memberOf MapCache
	* @param {string} key The key of the value to get.
	* @returns {*} Returns the entry value.
	*/
	function mapCacheGet(key) {
		return getMapData(this, key).get(key);
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_mapCacheHas.js
/**
	* Checks if a map value for `key` exists.
	*
	* @private
	* @name has
	* @memberOf MapCache
	* @param {string} key The key of the entry to check.
	* @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	*/
	function mapCacheHas(key) {
		return getMapData(this, key).has(key);
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_mapCacheSet.js
/**
	* Sets the map `key` to `value`.
	*
	* @private
	* @name set
	* @memberOf MapCache
	* @param {string} key The key of the value to set.
	* @param {*} value The value to set.
	* @returns {Object} Returns the map cache instance.
	*/
	function mapCacheSet(key, value) {
		var data = getMapData(this, key), size = data.size;
		data.set(key, value);
		this.size += data.size == size ? 0 : 1;
		return this;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_MapCache.js
/**
	* Creates a map cache object to store key-value pairs.
	*
	* @private
	* @constructor
	* @param {Array} [entries] The key-value pairs to cache.
	*/
	function MapCache(entries) {
		var index = -1, length = entries == null ? 0 : entries.length;
		this.clear();
		while (++index < length) {
			var entry = entries[index];
			this.set(entry[0], entry[1]);
		}
	}
	MapCache.prototype.clear = mapCacheClear;
	MapCache.prototype["delete"] = mapCacheDelete;
	MapCache.prototype.get = mapCacheGet;
	MapCache.prototype.has = mapCacheHas;
	MapCache.prototype.set = mapCacheSet;

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/memoize.js
/** Error message constants. */
	var FUNC_ERROR_TEXT$2 = "Expected a function";
	/**
	* Creates a function that memoizes the result of `func`. If `resolver` is
	* provided, it determines the cache key for storing the result based on the
	* arguments provided to the memoized function. By default, the first argument
	* provided to the memoized function is used as the map cache key. The `func`
	* is invoked with the `this` binding of the memoized function.
	*
	* **Note:** The cache is exposed as the `cache` property on the memoized
	* function. Its creation may be customized by replacing the `_.memoize.Cache`
	* constructor with one whose instances implement the
	* [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
	* method interface of `clear`, `delete`, `get`, `has`, and `set`.
	*
	* @static
	* @memberOf _
	* @since 0.1.0
	* @category Function
	* @param {Function} func The function to have its output memoized.
	* @param {Function} [resolver] The function to resolve the cache key.
	* @returns {Function} Returns the new memoized function.
	* @example
	*
	* var object = { 'a': 1, 'b': 2 };
	* var other = { 'c': 3, 'd': 4 };
	*
	* var values = _.memoize(_.values);
	* values(object);
	* // => [1, 2]
	*
	* values(other);
	* // => [3, 4]
	*
	* object.a = 2;
	* values(object);
	* // => [1, 2]
	*
	* // Modify the result cache.
	* values.cache.set(object, ['a', 'b']);
	* values(object);
	* // => ['a', 'b']
	*
	* // Replace `_.memoize.Cache`.
	* _.memoize.Cache = WeakMap;
	*/
	function memoize(func, resolver) {
		if (typeof func != "function" || resolver != null && typeof resolver != "function") throw new TypeError(FUNC_ERROR_TEXT$2);
		var memoized = function() {
			var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
			if (cache.has(key)) return cache.get(key);
			var result = func.apply(this, args);
			memoized.cache = cache.set(key, result) || cache;
			return result;
		};
		memoized.cache = new (memoize.Cache || MapCache)();
		return memoized;
	}
	memoize.Cache = MapCache;

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_memoizeCapped.js
/** Used as the maximum memoize cache size. */
	var MAX_MEMOIZE_SIZE = 500;
	/**
	* A specialized version of `_.memoize` which clears the memoized function's
	* cache when it exceeds `MAX_MEMOIZE_SIZE`.
	*
	* @private
	* @param {Function} func The function to have its output memoized.
	* @returns {Function} Returns the new memoized function.
	*/
	function memoizeCapped(func) {
		var result = memoize(func, function(key) {
			if (cache.size === MAX_MEMOIZE_SIZE) cache.clear();
			return key;
		});
		var cache = result.cache;
		return result;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_stringToPath.js
/** Used to match property names within property paths. */
	var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
	/** Used to match backslashes in property paths. */
	var reEscapeChar = /\\(\\)?/g;
	/**
	* Converts `string` to a property path array.
	*
	* @private
	* @param {string} string The string to convert.
	* @returns {Array} Returns the property path array.
	*/
	var stringToPath = memoizeCapped(function(string) {
		var result = [];
		if (string.charCodeAt(0) === 46) result.push("");
		string.replace(rePropName, function(match, number, quote, subString) {
			result.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
		});
		return result;
	});

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/toString.js
/**
	* Converts `value` to a string. An empty string is returned for `null`
	* and `undefined` values. The sign of `-0` is preserved.
	*
	* @static
	* @memberOf _
	* @since 4.0.0
	* @category Lang
	* @param {*} value The value to convert.
	* @returns {string} Returns the converted string.
	* @example
	*
	* _.toString(null);
	* // => ''
	*
	* _.toString(-0);
	* // => '-0'
	*
	* _.toString([1, 2, 3]);
	* // => '1,2,3'
	*/
	function toString(value) {
		return value == null ? "" : baseToString(value);
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_castPath.js
/**
	* Casts `value` to a path array if it's not one.
	*
	* @private
	* @param {*} value The value to inspect.
	* @param {Object} [object] The object to query keys on.
	* @returns {Array} Returns the cast property path array.
	*/
	function castPath(value, object) {
		if (isArray(value)) return value;
		return isKey(value, object) ? [value] : stringToPath(toString(value));
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_toKey.js
/** Used as references for various `Number` constants. */
	var INFINITY = Infinity;
	/**
	* Converts `value` to a string key if it's not a string or symbol.
	*
	* @private
	* @param {*} value The value to inspect.
	* @returns {string|symbol} Returns the key.
	*/
	function toKey(value) {
		if (typeof value == "string" || isSymbol(value)) return value;
		var result = value + "";
		return result == "0" && 1 / value == -INFINITY ? "-0" : result;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_baseGet.js
/**
	* The base implementation of `_.get` without support for default values.
	*
	* @private
	* @param {Object} object The object to query.
	* @param {Array|string} path The path of the property to get.
	* @returns {*} Returns the resolved value.
	*/
	function baseGet(object, path) {
		path = castPath(path, object);
		var index = 0, length = path.length;
		while (object != null && index < length) object = object[toKey(path[index++])];
		return index && index == length ? object : void 0;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/get.js
/**
	* Gets the value at `path` of `object`. If the resolved value is
	* `undefined`, the `defaultValue` is returned in its place.
	*
	* @static
	* @memberOf _
	* @since 3.7.0
	* @category Object
	* @param {Object} object The object to query.
	* @param {Array|string} path The path of the property to get.
	* @param {*} [defaultValue] The value returned for `undefined` resolved values.
	* @returns {*} Returns the resolved value.
	* @example
	*
	* var object = { 'a': [{ 'b': { 'c': 3 } }] };
	*
	* _.get(object, 'a[0].b.c');
	* // => 3
	*
	* _.get(object, ['a', '0', 'b', 'c']);
	* // => 3
	*
	* _.get(object, 'a.b.c', 'default');
	* // => 'default'
	*/
	function get(object, path, defaultValue) {
		var result = object == null ? void 0 : baseGet(object, path);
		return result === void 0 ? defaultValue : result;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_getPrototype.js
/** Built-in value references. */
	var getPrototype = overArg(Object.getPrototypeOf, Object);

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/isPlainObject.js
/** `Object#toString` result references. */
	var objectTag = "[object Object]";
	/** Used for built-in method references. */
	var funcProto = Function.prototype, objectProto$1 = Object.prototype;
	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;
	/** Used to check objects for own properties. */
	var hasOwnProperty$2 = objectProto$1.hasOwnProperty;
	/** Used to infer the `Object` constructor. */
	var objectCtorString = funcToString.call(Object);
	/**
	* Checks if `value` is a plain object, that is, an object created by the
	* `Object` constructor or one with a `[[Prototype]]` of `null`.
	*
	* @static
	* @memberOf _
	* @since 0.8.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
	* @example
	*
	* function Foo() {
	*   this.a = 1;
	* }
	*
	* _.isPlainObject(new Foo);
	* // => false
	*
	* _.isPlainObject([1, 2, 3]);
	* // => false
	*
	* _.isPlainObject({ 'x': 0, 'y': 0 });
	* // => true
	*
	* _.isPlainObject(Object.create(null));
	* // => true
	*/
	function isPlainObject(value) {
		if (!isObjectLike(value) || baseGetTag(value) != objectTag) return false;
		var proto = getPrototype(value);
		if (proto === null) return true;
		var Ctor = hasOwnProperty$2.call(proto, "constructor") && proto.constructor;
		return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/isError.js
/** `Object#toString` result references. */
	var domExcTag = "[object DOMException]", errorTag = "[object Error]";
	/**
	* Checks if `value` is an `Error`, `EvalError`, `RangeError`, `ReferenceError`,
	* `SyntaxError`, `TypeError`, or `URIError` object.
	*
	* @static
	* @memberOf _
	* @since 3.0.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is an error object, else `false`.
	* @example
	*
	* _.isError(new Error);
	* // => true
	*
	* _.isError(Error);
	* // => false
	*/
	function isError(value) {
		if (!isObjectLike(value)) return false;
		var tag = baseGetTag(value);
		return tag == errorTag || tag == domExcTag || typeof value.message == "string" && typeof value.name == "string" && !isPlainObject(value);
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/attempt.js
/**
	* Attempts to invoke `func`, returning either the result or the caught error
	* object. Any additional arguments are provided to `func` when it's invoked.
	*
	* @static
	* @memberOf _
	* @since 3.0.0
	* @category Util
	* @param {Function} func The function to attempt.
	* @param {...*} [args] The arguments to invoke `func` with.
	* @returns {*} Returns the `func` result or error object.
	* @example
	*
	* // Avoid throwing errors for invalid selectors.
	* var elements = _.attempt(function(selector) {
	*   return document.querySelectorAll(selector);
	* }, '>_>');
	*
	* if (_.isError(elements)) {
	*   elements = [];
	* }
	*/
	var attempt = baseRest(function(func, args) {
		try {
			return apply(func, void 0, args);
		} catch (e) {
			return isError(e) ? e : new Error(e);
		}
	});

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_basePropertyOf.js
/**
	* The base implementation of `_.propertyOf` without support for deep paths.
	*
	* @private
	* @param {Object} object The object to query.
	* @returns {Function} Returns the new accessor function.
	*/
	function basePropertyOf(object) {
		return function(key) {
			return object == null ? void 0 : object[key];
		};
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_baseClamp.js
/**
	* The base implementation of `_.clamp` which doesn't coerce arguments.
	*
	* @private
	* @param {number} number The number to clamp.
	* @param {number} [lower] The lower bound.
	* @param {number} upper The upper bound.
	* @returns {number} Returns the clamped number.
	*/
	function baseClamp(number, lower, upper) {
		if (number === number) {
			if (upper !== void 0) number = number <= upper ? number : upper;
			if (lower !== void 0) number = number >= lower ? number : lower;
		}
		return number;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/clamp.js
/**
	* Clamps `number` within the inclusive `lower` and `upper` bounds.
	*
	* @static
	* @memberOf _
	* @since 4.0.0
	* @category Number
	* @param {number} number The number to clamp.
	* @param {number} [lower] The lower bound.
	* @param {number} upper The upper bound.
	* @returns {number} Returns the clamped number.
	* @example
	*
	* _.clamp(-10, -5, 5);
	* // => -5
	*
	* _.clamp(10, -5, 5);
	* // => 5
	*/
	function clamp(number, lower, upper) {
		if (upper === void 0) {
			upper = lower;
			lower = void 0;
		}
		if (upper !== void 0) {
			upper = toNumber(upper);
			upper = upper === upper ? upper : 0;
		}
		if (lower !== void 0) {
			lower = toNumber(lower);
			lower = lower === lower ? lower : 0;
		}
		return baseClamp(toNumber(number), lower, upper);
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/now.js
/**
	* Gets the timestamp of the number of milliseconds that have elapsed since
	* the Unix epoch (1 January 1970 00:00:00 UTC).
	*
	* @static
	* @memberOf _
	* @since 2.4.0
	* @category Date
	* @returns {number} Returns the timestamp.
	* @example
	*
	* _.defer(function(stamp) {
	*   console.log(_.now() - stamp);
	* }, _.now());
	* // => Logs the number of milliseconds it took for the deferred invocation.
	*/
	var now = function() {
		return root.Date.now();
	};

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/debounce.js
/** Error message constants. */
	var FUNC_ERROR_TEXT$1 = "Expected a function";
	var nativeMax = Math.max, nativeMin = Math.min;
	/**
	* Creates a debounced function that delays invoking `func` until after `wait`
	* milliseconds have elapsed since the last time the debounced function was
	* invoked. The debounced function comes with a `cancel` method to cancel
	* delayed `func` invocations and a `flush` method to immediately invoke them.
	* Provide `options` to indicate whether `func` should be invoked on the
	* leading and/or trailing edge of the `wait` timeout. The `func` is invoked
	* with the last arguments provided to the debounced function. Subsequent
	* calls to the debounced function return the result of the last `func`
	* invocation.
	*
	* **Note:** If `leading` and `trailing` options are `true`, `func` is
	* invoked on the trailing edge of the timeout only if the debounced function
	* is invoked more than once during the `wait` timeout.
	*
	* If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
	* until to the next tick, similar to `setTimeout` with a timeout of `0`.
	*
	* See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
	* for details over the differences between `_.debounce` and `_.throttle`.
	*
	* @static
	* @memberOf _
	* @since 0.1.0
	* @category Function
	* @param {Function} func The function to debounce.
	* @param {number} [wait=0] The number of milliseconds to delay.
	* @param {Object} [options={}] The options object.
	* @param {boolean} [options.leading=false]
	*  Specify invoking on the leading edge of the timeout.
	* @param {number} [options.maxWait]
	*  The maximum time `func` is allowed to be delayed before it's invoked.
	* @param {boolean} [options.trailing=true]
	*  Specify invoking on the trailing edge of the timeout.
	* @returns {Function} Returns the new debounced function.
	* @example
	*
	* // Avoid costly calculations while the window size is in flux.
	* jQuery(window).on('resize', _.debounce(calculateLayout, 150));
	*
	* // Invoke `sendMail` when clicked, debouncing subsequent calls.
	* jQuery(element).on('click', _.debounce(sendMail, 300, {
	*   'leading': true,
	*   'trailing': false
	* }));
	*
	* // Ensure `batchLog` is invoked once after 1 second of debounced calls.
	* var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
	* var source = new EventSource('/stream');
	* jQuery(source).on('message', debounced);
	*
	* // Cancel the trailing debounced invocation.
	* jQuery(window).on('popstate', debounced.cancel);
	*/
	function debounce(func, wait, options) {
		var lastArgs, lastThis, maxWait, result, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
		if (typeof func != "function") throw new TypeError(FUNC_ERROR_TEXT$1);
		wait = toNumber(wait) || 0;
		if (isObject(options)) {
			leading = !!options.leading;
			maxing = "maxWait" in options;
			maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
			trailing = "trailing" in options ? !!options.trailing : trailing;
		}
		function invokeFunc(time) {
			var args = lastArgs, thisArg = lastThis;
			lastArgs = lastThis = void 0;
			lastInvokeTime = time;
			result = func.apply(thisArg, args);
			return result;
		}
		function leadingEdge(time) {
			lastInvokeTime = time;
			timerId = setTimeout(timerExpired, wait);
			return leading ? invokeFunc(time) : result;
		}
		function remainingWait(time) {
			var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, timeWaiting = wait - timeSinceLastCall;
			return maxing ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
		}
		function shouldInvoke(time) {
			var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
			return lastCallTime === void 0 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
		}
		function timerExpired() {
			var time = now();
			if (shouldInvoke(time)) return trailingEdge(time);
			timerId = setTimeout(timerExpired, remainingWait(time));
		}
		function trailingEdge(time) {
			timerId = void 0;
			if (trailing && lastArgs) return invokeFunc(time);
			lastArgs = lastThis = void 0;
			return result;
		}
		function cancel() {
			if (timerId !== void 0) clearTimeout(timerId);
			lastInvokeTime = 0;
			lastArgs = lastCallTime = lastThis = timerId = void 0;
		}
		function flush() {
			return timerId === void 0 ? result : trailingEdge(now());
		}
		function debounced() {
			var time = now(), isInvoking = shouldInvoke(time);
			lastArgs = arguments;
			lastThis = this;
			lastCallTime = time;
			if (isInvoking) {
				if (timerId === void 0) return leadingEdge(lastCallTime);
				if (maxing) {
					clearTimeout(timerId);
					timerId = setTimeout(timerExpired, wait);
					return invokeFunc(lastCallTime);
				}
			}
			if (timerId === void 0) timerId = setTimeout(timerExpired, wait);
			return result;
		}
		debounced.cancel = cancel;
		debounced.flush = flush;
		return debounced;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_escapeHtmlChar.js
/**
	* Used by `_.escape` to convert characters to HTML entities.
	*
	* @private
	* @param {string} chr The matched character to escape.
	* @returns {string} Returns the escaped character.
	*/
	var escapeHtmlChar = basePropertyOf({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;",
		"'": "&#39;"
	});

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/escape.js
/** Used to match HTML entities and HTML characters. */
	var reUnescapedHtml = /[&<>"']/g, reHasUnescapedHtml = RegExp(reUnescapedHtml.source);
	/**
	* Converts the characters "&", "<", ">", '"', and "'" in `string` to their
	* corresponding HTML entities.
	*
	* **Note:** No other characters are escaped. To escape additional
	* characters use a third-party library like [_he_](https://mths.be/he).
	*
	* Though the ">" character is escaped for symmetry, characters like
	* ">" and "/" don't need escaping in HTML and have no special meaning
	* unless they're part of a tag or unquoted attribute value. See
	* [Mathias Bynens's article](https://mathiasbynens.be/notes/ambiguous-ampersands)
	* (under "semi-related fun fact") for more details.
	*
	* When working with HTML you should always
	* [quote attribute values](http://wonko.com/post/html-escaping) to reduce
	* XSS vectors.
	*
	* @static
	* @since 0.1.0
	* @memberOf _
	* @category String
	* @param {string} [string=''] The string to escape.
	* @returns {string} Returns the escaped string.
	* @example
	*
	* _.escape('fred, barney, & pebbles');
	* // => 'fred, barney, &amp; pebbles'
	*/
	function escape(string) {
		string = toString(string);
		return string && reHasUnescapedHtml.test(string) ? string.replace(reUnescapedHtml, escapeHtmlChar) : string;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_baseValues.js
/**
	* The base implementation of `_.values` and `_.valuesIn` which creates an
	* array of `object` property values corresponding to the property names
	* of `props`.
	*
	* @private
	* @param {Object} object The object to query.
	* @param {Array} props The property names to get values for.
	* @returns {Object} Returns the array of property values.
	*/
	function baseValues(object, props) {
		return arrayMap(props, function(key) {
			return object[key];
		});
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/isNil.js
/**
	* Checks if `value` is `null` or `undefined`.
	*
	* @static
	* @memberOf _
	* @since 4.0.0
	* @category Lang
	* @param {*} value The value to check.
	* @returns {boolean} Returns `true` if `value` is nullish, else `false`.
	* @example
	*
	* _.isNil(null);
	* // => true
	*
	* _.isNil(void 0);
	* // => true
	*
	* _.isNil(NaN);
	* // => false
	*/
	function isNil(value) {
		return value == null;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_baseSet.js
/**
	* The base implementation of `_.set`.
	*
	* @private
	* @param {Object} object The object to modify.
	* @param {Array|string} path The path of the property to set.
	* @param {*} value The value to set.
	* @param {Function} [customizer] The function to customize path creation.
	* @returns {Object} Returns `object`.
	*/
	function baseSet(object, path, value, customizer) {
		if (!isObject(object)) return object;
		path = castPath(path, object);
		var index = -1, length = path.length, lastIndex = length - 1, nested = object;
		while (nested != null && ++index < length) {
			var key = toKey(path[index]), newValue = value;
			if (key === "__proto__" || key === "constructor" || key === "prototype") return object;
			if (index != lastIndex) {
				var objValue = nested[key];
				newValue = customizer ? customizer(objValue, key, nested) : void 0;
				if (newValue === void 0) newValue = isObject(objValue) ? objValue : isIndex(path[index + 1]) ? [] : {};
			}
			assignValue(nested, key, newValue);
			nested = nested[key];
		}
		return object;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/set.js
/**
	* Sets the value at `path` of `object`. If a portion of `path` doesn't exist,
	* it's created. Arrays are created for missing index properties while objects
	* are created for all other missing properties. Use `_.setWith` to customize
	* `path` creation.
	*
	* **Note:** This method mutates `object`.
	*
	* @static
	* @memberOf _
	* @since 3.7.0
	* @category Object
	* @param {Object} object The object to modify.
	* @param {Array|string} path The path of the property to set.
	* @param {*} value The value to set.
	* @returns {Object} Returns `object`.
	* @example
	*
	* var object = { 'a': [{ 'b': { 'c': 3 } }] };
	*
	* _.set(object, 'a[0].b.c', 4);
	* console.log(object.a[0].b.c);
	* // => 4
	*
	* _.set(object, ['x', '0', 'y', 'z'], 5);
	* console.log(object.x[0].y.z);
	* // => 5
	*/
	function set(object, path, value) {
		return object == null ? object : baseSet(object, path, value);
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_customDefaultsAssignIn.js
/** Used for built-in method references. */
	var objectProto = Object.prototype;
	/** Used to check objects for own properties. */
	var hasOwnProperty$1 = objectProto.hasOwnProperty;
	/**
	* Used by `_.defaults` to customize its `_.assignIn` use to assign properties
	* of source objects to the destination object for all destination properties
	* that resolve to `undefined`.
	*
	* @private
	* @param {*} objValue The destination value.
	* @param {*} srcValue The source value.
	* @param {string} key The key of the property to assign.
	* @param {Object} object The parent object of `objValue`.
	* @returns {*} Returns the value to assign.
	*/
	function customDefaultsAssignIn(objValue, srcValue, key, object) {
		if (objValue === void 0 || eq(objValue, objectProto[key]) && !hasOwnProperty$1.call(object, key)) return srcValue;
		return objValue;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_escapeStringChar.js
/** Used to escape characters for inclusion in compiled string literals. */
	var stringEscapes = {
		"\\": "\\",
		"'": "'",
		"\n": "n",
		"\r": "r",
		"\u2028": "u2028",
		"\u2029": "u2029"
	};
	/**
	* Used by `_.template` to escape characters for inclusion in compiled string literals.
	*
	* @private
	* @param {string} chr The matched character to escape.
	* @returns {string} Returns the escaped character.
	*/
	function escapeStringChar(chr) {
		return "\\" + stringEscapes[chr];
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_reInterpolate.js
/** Used to match template delimiters. */
	var reInterpolate = /<%=([\s\S]+?)%>/g;

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_reEscape.js
/** Used to match template delimiters. */
	var reEscape = /<%-([\s\S]+?)%>/g;

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/_reEvaluate.js
/** Used to match template delimiters. */
	var reEvaluate = /<%([\s\S]+?)%>/g;

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/templateSettings.js
/**
	* By default, the template delimiters used by lodash are like those in
	* embedded Ruby (ERB) as well as ES2015 template strings. Change the
	* following template settings to use alternative delimiters.
	*
	* @static
	* @memberOf _
	* @type {Object}
	*/
	var templateSettings = {
		"escape": reEscape,
		"evaluate": reEvaluate,
		"interpolate": reInterpolate,
		"variable": "",
		"imports": { "_": { "escape": escape } }
	};

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/template.js
/** Error message constants. */
	var INVALID_TEMPL_VAR_ERROR_TEXT = "Invalid `variable` option passed into `_.template`";
	/** Used to match empty string literals in compiled template source. */
	var reEmptyStringLeading = /\b__p \+= '';/g, reEmptyStringMiddle = /\b(__p \+=) '' \+/g, reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;
	/**
	* Used to validate the `validate` option in `_.template` variable.
	*
	* Forbids characters which could potentially change the meaning of the function argument definition:
	* - "()," (modification of function parameters)
	* - "=" (default value)
	* - "[]{}" (destructuring of function parameters)
	* - "/" (beginning of a comment)
	* - whitespace
	*/
	var reForbiddenIdentifierChars = /[()=,{}\[\]\/\s]/;
	/**
	* Used to match
	* [ES template delimiters](http://ecma-international.org/ecma-262/7.0/#sec-template-literal-lexical-components).
	*/
	var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;
	/** Used to ensure capturing order of template delimiters. */
	var reNoMatch = /($^)/;
	/** Used to match unescaped characters in compiled string literals. */
	var reUnescapedString = /['\n\r\u2028\u2029\\]/g;
	/** Used to check objects for own properties. */
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	/**
	* Creates a compiled template function that can interpolate data properties
	* in "interpolate" delimiters, HTML-escape interpolated data properties in
	* "escape" delimiters, and execute JavaScript in "evaluate" delimiters. Data
	* properties may be accessed as free variables in the template. If a setting
	* object is given, it takes precedence over `_.templateSettings` values.
	*
	* **Note:** In the development build `_.template` utilizes
	* [sourceURLs](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl)
	* for easier debugging.
	*
	* For more information on precompiling templates see
	* [lodash's custom builds documentation](https://lodash.com/custom-builds).
	*
	* For more information on Chrome extension sandboxes see
	* [Chrome's extensions documentation](https://developer.chrome.com/extensions/sandboxingEval).
	*
	* @static
	* @since 0.1.0
	* @memberOf _
	* @category String
	* @param {string} [string=''] The template string.
	* @param {Object} [options={}] The options object.
	* @param {RegExp} [options.escape=_.templateSettings.escape]
	*  The HTML "escape" delimiter.
	* @param {RegExp} [options.evaluate=_.templateSettings.evaluate]
	*  The "evaluate" delimiter.
	* @param {Object} [options.imports=_.templateSettings.imports]
	*  An object to import into the template as free variables.
	* @param {RegExp} [options.interpolate=_.templateSettings.interpolate]
	*  The "interpolate" delimiter.
	* @param {string} [options.sourceURL='templateSources[n]']
	*  The sourceURL of the compiled template.
	* @param {string} [options.variable='obj']
	*  The data object variable name.
	* @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
	* @returns {Function} Returns the compiled template function.
	* @example
	*
	* // Use the "interpolate" delimiter to create a compiled template.
	* var compiled = _.template('hello <%= user %>!');
	* compiled({ 'user': 'fred' });
	* // => 'hello fred!'
	*
	* // Use the HTML "escape" delimiter to escape data property values.
	* var compiled = _.template('<b><%- value %></b>');
	* compiled({ 'value': '<script>' });
	* // => '<b>&lt;script&gt;</b>'
	*
	* // Use the "evaluate" delimiter to execute JavaScript and generate HTML.
	* var compiled = _.template('<% _.forEach(users, function(user) { %><li><%- user %></li><% }); %>');
	* compiled({ 'users': ['fred', 'barney'] });
	* // => '<li>fred</li><li>barney</li>'
	*
	* // Use the internal `print` function in "evaluate" delimiters.
	* var compiled = _.template('<% print("hello " + user); %>!');
	* compiled({ 'user': 'barney' });
	* // => 'hello barney!'
	*
	* // Use the ES template literal delimiter as an "interpolate" delimiter.
	* // Disable support by replacing the "interpolate" delimiter.
	* var compiled = _.template('hello ${ user }!');
	* compiled({ 'user': 'pebbles' });
	* // => 'hello pebbles!'
	*
	* // Use backslashes to treat delimiters as plain text.
	* var compiled = _.template('<%= "\\<%- value %\\>" %>');
	* compiled({ 'value': 'ignored' });
	* // => '<%- value %>'
	*
	* // Use the `imports` option to import `jQuery` as `jq`.
	* var text = '<% jq.each(users, function(user) { %><li><%- user %></li><% }); %>';
	* var compiled = _.template(text, { 'imports': { 'jq': jQuery } });
	* compiled({ 'users': ['fred', 'barney'] });
	* // => '<li>fred</li><li>barney</li>'
	*
	* // Use the `sourceURL` option to specify a custom sourceURL for the template.
	* var compiled = _.template('hello <%= user %>!', { 'sourceURL': '/basic/greeting.jst' });
	* compiled(data);
	* // => Find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector.
	*
	* // Use the `variable` option to ensure a with-statement isn't used in the compiled template.
	* var compiled = _.template('hi <%= data.user %>!', { 'variable': 'data' });
	* compiled.source;
	* // => function(data) {
	* //   var __t, __p = '';
	* //   __p += 'hi ' + ((__t = ( data.user )) == null ? '' : __t) + '!';
	* //   return __p;
	* // }
	*
	* // Use custom template delimiters.
	* _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
	* var compiled = _.template('hello {{ user }}!');
	* compiled({ 'user': 'mustache' });
	* // => 'hello mustache!'
	*
	* // Use the `source` property to inline compiled templates for meaningful
	* // line numbers in error messages and stack traces.
	* fs.writeFileSync(path.join(process.cwd(), 'jst.js'), '\
	*   var JST = {\
	*     "main": ' + _.template(mainText).source + '\
	*   };\
	* ');
	*/
	function template(string, options, guard) {
		var settings = templateSettings.imports._.templateSettings || templateSettings;
		if (guard && isIterateeCall(string, options, guard)) options = void 0;
		string = toString(string);
		options = assignInWith({}, options, settings, customDefaultsAssignIn);
		var imports = assignInWith({}, options.imports, settings.imports, customDefaultsAssignIn), importsKeys = keys(imports), importsValues = baseValues(imports, importsKeys);
		var isEscaping, isEvaluating, index = 0, interpolate = options.interpolate || reNoMatch, source = "__p += '";
		var reDelimiters = RegExp((options.escape || reNoMatch).source + "|" + interpolate.source + "|" + (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + "|" + (options.evaluate || reNoMatch).source + "|$", "g");
		var sourceURL = hasOwnProperty.call(options, "sourceURL") ? "//# sourceURL=" + (options.sourceURL + "").replace(/\s/g, " ") + "\n" : "";
		string.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
			interpolateValue || (interpolateValue = esTemplateValue);
			source += string.slice(index, offset).replace(reUnescapedString, escapeStringChar);
			if (escapeValue) {
				isEscaping = true;
				source += "' +\n__e(" + escapeValue + ") +\n'";
			}
			if (evaluateValue) {
				isEvaluating = true;
				source += "';\n" + evaluateValue + ";\n__p += '";
			}
			if (interpolateValue) source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
			index = offset + match.length;
			return match;
		});
		source += "';\n";
		var variable = hasOwnProperty.call(options, "variable") && options.variable;
		if (!variable) source = "with (obj) {\n" + source + "\n}\n";
		else if (reForbiddenIdentifierChars.test(variable)) throw new Error(INVALID_TEMPL_VAR_ERROR_TEXT);
		source = (isEvaluating ? source.replace(reEmptyStringLeading, "") : source).replace(reEmptyStringMiddle, "$1").replace(reEmptyStringTrailing, "$1;");
		source = "function(" + (variable || "obj") + ") {\n" + (variable ? "" : "obj || (obj = {});\n") + "var __t, __p = ''" + (isEscaping ? ", __e = _.escape" : "") + (isEvaluating ? ", __j = Array.prototype.join;\nfunction print() { __p += __j.call(arguments, '') }\n" : ";\n") + source + "return __p\n}";
		var result = attempt(function() {
			return Function(importsKeys, sourceURL + "return " + source).apply(void 0, importsValues);
		});
		result.source = source;
		if (isError(result)) throw result;
		return result;
	}

//#endregion
//#region node_modules/.pnpm/lodash-es@4.17.23/node_modules/lodash-es/throttle.js
/** Error message constants. */
	var FUNC_ERROR_TEXT = "Expected a function";
	/**
	* Creates a throttled function that only invokes `func` at most once per
	* every `wait` milliseconds. The throttled function comes with a `cancel`
	* method to cancel delayed `func` invocations and a `flush` method to
	* immediately invoke them. Provide `options` to indicate whether `func`
	* should be invoked on the leading and/or trailing edge of the `wait`
	* timeout. The `func` is invoked with the last arguments provided to the
	* throttled function. Subsequent calls to the throttled function return the
	* result of the last `func` invocation.
	*
	* **Note:** If `leading` and `trailing` options are `true`, `func` is
	* invoked on the trailing edge of the timeout only if the throttled function
	* is invoked more than once during the `wait` timeout.
	*
	* If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
	* until to the next tick, similar to `setTimeout` with a timeout of `0`.
	*
	* See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
	* for details over the differences between `_.throttle` and `_.debounce`.
	*
	* @static
	* @memberOf _
	* @since 0.1.0
	* @category Function
	* @param {Function} func The function to throttle.
	* @param {number} [wait=0] The number of milliseconds to throttle invocations to.
	* @param {Object} [options={}] The options object.
	* @param {boolean} [options.leading=true]
	*  Specify invoking on the leading edge of the timeout.
	* @param {boolean} [options.trailing=true]
	*  Specify invoking on the trailing edge of the timeout.
	* @returns {Function} Returns the new throttled function.
	* @example
	*
	* // Avoid excessively updating the position while scrolling.
	* jQuery(window).on('scroll', _.throttle(updatePosition, 100));
	*
	* // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
	* var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
	* jQuery(element).on('click', throttled);
	*
	* // Cancel the trailing throttled invocation.
	* jQuery(window).on('popstate', throttled.cancel);
	*/
	function throttle(func, wait, options) {
		var leading = true, trailing = true;
		if (typeof func != "function") throw new TypeError(FUNC_ERROR_TEXT);
		if (isObject(options)) {
			leading = "leading" in options ? !!options.leading : leading;
			trailing = "trailing" in options ? !!options.trailing : trailing;
		}
		return debounce(func, wait, {
			"leading": leading,
			"maxWait": wait,
			"trailing": trailing
		});
	}

//#endregion
//#region src/utils/opencc.ts
	function opencc(text) {
		const cn2tw = opencc_js.default.Converter({
			from: "cn",
			to: "tw"
		});
		return {
			cn: opencc_js.default.Converter({
				from: "tw",
				to: "cn"
			})(text),
			tw: cn2tw(text)
		};
	}

//#endregion
//#region \0@oxc-project+runtime@0.115.0/helpers/typeof.js
	function _typeof(o) {
		"@babel/helpers - typeof";
		return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
			return typeof o;
		} : function(o) {
			return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
		}, _typeof(o);
	}

//#endregion
//#region \0@oxc-project+runtime@0.115.0/helpers/toPrimitive.js
	function toPrimitive(t, r) {
		if ("object" != _typeof(t) || !t) return t;
		var e = t[Symbol.toPrimitive];
		if (void 0 !== e) {
			var i = e.call(t, r || "default");
			if ("object" != _typeof(i)) return i;
			throw new TypeError("@@toPrimitive must return a primitive value.");
		}
		return ("string" === r ? String : Number)(t);
	}

//#endregion
//#region \0@oxc-project+runtime@0.115.0/helpers/toPropertyKey.js
	function toPropertyKey(t) {
		var i = toPrimitive(t, "string");
		return "symbol" == _typeof(i) ? i : i + "";
	}

//#endregion
//#region \0@oxc-project+runtime@0.115.0/helpers/defineProperty.js
	function _defineProperty(e, r, t) {
		return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
			value: t,
			enumerable: !0,
			configurable: !0,
			writable: !0
		}) : e[r] = t, e;
	}

//#endregion
//#region src/runtime/index.ts
	function createTest(target) {
		return (test) => typeof test === "function" ? test() : typeof test === "string" ? target.includes(test) || test === "*" : test.test(target);
	}
	var Runtime = class {
		constructor() {
			var _this = this;
			_defineProperty(this, "getTopLocationHref", memoize(async () => {
				if (parent === self) return window.location.href;
				return new Promise((resolve) => {
					window.addEventListener("message", function once(e) {
						var _e$data;
						if (((_e$data = e.data) === null || _e$data === void 0 ? void 0 : _e$data.key) === "getLocationHref") {
							window.removeEventListener("message", once);
							resolve(e.data.url);
						}
					});
					parent.postMessage({ key: "getLocationHref" }, "*");
				});
			}, () => window.location.href));
			_defineProperty(this, "getAnimeScope", memoize(async () => {
				var _this$getActiveRegist, _this$getActiveRegist2;
				if (parent === self) return ((_this$getActiveRegist = _this.getActiveRegister().search) === null || _this$getActiveRegist === void 0 || (_this$getActiveRegist2 = _this$getActiveRegist.getAnimeScope) === null || _this$getActiveRegist2 === void 0 ? void 0 : _this$getActiveRegist2.call(_this$getActiveRegist)) || "";
				return new Promise((resolve) => {
					window.addEventListener("message", function once(e) {
						var _e$data2;
						if (((_e$data2 = e.data) === null || _e$data2 === void 0 ? void 0 : _e$data2.key) === "getAnimeScope") {
							window.removeEventListener("message", once);
							resolve(e.data.animeScope);
						}
					});
					parent.postMessage({ key: "getAnimeScope" }, "*");
				});
			}, () => window.location.href));
			_defineProperty(this, "list", [{
				domains: [],
				opts: [],
				search: {
					name: "[BT]蜜柑计划",
					search: (cn) => `https://mikanani.me/Home/Search?searchstr=${cn}`
				}
			}]);
			if (parent === self) {
				window.addEventListener("message", (e) => {
					var _e$data3;
					if (((_e$data3 = e.data) === null || _e$data3 === void 0 ? void 0 : _e$data3.key) === "getLocationHref") {
						var _e$source;
						(_e$source = e.source) === null || _e$source === void 0 || _e$source.postMessage({
							key: "getLocationHref",
							url: location.href
						}, { targetOrigin: "*" });
					}
				});
				window.addEventListener("message", (e) => {
					var _e$data4;
					if (((_e$data4 = e.data) === null || _e$data4 === void 0 ? void 0 : _e$data4.key) === "getAnimeScope") {
						var _e$source2, _this$getActiveRegist3, _this$getActiveRegist4;
						(_e$source2 = e.source) === null || _e$source2 === void 0 || _e$source2.postMessage({
							key: "getAnimeScope",
							animeScope: ((_this$getActiveRegist3 = this.getActiveRegister().search) === null || _this$getActiveRegist3 === void 0 || (_this$getActiveRegist4 = _this$getActiveRegist3.getAnimeScope) === null || _this$getActiveRegist4 === void 0 ? void 0 : _this$getActiveRegist4.call(_this$getActiveRegist3)) || ""
						}, { targetOrigin: "*" });
					}
				});
			}
		}
		register(item) {
			this.list.push(item);
		}
		async getSearchActions() {
			var _this2 = this;
			const isInIframe = parent !== self;
			const searchs = _this2.list.map((o) => o.search).filter(Boolean).filter((o) => !(isInIframe && o.disabledInIframe));
			const register = _this2.getActiveRegister();
			const info = await _this2.getCurrentVideoNameAndEpisode();
			if (!(info === null || info === void 0 ? void 0 : info.name)) return [];
			let name = info.name;
			return searchs.filter((search) => search !== register.search && search.search).map((search) => ({
				name: search.name,
				search: () => {
					const { cn, tw } = opencc(name);
					const url = search.search(encodeURIComponent(cn), encodeURIComponent(tw));
					if (!url) return;
					if (isInIframe) parent.postMessage({
						key: "openLink",
						url
					}, "*");
					else window.open(url);
				}
			}));
		}
		async getCurrentVideoNameAndEpisode() {
			var _this3 = this;
			var _register$search, _register$search$getE, _register$search2, _episode$match;
			const register = _this3.getActiveRegister();
			if (!((_register$search = register.search) === null || _register$search === void 0 ? void 0 : _register$search.getSearchName)) return;
			let rawName = await register.search.getSearchName() || "";
			let episode = await ((_register$search$getE = (_register$search2 = register.search).getEpisode) === null || _register$search$getE === void 0 ? void 0 : _register$search$getE.call(_register$search2)) || "";
			let name = rawName.replace(/第.季/, "").replace(/[<>《》''‘’""“”\[\]]/g, "").trim();
			episode = ((_episode$match = episode.match(/([0-9.]+)[集话]/)) === null || _episode$match === void 0 ? void 0 : _episode$match[1].replace(/^0+/, "")) || episode.replace(/[第集话()（）]/g, "") || episode;
			return {
				name,
				rawName,
				episode
			};
		}
		getActiveRegister() {
			const registers = this.list.filter(({ domains }) => domains.some(createTest(location.origin)));
			if (registers.length !== 1) {
				console.log("[agefans-enhance]", window.location, registers);
				throw new Error(`激活的域名应该就一个`);
			}
			console.log("[agefans-enhance]", "激活的Register", registers[0]);
			return registers[0];
		}
		getActiveOpts() {
			return this.getActiveRegister().opts.filter(({ test }) => {
				return (Array.isArray(test) ? test : [test]).some(createTest(location.pathname + location.search));
			});
		}
		run() {
			let setupList = [];
			let runList = [];
			this.getActiveOpts().forEach((opt) => {
				const { run, setup, runInIframe } = opt;
				if (runInIframe ? parent !== self : parent === self) {
					console.log("[agefans-enhance]", "激活的opt", opt);
					setup && setupList.push(setup);
					runList.push(run);
				}
			});
			const init = () => {
				setupList.forEach((setup) => setup());
				runList.forEach((run) => run());
			};
			if (document.readyState !== "loading") init();
			else window.addEventListener("DOMContentLoaded", init);
		}
	};
	const runtime = new Runtime();

//#endregion
//#region src/utils/message.scss
	injectStyle("#k-player-message {\n  z-index: 999;\n  position: absolute;\n  left: 20px;\n  bottom: 60px;\n}\n#k-player-message .k-player-message-item {\n  display: block;\n  width: max-content;\n  padding: 8px 16px;\n  background: var(--k-player-background);\n  border-radius: 4px;\n  color: white;\n  font-size: 14px;\n  white-space: nowrap;\n  overflow: hidden;\n  box-sizing: border-box;\n  margin-top: 4px;\n}\n#k-player-message .k-player-message-item:hover {\n  background: var(--k-player-background-highlight);\n  transition: all 0.3s;\n}");

//#endregion
//#region src/utils/message.ts
	var Message = class {
		constructor(selector) {
			_defineProperty(this, "$message", void 0);
			_defineProperty(this, "MaxLength", 5);
			this.$message = $("<div id=\"k-player-message\">");
			this.$message.appendTo($(selector));
		}
		info(message, ms = 2e3) {
			if (this.$message.children().length > this.MaxLength) this.$message.children().first().remove();
			return new Promise((resolve) => {
				$(`<div class="k-player-message-item"></div>`).append(message).hide().appendTo(this.$message).show(150).delay(ms).hide(150, function() {
					$(this).remove();
					resolve();
				});
			});
		}
		destroy() {
			this.$message.empty();
		}
	};

//#endregion
//#region src/utils/parseTime.ts
	function parseTime(time = 0) {
		time = Math.round(time);
		return `${Math.floor(time / 60).toString().padStart(2, "0")}:${(time % 60).toString().padStart(2, "0")}`;
	}

//#endregion
//#region src/utils/storage.ts
	function createStorage$1(storage) {
		function getItem(key, defaultValue) {
			try {
				const value = storage.getItem(key);
				if (value) return JSON.parse(value);
				return defaultValue;
			} catch (error) {
				return defaultValue;
			}
		}
		return {
			getItem,
			setItem(key, value) {
				storage.setItem(key, JSON.stringify(value));
			},
			removeItem: storage.removeItem.bind(storage),
			clear: storage.clear.bind(storage)
		};
	}
	const session = createStorage$1(window.sessionStorage);
	const local = createStorage$1(window.localStorage);
	let gm;
	try {
		if (typeof GM_getValue === "undefined") throw new Error("GM_getValue is not defined");
		if (typeof GM_setValue === "undefined") throw new Error("GM_setValue is not defined");
		function getItem(key, defaultValue) {
			try {
				var _ref, _GM_getValue;
				return (_ref = (_GM_getValue = GM_getValue(key)) !== null && _GM_getValue !== void 0 ? _GM_getValue : local.getItem(key)) !== null && _ref !== void 0 ? _ref : defaultValue;
			} catch (error) {
				return defaultValue;
			}
		}
		gm = {
			getItem,
			setItem(key, value) {
				local.setItem(key, value);
				GM_setValue(key, value);
			}
		};
	} catch (error) {
		gm = local;
	}

//#endregion
//#region src/utils/popover.scss
	injectStyle(".k-popover {\n  position: relative;\n}\n.k-popover-overlay {\n  position: absolute;\n  display: none;\n  bottom: 100%;\n  left: 50%;\n  transform: translateX(-50%);\n  z-index: 100;\n  padding-bottom: 20px;\n}\n.k-popover-content {\n  background: var(--k-player-background);\n  border-radius: 4px;\n  overflow-x: hidden;\n  overflow-y: auto;\n  cursor: initial;\n  max-height: var(--k-player-popover-max-height, 70vh);\n}\n.k-popover-content::-webkit-scrollbar {\n  display: none;\n}");

//#endregion
//#region src/utils/popover.ts
	function popover(opts) {
		const { target, overlay, trigger = "hover", onVisibleChange } = opts;
		const $target = $(target);
		const $content = $(`<div class="k-popover-overlay"><div class="k-popover-content"></div></div>`);
		$content.on("click", (e) => e.stopPropagation());
		$content.find(".k-popover-content").append(overlay);
		$target.addClass("k-popover");
		$target.append($content);
		let isActive = false;
		let timeId;
		const toggle = (visible, delay) => {
			clearTimeout(timeId);
			timeId = window.setTimeout(() => {
				if (visible) {
					isActive = true;
					$content.fadeIn("fast");
					$target.addClass("k-popover-active");
					onVisibleChange === null || onVisibleChange === void 0 || onVisibleChange(true);
				} else {
					isActive = false;
					$content.fadeOut("fast");
					$target.removeClass("k-popover-active");
					onVisibleChange === null || onVisibleChange === void 0 || onVisibleChange(false);
				}
			}, delay);
		};
		if (trigger === "click") {
			$target.on("click", () => {
				toggle(!isActive);
			});
			window.addEventListener("click", (e) => {
				if (!$target[0].contains(e.target)) {
					if (isActive) toggle(false);
				}
			}, { capture: true });
		} else {
			$target.on("mouseenter", () => {
				toggle(true, 100);
			});
			$target.on("mouseleave", () => {
				toggle(false, 100);
			});
		}
		return $target;
	}

//#endregion
//#region src/utils/renderKey.ts
	const isMac$1 = /macintosh|mac os x/i.test(navigator.userAgent);
	const KeyMap = {
		ArrowUp: "↑",
		ArrowDown: "↓",
		ArrowLeft: "←",
		ArrowRight: "→",
		ctrl: "Ctrl",
		alt: "Alt",
		shift: "Shift"
	};
	const MacKeyMap = {
		ctrl: "⌃",
		meta: "⌘",
		alt: "⌥",
		shift: "⇧"
	};
	if (isMac$1) Object.assign(KeyMap, MacKeyMap);
	function renderKey(key) {
		Object.entries(KeyMap).forEach(([k, v]) => {
			key = key.replace(new RegExp(k, "i"), v);
		});
		return key;
	}

//#endregion
//#region src/player/plugins/shortcuts/types.ts
	let Commands$2 = /* @__PURE__ */ function(Commands) {
		Commands["forward5"] = "forward5";
		Commands["backward5"] = "backward5";
		Commands["forward30"] = "forward30";
		Commands["backward30"] = "backward30";
		Commands["forward60"] = "forward60";
		Commands["backward60"] = "backward60";
		Commands["forward90"] = "forward90";
		Commands["backward90"] = "backward90";
		Commands["togglePlay"] = "togglePlay";
		Commands["next"] = "next";
		Commands["prev"] = "prev";
		Commands["toggleWidescreen"] = "toggleWidescreen";
		Commands["Escape"] = "Escape";
		Commands["restoreSpeed"] = "restoreSpeed";
		Commands["increaseSpeed"] = "increaseSpeed";
		Commands["decreaseSpeed"] = "decreaseSpeed";
		Commands["temporaryIncreaseSpeed"] = "temporaryIncreaseSpeed";
		Commands["togglePIP"] = "togglePIP";
		Commands["internal"] = "internal";
		Commands["help"] = "help";
		Commands["prevFrame"] = "prevFrame";
		Commands["nextFrame"] = "nextFrame";
		Commands["toggleFullscreen"] = "toggleFullscreen";
		Commands["decreaseVolume"] = "decreaseVolume";
		Commands["increaseVolume"] = "increaseVolume";
		Commands["toggleMute"] = "toggleMute";
		Commands["forwardCustom"] = "forwardCustom";
		Commands["backwardCustom"] = "backwardCustom";
		Commands["recordCustomSeekTime"] = "recordCustomSeekTime";
		return Commands;
	}({});

//#endregion
//#region \0@oxc-project+runtime@0.115.0/helpers/objectSpread2.js
	function ownKeys(e, r) {
		var t = Object.keys(e);
		if (Object.getOwnPropertySymbols) {
			var o = Object.getOwnPropertySymbols(e);
			r && (o = o.filter(function(r) {
				return Object.getOwnPropertyDescriptor(e, r).enumerable;
			})), t.push.apply(t, o);
		}
		return t;
	}
	function _objectSpread2(e) {
		for (var r = 1; r < arguments.length; r++) {
			var t = null != arguments[r] ? arguments[r] : {};
			r % 2 ? ownKeys(Object(t), !0).forEach(function(r) {
				_defineProperty(e, r, t[r]);
			}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r) {
				Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
			});
		}
		return e;
	}

//#endregion
//#region src/player/plugins/shortcuts/keybindings.ts
	const isMac = /macintosh|mac os x/i.test(navigator.userAgent);
	const DefaultKeyBindings = [
		{
			command: Commands$2.togglePlay,
			key: "Space",
			description: "播放/暂停"
		},
		{
			command: Commands$2.backward5,
			key: "ArrowLeft",
			description: "步退5s"
		},
		{
			command: Commands$2.forward5,
			key: "ArrowRight",
			description: "步进5s"
		},
		{
			command: Commands$2.backward30,
			key: "shift ArrowLeft",
			description: "步退30s"
		},
		{
			command: Commands$2.forward30,
			key: "shift ArrowRight",
			description: "步进30s"
		},
		{
			command: Commands$2.backward60,
			key: "alt ArrowLeft",
			description: "步退60s"
		},
		{
			command: Commands$2.forward60,
			key: "alt ArrowRight",
			description: "步进60s"
		},
		{
			command: Commands$2.backward90,
			key: "ctrl ArrowLeft",
			mac: "meta ArrowLeft",
			description: "步退90s"
		},
		{
			command: Commands$2.forward90,
			key: "ctrl ArrowRight",
			mac: "meta ArrowRight",
			description: "步进90s"
		},
		{
			command: Commands$2.backwardCustom,
			key: "shift J",
			description: "步退[记忆时间]"
		},
		{
			command: Commands$2.forwardCustom,
			key: "J",
			description: "步进[记忆时间]"
		},
		{
			command: Commands$2.recordCustomSeekTime,
			key: "K",
			description: "设置[记忆时间]"
		},
		{
			command: Commands$2.prevFrame,
			key: "",
			description: "上一帧"
		},
		{
			command: Commands$2.nextFrame,
			key: "",
			description: "下一帧"
		},
		{
			command: Commands$2.prev,
			key: "P",
			description: "上一集"
		},
		{
			command: Commands$2.next,
			key: "N",
			description: "下一集"
		},
		{
			command: Commands$2.toggleWidescreen,
			key: "W",
			description: "宽屏"
		},
		{
			command: Commands$2.toggleFullscreen,
			key: "F",
			description: "全屏"
		},
		{
			command: Commands$2.Escape,
			key: "Escape",
			editable: false,
			description: "退出全屏/宽屏"
		},
		{
			command: Commands$2.restoreSpeed,
			key: "Z",
			description: "原速播放"
		},
		{
			command: Commands$2.decreaseSpeed,
			key: "X",
			description: "减速播放"
		},
		{
			command: Commands$2.increaseSpeed,
			key: "C",
			description: "加速播放"
		},
		{
			command: Commands$2.temporaryIncreaseSpeed,
			key: "V",
			description: "长按加速"
		},
		{
			command: Commands$2.togglePIP,
			key: "I",
			description: "画中画"
		},
		{
			command: Commands$2.increaseVolume,
			key: "ArrowUp",
			description: "增大音量"
		},
		{
			command: Commands$2.decreaseVolume,
			key: "ArrowDown",
			description: "减小音量"
		},
		{
			command: Commands$2.toggleMute,
			key: "M",
			description: "切换静音"
		},
		{
			command: Commands$2.internal,
			key: "?",
			editable: false,
			description: "显示帮助"
		}
	];
	var KeyBindings = class {
		constructor() {
			_defineProperty(this, "storageKey", "user-custom-keybindings");
			_defineProperty(this, "listener", []);
		}
		getCustomKeyBindings() {
			return gm.getItem(this.storageKey, []);
		}
		setCustomKeyBindings(keyBindings) {
			gm.setItem(this.storageKey, keyBindings);
		}
		registerKeyBinding(keyBinding) {
			DefaultKeyBindings.push(keyBinding);
			this.notify();
		}
		setKeyBinding(command, key) {
			let customKeyBindings = this.getCustomKeyBindings();
			customKeyBindings = customKeyBindings.filter((o) => o.command !== command);
			if (key) customKeyBindings.push({
				command,
				key
			});
			this.setCustomKeyBindings(customKeyBindings);
			this.notify();
		}
		getKeyBindings() {
			const customKeyBindings = this.getCustomKeyBindings();
			return DefaultKeyBindings.map((keyBinding) => {
				const customKeyBinding = customKeyBindings.find((o) => o.command === keyBinding.command);
				const nextKeyBinding = _objectSpread2(_objectSpread2({}, keyBinding), {}, {
					originKey: "",
					customKey: ""
				});
				if (isMac && nextKeyBinding.mac) nextKeyBinding.key = nextKeyBinding.mac;
				nextKeyBinding.originKey = nextKeyBinding.key;
				if (customKeyBinding) {
					nextKeyBinding.key = customKeyBinding.key;
					nextKeyBinding.customKey = customKeyBinding.key;
				}
				return nextKeyBinding;
			});
		}
		getKeyBinding(command) {
			return this.getKeyBindings().find((o) => o.command === command);
		}
		getCommand(key) {
			var _keyBindings$find;
			if (!key) return;
			return (_keyBindings$find = this.getKeyBindings().find((o) => o.key === key)) === null || _keyBindings$find === void 0 ? void 0 : _keyBindings$find.command;
		}
		subscribe(cb) {
			this.listener.push(cb);
			return () => {
				this.listener = this.listener.filter((fn) => fn !== cb);
			};
		}
		notify() {
			this.listener.forEach((fn) => fn());
		}
	};

//#endregion
//#region src/player/plugins/shortcuts/utils.ts
	function normalizeKeyEvent(e) {
		const SPECIAL_KEY_EN = "`-=[]\\;',./~!@#$%^&*()_+{}|:\"<>?".split("");
		const SPECIAL_KEY_ZH = "·-=【】、；‘，。/～！@#¥%…&*（）—+「」｜：“《》？".split("");
		let key = e.key;
		if (e.code === "Space") key = "Space";
		if (/^[a-z]$/.test(key)) key = key.toUpperCase();
		else if (SPECIAL_KEY_ZH.includes(key)) key = SPECIAL_KEY_EN[SPECIAL_KEY_ZH.indexOf(key)];
		let keyArr = [];
		e.ctrlKey && keyArr.push("ctrl");
		e.metaKey && keyArr.push("meta");
		e.shiftKey && !SPECIAL_KEY_EN.includes(key) && keyArr.push("shift");
		e.altKey && keyArr.push("alt");
		if (!/Control|Meta|Shift|Alt/i.test(key)) keyArr.push(key);
		keyArr = [...new Set(keyArr)];
		return keyArr.join(" ");
	}

//#endregion
//#region src/player/plugins/shortcuts/shortcuts.ts
	var Shortcuts = class Shortcuts {
		constructor(player) {
			this.player = player;
			_defineProperty(this, "handleKeyEvent", (e) => {
				var _document$activeEleme;
				if (/input|textarea|select/i.test((_document$activeEleme = document.activeElement) === null || _document$activeEleme === void 0 ? void 0 : _document$activeEleme.tagName)) return;
				const key = normalizeKeyEvent(e);
				const command = Shortcuts.keyBindings.getCommand(key);
				if (command) {
					e.preventDefault();
					this.invoke(command, e);
				}
			});
			player.shortcuts = this;
			window.addEventListener("keydown", this.handleKeyEvent);
			window.addEventListener("keyup", this.handleKeyEvent);
		}
		static registerCommand(command, keydown, keyup) {
			this.commands.push({
				command,
				keydown,
				keyup
			});
		}
		invoke(command, e) {
			const cmd = Shortcuts.commands.find((cmd) => cmd.command === command);
			if (cmd) {
				var _cmd$type;
				(_cmd$type = cmd[e.type === "keydown" ? "keydown" : "keyup"]) === null || _cmd$type === void 0 || _cmd$type.call(this.player, e);
			}
		}
	};
	_defineProperty(Shortcuts, "Commands", Commands$2);
	_defineProperty(Shortcuts, "keyBindings", new KeyBindings());
	_defineProperty(Shortcuts, "commands", []);
	customElements.define("k-shortcuts-tip", class extends HTMLElement {
		constructor() {
			super();
			_defineProperty(this, "unsubscribe", void 0);
			_defineProperty(this, "node", void 0);
			this.node = document.createElement("span");
			this.attachShadow({ mode: "open" }).appendChild(this.node);
			this.unsubscribe = Shortcuts.keyBindings.subscribe(() => {
				this.renderKey();
			});
			this.renderKey();
		}
		renderKey() {
			const command = this.getAttribute("command");
			const kb = Shortcuts.keyBindings.getKeyBinding(command);
			if (kb) this.node.textContent = renderKey(kb.key);
		}
		disconnectedCallback() {
			this.unsubscribe();
		}
	});
	function setup$2(player) {
		new Shortcuts(player);
	}

//#endregion
//#region src/utils/keybind.ts
	const SHIFT_KEY = "~!@#$%^&*()_+{}|:\"<>?～！@#¥%…&*（）——+「」｜：“《》？";
	function keybind(keys, cb) {
		const isMac = /macintosh|mac os x/i.test(navigator.userAgent);
		keys = keys.filter((key) => !key.includes(isMac ? "ctrl" : "meta"));
		$(window).on("keydown", (e) => {
			var _document$activeEleme;
			if (((_document$activeEleme = document.activeElement) === null || _document$activeEleme === void 0 ? void 0 : _document$activeEleme.tagName) === "INPUT") return;
			let keyArr = [];
			e.ctrlKey && keyArr.push("ctrl");
			e.metaKey && keyArr.push("meta");
			e.shiftKey && !SHIFT_KEY.includes(e.key) && keyArr.push("shift");
			e.altKey && keyArr.push("alt");
			if (![
				"Control",
				"Meta",
				"Shift",
				"Alt"
			].includes(e.key)) keyArr.push(e.key);
			keyArr = [...new Set(keyArr)];
			const key = keyArr.join("+");
			if (keys.includes(key)) cb(e.originalEvent, key);
		});
	}

//#endregion
//#region src/utils/modal.scss
	injectStyle(".k-modal {\n  position: fixed;\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: 2147483647;\n  text-align: left;\n  animation: fadeIn 0.3s ease forwards;\n  color: rgba(0, 0, 0, 0.85);\n  font-family: system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Oxygen, Ubuntu, Cantarell, \"Open Sans\", \"Helvetica Neue\", sans-serif;\n}\n@keyframes fadeIn {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n.k-modal * {\n  color: inherit;\n}\n.k-modal-mask {\n  position: fixed;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  top: 0;\n  background: rgba(0, 0, 0, 0.45);\n  cursor: pointer;\n}\n.k-modal-wrap {\n  position: fixed;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  top: 0;\n  overflow: auto;\n  text-align: center;\n  user-select: none;\n}\n.k-modal-wrap::before {\n  content: \"\";\n  display: inline-block;\n  width: 0;\n  height: 100%;\n  vertical-align: middle;\n}\n.k-modal-container {\n  margin: 20px 0;\n  display: inline-block;\n  vertical-align: middle;\n  text-align: left;\n  position: relative;\n  width: 520px;\n  min-height: 100px;\n  background: white;\n  border-radius: 2px;\n  user-select: text;\n}\n.k-modal-header {\n  font-size: 16px;\n  border-bottom: 1px solid #f1f1f1;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n.k-modal-header-title {\n  padding: 16px;\n  font-weight: 500;\n}\n.k-modal-close {\n  cursor: pointer;\n  height: 55px;\n  width: 55px;\n  position: absolute;\n  right: 0;\n  top: 0;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  user-select: none;\n}\n.k-modal-close * {\n  color: rgba(0, 0, 0, 0.45);\n  transition: color 0.15s ease;\n}\n.k-modal-close:hover * {\n  color: rgba(0, 0, 0, 0.85);\n}\n.k-modal-body {\n  padding: 16px;\n  font-size: 14px;\n}\n.k-modal-footer {\n  padding: 10px 16px;\n  font-size: 14px;\n  border-top: 1px solid #f1f1f1;\n  display: flex;\n  justify-content: flex-end;\n}\n.k-modal-btn {\n  user-select: none;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: 32px;\n  line-height: 32px;\n  border-radius: 2px;\n  border: 1px solid #1890ff;\n  background: #1890ff;\n  color: white;\n  min-width: 64px;\n  cursor: pointer;\n  padding: 0 8px;\n}");

//#endregion
//#region src/utils/modal.ts
	function modal(opts) {
		const { title, content, onClose, onOk, afterClose, okText = "确 定", handleOkOnEnter } = opts;
		const store = {
			width: document.body.style.width,
			overflow: document.body.style.overflow
		};
		const ID = Math.random().toString(16).slice(2);
		$(`
<div class="k-modal ${opts.className || ""}" role="dialog" id="${ID}">
  <div class="k-modal-mask"></div>
  <div class="k-modal-wrap">
    <div class="k-modal-container" ${opts.width ? `style="width:${opts.width}px;"` : ""}>
      <div class="k-modal-header">
        <div class="k-modal-header-title"></div>
        <a class="k-modal-close">
          <svg viewBox="64 64 896 896" focusable="false" data-icon="close" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 00203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path></svg>
        </a>
      </div>
      <div class="k-modal-body">
      </div>
    </div>
  </div>
</div>`).appendTo("body");
		$("body").css({
			width: `calc(100% - ${window.innerWidth - document.body.clientWidth}px)`,
			overflow: "hidden"
		});
		if (title) $(`#${ID} .k-modal-header-title`).append(title);
		else $(`#${ID} .k-modal-header-title`).remove();
		$(`#${ID} .k-modal-body`).append(content);
		$(`#${ID} .k-modal-close`).on("click", () => {
			handleClose();
		});
		$(`#${ID} .k-modal-container`).on("click", (e) => {
			e.stopPropagation();
		});
		$(`#${ID} .k-modal-wrap`).on("click", () => {
			handleClose();
		});
		function reset() {
			$(`#${ID}`).remove();
			$("body").css(store);
			window.removeEventListener("keydown", fn, { capture: true });
			afterClose === null || afterClose === void 0 || afterClose();
		}
		function handleClose() {
			onClose === null || onClose === void 0 || onClose();
			reset();
		}
		function handleOk() {
			onOk === null || onOk === void 0 || onOk();
			reset();
		}
		function fn(e) {
			if (["Escape"].includes(e.key)) {
				e.stopPropagation();
				handleClose();
			}
			if (handleOkOnEnter && e.key === "Enter") {
				e.stopPropagation();
				handleOk();
			}
		}
		window.addEventListener("keydown", fn, { capture: true });
		if (onOk) {
			$(`#${ID} .k-modal-container`).append(`
      <div class="k-modal-footer">
        <button class="k-modal-btn k-modal-ok">${okText}</button>
      </div>
    `);
			$(`#${ID} .k-modal-ok`).on("click", () => {
				handleOk();
			});
		}
	}

//#endregion
//#region src/utils/alert.scss
	injectStyle(".k-alert {\n  margin-bottom: 16px;\n  box-sizing: border-box;\n  color: black;\n  font-size: 14px;\n  font-variant: tabular-nums;\n  line-height: 1.5715;\n  list-style: none;\n  font-feature-settings: \"tnum\";\n  position: relative;\n  display: flex;\n  align-items: center;\n  padding: 8px 15px;\n  word-wrap: break-word;\n  border-radius: 2px;\n}\n.k-alert-icon {\n  margin-right: 8px;\n  display: block;\n  color: var(--k-player-primary-color);\n}\n.k-alert-content {\n  flex: 1;\n  min-width: 0;\n}\n.k-alert-info {\n  background-color: var(--k-player-primary-color-highlight);\n  border: 1px solid var(--k-player-primary-color);\n}");

//#endregion
//#region src/utils/alert.ts
	function alert(html) {
		return `<div class="k-alert k-alert-info">
  <svg class="k-alert-icon" viewBox="64 64 896 896" focusable="false" data-icon="info-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true">
    <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm32 664c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V456c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272zm-32-344a48.01 48.01 0 010-96 48.01 48.01 0 010 96z"></path>
  </svg>
  <div class="k-alert-content">
    <div class="k-alert-message">${html}</div>
  </div>
</div>`;
	}

//#endregion
//#region src/utils/tabs.scss
	injectStyle(".k-tab {\n  flex: 1;\n  white-space: nowrap;\n  cursor: pointer;\n  text-align: center;\n  padding: 8px 0;\n}\n.k-tabs {\n  display: flex;\n  position: relative;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.2);\n}\n.k-tabs-wrapper {\n  text-align: left;\n  overflow: hidden;\n}\n.k-tabs-wrapper * {\n  box-sizing: border-box;\n}\n.k-tab-indicator {\n  position: absolute;\n  width: 0;\n  height: 1px;\n  left: 0;\n  bottom: -1px;\n  background-color: var(--k-player-primary-color);\n  transition: all 0.3s;\n}\n.k-tabs-panes {\n  display: flex;\n  flex-wrap: nowrap;\n  transition: all 0.3s;\n}\n.k-tab-pane {\n  flex: 0 0 100%;\n  width: 100%;\n  padding: 8px;\n  position: relative;\n}");

//#endregion
//#region src/utils/tabs.ts
	function tabs(opts) {
		const tabsHTML = [];
		const tabsContentHTML = [];
		opts.forEach((tab, idx) => {
			const tabHTML = `<div class="k-tab" data-idx="${idx}">${tab.name}</div>`;
			const $contentHTML = $(`<div class="k-tab-pane ${tab.className || ""}"></div>`);
			$contentHTML.append(typeof tab.content === "function" ? tab.content() : tab.content);
			tabsHTML.push(tabHTML);
			tabsContentHTML.push($contentHTML);
		});
		const $root = $(`<div class="k-tabs-wrapper">
    <div class="k-tabs">
      ${tabsHTML.join("")}
      <div class="k-tab-indicator"></div>
    </div>
    <div class="k-tabs-panes"></div>
  </div>`);
		$root.find(".k-tabs-panes").append(...tabsContentHTML);
		const $indicator = $root.find(".k-tab-indicator");
		$root.find(".k-tab").on("click", (e) => {
			$root.find(".k-tab").removeClass("active");
			const $tab = $(e.target).addClass("active");
			const idx = parseInt($tab.attr("data-idx"));
			$root.find(".k-tabs-panes").css("transform", `translateX(-${idx * 100}%)`);
			function updateIndictor() {
				const width = $tab.outerWidth();
				if (width) $indicator.css({
					width,
					left: idx * width
				});
				else requestAnimationFrame(updateIndictor);
			}
			updateIndictor();
		});
		$root.find(".k-tab:first").trigger("click");
		return $root;
	}

//#endregion
//#region src/player/plugins/shortcuts/help/index.scss
	injectStyle(".script-info .k-modal-body {\n  padding: 0;\n}\n.script-info .k-modal-body * {\n  box-sizing: border-box;\n  font-size: 14px;\n  line-height: normal;\n  font-family: system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Oxygen, Ubuntu, Cantarell, \"Open Sans\", \"Helvetica Neue\", sans-serif;\n}\n.script-info .k-modal-body table {\n  width: 100%;\n  border-spacing: 0;\n  border-collapse: separate;\n}\n.script-info .k-modal-body tbody tr td:first-child {\n  white-space: nowrap;\n  width: 85px;\n}\n.script-info .k-modal-body th,\n.script-info .k-modal-body td {\n  padding: 8px;\n  border-bottom: 1px solid #f1f1f1;\n  word-wrap: break-word;\n  word-break: break-all;\n}\n.script-info .k-modal-body .info-title {\n  font-weight: 600;\n  padding-top: 24px;\n}\n.script-info .k-modal-body a {\n  color: var(--k-player-primary-color);\n  margin: -4px 0 -4px -8px;\n  padding: 4px 8px;\n  border-radius: 4px;\n  text-decoration: none;\n  cursor: pointer;\n  display: inline-block;\n  white-space: nowrap;\n}\n.script-info .k-modal-body a:hover {\n  color: var(--k-player-primary-color);\n  background-color: var(--k-player-primary-color-highlight);\n}\n.script-info .k-modal-body .k-tabs {\n  border-bottom: 1px solid #f1f1f1;\n}\n.script-info .k-modal-body .shortcuts {\n  padding: 8px;\n}\n.script-info .k-modal-body .shortcuts-wrapper {\n  height: 400px;\n  padding: 0;\n  overflow-y: scroll;\n  position: relative;\n}\n.script-info .k-modal-body .shortcuts-wrapper::-webkit-scrollbar {\n  width: 8px;\n}\n.script-info .k-modal-body .shortcuts-wrapper::-webkit-scrollbar-thumb {\n  background: rgba(0, 0, 0, 0.15);\n  border-radius: 4px;\n}\n.script-info .k-modal-body .shortcuts-wrapper::-webkit-scrollbar-thumb:hover {\n  background-color: rgba(0, 0, 0, 0.45);\n}\n.script-info .k-modal-body .shortcuts th {\n  position: sticky;\n  background-color: white;\n  top: 0;\n  z-index: 1;\n}\n.script-info .k-modal-body .shortcuts .shortcuts-input-wrapper {\n  display: flex;\n  align-items: center;\n}\n.script-info .k-modal-body .shortcuts .k-input {\n  flex: 1;\n  padding: 4px 8px;\n  border-radius: 4px;\n}\n.script-info .k-modal-body .shortcuts a {\n  margin-left: 8px;\n}\n.script-info .k-modal-body .shortcuts .k-font-kbd {\n  font-family: consolas, monospace;\n}\n.script-info .k-modal-body .feature {\n  margin-bottom: 8px;\n}\n.script-info .k-modal-body .feature-title {\n  font-weight: 500;\n}\n.script-info .k-modal-body .feature-description {\n  color: #666;\n}");

//#endregion
//#region src/player/plugins/shortcuts/help/showHelp.ts
	function genIssueURL({ title, body }) {
		const url = new URL(`https://github.com/IronKinoko/agefans-enhance/issues/new`);
		url.searchParams.set("title", title);
		url.searchParams.set("body", body);
		return url.toString();
	}
	const scriptInfo = (video) => {
		return tabs([
			{
				name: "脚本信息",
				content: `
    <table class="k-table">
      <tbody>
      <tr><td>脚本版本</td><td>1.54.5</td></tr>
      <tr>
        <td>脚本作者</td>
        <td><a target="_blank" rel="noreferrer" href="https://github.com/IronKinoko">IronKinoko</a></td>
      </tr>
      <tr>
        <td>脚本链接</td>
        <td>
          <a target="_blank" rel="noreferrer" href="https://github.com/IronKinoko/agefans-enhance">GitHub 源码</a>
          <a target="_blank" rel="noreferrer" href="https://github.com/IronKinoko/agefans-enhance/releases">更新记录</a>
          <a target="_blank" rel="noreferrer" href="https://ironkinoko.github.io/agefans-enhance/">在线播放器</a>
        </td>
      </tr>
      <tr>
        <td>脚本反馈</td>
        <td>
          <a target="_blank" rel="noreferrer" href="${genIssueURL({
					title: "🐛[Bug]",
					body: issueBody(video === null || video === void 0 ? void 0 : video.src)
				})}">GitHub Issues</a>
          <a target="_blank" rel="noreferrer" href="https://greasyfork.org/scripts/424023/feedback">Greasy Fork 反馈</a>
        </td>
      </tr>
      <tr>
        <td>特别鸣谢</td>
        <td>
          <a target="_blank" rel="noreferrer" href="https://www.dandanplay.com/">弹弹play</a>提供弹幕服务
        </td>
      </tr>
      ${video ? `<tr><td colspan="2" class="info-title">视频信息</td></tr>
         <tr><td>视频链接</td><td>${video.src}</td></tr>
         <tr><td>视频信息</td><td>${video.videoWidth} x ${video.videoHeight}</td></tr>` : ""}
      </tbody>
    </table>
    `
			},
			{
				name: "快捷键",
				className: "shortcuts-wrapper",
				content: () => {
					const $root = $(`
          <div class="shortcuts">
            ${alert("自定义按键立即生效，请使用英文输入法")}

            <table class="k-table">
              <thead>
                <tr>
                  <th>动作</th>
                  <th>默认按键</th>
                  <th>自定义</th>
                </tr>
              </thead>
              <colgroup>
                <col style="width:130px"></col>
                <col style="width:130px"></col>
                <col></col>
              </colgroup>
              <tbody></tbody>
            </table>
          </div>
        
        `);
					Shortcuts.keyBindings.getKeyBindings().forEach((kb) => {
						const $tr = $(`
          <tr>
            <td>${kb.description}</td>
            <td><span class="k-font-kbd">${renderKey(kb.originKey)}</span></td>
            <td>
              <div class="shortcuts-input-wrapper">
                <input type="text" class="k-input k-font-kbd"><a>删除</a>
              </div>
            </td>
          </tr>
          `);
						if (kb.editable !== false) {
							$tr.find("input").val(renderKey(kb.customKey)).on("keydown", function(e) {
								e.stopPropagation();
								e.preventDefault();
								const key = normalizeKeyEvent(e.originalEvent);
								this.value = renderKey(key);
								Shortcuts.keyBindings.setKeyBinding(kb.command, key);
							});
							$tr.find("a").on("click", function(e) {
								$tr.find("input").val("");
								Shortcuts.keyBindings.setKeyBinding(kb.command, "");
							});
						} else $tr.find("td").eq(2).html("不支持自定义");
						$root.find("tbody").append($tr);
					});
					return $root;
				}
			},
			{
				name: "实验性功能",
				className: "feature-wrapper",
				content: () => `
      <div>
        ${alert("实验性功能可能存在问题，仅供尝试")}

        <ul class="features">
          <li class="feature">
            <div class="feature-title">播放本地视频</div>
            <div class="feature-desc">将本地视频文件拖入到视频区域，常用于播放本地更高清的视频</div>
          </li>
          <li class="feature">
            <div class="feature-title">支持导入 <a target="_blank" rel="noreferrer" href="https://github.com/xmcp/pakku.js">Pakku哔哩哔哩弹幕过滤器</a>生成的弹幕文件</div>
            <div class="feature-desc">将 Pakku 生成的XML弹幕文件拖入到视频区域，会覆盖内置的弹幕数据</div>
          </li>
        <ul>
      </div>
      `
			}
		]);
	};
	const issueBody = (src = "") => `# 文字描述
<!-- 如果有需要额外描述，或者提意见可以写在下面空白处 -->


# 网址链接
${window.location.href}

# 视频链接
${src}

# 环境
userAgent: ${navigator.userAgent}
脚本版本: 1.54.5
`;

//#endregion
//#region src/player/plugins/shortcuts/help/index.ts
	const GlobalKey = "show-help-info";
	function help() {
		if (!document.fullscreenElement) {
			const video = $("#k-player")[0];
			if (parent !== self) {
				parent.postMessage({
					key: GlobalKey,
					video: video ? {
						src: video.currentSrc,
						videoWidth: video.videoWidth,
						videoHeight: video.videoHeight
					} : null
				}, "*");
				return;
			}
			showHelp(video);
		}
	}
	function showHelp(video) {
		if ($(".script-info").length) return;
		modal({
			className: "script-info",
			title: "agefans Enhance",
			content: scriptInfo(video)
		});
	}
	keybind(["?", "？"], help);
	window.addEventListener("message", (e) => {
		var _e$data;
		if (((_e$data = e.data) === null || _e$data === void 0 ? void 0 : _e$data.key) !== GlobalKey) return;
		showHelp(e.data.video);
	});

//#endregion
//#region src/player/plugins/shortcuts/commands.ts
	function seekTime(duration) {
		return function() {
			const safeMaxTime = this.plyr.duration - .1;
			this.currentTime = clamp(this.currentTime + duration, 0, safeMaxTime);
			this.message.info(`步${duration < 0 ? "退" : "进"}${Math.abs(duration)}s`);
		};
	}
	Shortcuts.registerCommand(Commands$2.forward5, seekTime(5));
	Shortcuts.registerCommand(Commands$2.backward5, seekTime(-5));
	Shortcuts.registerCommand(Commands$2.forward30, seekTime(30));
	Shortcuts.registerCommand(Commands$2.backward30, seekTime(-30));
	Shortcuts.registerCommand(Commands$2.forward60, seekTime(60));
	Shortcuts.registerCommand(Commands$2.backward60, seekTime(-60));
	Shortcuts.registerCommand(Commands$2.forward90, seekTime(90));
	Shortcuts.registerCommand(Commands$2.backward90, seekTime(-90));
	Shortcuts.registerCommand(Commands$2.forwardCustom, function(e) {
		seekTime(+this.localConfig.customSeekTime).call(this, e);
	});
	Shortcuts.registerCommand(Commands$2.backwardCustom, function(e) {
		seekTime(-this.localConfig.customSeekTime).call(this, e);
	});
	Shortcuts.registerCommand(Commands$2.recordCustomSeekTime, (() => {
		let open = false;
		return function() {
			if (open) return;
			open = true;
			this.plyr.pause();
			modal({
				width: 250,
				title: "自定义跳转时间",
				content: `<label>
          <span>自定义跳转时间</span>
          <input id="k-customSeekTime" class="k-input-number" style="width:60px" type="number" value="${this.localConfig.customSeekTime}" />
          <span>秒</span>
        </label>
          `,
				afterClose: () => {
					open = false;
					this.plyr.play();
				},
				handleOkOnEnter: true,
				onOk: () => {
					const value = $("#k-customSeekTime").val();
					if (!value || isNaN(+value)) {
						this.message.info("请输入正确的数字");
						return;
					}
					this.configSaveToLocal("customSeekTime", +value);
					this.message.info(`记录成功，自定义跳转时间为${this.localConfig.customSeekTime}s`);
				}
			});
		};
	})());
	Shortcuts.registerCommand(Commands$2.prev, function() {
		this.trigger("prev");
	});
	Shortcuts.registerCommand(Commands$2.next, function() {
		this.trigger("next");
	});
	Shortcuts.registerCommand(Commands$2.toggleWidescreen, function() {
		if (this.plyr.fullscreen.active) return;
		this.toggleWidescreen();
	});
	Shortcuts.registerCommand(Commands$2.togglePlay, function() {
		this.plyr.togglePlay();
	});
	Shortcuts.registerCommand(Commands$2.Escape, function() {
		if (this.plyr.fullscreen.active || !this.isWideScreen) return;
		this.toggleWidescreen(false);
	});
	Shortcuts.registerCommand(Commands$2.restoreSpeed, (() => {
		let prevSpeed = 1;
		return function() {
			if (this.speed !== 1) {
				prevSpeed = this.speed;
				this.speed = 1;
			} else if (this.speed !== prevSpeed) this.speed = prevSpeed;
		};
	})());
	function changeSpeed(diff) {
		return function() {
			let idx = this.speedList.indexOf(this.speed);
			const newIdx = clamp(idx + diff, 0, this.speedList.length - 1);
			if (newIdx === idx) return;
			this.speed = this.speedList[newIdx];
		};
	}
	Shortcuts.registerCommand(Commands$2.increaseSpeed, changeSpeed(1));
	Shortcuts.registerCommand(Commands$2.decreaseSpeed, changeSpeed(-1));
	function createTemporaryIncreaseSpeed() {
		let prevSpeed = 1;
		let isIncreasingSpeed = false;
		return [function keydown(e) {
			if (!e.repeat || isIncreasingSpeed) return;
			isIncreasingSpeed = true;
			prevSpeed = this.speed;
			this.plyr.speed = 3;
			this.message.info("倍速播放中", 500);
		}, function keyup(e) {
			if (!isIncreasingSpeed) return;
			isIncreasingSpeed = false;
			this.plyr.speed = prevSpeed;
		}];
	}
	Shortcuts.registerCommand(Commands$2.temporaryIncreaseSpeed, ...createTemporaryIncreaseSpeed());
	Shortcuts.registerCommand(Commands$2.togglePIP, function() {
		this.plyr.pip = !this.plyr.pip;
	});
	Shortcuts.registerCommand(Commands$2.internal, function() {});
	function changeFrame(diff) {
		let fps = 30;
		let isSuspend = false;
		return function() {
			this.plyr.pause();
			this.currentTime = clamp(this.currentTime + diff / fps, 0, this.plyr.duration);
			if (this.localConfig.autoplay) {
				if (!isSuspend) this.plyr.play = ((play) => {
					isSuspend = true;
					return () => {
						isSuspend = false;
						this.plyr.play = play;
					};
				})(this.plyr.play);
			}
			this.message.destroy();
			this.message.info(`${diff > 0 ? "下" : "上"}一帧`);
		};
	}
	Shortcuts.registerCommand(Commands$2.prevFrame, changeFrame(-1));
	Shortcuts.registerCommand(Commands$2.nextFrame, changeFrame(1));
	Shortcuts.registerCommand(Commands$2.toggleFullscreen, function() {
		this.plyr.fullscreen.toggle();
	});
	Shortcuts.registerCommand(Commands$2.increaseVolume, function() {
		this.plyr.increaseVolume(.05);
		this.message.info(`音量${Math.round(this.plyr.volume * 100)}%`);
	});
	Shortcuts.registerCommand(Commands$2.decreaseVolume, function() {
		this.plyr.decreaseVolume(.05);
		this.message.info(`音量${Math.round(this.plyr.volume * 100)}%`);
	});
	Shortcuts.registerCommand(Commands$2.toggleMute, function() {
		this.plyr.muted = !this.plyr.muted;
		this.message.info(this.plyr.muted ? "静音" : "取消静音");
	});

//#endregion
//#region node_modules/.pnpm/plyr@3.6.4/node_modules/plyr/dist/plyr.svg?raw
	var plyr_default = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\"><svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"><symbol id=\"plyr-airplay\" viewBox=\"0 0 18 18\"><path d=\"M16 1H2a1 1 0 00-1 1v10a1 1 0 001 1h3v-2H3V3h12v8h-2v2h3a1 1 0 001-1V2a1 1 0 00-1-1z\"/><path d=\"M4 17h10l-5-6z\"/></symbol><symbol id=\"plyr-captions-off\" viewBox=\"0 0 18 18\"><path d=\"M1 1c-.6 0-1 .4-1 1v11c0 .6.4 1 1 1h4.6l2.7 2.7c.2.2.4.3.7.3.3 0 .5-.1.7-.3l2.7-2.7H17c.6 0 1-.4 1-1V2c0-.6-.4-1-1-1H1zm4.52 10.15c1.99 0 3.01-1.32 3.28-2.41l-1.29-.39c-.19.66-.78 1.45-1.99 1.45-1.14 0-2.2-.83-2.2-2.34 0-1.61 1.12-2.37 2.18-2.37 1.23 0 1.78.75 1.95 1.43l1.3-.41C8.47 4.96 7.46 3.76 5.5 3.76c-1.9 0-3.61 1.44-3.61 3.7 0 2.26 1.65 3.69 3.63 3.69zm7.57 0c1.99 0 3.01-1.32 3.28-2.41l-1.29-.39c-.19.66-.78 1.45-1.99 1.45-1.14 0-2.2-.83-2.2-2.34 0-1.61 1.12-2.37 2.18-2.37 1.23 0 1.78.75 1.95 1.43l1.3-.41c-.28-1.15-1.29-2.35-3.25-2.35-1.9 0-3.61 1.44-3.61 3.7 0 2.26 1.65 3.69 3.63 3.69z\" fill-rule=\"evenodd\" fill-opacity=\".5\"/></symbol><symbol id=\"plyr-captions-on\" viewBox=\"0 0 18 18\"><path d=\"M1 1c-.6 0-1 .4-1 1v11c0 .6.4 1 1 1h4.6l2.7 2.7c.2.2.4.3.7.3.3 0 .5-.1.7-.3l2.7-2.7H17c.6 0 1-.4 1-1V2c0-.6-.4-1-1-1H1zm4.52 10.15c1.99 0 3.01-1.32 3.28-2.41l-1.29-.39c-.19.66-.78 1.45-1.99 1.45-1.14 0-2.2-.83-2.2-2.34 0-1.61 1.12-2.37 2.18-2.37 1.23 0 1.78.75 1.95 1.43l1.3-.41C8.47 4.96 7.46 3.76 5.5 3.76c-1.9 0-3.61 1.44-3.61 3.7 0 2.26 1.65 3.69 3.63 3.69zm7.57 0c1.99 0 3.01-1.32 3.28-2.41l-1.29-.39c-.19.66-.78 1.45-1.99 1.45-1.14 0-2.2-.83-2.2-2.34 0-1.61 1.12-2.37 2.18-2.37 1.23 0 1.78.75 1.95 1.43l1.3-.41c-.28-1.15-1.29-2.35-3.25-2.35-1.9 0-3.61 1.44-3.61 3.7 0 2.26 1.65 3.69 3.63 3.69z\" fill-rule=\"evenodd\"/></symbol><symbol id=\"plyr-download\" viewBox=\"0 0 18 18\"><path d=\"M9 13c.3 0 .5-.1.7-.3L15.4 7 14 5.6l-4 4V1H8v8.6l-4-4L2.6 7l5.7 5.7c.2.2.4.3.7.3zm-7 2h14v2H2z\"/></symbol><symbol id=\"plyr-enter-fullscreen\" viewBox=\"0 0 18 18\"><path d=\"M10 3h3.6l-4 4L11 8.4l4-4V8h2V1h-7zM7 9.6l-4 4V10H1v7h7v-2H4.4l4-4z\"/></symbol><symbol id=\"plyr-exit-fullscreen\" viewBox=\"0 0 18 18\"><path d=\"M1 12h3.6l-4 4L2 17.4l4-4V17h2v-7H1zM16 .6l-4 4V1h-2v7h7V6h-3.6l4-4z\"/></symbol><symbol id=\"plyr-fast-forward\" viewBox=\"0 0 18 18\"><path d=\"M7.875 7.171L0 1v16l7.875-6.171V17L18 9 7.875 1z\"/></symbol><symbol id=\"plyr-logo-vimeo\" viewBox=\"0 0 18 18\"><path d=\"M17 5.3c-.1 1.6-1.2 3.7-3.3 6.4-2.2 2.8-4 4.2-5.5 4.2-.9 0-1.7-.9-2.4-2.6C5 10.9 4.4 6 3 6c-.1 0-.5.3-1.2.8l-.8-1c.8-.7 3.5-3.4 4.7-3.5 1.2-.1 2 .7 2.3 2.5.3 2 .8 6.1 1.8 6.1.9 0 2.5-3.4 2.6-4 .1-.9-.3-1.9-2.3-1.1.8-2.6 2.3-3.8 4.5-3.8 1.7.1 2.5 1.2 2.4 3.3z\"/></symbol><symbol id=\"plyr-logo-youtube\" viewBox=\"0 0 18 18\"><path d=\"M16.8 5.8c-.2-1.3-.8-2.2-2.2-2.4C12.4 3 9 3 9 3s-3.4 0-5.6.4C2 3.6 1.3 4.5 1.2 5.8 1 7.1 1 9 1 9s0 1.9.2 3.2c.2 1.3.8 2.2 2.2 2.4C5.6 15 9 15 9 15s3.4 0 5.6-.4c1.4-.3 2-1.1 2.2-2.4.2-1.3.2-3.2.2-3.2s0-1.9-.2-3.2zM7 12V6l5 3-5 3z\"/></symbol><symbol id=\"plyr-muted\" viewBox=\"0 0 18 18\"><path d=\"M12.4 12.5l2.1-2.1 2.1 2.1 1.4-1.4L15.9 9 18 6.9l-1.4-1.4-2.1 2.1-2.1-2.1L11 6.9 13.1 9 11 11.1zM3.786 6.008H.714C.286 6.008 0 6.31 0 6.76v4.512c0 .452.286.752.714.752h3.072l4.071 3.858c.5.3 1.143 0 1.143-.602V2.752c0-.601-.643-.977-1.143-.601L3.786 6.008z\"/></symbol><symbol id=\"plyr-pause\" viewBox=\"0 0 18 18\"><path d=\"M6 1H3c-.6 0-1 .4-1 1v14c0 .6.4 1 1 1h3c.6 0 1-.4 1-1V2c0-.6-.4-1-1-1zm6 0c-.6 0-1 .4-1 1v14c0 .6.4 1 1 1h3c.6 0 1-.4 1-1V2c0-.6-.4-1-1-1h-3z\"/></symbol><symbol id=\"plyr-pip\" viewBox=\"0 0 18 18\"><path d=\"M13.293 3.293L7.022 9.564l1.414 1.414 6.271-6.271L17 7V1h-6z\"/><path d=\"M13 15H3V5h5V3H2a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1v-6h-2v5z\"/></symbol><symbol id=\"plyr-play\" viewBox=\"0 0 18 18\"><path d=\"M15.562 8.1L3.87.225c-.818-.562-1.87 0-1.87.9v15.75c0 .9 1.052 1.462 1.87.9L15.563 9.9c.584-.45.584-1.35 0-1.8z\"/></symbol><symbol id=\"plyr-restart\" viewBox=\"0 0 18 18\"><path d=\"M9.7 1.2l.7 6.4 2.1-2.1c1.9 1.9 1.9 5.1 0 7-.9 1-2.2 1.5-3.5 1.5-1.3 0-2.6-.5-3.5-1.5-1.9-1.9-1.9-5.1 0-7 .6-.6 1.4-1.1 2.3-1.3l-.6-1.9C6 2.6 4.9 3.2 4 4.1 1.3 6.8 1.3 11.2 4 14c1.3 1.3 3.1 2 4.9 2 1.9 0 3.6-.7 4.9-2 2.7-2.7 2.7-7.1 0-9.9L16 1.9l-6.3-.7z\"/></symbol><symbol id=\"plyr-rewind\" viewBox=\"0 0 18 18\"><path d=\"M10.125 1L0 9l10.125 8v-6.171L18 17V1l-7.875 6.171z\"/></symbol><symbol id=\"plyr-settings\" viewBox=\"0 0 18 18\"><path d=\"M16.135 7.784a2 2 0 01-1.23-2.969c.322-.536.225-.998-.094-1.316l-.31-.31c-.318-.318-.78-.415-1.316-.094a2 2 0 01-2.969-1.23C10.065 1.258 9.669 1 9.219 1h-.438c-.45 0-.845.258-.997.865a2 2 0 01-2.969 1.23c-.536-.322-.999-.225-1.317.093l-.31.31c-.318.318-.415.781-.093 1.317a2 2 0 01-1.23 2.969C1.26 7.935 1 8.33 1 8.781v.438c0 .45.258.845.865.997a2 2 0 011.23 2.969c-.322.536-.225.998.094 1.316l.31.31c.319.319.782.415 1.316.094a2 2 0 012.969 1.23c.151.607.547.865.997.865h.438c.45 0 .845-.258.997-.865a2 2 0 012.969-1.23c.535.321.997.225 1.316-.094l.31-.31c.318-.318.415-.781.094-1.316a2 2 0 011.23-2.969c.607-.151.865-.547.865-.997v-.438c0-.451-.26-.846-.865-.997zM9 12a3 3 0 110-6 3 3 0 010 6z\"/></symbol><symbol id=\"plyr-volume\" viewBox=\"0 0 18 18\"><path d=\"M15.6 3.3c-.4-.4-1-.4-1.4 0-.4.4-.4 1 0 1.4C15.4 5.9 16 7.4 16 9c0 1.6-.6 3.1-1.8 4.3-.4.4-.4 1 0 1.4.2.2.5.3.7.3.3 0 .5-.1.7-.3C17.1 13.2 18 11.2 18 9s-.9-4.2-2.4-5.7z\"/><path d=\"M11.282 5.282a.909.909 0 000 1.316c.735.735.995 1.458.995 2.402 0 .936-.425 1.917-.995 2.487a.909.909 0 000 1.316c.145.145.636.262 1.018.156a.725.725 0 00.298-.156C13.773 11.733 14.13 10.16 14.13 9c0-.17-.002-.34-.011-.51-.053-.992-.319-2.005-1.522-3.208a.909.909 0 00-1.316 0zm-7.496.726H.714C.286 6.008 0 6.31 0 6.76v4.512c0 .452.286.752.714.752h3.072l4.071 3.858c.5.3 1.143 0 1.143-.602V2.752c0-.601-.643-.977-1.143-.601L3.786 6.008z\"/></symbol></svg>";

//#endregion
//#region src/player/html.ts
	const icons = `
<svg
xmlns="http://www.w3.org/2000/svg"
style="position: absolute; width: 0px; height: 0px; overflow: hidden"
aria-hidden="true"
>
  <!-- Plyr.svg -->
  ${plyr_default}

  <!-- 自定义的 symbol 元素 -->
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
    id="widescreen-quit"
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

  <symbol id="question" width="1em" height="1em" viewBox="0 0 22 22">
    <path fill="currentColor" d="M6 16l-3 3V5a2 2 0 012-2h12a2 2 0 012 2v9a2 2 0 01-2 2H6zm4-4v2h2v-2h-2zm2-.998c0-.34.149-.523.636-.925.022-.018.296-.24.379-.31a5.81 5.81 0 00.173-.152C13.705 9.145 14 8.656 14 8a3 3 0 00-5.698-1.314c-.082.17-.153.41-.213.72A.5.5 0 008.581 8h1.023a.5.5 0 00.476-.348.851.851 0 01.114-.244A.999.999 0 0112 8c0 1.237-2 1.16-2 3h2z"></path>
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
    <span class="plyr__tooltip">下一集(<k-shortcuts-tip command="${Shortcuts.Commands.next}"></k-shortcuts-tip>)</span>
  </button>
</template>

<template id="plyr__widescreen">
  <button
    class="plyr__controls__item plyr__control plyr__widescreen plyr__custom"
    type="button"
    data-plyr="widescreen"
    aria-label="widescreen"
  >
    <svg class="icon--not-pressed" focusable="false">
      <use xlink:href="#widescreen"></use>
    </svg>
    <svg class="icon--pressed" focusable="false">
      <use xlink:href="#widescreen-quit"></use>
    </svg>
    <span class="label--not-pressed plyr__tooltip">网页全屏(<k-shortcuts-tip command="${Shortcuts.Commands.toggleWidescreen}"></k-shortcuts-tip>)</span>
    <span class="label--pressed plyr__tooltip">退出网页全屏(<k-shortcuts-tip command="${Shortcuts.Commands.toggleWidescreen}"></k-shortcuts-tip>)</span>
  </button>
</template>

`;
	$("body").append(icons);
	const loadingHTML = `
<div id="k-player-loading" style="display: none">
  <div class="k-player-center">
    <div class="k-player-tsuma"></div>
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
    <div class="k-player-error-img"></div>
    <div class="k-player-tsuma"></div>
    <div class="k-player-error-info"></div>
  </div>
</div>`;
	const pipHTML = `
<div id="k-player-pip" style="display: none">
  <div class="k-player-center">
    <div class="k-player-tsuma"></div>
  </div>
</div>`;
	const speedList = [
		.5,
		.75,
		1,
		1.25,
		1.5,
		2,
		2.5,
		3,
		3.5,
		4
	];
	const createSpeedHTML = () => popover({
		target: `
<div id="k-speed" class="plyr__controls__item k-popover k-text-btn">
  <span id="k-speed-text" class="k-text-btn-text">倍速</span>
</div>
`,
		overlay: `<ul class="k-menu">
${[...speedList].reverse().map((speed) => `<li class="k-menu-item k-speed-item" data-speed="${speed}">${speed}x</li>`).join("")}
</ul>`
	});
	const createSettingsHTML = () => popover({
		target: `
<button id="k-settings" type="button" class="plyr__control plyr__controls__item">
  <svg><use href="#plyr-settings" /></svg>
</button>
`,
		overlay: `
<div class="k-settings-list">
  <label class="k-settings-item">
    <input type="checkbox" name="showSearchActions" />
    显示画质
  </label>
  <label class="k-settings-item">
    <input type="checkbox" name="autoplay" />
    自动播放
  </label>
  <label class="k-settings-item">
    <input type="checkbox" name="autoNext" />
    自动下一集
  </label>
  <label class="k-settings-item">
    <input type="checkbox" name="showPlayLarge" />
    显示播放图标
  </label>
  <label class="k-settings-item">
    <input type="checkbox" name="continuePlay" />
    记忆播放位置
  </label>
  <label class="k-settings-item">
    <input type="checkbox" name="showProgress" />
    显示底部进度条
  </label>
</div>
`
	});
	const createSearchActionsHTML = () => popover({
		target: `
<div class="plyr__controls__item k-popover k-text-btn">
  <span class="k-text-btn-text">画质</span>
</div>
`,
		overlay: `<ul class="k-menu"></ul>`
	});
	const progressHTML = `
<div class="k-player-progress">
  <div class="k-player-progress-current"></div>
  <div class="k-player-progress-buffer"></div>
</div>
`;
	const i18n = {
		restart: "重播",
		rewind: "快退 {seektime}s",
		play: "播放(空格键)",
		pause: "暂停(空格键)",
		fastForward: "快进 {seektime}s",
		seek: "Seek",
		seekLabel: "{currentTime} / {duration}",
		played: "已播放",
		buffered: "已缓冲",
		currentTime: "当前时间",
		duration: "片长",
		volume: "音量",
		mute: "静音(M)",
		unmute: "取消静音(M)",
		enableCaptions: "显示字幕",
		disableCaptions: "隐藏字幕",
		download: "下载",
		enterFullscreen: "进入全屏(F)",
		exitFullscreen: "退出全屏(F)",
		frameTitle: "标题名称： {title}",
		captions: "字幕",
		settings: "设置",
		menuBack: "返回上级",
		speed: "倍速",
		normal: "1.0x",
		quality: "分辨率",
		loop: "循环",
		start: "开始",
		end: "结束",
		all: "全部",
		reset: "重置",
		disabled: "禁用",
		enabled: "启用",
		advertisement: "广告",
		qualityBadge: {
			2160: "4K",
			1440: "HD",
			1080: "HD",
			720: "HD",
			576: "SD",
			480: "SD"
		}
	};

//#endregion
//#region src/player/index.scss
	injectStyle("#k-player-wrapper {\n  position: relative;\n  width: 100%;\n  height: 100%;\n  background: #000;\n  overflow: hidden;\n  font-size: 14px;\n  user-select: none;\n  --k-player-error-background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAWEAAAEQCAMAAABWXzWBAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAB+UExURUdwTP/v3zJRbd6wpUZuiR4eJZKUmcbGxispL8bIzQoHCJqanhQUGEFkfaysr6Khpb+/wTBGWSAQET4iJLa3ujc5P4F9gMPExyYwPouLjmJVWX1fX08vMUtJTWhHQP///y8XGWhmaXhydOfm5uTEts+mmuLX0aN9c/fi07uUioFWbdMAAAABdFJOUwBA5thmAAAgAElEQVR42uyd6XKjOhCFp1xBrBYCCwnhcMs4VX7/R7xqSYDA4CWB2I7VMzUVk+THfD45vagh//65cOHChQsXLly4cOHChYv3i/3ucDjs9g7EarHLIxmO8ZqAC1Yoxg7GKh5xiALsE+EYryfhhPkyKAuiKD98OiKLE44K6qvAjScZ7yrHZFmTyKOj30ZaJ84qVjCJtCPsE1SAjJ1VLGsSxLeCaKtwYBaLQ1T5w0hr58bL2rAYEfZp49x4SZPwsH8WAgo31+OtYsM6eKyKCpfwVrFhY8Yu4S1lw7qhO1dxKgrnFAvEZ56gScI+wahyTrFWotMqxvHROcUChAM6Q1iqONZO4UrjHxGuySxhGsfOKdYqJXxCcCoBI+Rqip8SbuYETA1i5mqKH0Rljy7PUh2hOEaCsdpN5n9QrEXMvxCcE1wFcL4kZex0vAJhPQcKkkgxlpBdWXF/wyGuEZaWnLLK6yA7Jd9VrM01zVNKrhXl3O1VrENYMiaYGcjulOkel7iZsDKM9FgkjvF9hI8+iRm5HTIVtWbskt6NtUTD6jr17xIyAsa5Y3yLDR+iKCmO1L8ziDoCyd1R3rWGDnYukzsFbO9VOKu4RcCC+N8LAmtu7kR6PvYgYK/B/vcDw2TTyfgS4O8L2MhYDejdTGiyhjjkUVJh/6ehdlfc9HgKsLTghvwYsM+VG7vp8RRgj/EpZOHpdCdkt+U2DTgQk4D90+krvNcpqsgd5Z0DnlmS4KfwFN5txkd3WjroM8Ai0JyvhmH4DTcWcFrqEPdlWjJjEd9PeChwiLtOTgJmCwOGfFe4qq0bpkVLlGnnDZ4rKToTrqm/RuiS4u1lvJNlROqvE6SJXPOhspy/VnDmBW8u4730iIqsRtgnoq68t5axlHCA/TUDHWFO8bbdxycUav66kcZwUPqudZtMczVZmbBPibrH5i1lDBJG/vpB8Lvuw16U8LfmEbM6RlX+hjIGCcdzfE+nr7sHw1dWg95PxpckfPqCCJdsokX9bjKW/fKsC4ehIvy1qBu/nYxlLTzvwicl4p/aBB/djqfd+G0KN9nOzdfCSsSnH7oEp5RMFhXvMHCrdofL7VwYnhYoJggdQ8ZN/g5z471+JmB1ee6+RJ4jFGM8hBwXfz/jqXOj+siWm0gQQubeLYrTVELm9lDzryOGo2VYn+LjElhWwN/VLZd+MAOZ0xTChpzKwu3vuvGn2k/DEz2Gqs++n93Acynlk10zII4tyOS4+6sPLlUbwt7Efhr/aiP8qelOQJYyjlVgbDwZ/5f/xYXuT7PAOsEg7AiffpbYwHXPIXNsEMcgZfg8YZ95/sfur9F8q5RPrvZ8LYJYM5aUzyATLOECYST/KMy4OvwpO4b11QsL2L2GfzqOIFqug9Rm2mYNWAVC8gP2mf8ZO1b6DS7cAXNajHDHWFIetRtUX0cas4Qsml3+J+4p1XzZpbUIW8Onn/cZvesOIMvKzYgYgYiBscy9+aszNjdoXF47CU8LEm5RIiXYAWT1IBvzCc2Y1YcX17G6w6jC1zbTTsu5RJfZEDKOa0Pm2NKw4vzajHWHHF897+SWiBcavIOMUatUmfmIBd9cNl+AjpLxi3pFpbbbbzlP7hEvdrIBRXDHOLYh8xHjWDF+SR3L5rS6ce+Ph2rsflry6EhbRUsSPmoHbZzGlk8go2Ng/GI9yOGOpSkO++6hvyRhXaD1KFu/4DoZGvAtZKZ6+hfr8w5Jtfzy9d0yNirtA/oRSsCP0eBzooEe5KXmFbvci/0HhyqO0W0hhDKLF2r0ZKZbf2/qJhnbjMXwQzG69FqMd/DMk4eHbjOuIm4vs+rwOofS+2fwCVvGYugK1hUBPlwU9VHIgKT3IrsVn4epE42HyLizCjEmrV5IC94FZVYmiVfUjfRjKCteYba584KVboW5d+enHakJJsaGIVhTHLwi22yy0vO8RIZ5Yt7hsHvy8m0XCFo15AkQw0BCM66DumFCKVkIxpq62EkdSLwScOB1AZwT/WBCwPykcv4sWBjS+sh9/1kSnvyn8fJ8V9R1XRQwvEyiRPMdAJYRbDKp6SjqMT+hhCvo1HDBngIxSc20DX6BSgRsE09aL2BMkjIbA/Y0dqVmG/NTJcBPBK1wmD4JYo6RKdxqiTc3CFWU2n3tKLWup0zjeTyjxopwGBfC95/DKcyYApwisRFvMuBnQ84GhIG4UrtJgU/yZN6Ghh3ioYqJ+vv7Kibt4JIV0iYsxGARiQ253IwIB+Z17xlPYBmN0XAYoqGKOeU+eZQZa8aiGBhF2ZpBCznbnGm4f91as20Z+31VfUJI8DqqqtrLWHUwgcJpxBwTnz7Gmwluj0FryyhKu0wDdsmshjsXMZ6h8h/8Eu9DDmclkEJ1wOuDjt1aPTg7Eguxle44xj59VJmM26F8JXGUY8BdXvNKRT8Yangz1HRmjPlarPUYuD1DfBIxSVNC6QPznWYM+a48BxwEhTZcWcONNdx/bU/cWEYJkeiiI+mTpnkLVkLMWNoRlunu2B2VpQwTTB6LGH5/yi5PMusnX/MNiu2HjK12gQ7VuLjQhINW9Vrz5fgd0d+Q/A7itG4baJ5WiODHDSxIe0Z33MlsN+JrAH9s4WOrvsgGSNvX5bC8y8blnvkGQFythbg3Cly3J6P4WFP8OBH3JQXbRckIcKkBf2SBCvNzniRdk3fZmM8Il61ZrDQPTW3EtKr1MDNFAaMPFHGLGAHifEh489FLOLAoS8TZhBGPXpfjd6CFDojXKShiFvcVBW0KdaMijmsp4vSBU7fOKJhnIZY0Mw34owiGUZbabEe2MCZsiXhIeMVfmSX/F7RDTI4FPEgfx8cgxukjp/O0PVmSiHujaE14IGFtzttNVl5PfRM24XWID2u12sJCzEUh8x2OUdDQNKVPgXiX9ypuAY8lDNe3akLUQR6LNhtmwpERg0+sdi/fPhWYW1VbjXEcVwEsrJOnQFx0iMsZCWvv2JZ2ax2MbCKbMeLuShKt1tz9S5FlxriuYQfdY3DfxUNHbf0ZvkEsoWynJGwVcH0fkZTDAq2cnGTYV6JkvSl+JRDuzbgJGhTXxaNF7OPuxK728laGgHIz4RHd5b5ZSwZdxrVUB99SrHhQkqK0kzFnRS2OSsQpfwrEQiFWjLbnEm7ri6yr3nRalLZsVRfBqEA+J+xFwZrTe+l6vYzTopCU4Z4L5RP8CVSc5wbRdizhrr4o7RJZK16djgyIlrPFhCQME81/a8q4d2PaBEUgYKuMQv1/zSzWMhPoPDovNoi2YwmbHmSU/rohvazhkvk+elBeRA1tVj0ciUVvFbJsSwogLOkSdC3jkdUQx5ZRtMymJfwxui4r5PYESjOeS3U986Tm+MhWPfZIUV+44Sqp4U5CDB3IRYKEr4gYnSGeTnNjd5bmbBhnKokl7VbAJcIBDdG6hGFQ0TEmdaFvOJZ108Xeg1Cy3sQejxGXej4x9ohxjWwKuM4FZG3hTQ7tbcJeGlKxNuKKMWa8Ig4adfMbJfFlm5CI+Voje95ZsWw9gEowINx5xMgksg581hdjUZlddAkvEfJ/LdbfyWQNUzLmTSDAJ1KeXtnRpHAv8mXEE/flkzutWCJOyrIdso0lXEx6B5C3Ct6kDM7KNYtw1Mgkj37hiHpvjqFxUZt75hG5coAJcfH0lIwf6yPVeVu1bSMOEm9AuJfwdlrC+rrF2JojTRCuecjj9BcO+pnQImZBoxEjem1hB+66v3TvIydn7wFG+CbEMKEwK5nHQJe3U1KdlvBm0IXoE6VZwpDqwvQ3CFeMtslO6OXea/UaN082uCj08VdgdNvgg/Ybr41nq9iScDmo4DrA/SBZey8YcSvjiV0BT/7wUvwb2yoCtc1drbbJ4usPhFcPO0mvIo5TS8jfQFx5lojPpHom4eFZiDnokGXFHOH4twgzI+KQwRQIGJMbEOva7iJibev9qTaiN9dsZmG77n3CcttisgkZmUfR+oJ246l9F6ks8iuE/7G4HbSVR3Wcc0NWUs/hQJdkzNunobRClt9C7qzZZLOZGMLTUrUKjNFp02bb7XIC4mw8l5CEZbnG098hLGg7Li6YEvENP89wT7KMS4z7x0votEfi2xD3vR0UFBpxL+GhVMsZ8vLr+z2VfjXrQYT/iZh3hx7if97ORblVGwjD5zgHDuGOAWEJRAyJc3n/F6zuWoQgtHbDTDtTN9PLl/Wv3dXuj3AryA9mVsI3Yj/Q1cA737Etk2M5W243O+Rptwjhiz9VW5AX4MH8YBysCAdcJX6KcKKDuEMXKqYXjiEuJIdiMzmWy/dq/YhBbg79c/92CSif5fzln2/PuYVInHQZrSc548sqhlnZ/GOEfxV6qq2bLkS4GyXNMcQYiZ/eSt26xgSx/M0dSyhAPiGleEttQaqWea6a4O3yxSXM8+EfI9yHeuSqI5dJfPmPIU5CPGMp3eW+Upi9/OJA46gDW40zv704Zd+ec5WvjQwu5uLKIcxqup8jbA+754addjItbo6VYHhGkuGGWJRyu8trL3EkiEOSptXJ3/QBqRrM4Vrb5QQ1dLC4RUoD9Pxj2ZrUidLcP8/KDK05+H2eZ22K5G9XNNYwye41a9PAb5WY60R1OmXfnHOZL7JPizZFBZuXcctjqvk5wn2o84nnAmEklwrLg+c+mnCiHal8asFNOoyZj/bqWHkr+VrFWOpEYAhvnnOVL7Jb2KWI4WxnnCLxjcU/RvhXYqSYIb6go8UdHy3kW/RzaHwAPdS6HMSwMVmTj7/BUcJ9Z8rT2Szbq+fgAeg26m0/E4aw+M4W4Q8u0xRY3z/nuI2QjLPyYH2AJ4LD0PgAriE3C6MfxxTFl1IX4aLuqCTizXMu22vUm8kV0NiUzZiw+PWTiPVMGzuaWhHFjENzsD4IZzpjLQFeK0ZoS+W4zvgY53ClnMiaLMuWfcs/XpGoPNQ51LHX3UwGmMqWLU62VJMMautGLdg8ZJ9MI86TLona+V8ixoQix8YnFzY+VikWjF3PH+eQFL144zkhgti9GYXJcOupo+GvI43J7emL8P1ePuyWyu9rg3zY+oGhlatMHC0DLTebrnfvRvZq+DVPeJ+NIw4PIVaTDnimBPvY6axhH7HLOA8XGZuaa/9eJCpfeZ3G/e2JPV+jeLlAOstjPVnfhA6C57keRjKjkHe52R8h4jF9foCBlkRc8HKSRu0kUeSHu2EsjCfs90YSmJs9wO5vc3HWiSDORLblPecqT34BAj6IRwH46en2MbDMGKnUFKFV8AqMBK2sk19f/4ZjfT9jgTjJxUoYNYi7ww3HmUrGOPxvD9TjVRCrCs2TDINMovUIRxAPAvBNMa5b2RIvF1M/Cu84e3tZry/sKaf63snjvgjzUgRyRwlpifr/Lg/lbIYxso49/51xtwxilhPrCm2dDGf7IRzXX0/gEYznvHsuKMA7tMG1HtFW9S8IM8bkfK/vUIETqcaYhlOrhHUXcbcswvBEWwINZnxWX7uMS18QUyYTdtRyUySW1YYS4fOHCuCbYTxyxpMav+wRi6Z6By97niXhl9ewvndFgcEpZYNiahClWKZW2+ddJ9OyElr+tRcYyK4t1bek1f9oCQV7Di5VBBFX3kzCk6oFMVFc1Z9uinEdtIQMDC+l7TCib3rXKohfXhp6585jEmLZBsJtUrKzC8v0Nd+ZjuiW12v8CjO6tDpB9poC7v4ly/M6N4hxmy4Ghv0i4UnVgri+2eiFWjFez4wxx0v7b4VQxzB73sl9Ysy+pqHYvCspKctwVkKxcz0hX3ACmzVIHPoM8iTlYksn8GZMy7SiWJx1AUR88YqEJ1WTGmG4PgGx+GKMeeZw5Ir21RJ+eZ3PdyBmnPpfSNw/4xazbyrWCdhmZlzK8RTYcRSnfsUXuFuWVh4/75D9WS4VUCfmNIVthsrbuFyfcyxRM9qwwCsR1xQduwGHhBni+HpPCIvlxiksG76ay5vsSig2ETcCsSw8VNtcDSwwyHzBnk6ztP2CznU+lZijyCg4/9fli5QYthkq2QpaioTnnEuXeQTEO48EHd03fl4Qfh7O9xCWuQhiBRriZh9mE4vf3nVbsxH87yzufsDua8pvM7lmkImRRlg/iJWB7FlEeMtqWiaOEnLegZt9lk0EFrHe89gSCRvCPcgjrCAzvOxsOz6m+/yyePAdMmGXG+q2FTaDue7q8vZvuTUDlC9lkziT/tLtIbWTZPwvCAqCdoLRHSL++4jTVEJOSpCiTIZwpP/hmVMdr8+5dLgtNVjjnf/dYpBD+IXJxAM6QWSIIixv2jTjjYuPTu7jNfCsc71ixM2N8Na4aOAtv0mW/pZGf2f+OxC7Ai07AJIGKIgWYo64OhnEJ8/tkYYenOdF6N6ebhLv3igNf+VQiBF/cKjK53eH8PvwkO1zljFyd/NGe4Emm5fQ/OVzOQxi3F7WhFeD0vMsP2bstTJwMVDrnmnEPsPElnUpnJnKNOO9ZBiGMAf8rTg0Be7HkRXQtX6GsUfF3xf3wedHBHF/DdpC7O9rxKLx6+1gFnw1Gk71+Xx7XNspyvVafFoFMmjFiWaFJKJz0CKj0Zal2Y2BHc11612EsMHL2KGdJktT9GM9SBumxcOqafz8PwVxECA5DqWu1TbHWrmUFA3IiWfH/gjawRjsESZwtjcVjCe7cs8+ilhMt7Nz1HGWmQrjS7AqN4xIpLWp4z76/cyhSfqRG4gJpLXxERtq2Su+DrMjFOghhAcmE50KYoR4y6Bjz8Z/IZ93BbsubbUpEvaTCdlPxbQvZbrQxvbHL5K2aO4TQ7jN1EhPBnc9ViIRpL0q3/pxwjvRWxYcb//xdWMZ8tk1tOplz3gIF4Sbh6z399dU+Md3LEJnOu3Os+VCQWyrhy69p4SrF8e4wM5lorKE2U9FU4hSsHZYcaMqxplF95wuWWZGcZyOPBCJj3nuCZn37hHKYhZ4dR7XS8bLDhoP7msPk+L3O1Ji8FxT6bzNIhQJxM3O14wjTpZCDOd1xXqQo81MJuTlhf6c53BqVi0yNpjpKUpZdKPUaVzawTT/tl3Kb4La3aqiyxHEu8245/pBXh9OuD4rb3NGOEcM8U4W6byqQAjx0p0uSB2fLp5NwBCWP0VQkELLgjQW+V1kYthmZebfsPjU9IXpvF9VlEk/DOPHqi30JXguXwgiPuot4e7BhJtkysuJzjs9NiYlsDxDF9c/rTpdhM8UPP0IPjmGl0EcEBqDXWSGWG29aMJwpNX6AlVuTyJI9/EydajH/svh+yalWzPuIYz4XAAdfoxKaMJlQhpucIW2Ryj4O44QaAGzjLhyzzlhoA8fijPXmYD9BJeJ6OSw5/X0eqQVJCpuTyJo9xLfkLjq4DIe3DhmiK8ma3sOrg856c7anr+gfDmKUpzvXSVNsL92gb59LJdSJ9PCXLg1hOGhyCTUphgm+YhUDDtz744vEMjVyPbXjR1u48eXKvdu/taQiONFXjGc40FJ8ev0kGyNnM0LlQoxwxFSsvMStiZEM6w5Kki40oe/sI2xR920MtfgiNO0cmOYw3RF4mTbmWtnhHTDzbrBOnxNOW0pv620Atwv99f4jF5V//I8PESGz5P6z8KTHJKnU7EXxGBiYorAEqwKvEw22yzjCM+ndfHHO0QghKON7VsTrlKE3FZbmvvVl/LDbdEQui004s0+LmMuxSw5aRL6ILerOg5UHHQTVvtKFJU7M2zTbEcmI5iWneDMtHRXFFwU4crxxA3SP9lCofeWQAViMwFr9xbLDfX9Ms34m+X79vb+yZ7fzvP5NkvG8vZTvI2ZT7U8yE6MHXQqYnPtJJ8TGu6UHZhiO88HCANvrwAyruZsDZgPn6aZMY1wPBBa71S2IWybmW3nhu801CY3A3HL2f7efgRjM1Ml6uhHOUWzw1QfdJjoCe6Q7ryusQzt8BqGWVnlTvQqxNXp5CPMCjkZ9BnDHEUbE5enxfZRJi897I+TVfjyTtmHPtxUBL/vwdVx3P9PLzvmMqy2DQmy7lZ05zVh+UwNYSitp/VEr1Dj6uS1zuZrF/7lIygS7a5BjWhamdJialuCG1bBjeMiR3v7feT5vI3iJbGPdhCr41opQkhzaPu6fdiVuMX2Rgjkwp7dbhHGnhac2gn44zcWrTZXFN0bukTfceGprimSfjCsjGOQP4z8fv4+9nwWo3i35mPdl2y9MU0d9IfeeetoTid91tEUlHPriV4ZqiKMXZHgiCu/48yWCUK1vsYP+U3FRNtz3M65NUrsZCCrWu7t99HnHcl3zz8QMJNhhTKkhba1aoRObL83pUQmiCk00FgzEfYEqQjjlUhcLvHJb0vVbiyHZus7UO2tf44D+w18Xgby8SDmRx7Phx/5itj6fJVS1hAdwokwrTH20N4gbucVYWVi6RhDZGp3PnYqaUE4PfmtW78zQbDZMGMbDOTjS8z2OIhhIP8LxJ+5lIr+YSJRS8HFOoTzf3i7EuVGcSCaeBYCBnMYJIwQVFBhx/n/H1y1kEACCZ8VtnZ2ZypTZT+3X9+veywW+SPrlTDlFNsVwvmyZzn3KRY5noqeT7F1+ciq12E4upmGeVZ8VrOW34V2y2F8eHAhDflyP8Sfl7p438UJcjyicqRWOTKetOQDw0JNxWzOTi4UTL5uQjiQXWFkUbmFNsZeW2JRVThvmT9s6XVYafhHG6NqiqIvw9BhyI+Y8edAju/KN4CGRzcnAwnu4RoYfy0Ba8s1QYlwifpp0myuqi0XiSaj43HEnOJNtD0Ri0M0cMnPa7lG72yMSHRFV2crjCdGfoQqInp8T1BR7Eca9hFWqYbgnxpn4OwipyRm3y5sOB8R3gX2vU0jjZafiFLHzV0m/N9pm4Y9dF6ODNMurVYQfylDvjzm8d5x1UPSMKcG+OwzTNTSQy/uNbqN2A/qNcK7xRfeaPksIFZtpd3CNxp7zMENR9ctxwC5HXeNBWP+3lJhyMPdhnxN6RuYovk+0hJKPgjcXMn6afUME/4nWDBxtpgkNmhCIRxIHdaTLUHYmbc29Jb0WlnUsYo/O8A58oiZGlWTlclhGLgddyyxYVwlMIjS/N4dHV+a188cy2gYjihx3mW1xjtwxypp8UodUM5qK5pozQNzBytWKFhBrCFsmvDJpZQSrNOT4+/KhkUDrutwaYE4/JKGfDcjJ8WrFxHGaLjsoLeRmGtRDZQyGfT5TR1XuXCgaGKBcG7DarG3KYKKXO8+37GKr31gWjnzvBgXHgYo/QqMbS5P1AMgfmvuZYsBvRi2jUUJjHxYnVxs9mFW8sgiBUwX0/DjfwKmIzydMbKEtWaWJ2XzjdL7zVV8u6Ojc3X9LHsWw9i54HTc+Q6MoTvKQT7fBfJQvObvimORjG4uq/31Ok1YEaAJc3u5lHM1rRjnC0yEbW2KZcZmFNx2+UL48j8XSVhomCwpQuAr7Bjo2O7yOFkoQ94E+SIaIJff40sQC0fHKE/horXCacTJzIfK5hJh8duKW76YldQ1J3MdrIOjrBMgoTRuHjra3rK10rA35RvShIfL5SIbQ/DvBsYQv7ExEXGAfB1UN48BxM3zCHewZ5CFpW2Bva7DTEy+lgvl3HF+BYgYt32szQPqvSAt3VhlFAfRjc4tCP93kyRmGhaObjJiHZ6rQHrLjlVGDXVkC8hX7YvR7Z+/YtVA9T2iIINsU7kAI2agzG+MLGXpSBOCiHuSsXh5ectVzNUc4GEXS4j1BUXXKr6d1b156JL/s4zBOMqXEePEhbFWGlqCPKhONP/1zOPi76eDtW9WNTThLGzVYMB+CPM/pthzJu+mVJyIa8TCisWxDeGDnU6V3Hgw6oyfjFNqGySxW1ffO2OzwOGpNu1Yq3EOeqfpojf9/3EqPj6PMC47ThKJXagF4yypx0uuBsLl2JlGnIZBk49DbAoibtFwPn/XPbNScV8koZV9mLHedXX1337EQkf4iCHrJsyf71cQrhPK3CLIOM1YBQhnBsJjzQ17NYvFAjqLF+sG7qMPSB948MyiplPUx76BNOUbt1pFt+x4NGSdkQdz/Kp4gSWKKKJ+WEUOoRaMBREn+tZBpc4rRTFuBcIc4uXZTicNL86lmTLjhtiBveozOzo5+z6FE1vJ8Ihx5kL4a65xDpcJ4cmQz8eXEMY0DTOXGD33ddgHhBMT4bGkHPdBnMlLg95iGt5BErll51vD2Cl9aTlxELdncyRtO3MAjKPMbccyRh4xHowo++f4dCxBiyJi3NG5Nd+wn7IVwlKTtPTaOFBamgJivRVnRdhKHZrAVO4qDecr8lDbBbO3u5GiDTyXbupyiyzSpqAND7Ivw2TBEEt0z5fYaPEdNbQME6deFsYJqWAJKTMQFkScoSBuq2nCwtPHMKfWvonUzk4dE1Voa7aOYxHaFt3PnG6c7+ooX+SikhvjKu1gnsWsJPGY9unqD7fhehvhhiWkBIQ1Ik6l0mCG4j2ZXxyH2ED4sDFRskzzPK3iJn/GQRLz0KVnTvudb9CEHDppNgkZGu1dURgT3TAK9HSVuEEFBoTTyN3Iq/voy7zOmEp1+Krd77H24rAXG1t1h1U0vHNEYiPGSmf8sKbh/D/Lqu2/fwsjvqeDIYK3TbLI/A4m33518YTna8S0aBgts2hDTaVnmCMcmQiLeK0iSpVvsuLY2Fs82BWDLZUKWE6c8mh7y3pJw/vCnG0//7vHiBUhw07uBldAzaJrmp+mK2BA8IUiPP+wuKfLNoQhCWE97JVHlWHD4rdEicZN3zAvNvYWF327nWNK7TTKXZ7ULSn4ew6B3JmGY9yj5ldXlbi/ZX89MzDkDUYuBcggKYjoS10OUlBG03JLepMQkiUR0waKU7Vc3u/jRSth2qY9rReSdcVge1cjmCpui6uAljE2L+Duo0fjTM/UDX2g0fkDjByVG4xcJj1/8+S1ZmiBiobWib/5I22ZRH1f6giPa41+7C2/agpiVWDXaXh3o8HJf3Y6iba7NcY2qo7PGdMAAAqTSURBVGMvMR4emIm4Qlmo+0kzpyVnGL98BJO0RUfZpnwsRShJIkJK04ZFhzoOVq9KluTzdZfTpuG16peKc11CatzefZ6jYSYps+dfw7mj/8hoj2TkDrsoOXrHZTvS0q6rN1kCBSlHWBtiS5UydBIjy8sKYh1hb1Nu1aIXMZpxrjdLbCThzUrKPRI7BSMdXz8/3wXye24HUkIpvYGw5ydRi1KTJYRAT9yGDoi1DSO3tolDzQDM+GRrluhFCaRdrk972NuQIdujEPP4TYC8Ci7KN11d40xe4K0beU3r1anfoshkCagb2xEOUxR72pLcSqvytF0zmytuG4OCMamM8KqfF2sfhliCTI36W5W866xdg/ui3VSZph5OfYTqyrThFAoTJHRAnK+6SgdrqGaPL1TFzTkoKM5TGk8yY3z5fOa5iJEsRRdlmrxNeTvCpCBbRkw9ltYtYjrCIPaRfWWB2L9bhzwJMiSWNkI1V5Yn0+iFCc+RxGpWGOqP3Kew36chVvmeX2agK/XGTQOM24KlmwhHuCXzCNvo6fzyK0O9SOWwE+LTWsHSXmtbZXnSjB2HveaKk+maunGRbvh89hFhMsH1e6XjfUxpjzeKyIyHw32b6SwBajUS4RLX9QrisvW01Q2nn3PkIJoZO0gCu5oV467tcH0a48tvQynB77ThDwIQE0ycCPcRwRiVmtKzuGeQZQh4OK2V8rkJcawJIzj8nHPZSzNjG0l4a5KYnR74rIdmhRdWPAhCZn70RogjH9asEchiRXaE2yiawrVK3YwpR4QhavQjK8SntWrBzjoEiALrA2acW2aA4nar/giKKF3zFMbXYZCiCPxb/U4rblIfk65tiS1u+z72NU/raG0c2xHagoBwheFTSS0QE63UdnCeP7MXM2eM43w9iuIiCb2zSR+ax14O+nAzJvit26HRqBhq+dwajjBus6zt5xMPUjesRC0k7+KFbEM81ePvK2YqG88PhzyOpalr82pBEt54xs7mz4N8PKjG0fDvF4jz408e8u2xnns0olxdpmzYTxB36Yl8HWm0etuZOhXs5WuB0NsmDNNX/DnFsM6rH0Ix0w13Z5M8NI8No1RaB/SnoORvEOb8zFo/DHu5FfaVTce7IkA4VXedUn9Vb836WfPr4D5/5jBh+VcOgily7WpB7Id3PV9ji/58ecSEFcjnrmibP0IYMVqGVVtg7YbGyBSA8FyASv3V1EfFZkWqZcdjK1IzhmM5xHu91Bajyc9VWXibke8der/O0inwf12B/saIC0QJ/1amfSG1akpFw75AWCtApfN1NhPik6Vz4RzNXJn4AfYdNUnXOWOuotpPtkH+qtSI5fUuPzdoNFHQv+HhtqV1WNUY0WQ+jTiCjHjUpJf4+J8t369o3skqhREM3zBhfSMpH/ukSmBtKqvxyFyo26ZldcPt1aMlX+6MJP4WYUpoW/LEze+LWl7QmC53If5mjeUEss49AGIlJLyzDKvaTVjX2IcIDyJjKcIfR1NuLrKCCNeYm/I2ylnCw1EB8nWbh+dZlKY4/gnCDSFidLBOcTEu8afzjb92ifBHY8mg60AVM9HWKKVr5Ut+BvFoxt5+KkmU8zxjxE3ZT8ts2+8JS+bRxdUZSxiDKH+EMO4JzBdHUeN3VEQTEwtHFoQ/Gr9O1p0lb9nwuMHCOsCKRsTwVRBPLJyZ9cUGQno4fbVFF+MiefdjR/mqq4Sd6ffxTzwdZrBSniTcj7GCyVBChWukSMJVqwXjVUgRjYrjloaH3YT1EUz9rAk3470KJDJLAbeBO2jJJmFUWYqFKTOO8tUC8TDR8PH7448Q5qEavJvI/7+9K9pxFAeCETpYAsRAwHaAcAKk1er+/wev2yHBNrbJZLNolXFLq3nYl6FUU+4ut7uv+H60lhajQY58jNjaDl2lFLlwM5d3XZbmYgODlcd4AHF8HzNCbN2MAuXaiXKdC1WGDOM/pfV97n1HmH9Vw7naRYZB4OZ9vB0ZMSUm0rpgOPxMF7KgiYXBMC7XjwlO9krDSPIsuYsEyR3lQAtEFisJrf3CiLKQZdHa8/M2h20Rip8dALwPhVM2ggoTYbnlDLKKRyohpq1V7Jgzk1m3ghhYHK8vPMotiVi/xYvTJY1wOy2IcuHKMDgoDesEmxHo7hcG/BRT+N8/s8oiEs3I+ax4HeguUzdFQRVSm/wRg2NMHm/M3RQOXABfTkGIL4Tr5y4h0txJ5QXnhk13pG+9VMNeyXAXTSl/9G9DwnYlMocbeuWF0UcFiMnaMFbGY5opvAEwDiOejkXz9JLrLcG4q8YPXnBe1HVdEEpx9v4+nsQhbcaakO4hyn01qiv7KOGWvo21EfSAuLRT+OQCWMB/CmndjF/Ko9LNDEPxXPch710k2kg+s1lbVUxesjqBEKcWPsFnad9UzCNrAhuFqQJwYK7zypC94NzeBKMuNn3lse32RHhqSKqaFMOVKSv7eqhHLb9SS/Q2mmLMJDv+5AT4VFr4HYTxa5VAO3PZrhhQkTC2K8BppAJ8wIXGCsRtFXFmY1QHn6OzOFnM4nLVpu1SiMVry8LXay2sSYhY4s35+sTDQvWwa3Td2i0eFIhZ1ddKRqz+jcH3qB/CaRLeBgKtyjmlUg7s/D5lv10KpAJmBBr3pRcFh59I7/zwFwROkI2lSfBj1UrDVSCdU/mVEs2/JWFm6nLfUgjpv4PsPYte8K3EjDREnqbd4e8IMXnz32UAcVvhckXx20EhRPXL6pVSjDc/fjW90aUQioAESVYdPjquYvLmY1tzM9Kqoj02WwxnaqgENKUgNBavaEobgmsCqwp9SZIPRxikAGgMRWU/4g3DBAhDiTmEAnZTi6GmFLiUWZ1QRQMngRWjQlwpfTrCoBS4awzHTeOw9H5Ke3rFBaEsMtsxHcklpaiFz1Y+rRAXDf9vgbB4r3vG6f/JOexbOohtkMye6eDCO+ll40V+CaNIQBm7k2QafxeExUK3R2znpylZeoJ4G16WlX5fkWAhLd8G4S97SIstX/ehviPNphCGHM4jbC/wFike41sDhCwB6yrjYqzyEo+wTYul+RlFRPHm2K0QCr6LQgPCV4+mMQhRrMwkcSZppc3IzDzCdjdAru7gvCvtTmVpN4qT5Nx6MG05G1efegQWhdDwLbW++LOH8onDTnRRrHqvDfj+U170hwf+oHtSJ46tILGWQ2j81eY/I8BD55G064RiAgGJdQ3Q8dXOP+ysOvtzzqkTMomLPlQ5uoGvePA8eIA3qmcZ4kiZnq3rLzW8/Tp7gLd1opBJnIW2/OFiwPfti80+v+5owmyequ3Izx4C8d6tZt9DJwSJ8dmcS37njT+ewC/pBChx4D7eFny9Ar8CMdTOJ5f83uEdPH+/JsVLVkwkD1iX3zDz+L6cFXPpTqmc335SHd5shtfLw5ejlU47PuIm7ZOS/Ypdzviv8vC+IaHgDZVHfwl0bxcg1+rqLYjfgJhL83l6AesccQ9BW8/eN0KMIE9tT/u+nZqcsHav0Q4fDrHWM8hFHDmZRo/vmzIKU+N/3ezcI/3pNFbb/gsSsSb1wLyRxti/Wxf4Cqio6zxtotzj+/bU+N4kHUUeXh8+fPjw4cOHDx8+fPjw8WfifzujtuTxyJZ/AAAAAElFTkSuQmCC);\n  --k-player-tsuma-length: 2;\n  --plyr-line-height: 1;\n  --plyr-tooltip-background: var(--k-player-background);\n  --plyr-tooltip-color: var(--k-player-color);\n  --plyr-range-thumb-background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAMAAADW3miqAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAGSUExURUdwTMnHx+vr6oyMjOnp6eTl5dbW1ry8wNXV1efl5O3t7ePj5NnZ2cTDw/Hx8Ozs7Onp6XFfcePj5OPj5OLi4tbW1ubm5t/f4M7NzuPj4+7u7t3d3eHj4+bl5eLi4+Hh4drc3NTU1M/Pz9DOzuHh4RESFQ8QEw0OERcXGOvq6iYlJh0bG87MyeHg3lRRThMUFsbDwGJfXYyJhiAfIHl2cdjW0y4rJ0FAPzIxMxscJvB5ZJiVkri1sqajoEpDbRMtPxIXGyckGelkXrGuq768ubWxrXNwbm9boYNzww6c4gGu8sdeVhNffJibTfOQYNWLS3zDkuymQz0yIJzMWd7ZTLq+RGN/QoOAfG9raKyqqYNltXZGPBllkTWJ1Wk1MWOEzCZMWAK8+AWTv8x5VAxMRRa8o7jQjTeKUFjKw6pwPaRaR7SEM8DOWFNeLU5EIv22RE9cnmItMQd2prJOTCGDpVNurGSk3TS380E5Vwlwj3d6toaXcHGilAh3cH3EYk7AdmlBMUrFnZd3J3NsK49rKEY6HBLcix4AAAAqdFJOUwAV9AfFuCYNMv/oqkUg+8nTA5OfblDggEBi2lyLv7V1dmdlfmj//////gxP1k4AAAKHSURBVDjLtZRXc9pAFIWFQAKJXl2x03bVCwgJ0XHDvfcS917Te+LU/50VMI7BJjN5yNFodnb0Sbv37LnCsH+S00UGb09J5z1MGKdDtpupJ04TrjvQE65QoEJke0ck0uEhu2hxgIvbmhhv5yDPJjka5yzRPjUtFHxdTVAHl2CglsxVErKcSOVW0wyTlkKNjM0h8hCgi2EYdAMWAsCu+hv2ThK+JGgWU/F139qVK0Al0YeaBPkc57ipkPRLK8odBlFsigrUKaebSoB7GEQpFaruQ4RbBi0EkSu91cU68xpsSfGDnSSC2iiZAS0FZaoNOeQfEuBfICEfsGEevMLUlhdqFSrVAUKlVgyTwqNYr5S2IOX5y/HTOQCEi6Oj/TKApYkXG6UqlJa6sbBoWG9s9vdnp6bn2KX5L9cHn8ul3bGx0acl9AQaIoHFVas2YRwxU7M/Lxfn52e+Hey/30HM1rMygjQ1gDksCBr92dOv01dnPxbOl5Zmjid2d0YnXo8MZ6AFxbDa8Wvj2U1wcvX9YmGxj5853n71doN5hyDLKdGPuXUTLaesZ/dOZmd/9S0uTE4efspsv9kqDq8VrTJNvQeL1Lxk1/emzy4BnJs8P/xownLxw8haMWNVZ7npoutJEvqspAHWMKpjxuSVqgVJ2oPZ3aLZ4DiEt0doqHGUzyieVFofC0hRVjvYw1Ki5eExst5TDbrXobcKHZTFWD2aLoe0bMC7GWe0FT0WrWc86A3jaspkUTfVUWi1FZ8YouLtf9rFHiVwvZCSTV4TWJYVNCOdyKlS4HFjozs93Q5a0sXB/MDAUF4VJTzmfuS9798TfRAK9xAE4Q63PWz3Blv+pYJ2pCAWxP6PfgNybqCJigGJ+wAAAABJRU5ErkJggg==) no-repeat\n    center/contain;\n  --plyr-range-thumb-width: 18px;\n  --plyr-range-thumb-height: 18px;\n  --plyr-color-main: var(--k-player-primary-color);\n}\n#k-player-wrapper .plyr__captions {\n  padding-bottom: 4.4vh;\n  padding-bottom: max(20px, 4.4vh);\n}\n#k-player-wrapper .plyr__caption {\n  font-size: 2.4vw;\n  color: white;\n  --w: 2px;\n  --b: 2px;\n  --c: black;\n  text-shadow: var(--w) var(--w) var(--b) var(--c), calc(-1 * var(--w)) calc(-1 * var(--w)) var(--b) var(--c), var(--w) calc(-1 * var(--w)) var(--b) var(--c), calc(-1 * var(--w)) var(--w) var(--b) var(--c);\n  background: transparent;\n}\n@media (max-width: 576px) {\n  #k-player-wrapper .plyr__caption {\n    font-size: 3vw;\n  }\n}\n#k-player-wrapper .plyr--full-ui.plyr--video input[type=range] {\n  cursor: pointer;\n}\n#k-player-wrapper .plyr--full-ui.plyr--video input[type=range]::-webkit-slider-thumb {\n  transform: scale(0);\n}\n#k-player-wrapper .plyr--full-ui.plyr--video input[type=range]:hover::-webkit-slider-thumb {\n  transform: scale(1);\n}\n#k-player-wrapper .plyr--full-ui.plyr--video input[type=range]:active::-webkit-slider-thumb {\n  transition: all 0.1s linear;\n  box-shadow: none;\n}\n#k-player-wrapper .plyr--full-ui.plyr--video input[type=range].shake-0:active::-webkit-slider-thumb {\n  transform: scale(1.3) rotate(15deg);\n}\n#k-player-wrapper .plyr--full-ui.plyr--video input[type=range].shake-1:active::-webkit-slider-thumb {\n  transform: scale(1.3) rotate(-15deg);\n}\n#k-player-wrapper.k-player-widescreen {\n  position: fixed;\n  left: 0;\n  top: 0;\n  z-index: 10000;\n}\n#k-player-wrapper .k-player-contianer {\n  width: 100%;\n  height: 100%;\n}\n#k-player-wrapper .k-player-controls-spacer {\n  flex: 1;\n}\n#k-player-wrapper #k-player-loading,\n#k-player-wrapper #k-player-error {\n  position: absolute;\n  left: 0;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  z-index: 10;\n  font-size: 66px;\n  color: white;\n  pointer-events: none;\n  background: black;\n}\n#k-player-wrapper .k-player-error-img {\n  background: var(--k-player-error-background) no-repeat center/contain;\n  width: 200px;\n  height: 200px;\n  opacity: 0.4;\n}\n#k-player-wrapper .k-player-error-info {\n  text-align: center;\n  padding: 24px;\n  font-size: 18px;\n}\n#k-player-wrapper #k-player-pip {\n  position: absolute;\n  left: 0;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  z-index: 10;\n  pointer-events: none;\n}\n#k-player-wrapper .k-player-tsuma {\n  width: 200px;\n  height: 200px;\n  position: absolute;\n  bottom: 0;\n  right: 0;\n  background: no-repeat center/contain;\n  opacity: 0.1;\n  z-index: -1;\n  pointer-events: none;\n}\n#k-player-wrapper .k-player-tsuma[data-bg-idx=\"0\"] {\n  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAATYAAAE2CAMAAADcYk6bAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAADDUExURUdwTJKUmcPDwwAAAMbGxkZuicKHkQAAAAAAACspL/bVyfPNwh4eJDFPa728vZeZne/BuPne0Y2Oknd6f7W1tm9wdqKjpYSEhxgWGJydoeCqofzm2CUlKPfaza6vsOq1rTw3NzAxNlNQUQ0MDaipq0RDRDtZcmdlaers7TA/Tuy6sv///2hFP0FngV1bXuWSjtSmn9Obk39XUcXg8sKVklQ4MzgmI6V2cbaCflFofOXBtpRpY9fX14ukwKebmaK60s3NzfSAYKcAAAAJdFJOUwD///////8T7EF3ZuoAACAASURBVHja7J1pj5tKFoYvp5EdJKuQoNh0ESrKIDxqC0WWu+1RW3f8/3/VVLHYLMUO3WTGR/ngWAlxP37PXpC//nrZy172spe97GUve9nLXvay/3vbvjXZrxecnrj23Gzb3u9f4NqJMUw7hYQ0jqLI0HXdsjRNs/SY2C9uQmYMmBLGumZ6COSagRruX9jKzPa2G0a6GiBIgVWx8d8Dpi+5FZm5VFcxCBSWEMOqHkUWYq9M/0/Ftp0rzRWYWV4DMWZIjclu9/lJ/uEE9f2v/xFc4/htH8w03MyMxTPqfn6cLtfN5jf/rfbnYNuKqwJeF/BfqQ2ilzNTouDewow5ZeyS02WTmJdQ/BOwbauw7J2fVAYGqwp4WaBJvDawdCOKKQ19ZWdXCP5qzppKbN7e39/vsnxvgIZ0n5yum8zOwDnaKw9u23Il5YY0snhlgBojN0I4UDU9psS1i/B+CZjZVOLMOLb74f39cBNJjSr0snnYGa0eW/EHdFklJZlYXBfUioQkimNTMyhh0iuQK1ZnfmQeUmjvh3v6qsYNWYR8bYrGghsEu9Vi2z6R+VSXhKVntwHyJJ36u6Lu9nv2HVDLZFfMtPZ+y14cqkVH5NNridrmzN72VoptW0Rm4lHEij+9aVE/dVmb0Ni5HXJECS7mnEJsYIZ+WWo5NneF2B7MdqHhTEX2lJ1jUEoNVpvd34sOebvxXHAXYAOLhJfNn4HtyYzqwUzIKnZ7YrvfDsxujzeLsQ0ZNQfl1Bg2GSvrwvYsP635meXJ9/YQ1iMj8Hczfvkf9mLltBEY5tjW1F3lzGximEhezu5ZZMvzQaay1FufYY18bZqwoRVh2+bOKS3JLOGWECpQYxBvJR8FlZCLkNqGSxaRtWDLoPnGQgGtzu69aLdSmkDW5/EqpnZOsIWrwJa5px3q+JuglcXG5FbMpCj6PG0a7CyvBts2g6Yh+ftMiO09qfLiZmrrwZa55/dCqzjp4YkNPPr51UgtyQgyoj+N7YegFaqPcnPFqV2aqSXzth/HlkEj+rdDK3E7yFkrf2fUSBu1h9p+kltKbRd5IP+E3YqJIBkcdVJbA7aE2p46PwMtK+Hu8nN0103t4aQ/hi2F5ltIXosBTqid27AlnxZ+DltCzaYBrIYaq9e6tJZh+zG1ZVFtRVLjI4+k8jhvflZtncs5Yq4Imgyactp0mryA2lpBVTdy+xitippJjp1aS1vSmeo28QrTtneu4vuEhGFIFMK3c5qlpzs5++1N0WBV1DD9uHaLbS5s28oGk59t4gtMSQ08jPhijht78VwqAev69mEgr8rASNLB+RuwbYsLzDiyJH60qbjABPF2DkV2jFdGzfFFge1c5ZhhG9vKP9dxO0J1KSjj6shYlhuhdVFj+vnY9LGzPB7b85ROGGkBgs6NbzX2GrNTu0/OB31cNGsSRk13t/mK1lBHDRVBN+ZOBpX1yYjPpCrH01fVIQXYvBTb0F3CNj8HMH7gD2gJahO5IYPl9/DaT20wcOG3zQ6caHhNxUO67DwcJm4DwfS7y12cdvxD1ss5NAdWFs8PM2Dj20/SjS2to4YcnUl77/hbe+/7vb+TTsUGXtswvIRtyEGt7XdDSw8a3LrT5n16bEuOfHxee2JT+x+xZ9R8aWloheIvj1hVHMn795qb3qZSk1Hco3RLiy1tCDZbS0PnUuwAe56HKp5XY3QTvCfP8JEg6BHa0iYBrCHYFMQ4U8q6KHWJ4T82Hccx8ys/qVXkdpjFI0W9i3/ti00fgs1HMj59EPKpuLw9mBcdClRmjhNkejsU7C6I/7NzQ/S46dkkQPQ2ANvOkxGvnK9XK6JE4ecc0Wz+6UgJNTPDditiuwmKtPmxdQ/EH01C/DYstsH50XFcT5T41Jql8AVP4tRM/JgIHJqwZWlzAWwh7au2IcPd7ds+kuF36SrXKCTR9JoEggRaoem6N2PLhDh/QlLJ8dqvScBkUNkWgoyqF7LoZHDAw1r5kG7miX9n3KDK7XafPyWB080NBvdWDJvrMS+tXepyJAaeSq0SJW8tapOXqoAKejuLZ0hZInXsQS0pD26/BRe7fITjFwPgcWog98e2XLEtkWOPIeWQajcNbiBj4ej4ROJgbA5l1Gpe/oxtf38jNgbEP7ZM284ZNn0YNh7cQDwBZZ46blWMnLrWskyaR7YR4X+s9sFyj10ZYVD9kWBjlZvISxP7ItQc/mnBdETUSql0hNhGT0JB353mrD9SL2XBDTdd83ocfkwNPNZQoZZhEKd2H8xgwgAZRe5Xx/yD1R8DscWNXpoI7iNUYaCLOg5uHdmOqzXQhJE9dZvahXM2bXOHjsTbvDTpHEg0pBaBwHEaW9t707htUS9lDhA2nUI9w/BEmmDbWy1emqSGIbUIMLE1x8Mp5RmMlxtTk9JwrGFMIu3KpU/BxX1TAxfblEK5ta4ZDx00cTrN6o9hiTQbiwetXpqmBr+fp3KxLXVqd4rcZGTsTi31x+DdMksKulzvS+ueSlGvKOIsd0vaFLnJWJgWziO2fb29NOFGrF5BxMTyctimfCMBEYW3bP9ij8DGvRRvutyUSL1Gk+ZyKx1AU+QmCm/n4RPxQi412N/swHYK+4QsCBYUG7/8lKuLqt7skFY86olAPnQlhQvResnBXHTpCtOWHTgkV3FrFY46bbR3upLCpY+LyrK3qNhkkKRJU0BVoaJFwqjHC3BssdyVFI6kR8kLy4qNhc5pd/QiQ7HKoQ0Pn1EWZ7y4y0tZydt58A+wufCJShSpk/ZDmFYObqWJ1NqPw8YarM6k8MV6U+iI2EsfJwHNCNAkN/Xj0ineNCNEb+Ow9SrdWG/aOkViCQHLC2PDtLkJ4Q0vdMw3UeRfCrPeSaedeelmdpdum+uHq7V2CMufXUKG3vTdpL0XtM8PgBW9BbllByn9sdj2UbeXMmy+2Sa2YGmxcS+LncYvhzcRghlLacAJVvF2ojSRqvux2N5c1O2lJ7ftYDPgbzgox7xUa5YbPzQBqB0bps/iLZtR6uPvSOicunGxhV5rQvAWwFR73KseNQ4L2CcA3oG1zoWLd69NvP8lTwodqdQ1WhNCsED1UdMOmKHa5KbgmR6wCOu1Tk5Q/Jj0jr8j4YFtb3ZWvH7rTY+LJIT6iA1RvWkQylI544YdzWubnIDzeSyFNjz6EWRJpwCA2u4ZuZIQtfsoLBHLal5q0caxOwT8DKKq6bhykbLcokxu+fplPwFbsoppk9ulPSEsk0cF2LxQcxrcNNk1YtPSy/d/VeIHmD4tTo208fffpuOj1qRwcqXWn2+J0MZA1L00jhpXinzZ6HgMW4Vb+StFkXI551WbDMb4OyJ71CD0szWPeousEMCry02jqqM2ZNPAcVTmpAaNoKUQN0l8zn100o2kSVKw2vr56wdpk9NCta7g2wAcWqrwkEl2aIdh0yOiQwkbKsvN/+ecLa2mPe+Oc/PbapDLZ9wmJ7xQi+DVfR9FMYcj/PeAiU2VdN2Ifak0minTN/0IpUMjhtSeiG2vtcjtsjPa+1G0jNrqPQFIYXKWGglzKcdmMW5hiJunzigOvd/Z7erS29S7vUlLdPvaaT8wM2I6CQReqqtNbsq9VGJeqkd+IfGzgg5VBkj5MIdlhKnY2qLbaRe0hTbTWwpbTgeqXqqKvqncS1lWKFTnEJhepWjOi9Cpj7tLoluz3I4umiG0DT4EggWLV1ATL1VVTzSXZ9S4l+qG/1yIM2xlbYLlZ87DeoRJ3BK56Y21WxjC9KoNhmoSkGN6coOXitICC26SlHipHrnW0xkq/T+7BIW8R5iM7U3BTXIj0QwZAVQ0GJtjClYKvqY2pAVP4sbExrICyZNlTKJKgQyGH+R7hOleyseVwtXfRbFmyAgw+LmLwnNfINk0cVOpxg2QJKmZ3P6djWzAcBW3svNiHVaSMvhmeeLjZvLOVJQVvvw5MgJK/pefQXITNVKAd3aUYKtx49hSL+VyU8w06tP//MuvLCxZDYLSjDAHtqYzqVHb+IP1yv1GlMjAgvFrF7b6tVFo/5e2c/FtU1cDuPAm3UuHjGoDNgljxmA50yKUF7SnVU7+///q+gUhD2hyDterlrab2uSX7+3PnykODaAbbvbbxFo3bcBAxeL90edXWoq0UwB55n+bY7gR9e56BS6nw4THHCmU/wTbHS2VZRAQjedGTzU2o6WxjnkzJWMgLch+Hxfk6jkzlbeCKpPlLDOhxN0gRJBZsNVPY0vu9Z0DVAZlZrgpSBfZPkg95xSMdeO5lqtwvz/FV6EAlCqPAIlI//21HC4IufUKaLKyq8Ii+CC2/MmeSB2HdcYNDH6hvpdDcbMaOfztoPKcllpxi72YUSVt+1MWRzdaChKS+7NgM0HItVfAIpoFG6/ubJF8hS203ggOihowK6nhZsENBA7YCARZ4ybKIPPZ76PCtj8KQS72sIQ049TEv7/hygYht15B8unLth7MSCFPnuztsycszfWEeREOfELJlMD5Vk8VuvMTgNqyySIreMz9wK/RaW/WanVSeSq80lL9MMPFYCYIue2uFBJMxh8PY0tBlD+NzQbJUXF+79RrXX+2Zck6eTt7BpAoDfWLuggCWhDHTFH7s9qfpN+VfUGFMDf1akBmuAXGiBu/Ebfpxt3o0UQecu9JbN+rPvmMRJGft0vLZvvWUCqQ51Y3WkJrKc7k6YiLooe21wOf1UPs6yAXpJJlQZbpaEsBLGYSNz0d5IIbGujHXUf64M4y5OjJThErbS5qpficJ5Rss3hfU8pRJ29exy1U0lafjmdm+72el60flZ6G+tJDfccrwQGzF0zQebCZwttQTQmbEpHrssz4IRjIybMFzarPPSEv+xgCJLTdLBbbneLm9atyB7g9Uvw+nQbYzE0x5rPTby6VBhMtpMQ3xTAg57iHzqipboIeeFPJ4MSJp6tG54mzeJBjkD/VOwgS1JU6YF1mfYYXFe12odZbS+szt9T1yyPhH7W0OdVcdcKmliz92gV8HqfERCLZTNi0Vxiqac2nglR4VRObwhaD5/p7QRp3Wgrikp5LQaI9LBZK4A5NwNFA4HTSm6M6Qw5bd9/EymE7Zlo89U3VcS2ccdOR23/+O5NXGHDj9QQ2cIVtUtrkkz34ILGVXP10CKW9Q4e8fdfStlkc1u2Qm5dEEIbYr3tsdnX6ehIC4VoUWZb5RWYy7UiUc9z0bbgZ3+y4HUQ8hS1PHQlnkqMJl1Df1Ke/kjZbIoq0MgX0bNxi+qaFTa3DruXEG67QQ6wwLqG/2WTV2zmZMeMRUJrniOU2w/32bT6v0HNLGJlIiUBXOnUV74k0ANYcVk+1kytsWpS0lgJPBQ15X9VW2BYW3PazZfEFNw9x2oe5V+IWU4E7nxuJ0Bg3+m22ydi2xBcdDodNWIRT2Dy7L9Qp5xQ2KWD11PkiFS0YSUp1JcPP+u0zkLafRtY0uc1b09boAltc1i4C6RXVCRz2k6GL+m4HLM6GrdupAgAgVk2cEoPkApuKZyewFVH11BlAhQ3brFMXZBmVvffW2DYO3EYZuAYPseFAOmzDy4gMNnZ+fgBLWyyeZ3h97xXcD2f5FDbssLlkMx/HBmSWVyMDCMZEmUsdzoYJADlr2q5aCiL2udh8qA+LbvvZXFg4nDlpc2501XOLBwVX9aYAvWlazjTz323Sdy9WROPYQHSJDUxhi4PkuePNEHEbl4VQWaJ12/fvRPxt8bH8MAK3sZ5BgcOdqhKF7XgR6Xbg6kFVAuQcAq+g9NuM3Ap4Lrvn4xKSxFbtXGljqkAOMfWqe1Xu8XQX1aJLORW2pvV67/KpsC1fHDSlqJt39c+NNAmAygB+Hw23gVXTbnV1+j2sSkBZEZ8GjM4pbu4XQM7heHIFQovNVYR0v8W4tBFKqntbeKO70SpyZTbpTDW2XZ+WQmmwLZXAOROnHt+VxLVNLTFR6VWP7Rx8rFZ7XAybMgDmGQ38eLZbNk1Kn9p3XMgpbMRhiyJXDqmmpC2u0sddaQ4rJDMXjEGF7TPoVAzEO4tt+fqx0AbO2bj3nZI5tSglOr9aDUIPHewe5cAj6MFRJc0Kkc93pVqvpupdjieqPTDusLlThkkyfrwHUzk6lOZ+ROjJzNU4qoiv31vWVciJwfbHgVsszkJ3eP/83K2pMm7H0+qK2jFj3Sw+ECEelFTUBVF525zcbM6WMzyFTWKLLbcvqBrFBqCSNp6nj/uEiiRe3G21pJA326ZNuq2A9cZKm1kvPTn3sW0KpNV0oKJ79bWkvi94TAiJOaMlLSRiyi0QOqu4lYmZPUImWkwhJ0NsWkLGsakQveo3Bx5oGZGpwhbbuneYK2y7lnT6td78WA7Xy8evxWIQArda3I4XonbEhcxJzYpMRc4BExJFES/Cp4f1fB28Qb3PiCZqi1A4bNWX2CIoKUu6zYFH2rS4isBa2SXpdbN9C2SXJlxj09r68uPjw3HbrjOpuZ3c0p8Ts8kMYK5HpRkPBk2996nRlA8oqVDZjApswokej4gZbK7DfmpYj8JWB8VoJ+RdbMTDvsMWhgrboW2cZfq72b4sR9brj1+LX4cmq7WeanT24a/seggMILada8ZbrvR5SZQpxUdT2JTlQ0Ns0bjFhxHkysGNdKaNlDU9wvo6pMK22XWesGoODtufe+CUwh7aMpDHfsnfBQHXhQLGTAfNjD7BTNuSfqrekXS8agGqAunCEbCdgePT27RuRJyWcrSB9F7FRHqk7creqG4Om27YAcibw8/l+FLedbOjZVnUMUIE/VUXmbgeOw8qURCzB6iLIPNhy6KUEUBYMoEtLYjFZotuSRqOOUoFVtDSlB0fNG5Q1krahtgWh4a4ikFzeF1Oc9s2NCgCu+jtxEiVWhUExiY4nc8naGwQqKQGF1PYkD/Epntnx06SRVWusAlvtD3+Tg7Lr7Ft17XDtn6fxLZc/lh8ti0msq6FHwt+h5qPASD4+/c5fYLC5htzGRdJ+jU2u0cAJixXXlWMUoYe11KAhcImhtg2u7V9/Qrb8lX9sX/dXR+HJoi1L8HMw+zKsIFKU9N7pmBWn2DH0egCyKS0EY0tN4c5u2MoydgGV6LSZt/4hMe6UZV9QEh0W8gW22fjWkLWBwvNcLPkrvi9bNdBnCR5hNSP4ezvy84kUWBgiyCz+oQOG5STto1kJNTYzB6BGVQ8Ikrqf4QZZVkc6r7bh3wpQIwgwTpsXGN7b5CTtoMDZqG9Dr9w5m2xM4dQDH0imsHzgrhw4gfN1YP/bBbICDbWY0umpC1UVB22JBwNy0CSoICuW7sV9dCgUBDeYFM+wZ7TUNL2erE6ZgN0Hyo6Bhabh3DTdI2oIKkL4dwSrM0NJUnwf8A2XrSARtp6bKnp4L41+MB0uRMafLZd/eyhDZgWK+0iZ2yb3idE19gG8JzBe/1xaA02bMhjwaTK42HkyaLom91gbAQy8ufDJtwGwEStxyhp6rCBaOScBYBA5w+Ytm+NE55HYhAlA/IC21bl6Lt1NIHtgt7LttHYoGzM5Q2Et63gnLXtYAwzILXtBJkdG/sSW6KxVV0r461xs9jCmLaHXYZtZh49jA2fsW30rkFiA5DN6+tPR+nnPW7L158bI5qQ8zSsdCBOaiFEjYeWGoS2ZbwuZ9uH6bCFk9hwqBIDlcJX/2PtXHgb5ZUwLLxVVk0qQFxCYrWQ0kRIyCJgxcAJUv7/zzozvnBpIV19wll1L2qbzdPXM+/YY6dvnP2RJ0lAoOxyMmyvetc15j/IjThvBUhE7xB4KSvLsmpkTiAxKz+mY0ZwFLFBQZHt97a9P8fyfWm/GZG9vKfjP9wY+Au24tN6siA7YNvLTsZZJdmALT46xZcoW1UswWfF/2BA3lLAFkYGW1WWtBXRPDaJ7mMCLpHYILFA9LXP8dw7U5HgclyzvPr75yv9HRvx0FE4gVwwCkwv7f5HOYrYrPSLQ8Wjg9s/eDfi18wfsAlQG61ucuKRB7tv9fiAB374qbo7w45aXzzOweIJJzuVP4a1yiuDjRRYrC9iswCbZSlsZ62j7xMQj7KR89G6fHW0ZH2n8q+lgp3VArBlapZqbBXDOoEcB2w7iW7CToe8O6YECG24zEoWjiHaWbhmedWrLQNsi4GIOO8ZTjjZCXLse1eCb+WfxnZoweab4Pb7lYl2KkSI2GRSiAQvaQ6pVMRydXe3VQ8NzihvOwJ3B5NHjiKUK88LW5HEL15WLK/+yssX5f0P3vKSBdm/Fo7l7fHcRSyJzQgJO/DBCXunA9p85dzwE3+RGwmEOClskcHmYip9yC2Y3UhtI4Qf257cRwlx0A6FuvQN7yuYO7kbXciKqXSKzV5cbwNsnndEbPtRr5T9rUAIwAl7n6+l2hz5N7mRhxAiS+vC93Ga+qKr6I5WsrwiYbczY7vbGb3tJpLbllAYQB7V2xzBea71DjJGsGIqHSbp+zNs8SmV2PAKDtN97HzLpQbbq0Bs/D00onxuQgAbE1khCjzR4o2wRfi/anYzY0QOsbVQh0a1eadf+zzXOEXOqipdKZX2KSFDQ7uILZDYLBuwjVulztN+S5gm4NI/0XjR1qzXGhOydBSceIIrbDAiLxQNYEsglXKCRYIm5brz4ADdrmPBWdQP028Drm3WgVgrptIeW/gMG1QlF8QWfMM2DlvEdgrPBmzvvITy6GYsiJHbUtsqCSW2ughDlFso2ioHbJhK0bYpTHmyKLmPO+d2WNfmjgYSzGF7CZQDiT9XwvZnwLbssewUsEVefD46Q3vZdPqBn7uEgeP4rx0YCFrJ+mqkyqWr6e2CdVJtoeRWiLZ0d3kFVamNtg2VtsupCx93I8XlA7iSRQ9RC2YPm0Bk7mlC9fNfqzlQYfMRW7DsrU4WYIOSb4Jtwjm2XrPAscL3rsTRz1KcqGT5nRACxhtRFCJV2FK2oRJbJ2JIpC4OpLZT1NyJ+GR+aJnHaqaKWPUd557Jzgpz/ntNbFg+LWMj4SduDe0n2LxJkiSx95bFjpW9N7hfjrM0srxQ9dvGi1fTQw4cYQtDwSoKoCqoSh+QEVBl+TVx1dCSy2k+TNU7Z5lgN7OwKZ9oLif46YqbfiNs4TNsEWKLjt+xnce5KjpkZ8BWA7Y7+PyuziwvU4vd2JW70D73EB1iqw02jthcxObF7AZ/TCS1nXzIP7jXcaQrGYOvKSvWt7TNvuUCGDd7vQVexEb6qnMZm/UZATbrO7ZRTiB7/1DsHauoW/CrbllJx2u6FIKlO/MgkTaNSBW2/4UZIMglNnAgHqNIjbr9kOCuKtLp0Qm0LEnJedBjC+YWQ5VxO76thE3aZyyfnizGkv3JB2we1E6md9aLpjmBHMND4TheWt9KupO58ORbUX0ycrNnd/3tiLWtSDOttgIYuBpblnWKWu6Ox/Wqp6scCWNdVSa7qmWPp9jOJ7mCF7+vim3/XjzDdj75EWDbO2G/Mwd/HecE28nw4g4vPQE2iNS0aiApeOlbL7fZ488kZBuJjTcot1S0iClBbAXM0eR6RWj5gA7/Qdo4Ce7eMDDXdLu7Qmbow2U8Z9zkTv9Kxfxfed2ALJ/gNZ+Xu6ku2C4W7a2LwWZ9x2YVhwtgu4iqwtjjotwiL3s76TMH80djbMYqxCYanKNhKjYQyfKkulZMMArUEs0sVw+q5uxOC47ym4sJIrneWPYMGzZNrVjM/9VHYeLP1HL2T9qCMqDmQ6F+GqttSKXE9lI8LyuxSSEkILcCgltd6IOg8eimsCF8M47YwqbDOQo5EUNbDhkFsDWSmgamrUgf6SS1eyOrry1M5cpsSS/ce26nyrgVK+WET9VEdLo8wQbPVuB5fst7HaktGi/eBt4FheWdwEGosENRbpGoa1+35Q43QPVehJwhmAG2pmEmkeYwEomtBGq5HkZr11Gk27m0uUsfB59XdiI23/M8a9xkql2pmNfYsHx6VnTbYRr5EaSF91FsA7ntBz0CthpbrnpsLpiIAlJELSJ1Ks9s8pByUJ3HGqw/WyZkIr10tMfWXa80nwylPg0Os+pdUoPcKp/sMaxgzbaakPWK+b9/1Mkw+/L5FFt0QbVF/mGK7ThEv+h0OISAjUts0maBYiIuhJ6m571q6CVlOUmkFeUt2AipNqgRJJ8Sqqtqnlo+iE3nU5Dgdle2TDeAkP0cNttXQXwtB6LOXdnFp/cEG7EuqDbf789fI7bI6vfdAVt9OBQSWy7dPDrVlnOs1OtQbyzgLiGpyrGKARRtm0yIDGNbCn6ipUmSlCVQg9+TXD0UNZpPQp1CR6/5DjL3jYU9tmDW7wZrOpC3o15wi6zlWp7spdr8YoQNl2P7ryBnH7BdIAV0ZW/n3StMUyye9BEzuY1TleMTKpxVyVUebRFgehlr2o7xG9C6grSGgdj0nJ3qDakluIIJkZTrFbd5bI66m38tB3KwTC3/DFt8wTsN/ctw2l/Guj6VQpFQH8DbAjZq7Dy8opIJwTbAzbjkx4SaTKTXDQeJ8YaD5WgBRNLwhlJJLR+RozpBGCui0UESlcm0T6V4+WAw69j13Q8rYfNMLf9sEz0oQnkX5Bgbyi0eigSI/bUfio5qaC4F53oDbG3V6+2xqaZXM4PH33S8kpGd6mTi3nhntJabX7RPq+44mYIGXblknlcdiw22eNaxO+s5EMAWvfTV1bPDtbj8Gr6+9XeZyFjXV6XEyWoB1XsIbqv3WPDykgZrxqqBTCmpbaYNaA+Yle3t/n0NsmpbGeFGAznmMsiNxIbU1GrINjepFBuy49kVaqWPcB1sX/7L79UV9jwCteytHmHDTROnx1bUDAoiwNZTQ4MPaQFmKdRKTPDIAmqTHZnyxjct/bFyCxVUy7tSTdJcU6M6xBm55fpJ9AaN+wu2l+Diq9y9ErZQTZen1RWmUrznFvtLB2wwb004RGwcDEcmWpnsJDVXJsCGA7aq5TBbgdoogJJ7Qjdt80NrGOXdimNmMBNVJ4h8HN1k8KS6qnfklwAAIABJREFUpt+6pa5KsY/9PLuwr16otc5FKl/Zyz+UCZBK8SJIwBaN1eabd8kgVlq3FRepuEmtyWJS263ytoEas2qbloeP6vZQJeNdiYj/3JxSErp3vDXckFreq81MUbQkeb8fWN50Mb+ELS1eVtuFgVq+0D8MqDaPT45GXTLABtnSn6gt0sHNtgAYhn7AlktqmhltOcPFnWqzaTvegPDg5d9hKGptvzk1oqYzA2RXPUd1gsgnakNLkpgVJIlNRemFw6y2OtK8zi6MWd6F7/r6zO/is0Iireu3bKy20Nc9n7bHGK72ILYxtRtnXHox+AgWg3WbIdSjiFqzOdUP7ShwSG59YNNTdEil136K4uYz+l0VLhawZeqCkeCyDrYLGfzuE2zhyQ/BlL6lI7WhKYlH2GCWimqgltAGvOsdVypAZzTBo8d9xFI4Gv4ttGlHocZNcjOBbVzUw+P/rJ0Lc6LIFoBLbu5MhXYJQRHTUTE4jjUpVoECYaHK//+z7nl0N5gAM9kLk91ko9mq+XLefc5pqoa00gbxLs8IYQdjn76oRa+TlI508y64yvliNtZWFbz5p2vWzLVPoMWQGLvxogsPAlc8ASjyDrUmblTd/6I1rzTcIBKTsmmxUbsCFm+p0wM/MIIr24it1VCOcy/tobPdpgmOP4DN5+neSQK373rLgOXNx04TcCXE6Xxt8kIbN1qFjod0ntViA1+a68IFUtNuUhrNA26plrVLKLNGt3cwqAslmKblA+StYmpdL6oNmxE2u4vtNIAtUKuy/Wmwbbjn5GVzHpsksF6O5/O1xAMpr1VSejxHY7uAdat04QI0VFMLO5oHHlIqauBkwZEyMG6KQSdqdx6wbyUWRTpWTZm2C6lop7NGYbOW5/5ZE8C2epjq8IpG/B5UfXds5NhaRVFUVElVqA0mgabm+zMLsTUobWmpSj9hWMZN3WOvhKTAgpPOBByp6cRCvEhNiLYnS8hvpa4fdaDxgZY5qO9Im7U6Pc16sXl8B8q/uCm9vwSyUs0l+9nImJS1Ox+PgI0OpGjni98+L4Ata0DYLpdvqaJWGWqupsZAQE0lGTZ4UxqnTIzIoRO176UNI7tMEjNXc+MI573T3oBvVS7BCsDVrwYOLacM3LgEAh5mrDMQhR+w5UnaFLyhiQ3bP/xpB9gqkDXQvJyghXmchYbau9CqSKFCnOuYAuIPxYndgWqbNMKGxMH+yaopc/lukirKI0TXIQA2Lrg5/mIA2xPfVDRV4MYlEIpARrGdjnvAluSqCsTSpmRusZyVeSLB8oeSqEFuJLtBvy1aG+ZigUNS9FpRcy6LGFdpu9KGP4uF2wyCP4z/pGu8qGw7QhTqkMJdaxcH/Umi9aKGmCcK3NRWQ4hA/LHGbscnacO2Wop4A+L1Dx7TwcdsF2Iequ2azOK0G/S37aP4GRJ4jikgX631txGv3Qqb0lr8lkjjRtQJxIBpe8T8QdZI2rAB8xbNvH5sq+NJB26TYFsokzmPRiOQxX6PEyqQxKC43QJuEVoEi8DLQy5HXFR8BaFHLhjWnb1SX8nqm4rEIGzToEJFrfNorbWTGntOkyyuqAIqu10gurNSUirvnE6e1xsQWD+O5ykDN87lcePccTQC8Qhbgj1UIG556i2CHH2n5NMkOiFRKVUVl0opyYnaHe+I/5JVye+UWeYqYXlHvLqfmdvoSUWx0ZR6TeGjbqiZxm2TKq2h8DLEOzfU0cUQtl3E1ylMFLgd1IT1bv82WjpaHa8FQEokqGkwu9H4QCrpuPfdvaMGoUCtqmBor7rN8YK8I3gCDiMg2lUqSoKlgfEXKH93UxwizCCFBcvmdmVN/ZzE6q4VxN5vsU0UuKn7eZZHHH8c8QnHKw32pGBFYu+GvRehPjV4d0NTKgLDliXKypO9Uo2PWp0AJUS5nFZqbDYKVguMPomLtO37sSE7gV9It1HLTMgANuy/XMa+F/RXqTGC2k1WcQNpO+pZ1fXiabQGcsWePZrtOfk3itEVM0WN65Jo2JQIUfjabVAWJFdunWVUOpeYJGjBMtRYuJDkx2krW5RFHsoPDbysxOBvLSso8Biyd/8BhgK7h6mmcXXzDLpKvLPGGRuOKtLadmUCMner9Rmy25YlWVkhzmUrJdhe2XZX2sj0izJO8e0J2ECk5pJgtdMtROgSfp7tQ3GTd1ZNzXU8g7sNwLKdqaNnANte5UPTrLNXt2v+1pV6gA0tlXAp2+ZDZKGoSd0VBL91Diq0YbuXNpc8K/DCnyNsZPvFR33cSmnfI8PJvm3YcGTTUXp6fSuq+AbC5gO2/t+95ahrrx6Wb5Nge1yqMPpxP+pKV4CNXaGp+uujvYvUuQ/+vZQ6QjzSQtN+lGMKMH+1xrYFFf2kjoDS7s6jqWHIbV1iB1wnJNbvAS/rLOMoGMSGGwdWD1MdlWIJZKcDm83occKyIGxktVpugqnp86SKBEhobfwobRJRbqmdD96dx5UgdbQ/YxMtsFbanmvw0ikE3Ukt7qjheILlobCBR+gfsHACjS2apgSy0k1s82C0Lh4jNl0Z01qqCoZK2lCM7gybuJvNe0cjBn9ZoFsBcMBGwiY+zydvWxEz0mbXSdUU1/11vt68+bWGhi9t09jbFdGCsfUv2/De+AXrNMnNMGo9JUTY68VsZH+Yc2Lb1kobOdN3bhSlPAH8Qc6UOMK/h8YqiqYf86VQuBViE0ZFO+LVFTH6yq5vfnS8rteHw3o932zW87Mw0ODlMt75NO82ho33RjkT9Lh9/4/O5XEZ53msLg4WN6/1iGKrpRc9NyDxpCVThoyS8C60LRsxDsswPQdziNjsMPwgVJ//q879CIjBMwdij/SsN75tqD3XGc7CnHFsaxDbk7qsbop1i4jN7DTcRIMNDRY1w+e1/UHcdA0H7HvWpDFy0IatOzZL1FxjxEQCnoOxge3vly8Nr76d9vP1YW2AqWe9v23NwHwe3+JCTVcObcRZqR00kxQqdTsD/X/3Q+mVRZsp4zw05TBzgs6tMgIi/lpkakqbVNRML+rQX0ptxGzIIHPplohNPA9IG0kRMfuEDJ/NOqoZ2uuzyPwTYwtms8H9SxrbNPHuwTdHyBtvyJXSHo24kva9uIU6ra4pXCt53JhUtJUyBc5t4wwbs33CJuw+EVMUE/9IzB57n/k82D7T+pltlZ3i0mD7MXRCrrBNE+8eTqaAux5ypTTX6PiN1PPXdueUAMQNIwoskKWdOlk3wSQJC9uVFGEeNzJEbH17UVjQvGgD1myAGatpQit7nrGQWaWEzRvcEYQX7Ko0cj9hCYQXNA/4BMYWZLI1891TAh24MiRKwu8STMqWQrt1lzVmSZKx3e9DYfkR+ek6zozU9Gzj5hmwDSC7SYzYRlYr4S01E8a7BpvloStd9mPjBRMpuUJt30LdugIxetLKl3GY9wGsrSJT/FMnWZwmHWyvykyhyrmyLEaUsyNubzd8f1mA9ehgWw7VIjS282G6yhG60sfjwO+KbzPcxVVNYFjc3k0JR8YY5W51xSf8xGyrI1MtbVgn6WJTa8Wen0WYALTD+rfMiFsE4pYU4F5wWg2wBX1rhO5HEyaLd829Di/HtwH3bS2XtLYqC7fEjYxbe9QOBr425v5d2n2bie5WPNWooCn8U+sNdrSvCHeblsX6D6GBV9jcXmtIt2QIGQRi8xhb72S+5Wtsi2mxraLB0yvaOG4FsbS3St4E6iInWmDbc9F6SdGDbHsXX4C0AekEaXd3AAq6Y2j9p9DQuh3BHSSyfn0ODbYXq38w31lobMFhwsoRRDan9cCmAb5V3roxHrZv7UlTisXq1ojdM2vj2K6blOBKGZvZ2Aks02b/BWgkbkUja9xpjLbttODNB/1XT6ktbtPEu9g8s9SRDbnSXovKy4OWENOySG1FKNVRlHDpVLR/Y1gPsmdemBtnCZ7cm72JIGpVPD/MH7/0QBBi847KpFDYfjw4A9giPfAxyaXCjzszyjIfmMa1+KJNy49DgKB00ZQeU6y5Kkx2XddJfrt58NxyqvB8YIaYcD9znOQgKq9qWSd8p7l+TdRY3AIyjVsJcZtP2/aGLjG2PI1tmkuFNwabtxlofMbb6OjWzyLfam7GpdYYuwoAltyCc1Rcr/P1Wife1/3x7HuQy2pnycKFkGIcUpMcdJDWXr8MjaxbzXuLEVugLuLpx/akL2ybYBTme+e6q+Xs7djvShEb3YUXN5wNKVVlbFVRplUT7amucyBeel81PpCGX4+nIJfYtQvCx3dtQARCUkqyEkq8wPXr1Iy4uTK/7n1ypJbTv8QNAgUd1x8nwaZvw3BmGIG89GLj2RIniGtVGDSe0w7La0FFit6U+xGveyB2+6zkKyBrMIwUgYCihrhzOEQFnX8Z2duvv37+fCRxC2V1LQjbit1Xz7My2M6TYHsxk9vRpr8UD9gWK17gVxkbr5ImyIO4djiuTYRun1V4wIp/MALJIFCtgVoaz78oam+/fv38+7/4/EXihld1RJyRWgNXGFg/TMjw/8e7WHB7MtpPbUd9rtR5Oge8TTSz27J1nXh+9Ed5kEF3jWm/Cq5BapIGlxPXYf5FBTXI8Pkbxc1Gh0J32j05g7dr7zQ2Z5LATZd3H5yX03zRf3rlPPnRjhd3JNopCi/aHA5/ykyZIgAU53zpaAYZQfk/3s61x01kCcOCGX9gl4u2MdAkLEtzlaUBTUYZb3Ii5f//rFPVF8Cmsbmdw4cot/GMH1d3VVdV14uaX0BthZmNkPXm9ucXHu2KNTo3r/rcR1rkiLR4j80MfTvQp/nMmHAVAxNCN0ntO9hZYSfrfR/NfnEhFxGBvP/IFm9rYGanyYPmhsIJImyDNRrPYlO+Lz4i3u11e80wwot+uu/qxkb3eRbX2995yPCebXN9aHH2Gx/vj/PGllPTMpPmhvImPP6IcWTyXKpViZmbZXIsNoI31nTHKzP2Ip5Uxjugf0Pk9UewEZo0uH+/wcb2/vEJgYe9bG2e5p7Wyr6DI80QW4kjk8u5MXREqYaxI7D5A7YsN+IZbEYnBt5wc/vrPzm1tj82vX78+vyBYq1LqD1gxs3N/vjyy84DHOiCKvVz2HJfxbvVsdi8CuLdWDtbyfOMTz5r4/zxgVkuaw82MDg7+/z3/QcEJc/+a+a0p8cPmtubjR4BjvGhZ8xiU2O3zPwIbEEf2XjYZq+7WIhKJoZ/leNwf3z9K9q+RtVCpR/f3p5RY08MTWADc/u0A7ztj1vbbFa869P/zcHYcjwmaHwCF4AhGcVmJzd4e/+j24kNFmpxfRblsqeGJrklVzsTxpZ6s8UEM1AaO65/QLxbDGrHHh/AO4fNyMEHhugVPt4ralm7uRVFsn1HG2O7UNrxUVXwFuZrMEE1BG4HYnstPT4SVeMTXKRGckq5bMjvN7AT6wBuD2KY5dDgqSn1+cglN/LUFENzmnBTcm2mR4+1Nj/xdSqZcMrnUnGUvr19NqVJroW9H5s1XwhdBQ2eC8TpONMmrVRZfpriNQlTSYtyd6JSDcgW1hYlQagZ2yKx+bR4+/7x+Rn8rorEOuLRc1sLDczNrnCNwOfZdzO4mi4QdR7aLwszwmYiti7UDKiTMgkkK67fv3z79fZJD8JmaWp766Hh7maF3EVehwHJmhsdvaxzdqi1xYTlsUiA3zVQSPEMSrloeaQ5fDPGLvA4jlPXNfzq4J8Yex753n4CzDlteS6JECHNuKiuHtu5D9z2d1TeWFtMsio+TxNWUjjHCGCVYmbxPaG3yS+nbkexAv72p/xtCwwf0ktu/OmlXW1o4vUpuEmT0EwWmHVFP7cXnDebA7Dlw95mVMxLz9OEVSjGqpMrvf748vfX38ORCIkt2Xzgvc06hj7oZZf1xPrsOAEjKjIlNqDDFvQl4d2BG2Iz+70N87vpdLSwGRr9Kn378udXdUa4OO2qdzmDTnFj9fYXS2jnEptj81K9tZl+H4EQepy1IbYuicpp6QexeWKVwu72zx8Nx7Zp79Zandjfli9QsDKAfN9I42WFwIahiA7bEIHsLpWOe2fgGNzYfjgtNApr474UIt5v/2D6Y/0uNJCbYrMXv+Cczdq0okVR9dO4NdhiSzXc7m4NHC/S0PMCu9F0AyiXYBCIeOnb94xuhib8hMPuw5Bl1GbXOTwQyghrwzkwWmxl5h9VKh0vUsDm2108bdlBbB4f9+9jLfQzuZz2PjfvPymWfA6PmInQuXjJpEyNTqDBPFfdUaXSfsyRSKpFdj6DTZpbxmvIzmn/MzK5pLDb5xHtkxgwKV64tXEhFa2uxbnXGd5dKh1bG2AjSSWbZ8boZLgrQzfgVp+OeMB81DtOVu+HmlX68iKsDQ7zWmxul6kcSFAci41lcuLkDTbX6OfdXbH+fgw2vlbFO7Z3GZpcpYCNcdcF27MOG4olm8eUSsfYMBVZMVL2Xc6jfBvp5ZGxMaE9Cpu0uEfY6svShArsHkzK9kywmbyvMVFVGG9nBDLBlpBQg60kI3OjyenIB7jM7m3tYmh8lUpsnjsRUeE3UoxEutLdNb8RNp6LzG0xAvAO29nozS2nBTsd+zg2bXdD46uUSS03PbbQalw1GXU3tk69MGKDeFckXm6/rxkTxS2y6eVgbK2ltbaarUxDFSNsk+gDMyQsPx8TgYyxGRxbIxIvd9hSQnqB5P8LtnYNNMZ4EsaWi9QItdhwUn/ZX07YxW18ewixBTzeRZ2t+yIM13/Bp6HOwdhOE2z354hnxGTWTRyuDBJPsWF+wu3kXdzdygkja0sRmw/x7lmHrRSKHPAzNbbzP7a2hRHHpAHJKTopizQR0uFpHTNIiJqoQI+ythT3tgji3VTde7n5vmBtnBvp7Fp70KxlSlc9mOZt11vbotBW27N1qsXIUZSAm1gb/g3OTpf/sHOO2+hmZInHzsiqsIliis0MoyhqItzbBDbg1NYiAd5nv6+6vsfniczB2pb6TnhR7etYRAjVhFNsKc+BNKl5RPvMgI2ncA08JvB81aR8dQZsHQq+VDbn1K+jq8WeGsblIbrWStrli5PNvlh9wXopamBMar1caAtnSZaH3PMbWmdELpJkjCC2qcqWaYC12UlAtlX72KNUMGJbZmjs0QfQOjRHan5kTFOG2OsOrlQC3edKsXdXYePqo6SySKzHFkZ+YBdFzjZX++a6h9DalrjOZ500tZMwQvi08xlsHZND9PdN1hphEyreJE/Qws10ii2FHycpXl6KYkdhVGsssLexjV96h41RnMTnR9F0b8PtzgysSKzSfZO1RqMZXC6sPI/t1Y18n2F2Zg82rclAnLq/zY1XshzaienTGmyoPB9ZgVAm2pcXHwaByIYFo4PT1VmLzQTzr4Day862GTYB9xTbsmpPC07dzvhsfb+cYIvRJ4Ssk052lzTuCNtZBNhNEsSpHlvs+91+a9NweIyNLS1cIDYrabi5xVNsvLcmy2XTwS6fgNiMPoPrcWxNXIowZ/Kdff9nURQvBzRp3RZFH2Fjzoo6IISQNOfYDHOKDX1CnsVylUb7sMnLQ33DAhxKQ1OLzfXRlS7ot12WVRwsbh4bW1PARmtzaCUUMO6zuyVvQHMb5olVuitTORqpJSrvxE9ywOaGGr1K8AlBBuZmWwc9ClxLZ7CtqysiNce2Aj9ogntsKBKTCkUv8dZ2zXvG+6RlH7bx09U8NpMEQQeL9DBsCtwMtpXFWH4odiwb9Vca/z5wEyIxpmH5UuVvj+LEcHvZlcLKcCiF1a/HFgfBT3qgtSlwtQ7b6l4JvkYhcsuDgE2wobWhTyhZl4a7J/D2d+VV/EEiVsWxe9bdkzPTAH6i4qiWwNG1oCk2tqFlC3MK2NSgxSaUPs1zVcn3tid3hJMZziNHCtaWZV581mJ7dVHW8XBsvOa039QuTFyZLqwAogEdtpgfr7JUSJji5raVWz8HZGjzyJgXp3pspg/c7htQeRcl9lC2dTs8PKN0ucmULMe2ztRUm1sisdkNYpuUYEQvt+tbql90x+bWaw+JgzxmRivLiNNUeysTfUKTvSSjVNpNG+VMoww2VD7rqJwL6VZ0Bibqgn7X2E2kw4aulCSRGJgAa6fYjk02HPGtzcMkX5WQuNTfyjS9oOkcdAlwPqpXbj5A7zKTT7NvQsHFpnbXLNdjqzo6wfaK2EpR9BPH+j2bm5qoJXvB0drwLB/OYEub7mdX2Jd6c1m+BXYPsS3tea4nmSaJzS6ynDbGNAyQPiHL3TOeT1EXfiM2WKOylCC2NiIzR3Gox+YGTdPta27TdfKOsC3yBa02DdxjSyraTJT13BC4YdEvr85SoHnz5obY/HF3rrQ2/GRc/Xyl7qftHNACctOsNmBb8onwr3yEzWa0m96tCD1+w9gMrBCCODFFp9iMTQm7ioM8L0z5sRdrb+PC8appGtuZtYiVYb0i1/c8Owv2MzZXukiGoS1F5WqxYaaSWNGrGAezeXNTeSMV7AI30qAqjKfHZhrc2h7cwF59fYXx5g26yIM+qQUqbHD+qzT5G49fNTVD1uCZId0x7UglQFTfHzEGbNr5+SHsbY+wndp2/WqV2J4s0Cc9qAM2ex5byLtmchPH6LjbNzd1kh+CXcTWeJ4xgw1cKWB7tLm16ze+2np52nq+pEQzwsZMLTblEzD9lm7f3NTgfxns8mYFxAYbnVbCGF1pZ18eY1vNrb680Ifb2sJC/QibNcWWSmzYU8mnNpmb6zBqWKDp9c25JEiwkWLmyjm6Uvvi1I9XU7sWW5HUe5ndYktcLTZ+HSuyCDe+dPOxVB1JB48wYCv1sgPPsa3mBtgumze0G2yJhedjq5BCmLcJN8R25j4h4N18YG4bNzd5B0aWX/giJQHvP1F6lXe99iZpHPoM26luV97F0nfMrWLGLo56WCGFMG9TIIit5NpU/D2HWGna1q+lzlZDA73CBpvbq+bytBl3VfG8GaZec2Jta6bD1i5nJjscaontUvSz/MY9LAa6Uu4Tsv+2dia9juJAAFZ474JkQGKPZCGWAOIA9/f//1i7vJaJIXZm0jN96HnNJF9qdS3mq+WhZPJVQUHlVmhcA5RUYotc2F5Hz7B9XmkSIHCALfnCcb41hShsyaR3+Vntx8YnvMSRSAc9vOHcAFulm42EI1XY1Lrk9HzNVgzYPmaOAfIGLQjJd53OvfVGdoTt6ZY24xN4kpp+VS0FbA3OSCEnLSxsZ2krV3KNzZxSwjGRL7cFpG0PF7S3OEhja1Xx9yxtYtb0GReicvp8fVUtBWwPFH/wnrqCzqJJt3yfT2Df2TqdsO2LmouXJ7lDPMiXV0PlzqVtD7Rorp4QjY2YpXSnAITnCV1/RPKYvPymqxJS0tcpbNPYROB2HidJR46NvWk5Bn9pcyC1pror8JoexubdS7lfl64EtuYCGxi3cpxTed5bl1+0gkBKmppiXy6wxVLaaie2GRYrMh4eNQI4kqDW4tLdOVyaxC0XXz9o101u7EnCK8STA9sLdJQbt3Qd+F7XGiKSdfoG2xCh8w/ewKmV1DXW8Zv2009r4bjBRt9+0NGNymQ2btkf+0G7S+x2E7g5sNWZ0qGoiDOVpWZfXEQkJ4dUsxHCJjb/usY6CJc2v6WU/ASM3q9LBNPIsPllUPdnv/fYZI0JWkUzWmi1beJvsK14XDTn2JSSPlzTMNkksP0XblawBRYynmKP530sA2ps26R3+aHtVqJaAqPN3bBGKm/Ig42bjj86bNo4Ng6uc2AroOPIG9slN0NuEbaIfOqQGD7HM3fYpEaJhVtpP6ZyNi97BEdu4EhrO0lg1Iqhl9LG/5u93YKFh0HYbrhJ4w5l6Hj69EC/ykwifYILmxz351oqx5jFVrqqDcfGTwpQtMuwVYAtVz7BxhaV80QENt/+mVtuvET9GZtna4OWtsSBTZq2DOLRqOIbQWAjI/QKBWopnLZF6JFc2hqO7ZGrZUHWCpqojjU2+j9wk0FKO939jHc/yA02ESwIcXtFMr2SnzvQuIFpG3+taBd6+iutpGDcTtKWkzYUGxyDXf+0OFf8uX5gSBPNtW1Tdkg4BZZeVQZbYORmiqQmtdLYcnGvymmuI6pahm0Kw8YF6vJOOcqPY6+eGNR5ZFxC+4btqaExLWWulKdXwrkWJBhbhqt9wiNUwyBtm9hDUmJRH9kH5EVNOcEHfUZiYk3O97k6jOg1ZipPsYnzR0KXufG3AM88S1ukwg/p6tKZp1cyOQo7PFIXmuiOQO4RBLaHyuajssMeoSdbQqn4ThfvDiN6qafkDltY0wSLm1E1oXGFHxxdBpvHR3Cl6nOPIVrKqIlCgn4m6GhVVL2WNva9RCXqRmUeYYDW/1tsqMNIL7y7kjfVJPRD3rmF7ULlhwrkEhs6vub7LsCVwlESB1kFYpvWyKot8ykvjk1paRThJXhRw4SNfacSm98yJ/mBqPOWUVvaELeQHjd9DnON7YWxMZ8ArlSLS0MCsTXomUJHubQ1eslMaV2tEhWAbZDYEv99wss2UJe46faD1uY2hPS4vTWBOLDVGFueRo+4ijg2vvEqJATRvfXqq8i5aWPY4kb/H2rrIp90BWJbMDbZjxyf5Y2+Y+PcfEXtVEI12NoztiemVnUwexVpacsD8itt2lCTViGkjWMTigr3H5XojNLCFjShskDic2qnNMJhsEGtc/cVYfe34JC2LEfY1hyKfqWJIALyK9DR49S2K7FRwCbXV6TRy/iEcubEyBaOjXsI9s+OJIQSh7QRv+VwrsPzG2wPjG080m6eO4MtIL8yk6Q6SWj4SKHAls+VSBTQBUgs/qAaG8+ZAwMEALcbG24+5Q9SUp+VBO7TOaykdgkmxdgec//qxgGqpPpPQrDJYqKaf+HCxl4zYCvoKo1bp41bVA7UkrYwcQNhW6RBVE7iDRvdPvroy9IWlrbnKSPF0jaTx2sdmCI9tdpOAdj6FM2/QPhRVaCkMynYg9pVxjhdfcYGwVsl/u71AAADQ0lEQVRADHISt0Wr2aaFQ2OLt0/PvSltIWyt3cxQ5ha2tqiruClNWMLyKz9uPI+Pfq1OSi5rlcB2SGyPtNQ7NRS2jeqjhqBhlUWI246mPzcbG/0kx7cFB2MfJ5KeNzQhbH171AUtXiYIbgZ/bDJv030zTaWwVfCNSGwvdE2ZtG2J+F1UicK9guCm8u4tBmzTiZqT26cqDTJtNPp1r5/jq07a+ZnTqk5NMu6bX4Fpy2xshca2wqNXFbnVdakXiIrYY0huP94nNU30FKM6sJDYELVkWYIk7YStP99uhrA1A+mzR7yyj/UIDUGg1tdZ6+kxtryh7SEzEdhpkKoDEIFtU6IWqqeLdguIGpzuTobaoh6+h0GzsI3n+ANji2mcP4ej7kwU3FAvLTWmTWNTOvo3MmwFaUeJrexqdYMCyxKwQDg/3mdxg79iUYM+PmbchsR+Yb/gU0TF8cdhO1K9RE0gimlRDzBtXBt7542tstNc8KN/IHFzezRVS2Z1xFvWarZD5KRvr5DzV5vXoqWtJfH1c/fN+/Rdxh/FeasVwlbQnhm2fnw+0y7QuJmNDDqTFzr6V1VjOxYr0djqtH7KRt4oo0Pi4rYHpKaKFgIIO0yFO1gsnEtICxJFjtTunIkemNqjIjM9nv0M85+Bxg1fVV3bHmFN2rEaCdUVBYZNVOihV0c4UegwgmEUKn5RfTfHx0HJxYUd7m7aziKo9N9z2SKi1k5We1vUNU2DU1Iy0jGbGbaX6eLwOjwyebyF7Q+EDaStGukQ60JMxxxRp/qN+Psib6/TXO5lh9GO2SzyX9iScdJ+yc6/Q5BgbHF3WgWG44+DrnTOAVudZkHGzeTxBlulXMLRzizBmmmhtLQE/y3ErWgdyNxHt254+5IkbxIHC7cHQxG9tpCqojFtfXkSNqykI61iwJZnzzILMm76iNJga7hdA2kT2NjD9WFozTxRp+ukvtzcC+9cWsq0aiLJu5Zu1Le3yXonUztG1nZIW9rmuBj6hl9X2BlX6pGWgo5q9TfYpLStpGfYVnKoR75gnacQt3K8xHZTH7YuS8ZwJCAWtrXtu4+OiWdlkeK3sMVTe+D6ByzYsqLdvun7ZuA3iZlT30L4hH+AlH60kAnxVQAAAABJRU5ErkJggg==);\n}\n#k-player-wrapper .k-player-tsuma[data-bg-idx=\"1\"] {\n  background-image: url(data:image/png;base64,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);\n}\n#k-player-wrapper .k-player-center {\n  width: 100%;\n  height: 100%;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n}\n#k-player-wrapper #k-player-header {\n  transform: translateY(0);\n  transition: transform 0.3s;\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  padding: 8px;\n  text-align: right;\n}\n#k-player-wrapper #k-player-header .k-player-question-icon {\n  font-size: 24px;\n  width: 1em;\n  height: 1em;\n  color: white;\n  cursor: pointer;\n}\n#k-player-wrapper .plyr--hide-controls #k-player-header {\n  transform: translateY(-100%);\n}\n#k-player-wrapper .plyr__poster {\n  pointer-events: none;\n}\n#k-player-wrapper .plyr {\n  width: 100%;\n  height: 100%;\n}\n#k-player-wrapper .plyr__control svg {\n  font-size: 18px;\n}\n#k-player-wrapper video {\n  display: block;\n}\n#k-player-wrapper .plyr__next svg {\n  transform: scale(1.7);\n}\n#k-player-wrapper .plyr__widescreen svg {\n  transform: scale(1.3);\n}\n#k-player-wrapper .plyr--hide-cursor {\n  cursor: none;\n}\n#k-player-wrapper .plyr__control span:not(.plyr__tooltip) {\n  color: inherit;\n}\n#k-player-wrapper .plyr--hide-controls .k-player-progress {\n  opacity: 1;\n  transition: opacity 0.3s ease-in 0.2s;\n}\n#k-player-wrapper .k-player-fullscreen .k-player-progress,\n#k-player-wrapper .k-player-fullscreen [data-plyr=widescreen] {\n  display: none;\n}\n#k-player-wrapper .k-player-progress {\n  opacity: 0;\n  transition: opacity 0.2s ease-out;\n  height: 2px;\n  width: 100%;\n  position: absolute;\n  bottom: 0;\n}\n#k-player-wrapper .k-player-progress .k-player-progress-current {\n  position: absolute;\n  left: 0;\n  top: 0;\n  height: 100%;\n  z-index: 2;\n  background-color: var(--k-player-primary-color);\n}\n#k-player-wrapper .k-player-progress .k-player-progress-buffer {\n  position: absolute;\n  left: 0;\n  top: 0;\n  z-index: 1;\n  height: 100%;\n  background-color: var(--plyr-video-progress-buffered-background, rgba(255, 255, 255, 0.25));\n}\n#k-player-wrapper .plyr__controls {\n  z-index: 20;\n}\n#k-player-wrapper .plyr__controls .plyr__controls__item:first-child {\n  margin-right: 0;\n}\n#k-player-wrapper .plyr__controls .plyr__controls__item.plyr__progress__container {\n  position: absolute;\n  top: 15px;\n  left: 10px;\n  right: 10px;\n  --plyr-range-track-height: 2px;\n}\n#k-player-wrapper .plyr__controls .plyr__controls__item.plyr__progress__container:hover {\n  --plyr-range-track-height: 4px;\n}\n#k-player-wrapper .plyr__controls .k-text-btn {\n  display: inline-block;\n  padding: 0 8px;\n  text-align: center;\n}\n#k-player-wrapper .plyr__controls .k-text-btn-text {\n  line-height: 32px;\n  user-select: none;\n}\n@media (max-width: 576px) {\n  #k-player-wrapper .plyr__controls {\n    padding-top: 30px;\n  }\n  #k-player-wrapper [data-plyr=pip],\n  #k-player-wrapper [data-plyr=widescreen],\n  #k-player-wrapper .plyr__volume {\n    display: none;\n  }\n}\n\n.lds-spinner {\n  color: inherit;\n  display: inline-block;\n  position: relative;\n  width: 80px;\n  height: 80px;\n}\n.lds-spinner div {\n  transform-origin: 40px 40px;\n  animation: lds-spinner 1.2s linear infinite;\n}\n.lds-spinner div::after {\n  content: \" \";\n  display: block;\n  position: absolute;\n  top: 3px;\n  left: 37px;\n  width: 6px;\n  height: 18px;\n  border-radius: 20%;\n  background: #fff;\n}\n.lds-spinner div:nth-child(1) {\n  transform: rotate(0deg);\n  animation-delay: -1.1s;\n}\n.lds-spinner div:nth-child(2) {\n  transform: rotate(30deg);\n  animation-delay: -1s;\n}\n.lds-spinner div:nth-child(3) {\n  transform: rotate(60deg);\n  animation-delay: -0.9s;\n}\n.lds-spinner div:nth-child(4) {\n  transform: rotate(90deg);\n  animation-delay: -0.8s;\n}\n.lds-spinner div:nth-child(5) {\n  transform: rotate(120deg);\n  animation-delay: -0.7s;\n}\n.lds-spinner div:nth-child(6) {\n  transform: rotate(150deg);\n  animation-delay: -0.6s;\n}\n.lds-spinner div:nth-child(7) {\n  transform: rotate(180deg);\n  animation-delay: -0.5s;\n}\n.lds-spinner div:nth-child(8) {\n  transform: rotate(210deg);\n  animation-delay: -0.4s;\n}\n.lds-spinner div:nth-child(9) {\n  transform: rotate(240deg);\n  animation-delay: -0.3s;\n}\n.lds-spinner div:nth-child(10) {\n  transform: rotate(270deg);\n  animation-delay: -0.2s;\n}\n.lds-spinner div:nth-child(11) {\n  transform: rotate(300deg);\n  animation-delay: -0.1s;\n}\n.lds-spinner div:nth-child(12) {\n  transform: rotate(330deg);\n  animation-delay: 0s;\n}\n\n@keyframes lds-spinner {\n  0% {\n    opacity: 1;\n  }\n  100% {\n    opacity: 0;\n  }\n}");

//#endregion
//#region src/utils/isUrl.ts
	function isUrl(text) {
		return /^((https?):\/\/)?([^!@#$%^&*?.\s-]([^!@#$%^&*?.\s]{0,63}[^!@#$%^&*?.\s])?\.)+[a-z]{2,6}\/?/.test(text);
	}

//#endregion
//#region src/utils/subtitles.ts
	function readAsText(file) {
		return new Promise((resolve, reject) => {
			const fd = new FileReader();
			fd.onload = () => {
				resolve(fd.result);
			};
			fd.readAsText(file);
		});
	}
	async function parseSRTToVTT(file) {
		function srtToVtt(srtContent) {
			const lines = srtContent.split("\n");
			let vttContent = "WEBVTT\n\n";
			lines.forEach((line, index) => {
				if (!line.match(/^\d+$/)) {
					line = line.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");
					vttContent += line + "\n";
				}
			});
			return vttContent;
		}
		const vttContent = srtToVtt(await readAsText(file));
		return new Blob([vttContent], { type: "text/vtt" });
	}
	async function parseASSToVTT(file) {
		function assToVtt(assContent) {
			const lines = assContent.split("\n");
			let vttContent = "WEBVTT\n\n";
			let formatParts = [];
			const eventStartIdx = lines.findIndex((line) => line.includes("[Events]"));
			const formatLine = lines.slice(eventStartIdx).find((line) => line.startsWith("Format:"));
			if (!formatLine) throw new Error("ASS文件格式错误，未找到events.format");
			formatParts = formatLine.split(":")[1].split(",").map((part) => part.trim());
			lines.forEach((line) => {
				if (line.startsWith("Dialogue:")) {
					const parts = line.split(",");
					const formatMap = {};
					formatParts.forEach((part, index) => {
						formatMap[part] = parts[index].trim();
					});
					const timeStart = formatMap["Start"];
					const timeEnd = formatMap["End"];
					const text = formatMap["Text"];
					const vttTimeStart = timeStart.replace(/(\d+):(\d+):(\d+).(\d+)/, (match, p1, p2, p3, p4) => {
						return `${p1.padStart(2, "0")}:${p2.padStart(2, "0")}:${p3.padStart(2, "0")}.${p4.padEnd(3, "0")}`;
					});
					const vttTimeEnd = timeEnd.replace(/(\d+):(\d+):(\d+).(\d+)/, (match, p1, p2, p3, p4) => {
						return `${p1.padStart(2, "0")}:${p2.padStart(2, "0")}:${p3.padStart(2, "0")}.${p4.padEnd(3, "0")}`;
					});
					vttContent += `${vttTimeStart} --> ${vttTimeEnd}\n${text}\n\n`;
				}
			});
			return vttContent;
		}
		const vttContent = assToVtt(await readAsText(file));
		return new Blob([vttContent], { type: "text/vtt" });
	}
	function parseSubtitles(file) {
		if (file.name.match(/\.srt$/i)) return parseSRTToVTT(file);
		if (file.name.match(/\.vtt$/i)) return file;
		if (file.name.match(/\.ass$/i)) return parseASSToVTT(file);
		throw new Error("不受支持的文件类型");
	}

//#endregion
//#region src/utils/sleep.ts
	function sleep(ms) {
		if (!ms) return new Promise((resolve) => {
			requestAnimationFrame(resolve);
		});
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	}

//#endregion
//#region src/player/Kplayer.ts
	const MediaErrorMessage = {
		1: "你中止了媒体播放",
		2: "网络错误",
		3: "文件损坏",
		4: "资源有问题看不了",
		5: "资源被加密了"
	};
	const defaultConfig$1 = {
		customSeekTime: 85,
		speed: 1,
		continuePlay: true,
		autoNext: true,
		showProgress: true,
		volume: 1,
		showSearchActions: true,
		autoplay: true,
		showPlayLarge: false
	};
	var KPlayer = class KPlayer {
		constructor(selector, opts = {}) {
			_defineProperty(this, "localConfigKey", void 0);
			_defineProperty(this, "statusSessionKey", void 0);
			_defineProperty(this, "localConfig", void 0);
			_defineProperty(this, "plyr", void 0);
			_defineProperty(this, "$wrapper", void 0);
			_defineProperty(this, "$loading", void 0);
			_defineProperty(this, "$error", void 0);
			_defineProperty(this, "$video", void 0);
			_defineProperty(this, "$progress", void 0);
			_defineProperty(this, "$header", void 0);
			_defineProperty(this, "$pip", void 0);
			_defineProperty(this, "$videoWrapper", void 0);
			_defineProperty(this, "message", void 0);
			_defineProperty(this, "eventMap", void 0);
			_defineProperty(this, "isWideScreen", void 0);
			_defineProperty(this, "wideScreenBodyStyles", void 0);
			_defineProperty(this, "tsumaLength", void 0);
			_defineProperty(this, "curentTsuma", void 0);
			_defineProperty(this, "isHoverControls", false);
			_defineProperty(this, "$settings", void 0);
			_defineProperty(this, "$speed", void 0);
			_defineProperty(this, "localPlayTimeKey", void 0);
			_defineProperty(this, "$searchActions", void 0);
			_defineProperty(this, "opts", void 0);
			_defineProperty(this, "speedList", speedList);
			_defineProperty(this, "setCurrentTimeLogThrottled", throttle(() => {
				if (this.currentTime > 3) this.setCurrentTimeLog();
			}, 1e3));
			_defineProperty(this, "hideControlsDebounced", debounce(() => {
				const dom = document.querySelector(".plyr");
				if (!this.isHoverControls) dom === null || dom === void 0 || dom.classList.add("plyr--hide-controls");
			}, 1e3));
			_defineProperty(this, "hideCursorDebounced", debounce(() => {
				const dom = document.querySelector(".plyr");
				dom === null || dom === void 0 || dom.classList.add("plyr--hide-cursor");
			}, 1e3));
			_defineProperty(this, "isJumped", false);
			this.opts = opts;
			this.$wrapper = $("<div id=\"k-player-wrapper\"/>").replaceAll(selector);
			this.$loading = $(loadingHTML);
			this.$error = $(errorHTML);
			this.$pip = $(pipHTML);
			this.$video = (opts.video ? $(opts.video) : $("<video />")).attr({
				id: "k-player",
				playsinline: true
			});
			this.$progress = $(progressHTML);
			this.$header = $("<div id=\"k-player-header\"/>");
			this.$wrapper.append(this.$video);
			this.localConfigKey = "kplayer";
			this.statusSessionKey = "k-player-status";
			this.localPlayTimeKey = "k-player-play-time";
			this.localConfig = Object.assign({}, defaultConfig$1, gm.getItem(this.localConfigKey));
			const isIOS = /ip(hone|od)/i.test(navigator.userAgent);
			this.plyr = new plyr.default("#k-player", _objectSpread2({
				autoplay: this.localConfig.autoplay,
				keyboard: {
					global: false,
					focused: false
				},
				controls: [
					"play-large",
					"play",
					"progress",
					"current-time",
					"duration",
					"mute",
					"volume",
					"pip",
					"fullscreen"
				],
				captions: {
					update: true,
					language: "zh",
					active: true
				},
				storage: { enabled: false },
				volume: this.localConfig.volume,
				fullscreen: {
					enabled: true,
					iosNative: isIOS
				},
				i18n,
				tooltips: {
					controls: true,
					seek: true
				},
				disableContextMenu: false,
				loadSprite: false
			}, opts));
			this.$videoWrapper = this.$wrapper.find(".plyr");
			this.$videoWrapper.find(".plyr__time--duration").after("<div class=\"plyr__controls__item k-player-controls-spacer\"/>");
			this.$videoWrapper.find("[data-plyr=\"pip\"] .plyr__tooltip").html(`画中画(<k-shortcuts-tip command=${Shortcuts.Commands.togglePIP}></k-shortcuts-tip>)`);
			this.$videoWrapper.append(this.$loading, this.$error, this.$pip, this.$progress, this.$header);
			this.message = new Message(this.$videoWrapper);
			this.eventMap = {};
			this.isWideScreen = false;
			this.wideScreenBodyStyles = {};
			this.tsumaLength = +getComputedStyle(this.$wrapper[0]).getPropertyValue("--k-player-tsuma-length").trim();
			this.curentTsuma = -1;
			this.injectSettings();
			this.injectSpeed();
			this.injectNext();
			this.injectWideSreen();
			this.injectSearchActions();
			KPlayer.plguinList.forEach((setup) => setup(this));
			this.initEvent();
			if (opts.eventToParentWindow) this.eventToParentWindow();
			const status = session.getItem(this.statusSessionKey);
			if (status) {
				session.removeItem(this.statusSessionKey);
				setTimeout(() => {
					this.toggleWidescreen(status);
				});
			}
		}
		static register(setup) {
			this.plguinList.push(setup);
		}
		async setCurrentTimeLog(time) {
			var _this = this;
			var _time;
			time = Math.floor((_time = time) !== null && _time !== void 0 ? _time : _this.currentTime);
			const store = local.getItem(_this.localPlayTimeKey, {});
			const key = await _this.getPlayTimeStoreKey();
			store[key] = time;
			local.setItem(_this.localPlayTimeKey, store);
		}
		async getCurrentTimeLog() {
			var _this2 = this;
			return local.getItem(_this2.localPlayTimeKey, {})[await _this2.getPlayTimeStoreKey()];
		}
		async getPlayTimeStoreKey() {
			return await runtime.getTopLocationHref();
		}
		async getAnimeScope() {
			return await runtime.getAnimeScope();
		}
		async jumpToLogTime() {
			var _this3 = this;
			if (_this3.isJumped) return;
			if (_this3.currentTime < 3) {
				_this3.isJumped = true;
				const logTime = await _this3.getCurrentTimeLog();
				if (logTime && _this3.plyr.duration - logTime > 10) {
					_this3.message.info(`已自动跳转至历史播放位置 ${parseTime(logTime)}`);
					_this3.currentTime = logTime;
				}
			}
		}
		initEvent() {
			var _this4 = this;
			this.onDrop((e) => {
				var _e$dataTransfer, _e$dataTransfer2;
				e.preventDefault();
				const rawFiles = (_e$dataTransfer = e.dataTransfer) === null || _e$dataTransfer === void 0 ? void 0 : _e$dataTransfer.files;
				if (rawFiles) {
					const files = Array.from(rawFiles);
					const video = files.find((file) => file.type.includes("video"));
					if (video) this.src = URL.createObjectURL(video);
					const videoName = video === null || video === void 0 ? void 0 : video.name.split(".")[0];
					const subtitles = files.filter((file) => file.name.match(/\.(ass|vtt|srt)$/i));
					if (subtitles.length) {
						let subtitle;
						if (videoName) subtitle = subtitles.find((o) => o.name.includes(videoName));
						if (!subtitle) subtitle = subtitles[0];
						this.loadSubtitles(subtitle);
					}
				}
				const text = (_e$dataTransfer2 = e.dataTransfer) === null || _e$dataTransfer2 === void 0 ? void 0 : _e$dataTransfer2.getData("text");
				if (text && isUrl(text)) this.src = text;
			});
			this.on("loadstart", () => {
				this.$loading.show();
				this.hideError();
			});
			this.on("loadedmetadata", () => {
				this.$loading.hide();
				this.$searchActions.find(".k-text-btn-text").text(this.media.videoHeight + "P");
			});
			this.on("canplay", () => {
				this.$loading.hide();
				if (this.localConfig.autoplay) (async () => {
					try {
						await _this4.plyr.play();
					} catch (error) {} finally {
						if (_this4.media.paused) window.addEventListener("click", () => {
							setTimeout(() => {
								if (_this4.media.paused) _this4.plyr.play();
							}, 100);
						}, {
							capture: true,
							once: true
						});
					}
				})();
				if (this.localConfig.continuePlay) this.jumpToLogTime();
			});
			this.on("error", () => {
				this.setCurrentTimeLog(0);
				this.$searchActions.show();
				const code = this.media.error.code;
				this.$loading.hide();
				this.showError(MediaErrorMessage[code] || this.src);
				if (code === 3) {
					const countKey = "skip-error-retry-count" + window.location.search;
					let skipErrorRetryCount = parseInt(session.getItem(countKey) || "0");
					if (skipErrorRetryCount < 3) {
						skipErrorRetryCount++;
						const duration = 2 * skipErrorRetryCount;
						this.message.info(`视频源出现问题，第${skipErrorRetryCount}次尝试跳过${duration}s错误片段`, 4e3).then(() => {
							this.trigger("skiperror", 2 * skipErrorRetryCount);
						});
						session.setItem(countKey, skipErrorRetryCount.toString());
					} else {
						this.message.info(`视频源出现问题，多次尝试失败，请手动跳过错误片段`, 4e3).then(() => {
							this.trigger("skiperror", 0);
						});
						session.removeItem(countKey);
					}
				} else this.message.info("视频播放失败，链接资源可能失效了", 4e3);
			});
			this.on("pause", () => {
				this.hideControlsDebounced();
			});
			this.on("prev", () => {
				this.message.info("正在切换上一集");
			});
			this.on("next", () => {
				this.message.info("正在切换下一集");
			});
			const tryFixExitFullscreenOnInit = this.fixFullscreen();
			window.addEventListener("resize", () => {
				tryFixExitFullscreenOnInit();
			});
			this.on("enterfullscreen", () => {
				this.$videoWrapper.addClass("k-player-fullscreen");
				tryFixExitFullscreenOnInit();
			});
			this.on("exitfullscreen", () => {
				this.$videoWrapper.removeClass("k-player-fullscreen");
				this.toggleWidescreen(false);
				tryFixExitFullscreenOnInit();
			});
			this.on("volumechange", () => {
				this.configSaveToLocal("volume", this.plyr.volume);
			});
			this.on("timeupdate", () => {
				this.setCurrentTimeLogThrottled();
				this.$progress.find(".k-player-progress-current").css("width", (this.currentTime / this.plyr.duration || 0) * 100 + "%");
				this.$progress.find(".k-player-progress-buffer").css("width", this.plyr.buffered * 100 + "%");
			});
			this.on("ended", () => {
				if (this.localConfig.autoNext) this.trigger("next");
			});
			this.on("enterpictureinpicture", () => {
				this.setRandomTsuma();
				this.$pip.fadeIn();
			});
			this.on("leavepictureinpicture", () => {
				this.$pip.fadeOut();
			});
			window.addEventListener("message", (e) => {
				var _e$data;
				if (((_e$data = e.data) === null || _e$data === void 0 ? void 0 : _e$data.key) === "transportShortcut") {
					const data = e.data.data;
					const event = new KeyboardEvent("keydown", data);
					window.dispatchEvent(event);
				}
			});
			$(".plyr__controls button,.plyr__controls input").on("mouseleave", (e) => {
				e.target.blur();
			});
			const playerEl = document.querySelector(".plyr");
			playerEl.addEventListener("mousemove", () => {
				playerEl.classList.remove("plyr--hide-cursor");
				this.hideCursorDebounced();
				if (this.plyr.paused) this.hideControlsDebounced();
			});
			const controlsEl = document.querySelector(".plyr__controls");
			controlsEl.addEventListener("mouseenter", () => {
				this.isHoverControls = true;
			});
			controlsEl.addEventListener("mouseleave", () => {
				this.isHoverControls = false;
			});
			this.initInputEvent();
		}
		initInputEvent() {
			let timeId;
			const $dom = $("#k-player-wrapper input[type='range']");
			$dom.trigger("mouseup").off("mousedown").off("mouseup");
			$dom.on("mousedown", function() {
				clearInterval(timeId);
				let i = 0;
				timeId = window.setInterval(() => {
					$(this).removeClass().addClass(`shake-${i++ % 2}`);
				}, 100);
			});
			$dom.on("mouseup", function() {
				clearInterval(timeId);
				$(this).removeClass();
			});
		}
		on(event, callback) {
			if ([
				"prev",
				"next",
				"enterwidescreen",
				"exitwidescreen",
				"skiperror"
			].includes(event)) {
				if (!this.eventMap[event]) this.eventMap[event] = [];
				this.eventMap[event].push(callback);
			} else this.plyr.on(event, callback);
		}
		trigger(event, params) {
			(this.eventMap[event] || []).forEach((fn) => {
				fn(this, params);
			});
		}
		onDrop(callback) {
			this.$video.on("dragover", (e) => {
				e.preventDefault();
			}).on("drop", (_e) => {
				const e = _e.originalEvent;
				callback(e);
			});
		}
		injectSettings() {
			this.$settings = createSettingsHTML();
			this.$settings.find("[name=showPlayLarge]").prop("checked", this.localConfig.showPlayLarge).on("change", (e) => {
				const checked = e.target.checked;
				this.configSaveToLocal("showPlayLarge", checked);
				this.$videoWrapper.find(".plyr__control.plyr__control--overlaid").toggle(checked);
			});
			this.$videoWrapper.find(".plyr__control.plyr__control--overlaid").toggle(this.localConfig.showPlayLarge);
			this.$settings.find("[name=showSearchActions]").prop("checked", this.localConfig.showSearchActions).on("change", (e) => {
				const checked = e.target.checked;
				this.configSaveToLocal("showSearchActions", checked);
				this.$searchActions.toggle(checked);
			});
			this.$settings.find("[name=autoNext]").prop("checked", this.localConfig.autoNext).on("change", (e) => {
				const checked = e.target.checked;
				this.configSaveToLocal("autoNext", checked);
			});
			this.$settings.find("[name=showProgress]").prop("checked", this.localConfig.showProgress).on("change", (e) => {
				const checked = e.target.checked;
				this.configSaveToLocal("showProgress", checked);
				this.$progress.toggle(checked);
			});
			this.$progress.toggle(this.localConfig.showProgress);
			this.$settings.find("[name=autoplay]").prop("checked", this.localConfig.autoplay).on("change", (e) => {
				const checked = e.target.checked;
				this.configSaveToLocal("autoplay", checked);
				this.plyr.autoplay = checked;
			});
			this.$settings.find("[name=continuePlay]").prop("checked", this.localConfig.continuePlay).on("change", (e) => {
				const checked = e.target.checked;
				this.configSaveToLocal("continuePlay", checked);
			});
			this.$settings.insertAfter(".plyr__controls__item.plyr__volume");
		}
		configSaveToLocal(key, value) {
			this.localConfig[key] = value;
			gm.setItem(this.localConfigKey, this.localConfig);
		}
		injectSpeed() {
			this.$speed = createSpeedHTML();
			const speedItems = this.$speed.find(".k-speed-item");
			const localSpeed = this.localConfig.speed;
			speedItems.each((_, el) => {
				const speed = +el.dataset.speed;
				if (speed === localSpeed) el.classList.add("k-menu-active");
				$(el).on("click", () => {
					this.speed = speed;
				});
			});
			this.plyr.speed = localSpeed;
			this.$speed.find("#k-speed-text").text(localSpeed === 1 ? "倍速" : localSpeed + "x");
			this.$speed.insertBefore(".plyr__controls__item.plyr__volume");
		}
		injectNext() {
			$($("#plyr__next").html()).insertBefore(".plyr__controls__item.plyr__progress__container").on("click", () => {
				this.trigger("next");
			});
		}
		injectWideSreen() {
			$($("#plyr__widescreen").html()).insertBefore("[data-plyr=\"fullscreen\"]").on("click", () => {
				this.toggleWidescreen();
			});
		}
		fixFullscreen() {
			let isActive = screen.width === this.$wrapper.width() && screen.height === this.$wrapper.height();
			if (isActive) {
				$("[data-plyr=\"fullscreen\"]").addClass("plyr__control--pressed");
				this.$videoWrapper.addClass("k-player-fullscreen");
			}
			return () => {
				if (!isActive) return;
				isActive = false;
				$("[data-plyr=\"fullscreen\"]").removeClass("plyr__control--pressed");
				this.$videoWrapper.removeClass("k-player-fullscreen");
				try {
					this.plyr.fullscreen.exit();
				} catch (error) {}
			};
		}
		fixExitFullscreen() {
			$("[data-plyr=\"fullscreen\"]").removeClass("plyr__control--pressed");
			this.$videoWrapper.removeClass("k-player-fullscreen");
		}
		async injectSearchActions() {
			var _this5 = this;
			_this5.$searchActions = createSearchActionsHTML().toggle(_this5.localConfig.showSearchActions);
			_this5.$searchActions.insertBefore(_this5.$speed);
			const actions = await runtime.getSearchActions();
			if (actions.length === 0) return;
			_this5.$searchActions.find(".k-menu").append(actions.map(({ name, search }) => {
				return $(`<li class="k-menu-item k-speed-item">${name}</li>`).on("click", search);
			}));
		}
		async loadSubtitles(file) {
			var _this6 = this;
			const blob = await parseSubtitles(file);
			const nextTrack = _this6.plyr.currentTrack + 1;
			const track = document.createElement("track");
			track.kind = "subtitles";
			track.src = URL.createObjectURL(blob);
			track.srclang = "zh";
			_this6.media.append(track);
			await sleep(10);
			_this6.plyr.currentTrack = nextTrack;
		}
		toggleWidescreen(bool = !this.isWideScreen) {
			if (this.isWideScreen === bool) return;
			this.isWideScreen = bool;
			session.setItem(this.statusSessionKey, this.isWideScreen);
			if (this.isWideScreen) {
				this.wideScreenBodyStyles = $("body").css(["overflow"]);
				$("body").css("overflow", "hidden");
				this.$wrapper.addClass("k-player-widescreen");
				$(".plyr__widescreen").addClass("plyr__control--pressed");
			} else {
				$("body").css(this.wideScreenBodyStyles);
				this.$wrapper.removeClass("k-player-widescreen");
				$(".plyr__widescreen").removeClass("plyr__control--pressed");
			}
			this.trigger(this.isWideScreen ? "enterwidescreen" : "exitwidescreen");
		}
		get media() {
			return this.$video[0];
		}
		set src(src) {
			if (src.includes(".m3u8")) this.setM3u8(src);
			else this.setMp4(src);
		}
		get src() {
			return this.media.currentSrc;
		}
		/** 如果直接设置src满足不了需求，则使用这个方法去加载*/
		setM3u8(src) {
			if (hls_js.default.isSupported()) {
				const hls = new hls_js.default();
				hls.loadSource(src);
				hls.attachMedia(this.media);
			} else if (this.media.canPlayType("application/vnd.apple.mpegurl")) this.$video.attr("src", src);
			else throw new Error("不支持播放 hls 文件");
			this.afterChangeSrc();
		}
		setMp4(src) {
			this.$video.attr("src", src);
			this.afterChangeSrc();
		}
		afterChangeSrc() {
			this.isJumped = false;
			this.speed = this.localConfig.speed;
			this.plyr.volume = this.localConfig.volume;
		}
		set currentTime(value) {
			this.plyr.currentTime = value;
		}
		get currentTime() {
			return this.plyr.currentTime;
		}
		get speed() {
			return this.plyr.speed;
		}
		set speed(speed) {
			this.plyr.speed = speed;
			this.$speed.find(".k-speed-item").each((_, el) => {
				if (speed === +el.dataset.speed) el.classList.add("k-menu-active");
				else el.classList.remove("k-menu-active");
			});
			this.$speed.find("#k-speed-text").text(speed === 1 ? "倍速" : speed + "x");
			this.message.destroy();
			this.message.info(`视频速度：${speed}`);
			this.configSaveToLocal("speed", speed);
		}
		showError(text) {
			this.setRandomTsuma();
			this.$error.show().find(".k-player-error-info").text(text);
		}
		hideError() {
			this.$error.hide();
		}
		setRandomTsuma() {
			this.curentTsuma = ++this.curentTsuma % this.tsumaLength;
			this.$wrapper.find(".k-player-tsuma").attr("data-bg-idx", this.curentTsuma);
		}
		eventToParentWindow() {
			[
				"prev",
				"next",
				"enterwidescreen",
				"exitwidescreen",
				"skiperror",
				"progress",
				"playing",
				"play",
				"pause",
				"timeupdate",
				"volumechange",
				"seeking",
				"seeked",
				"ratechange",
				"ended",
				"enterfullscreen",
				"exitfullscreen",
				"captionsenabled",
				"captionsdisabled",
				"languagechange",
				"controlshidden",
				"controlsshown",
				"ready",
				"loadstart",
				"loadeddata",
				"loadedmetadata",
				"canplay",
				"canplaythrough",
				"stalled",
				"waiting",
				"emptied",
				"cuechange",
				"error"
			].forEach((key) => {
				this.on(key, () => {
					const video = this.media;
					const info = {
						width: video.videoWidth,
						height: video.videoHeight,
						currentTime: video.currentTime,
						src: video.src,
						duration: video.duration
					};
					window.parent.postMessage({
						key,
						video: info
					}, "*");
				});
			});
		}
	};
	_defineProperty(KPlayer, "plguinList", []);

//#endregion
//#region src/utils/request.ts
	function request(opts) {
		let { url, method, params } = opts;
		if (params) {
			let u = new URL(url);
			Object.keys(params).forEach((key) => {
				const value = params[key];
				if (value !== void 0 && value !== null) u.searchParams.set(key, params[key]);
			});
			url = u.toString();
		}
		return new Promise((resolve, reject) => {
			console.log("[agefans-enhance]", url);
			GM_xmlhttpRequest({
				url,
				method: method || "GET",
				responseType: "json",
				headers: opts.headers,
				onload: (res) => {
					console.log("[agefans-enhance]", res, res.response);
					resolve(res.response);
				},
				onerror: reject
			});
		});
	}

//#endregion
//#region src/player/plugins/danmaku/utils.ts
	function createStorage(storageKey) {
		function storage(key, value) {
			const store = local.getItem(storageKey, {});
			if (value) {
				store[key] = value;
				local.setItem(storageKey, store);
			} else return store[key];
		}
		return storage;
	}
	const storageAnimeName = createStorage("k-player-danmaku-anime-name-v3");
	const storageEpisodeName = createStorage("k-player-danmaku-episode-name-v3");
	function convert32ToHex(color) {
		return "#" + parseInt(color).toString(16);
	}
	function rangePercent(min, input, max) {
		input = Math.min(max, Math.max(min, input));
		return (input - min) / (max - min) * 100;
	}
	function addRangeListener(opts) {
		const { $dom, name, onInput, player, onChange } = opts;
		const $valueDom = $("<div style=\"width:45px;flex-shrink:0;text-align:right;white-space:nowrap;\"></div>");
		$valueDom.insertAfter($dom);
		const min = parseFloat($dom.attr("min"));
		const max = parseFloat($dom.attr("max"));
		const setStyle = () => {
			const value = parseFloat($dom.val());
			player.configSaveToLocal(name, value);
			onInput === null || onInput === void 0 || onInput(value);
			$valueDom.text((value * 100).toFixed(0) + "%");
			$dom.css("--value", rangePercent(min, value, max) + "%");
		};
		$dom.val(player.localConfig[name]);
		$dom.on("input", setStyle);
		$dom.on("change", () => {
			onChange === null || onChange === void 0 || onChange(parseFloat($dom.val()));
		});
		setStyle();
	}
	function getCheckboxGroupValue($dom) {
		const ret = [];
		$dom.each((_, el) => {
			if (el.checked) ret.push(el.value);
		});
		return ret;
	}
	function setCheckboxGroupValue($dom, value) {
		$dom.each((_, el) => {
			if (value.includes(el.value)) el.checked = true;
		});
	}
	function lockWrap(fn) {
		let lock = false;
		return (async (...args) => {
			if (lock) return;
			try {
				lock = true;
				await fn(...args);
			} finally {
				lock = false;
			}
		});
	}

//#endregion
//#region src/player/plugins/danmaku/apis.ts
	const headers = JSON.parse(atob("eyJYLUFwcElkIjoiaHZmNnB6dnhjbSIsIlgtQXBwU2VjcmV0IjoiSVpoY1VJYWtveEZhSzl4QkJESjlCczFPVTJzNGtLNXQifQ=="));
	const baseURL = "https://api.dandanplay.net";
	const client = (opts) => request(_objectSpread2(_objectSpread2({}, opts), {}, {
		headers,
		url: baseURL + opts.url
	}));
	function parseURLSource(url) {
		const hostname = new URL(url).hostname;
		if (hostname.match(/bilibili/i)) return "哔哩哔哩";
		if (hostname.match(/acfun/i)) return "AcFun";
		if (hostname.match(/tucao/i)) return "Tucao";
		if (hostname.match(/gamer/i)) return "巴哈姆特";
		return hostname.replace("www.", "").replace(".com", " ");
	}
	async function getComments(episodeId) {
		const [ddplay, extra] = await Promise.all([client({
			url: `/api/v2/comment/${episodeId}`,
			params: { chConvert: 1 }
		}), (async () => {
			const relatedRes = await client({ url: `/api/v2/related/${episodeId}` });
			if (!relatedRes.success) return [];
			return await Promise.all(relatedRes.relateds.map(async (o) => {
				const res = await client({
					url: `/api/v2/extcomment`,
					params: {
						url: o.url,
						chConvert: 1
					}
				});
				return {
					source: parseURLSource(o.url),
					url: o.url,
					shift: o.shift,
					comments: res.comments
				};
			}));
		})()]);
		return [{
			source: "弹弹Play",
			comments: ddplay.comments,
			url: "",
			shift: 0
		}, ...extra].map(({ source, comments, url, shift }) => {
			return comments.map((o) => {
				const [time, type, color, uid] = o.p.split(",");
				return {
					mode: {
						1: "rtl",
						4: "bottom",
						5: "top"
					}[type] || "rtl",
					text: o.m,
					time: parseFloat(time) + shift,
					style: { color: convert32ToHex(color) },
					user: {
						source,
						id: uid,
						url
					}
				};
			});
		}).flat().sort((a, b) => a.time - b.time);
	}
	async function queryAnimes(anime) {
		const res = await client({
			url: `/api/v2/search/anime`,
			params: { keyword: anime }
		});
		if (!res.success) throw new Error(res.errorMessage);
		const nameCountMap = /* @__PURE__ */ new Map();
		res.animes.forEach((o) => {
			nameCountMap.set(o.animeTitle, (nameCountMap.get(o.animeTitle) || 0) + 1);
		});
		return res.animes.map((o) => ({
			id: o.bangumiId,
			name: nameCountMap.get(o.animeTitle) > 1 ? `${o.animeTitle}(${o.typeDescription})` : o.animeTitle
		}));
	}
	const queryEpisodes = memoize(async function(animeId) {
		const res = await client({ url: `/api/v2/bangumi/${animeId}` });
		if (!res.success) {
			setTimeout(() => {
				var _queryEpisodes$cache$, _queryEpisodes$cache;
				return (_queryEpisodes$cache$ = (_queryEpisodes$cache = queryEpisodes.cache).clear) === null || _queryEpisodes$cache$ === void 0 ? void 0 : _queryEpisodes$cache$.call(_queryEpisodes$cache);
			}, 100);
			throw new Error(res.errorMessage);
		}
		return res.bangumi.episodes.map((o) => ({
			id: o.episodeId,
			name: o.episodeTitle
		}));
	});

//#endregion
//#region src/player/plugins/danmaku/danmakuList.ts
	function createDanmakuList(player, getComments, refreshDanmaku) {
		$("#k-player-danmaku-search-form .open-danmaku-list").on("click", () => {
			const comments = getComments();
			if (!comments || !comments.length) return;
			const $root = $(`
      <div class="k-player-danmaku-list-wrapper">
        <div class="k-player-danmaku-list-source-filter">
          <div>来源：</div>
          <div class="k-player-danmaku-list-source"></div>
        </div>
      
        <div class="k-player-danmaku-list-table-wrapper">
          <div class="k-player-danmaku-list-table-content">
            <table class="k-table k-player-danmaku-list-table">
              <thead>
                <tr>
                  <th>时间</th>
                  <th>内容</th>
                  <th>来源</th>
                </tr>
              </thead>
              <tbody>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `);
			const $source = $root.find(".k-player-danmaku-list-source");
			const $wrapper = $root.find(".k-player-danmaku-list-table-wrapper");
			const $content = $root.find(".k-player-danmaku-list-table-content");
			const $table = $root.find(".k-player-danmaku-list-table");
			let i = 0;
			let end = 100;
			const render = () => {
				if (i >= comments.length) {
					$content.height("");
					return;
				}
				$root.find("tbody").append(comments.slice(i, end).map((cmt) => `
        <tr data-source="${cmt.user.source}">
          <td>${parseTime(cmt.time)}</td>
          <td>${cmt.text}</td>
          <td>${cmt.user.url ? `<a href="${cmt.user.url}" target="_blank">${cmt.user.source}</a>` : cmt.user.source}</td>
        </tr>`).join(""));
				i = end;
			};
			render();
			modal({
				title: "弹幕列表",
				content: $root,
				className: "k-player-danmaku-list",
				afterClose: () => {
					refreshDanmaku();
				}
			});
			const sourceCountMap = comments.reduce((map, cmt) => {
				var _map$source;
				const source = cmt.user.source;
				(_map$source = map[source]) !== null && _map$source !== void 0 || (map[source] = 0);
				map[source]++;
				return map;
			}, {});
			Object.entries(sourceCountMap).forEach(([source, count]) => {
				const isDisabled = player.localConfig.danmakuSourceDisabledList.includes(source);
				const percent = (count / comments.length * 100).toFixed(2);
				$(`<label class="k-player-danmaku-list-source-item k-capsule">
          <input hidden type="checkbox" value="${source}"/>
          <div title="${source}有${count}条弹幕">${source}(${percent}%)</div>
        </label>`).appendTo($source).find("input").prop("checked", !isDisabled).on("change", (e) => {
					let next = [...player.localConfig.danmakuSourceDisabledList];
					if (e.currentTarget.checked) next = next.filter((src) => src !== source);
					else next.push(source);
					player.configSaveToLocal("danmakuSourceDisabledList", next);
				});
			});
			const itemHeight = $root.find("thead tr").height();
			$content.height(itemHeight * (comments.length + 1));
			$wrapper.on("scroll", (e) => {
				const dom = e.currentTarget;
				const height = dom.scrollTop + dom.clientHeight + 1e3;
				if ($table.height() < height) {
					end = Math.ceil(height / itemHeight);
					render();
				}
			});
		});
	}

//#endregion
//#region src/utils/parseToJSON.ts
	function parseToJSON(raw) {
		return new Promise((resolve, reject) => {
			const blob = new Blob([raw], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			fetch(url).then((r) => r.json()).then(resolve).catch(reject).finally(() => {
				URL.revokeObjectURL(url);
			});
		});
	}

//#endregion
//#region src/player/plugins/danmaku/filter.ts
	function createFilter(player, refreshDanmaku) {
		const $filter = $("#k-player-danmaku-filter-form");
		$("#k-player-danmaku-filter-import").on("click", () => {
			modal({
				title: "导入B站屏蔽设定",
				content: `
      <p>1. 随便点开一个视频，右侧弹幕列表打开屏蔽设定，对屏蔽列表右键，导出xml或json文件。</p>
      <p>2. 点击下面【开始导入】按钮，选择刚下载的xml或json文件</p>
      `,
				okText: "开始导入",
				onOk: importBiliSettings
			});
		});
		function importBiliSettings() {
			var _$import$get;
			const $import = $("<input type=\"file\" style=\"display:none\" accept=\".xml,.json\"/>");
			$import.on("change", (e) => {
				var _e$target$files;
				const file = (_e$target$files = e.target.files) === null || _e$target$files === void 0 ? void 0 : _e$target$files[0];
				$import.remove();
				if (!file) return;
				const fd = new FileReader();
				fd.onload = () => {
					const result = fd.result;
					if (typeof result === "string") {
						if (file.name.endsWith(".xml")) importBiliXML(result);
						if (file.name.endsWith(".json")) importBiliJSON(result);
					}
				};
				fd.readAsText(file);
			});
			$import.appendTo("body");
			(_$import$get = $import.get(0)) === null || _$import$get === void 0 || _$import$get.click();
		}
		function importBiliXML(xml) {
			mergeRules($(xml).find("item[enabled=\"true\"]").map((_, el) => el.textContent).get().filter((t) => /^(t|r)=/.test(t)).map((t) => t.replace(/^(t|r)=/, "")));
		}
		async function importBiliJSON(jsonStr) {
			try {
				mergeRules((await parseToJSON(jsonStr)).filter((o) => o.opened && o.type !== 2).map((o) => o.type === 1 ? `/${o.filter}/` : o.filter));
			} catch (error) {
				player.message.info("导入失败，JSON 格式有误", 3e3);
			}
		}
		function mergeRules(rules) {
			const mergedRules = new Set([...player.localConfig.danmakuFilter, ...rules]);
			player.message.info(`导入 ${mergedRules.size - player.localConfig.danmakuFilter.length} 条规则`);
			player.configSaveToLocal("danmakuFilter", [...mergedRules]);
			refreshDanmaku();
			refreshFilterDom();
		}
		const $input = $filter.find("[name=\"filter-input\"]");
		$input.on("keypress", (e) => {
			if (e.key === "Enter") addFilter($input.val());
		});
		function refreshFilterDom() {
			const filters = player.localConfig.danmakuFilter;
			let html = "";
			filters.forEach((filter, idx) => {
				html += `<div class="ft-row">
    <div class="ft-content">${filter}</div>
    <div class="ft-op"><a key="delete" data-idx="${idx}">删除</a></div>
    </div>`;
			});
			$filter.find(".ft-body").empty().append(html);
			$filter.find("[key=delete]").on("click", (e) => {
				deleteFilter(parseInt($(e.target).attr("data-idx")));
			});
			$filter.find("#filter-count").text(filters.length);
		}
		function deleteFilter(idx) {
			player.localConfig.danmakuFilter.splice(idx, 1);
			player.configSaveToLocal("danmakuFilter", player.localConfig.danmakuFilter);
			refreshDanmaku();
			refreshFilterDom();
		}
		function addFilter(filter) {
			const filters = player.localConfig.danmakuFilter;
			$input.val("");
			if (!filter || filters.includes(filter)) return;
			if (/^\/.*\/$/.test(filter)) try {
				new RegExp(filter.slice(1, -1));
			} catch (error) {
				return;
			}
			filters.push(filter);
			player.configSaveToLocal("danmakuFilter", filters);
			refreshFilterDom();
			refreshDanmaku();
		}
		refreshFilterDom();
	}

//#endregion
//#region src/player/plugins/danmaku/types.ts
	let Commands$1 = /* @__PURE__ */ function(Commands) {
		Commands["danmakuSwitch"] = "switchDanmaku";
		Commands["danmakuSyncBack"] = "danmakuSyncBack";
		Commands["danmakuSyncForward"] = "danmakuSyncForward";
		Commands["danmakuSyncRestore"] = "danmakuSyncRestore";
		return Commands;
	}({});

//#endregion
//#region src/player/plugins/danmaku/html.ts
	var DanmakuElements = class {
		constructor(player) {
			this.player = player;
			_defineProperty(this, "$danmakuOverlay", tabs([
				{
					name: "搜索",
					content: `<div id="k-player-danmaku-search-form">
      <label>
        <span>搜索番剧名称</span>
        <input type="text" id="animeName" class="k-input" />
      </label>
      <div style="min-height:24px; padding-top:4px">
        <span id="tips"></span>
      </div>
      <label>
        <span>番剧名称</span>
        <select id="animes" class="k-select"></select>
      </label>
      <label>
        <span>章节</span>
        <select id="episodes" class="k-select"></select>
      </label>
      <label>
        <span class="open-danmaku-list">
          <span>弹幕列表</span><small data-id="count"></small>
        </span>
      </label>
      
      <span class="specific-thanks">弹幕服务由 弹弹play 提供</span>
    </div>`
				},
				{
					name: "设置",
					content: `
    <div id="k-player-danmaku-setting-form" class="k-settings-list">
      <label class="k-settings-item">
        <input type="checkbox" name="showDanmaku" />
        <span>显示弹幕(<k-shortcuts-tip command="${Commands$1.danmakuSwitch}"></k-shortcuts-tip>)</span>
        </label>
      <label class="k-settings-item">
        <input type="checkbox" name="showPbp" />
        <span>显示高能进度条</span>
      </label>
      <div class="k-settings-item">
        <label class="k-settings-item" title="启用后合并显示重复的弹幕">
          <input type="checkbox" name="danmakuMerge" />
          <span>合并弹幕</span>
        </label>
        <label class="k-settings-item" title="启用后当弹幕过多的时候可以重叠显示">
          <input type="checkbox" name="danmakuOverlap" />
          <span>重叠弹幕</span>
        </label>
      </div>
      <label class="k-settings-item">
        <span>透明度&#12288;</span>
        <input type="range" name="opacity" step="0.01" min="0" max="1" />
      </label>
      <label class="k-settings-item">
        <span>弹幕大小</span>
        <input type="range" name="danmakuFontSize" step="0.01" min="0.5" max="2" />
      </label>
      <label class="k-settings-item">
        <span>弹幕速度</span>
        <input type="range" name="danmakuSpeed" step="0.01" min="0.5" max="1.5" />
      </label>
      <label class="k-settings-item" title="基准为 24 分钟 3000 条弹幕">
        <span>弹幕密度</span>
        <input type="range" name="danmakuDensity" step="0.01" min="0.5" max="2" />
      </label>
      <label class="k-settings-item">
        <span>弹幕区域</span>
        <input type="range" name="danmakuScrollAreaPercent" step="0.01" min="0.25" max="1" />
      </label>
      <div class="k-settings-item" style="height:24px">
        <div>弹幕类型</div>
        <label class="k-settings-item" title="顶部弹幕">
          <input type="checkbox" name="danmakuMode" value="top"/>
          <span>顶</span>
        </label>
        <label class="k-settings-item" title="底部弹幕">
          <input type="checkbox" name="danmakuMode" value="bottom"/>
          <span>底</span>
        </label>
        <label class="k-settings-item" title="彩色弹幕">
          <input type="checkbox" name="danmakuMode" value="color" />
          <span>彩</span>
        </label>
      </div>
    </div>
    `
				},
				{
					name: "过滤",
					content: `
    <div id="k-player-danmaku-filter-form">
      <div class="ft-input-wrapper">
        <div>
          <input type="text" name="filter-input" placeholder="可正则“/”开头“/”结尾" class="k-input"/>
        </div>
        <label id="k-player-danmaku-filter-import" title="导入B站弹幕过滤设置">
          导入
        </label>
      </div>

      <div id="k-player-danmaku-filter-table">
        <div class="ft-row" style="pointer-events:none;">
          <div class="ft-content">内容(<span id="filter-count"></span>)</div>
          <div class="ft-op">操作</div>
        </div>
        <div class="ft-body"></div>
      </div>
    </div>
    `
				},
				{
					name: "日志",
					content: `
    <div id="k-player-danmaku-log"></div>
    `
				}
			]));
			_defineProperty(this, "$danmakuSwitch", $(`
<button
  class="plyr__controls__item plyr__control plyr__switch-danmaku plyr__custom"
  type="button"
  data-plyr="switch-danmaku"
  aria-label="switch-danmaku"
  >
  <svg class="icon--not-pressed" focusable="false" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="bpx-svg-sprite-danmu-off"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.085 4.891l-.999-1.499a1.008 1.008 0 011.679-1.118l1.709 2.566c.54-.008 1.045-.012 1.515-.012h.13c.345 0 .707.003 1.088.007l1.862-2.59a1.008 1.008 0 011.637 1.177l-1.049 1.46c.788.02 1.631.046 2.53.078 1.958.069 3.468 1.6 3.74 3.507.088.613.13 2.158.16 3.276l.001.027c.01.333.017.63.025.856a.987.987 0 01-1.974.069c-.008-.23-.016-.539-.025-.881v-.002c-.028-1.103-.066-2.541-.142-3.065-.143-1.004-.895-1.78-1.854-1.813-2.444-.087-4.466-.13-6.064-.131-1.598 0-3.619.044-6.063.13a2.037 2.037 0 00-1.945 1.748c-.15 1.04-.225 2.341-.225 3.904 0 1.874.11 3.474.325 4.798.154.949.95 1.66 1.91 1.708a97.58 97.58 0 005.416.139.988.988 0 010 1.975c-2.196 0-3.61-.047-5.513-.141A4.012 4.012 0 012.197 17.7c-.236-1.446-.351-3.151-.351-5.116 0-1.64.08-3.035.245-4.184A4.013 4.013 0 015.92 4.96c.761-.027 1.483-.05 2.164-.069zm4.436 4.707h-1.32v4.63h2.222v.848h-2.618v1.078h2.431a5.01 5.01 0 013.575-3.115V9.598h-1.276a8.59 8.59 0 00.748-1.42l-1.089-.384a14.232 14.232 0 01-.814 1.804h-1.518l.693-.308a8.862 8.862 0 00-.814-1.408l-1.045.352c.297.396.572.847.825 1.364zm-4.18 3.564l.154-1.485h1.98V8.289h-3.2v.979h2.067v1.43H7.483l-.308 3.454h2.277c0 1.166-.044 1.925-.12 2.277-.078.352-.386.528-.936.528-.308 0-.616-.022-.902-.055l.297 1.067.062.004c.285.02.551.04.818.04 1.001-.066 1.562-.418 1.694-1.056.11-.638.176-1.903.176-3.795h-2.2zm7.458.11v-.858h-1.254v.858H15.8zm-2.376-.858v.858h-1.199v-.858h1.2zm-1.199-.946h1.2v-.902h-1.2v.902zm2.321 0v-.902H15.8v.902h-1.254zm3.517 10.594a4 4 0 100-8 4 4 0 000 8zm-.002-1.502a2.5 2.5 0 01-2.217-3.657l3.326 3.398a2.49 2.49 0 01-1.109.259zm2.5-2.5c0 .42-.103.815-.286 1.162l-3.328-3.401a2.5 2.5 0 013.614 2.239z"></path></svg>
  <svg class="icon--pressed" focusable="false" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="bpx-svg-sprite-danmu-on"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.989 4.828c-.47 0-.975.004-1.515.012l-1.71-2.566a1.008 1.008 0 00-1.678 1.118l.999 1.5c-.681.018-1.403.04-2.164.068a4.013 4.013 0 00-3.83 3.44c-.165 1.15-.245 2.545-.245 4.185 0 1.965.115 3.67.35 5.116a4.012 4.012 0 003.763 3.363l.906.046c1.205.063 1.808.095 3.607.095a.988.988 0 000-1.975c-1.758 0-2.339-.03-3.501-.092l-.915-.047a2.037 2.037 0 01-1.91-1.708c-.216-1.324-.325-2.924-.325-4.798 0-1.563.076-2.864.225-3.904.14-.977.96-1.713 1.945-1.747 2.444-.087 4.465-.13 6.063-.131 1.598 0 3.62.044 6.064.13.96.034 1.71.81 1.855 1.814.075.524.113 1.962.141 3.065v.002c.01.342.017.65.025.88a.987.987 0 101.974-.068c-.008-.226-.016-.523-.025-.856v-.027c-.03-1.118-.073-2.663-.16-3.276-.273-1.906-1.783-3.438-3.74-3.507-.9-.032-1.743-.058-2.531-.078l1.05-1.46a1.008 1.008 0 00-1.638-1.177l-1.862 2.59c-.38-.004-.744-.007-1.088-.007h-.13zm.521 4.775h-1.32v4.631h2.222v.847h-2.618v1.078h2.618l.003.678c.36.026.714.163 1.01.407h.11v-1.085h2.694v-1.078h-2.695v-.847H16.8v-4.63h-1.276a8.59 8.59 0 00.748-1.42L15.183 7.8a14.232 14.232 0 01-.814 1.804h-1.518l.693-.308a8.862 8.862 0 00-.814-1.408l-1.045.352c.297.396.572.847.825 1.364zm-4.18 3.564l.154-1.485h1.98V8.294h-3.2v.98H9.33v1.43H7.472l-.308 3.453h2.277c0 1.166-.044 1.925-.12 2.277-.078.352-.386.528-.936.528-.308 0-.616-.022-.902-.055l.297 1.067.062.005c.285.02.551.04.818.04 1.001-.067 1.562-.419 1.694-1.057.11-.638.176-1.903.176-3.795h-2.2zm7.458.11v-.858h-1.254v.858h1.254zm-2.376-.858v.858h-1.199v-.858h1.2zm-1.199-.946h1.2v-.902h-1.2v.902zm2.321 0v-.902h1.254v.902h-1.254z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M22.846 14.627a1 1 0 00-1.412.075l-5.091 5.703-2.216-2.275-.097-.086-.008-.005a1 1 0 00-1.322 1.493l2.963 3.041.093.083.007.005c.407.315 1 .27 1.354-.124l5.81-6.505.08-.102.005-.008a1 1 0 00-.166-1.295z" fill="var(--color)"></path></svg>
  <span class="label--not-pressed plyr__tooltip">开启弹幕(<k-shortcuts-tip command="${Commands$1.danmakuSwitch}"></k-shortcuts-tip>)</span>
  <span class="label--pressed plyr__tooltip">关闭弹幕(<k-shortcuts-tip command="${Commands$1.danmakuSwitch}"></k-shortcuts-tip>)</span>
</button>`));
			_defineProperty(this, "$danmakuSettingButton", $(`<button class="plyr__controls__item plyr__control" type="button" data-plyr="danmaku-setting">
<svg class="icon--not-pressed" focusable="false" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" id="bpx-svg-sprite-new-danmu-setting"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.645 4.881l1.06-1.473a.998.998 0 10-1.622-1.166L13.22 4.835a110.67 110.67 0 00-1.1-.007h-.131c-.47 0-.975.004-1.515.012L8.783 2.3A.998.998 0 007.12 3.408l.988 1.484c-.688.019-1.418.042-2.188.069a4.013 4.013 0 00-3.83 3.44c-.165 1.15-.245 2.545-.245 4.185 0 1.965.115 3.67.35 5.116a4.012 4.012 0 003.763 3.363c1.903.094 3.317.141 5.513.141a.988.988 0 000-1.975 97.58 97.58 0 01-5.416-.139 2.037 2.037 0 01-1.91-1.708c-.216-1.324-.325-2.924-.325-4.798 0-1.563.076-2.864.225-3.904.14-.977.96-1.713 1.945-1.747 2.444-.087 4.465-.13 6.063-.131 1.598 0 3.62.044 6.064.13.96.034 1.71.81 1.855 1.814.075.524.113 1.962.141 3.065v.002c.005.183.01.07.014-.038.004-.096.008-.189.011-.081a.987.987 0 101.974-.069c-.004-.105-.007-.009-.011.09-.002.056-.004.112-.007.135l-.002.01a.574.574 0 01-.005-.091v-.027c-.03-1.118-.073-2.663-.16-3.276-.273-1.906-1.783-3.438-3.74-3.507-.905-.032-1.752-.058-2.543-.079zm-3.113 4.703h-1.307v4.643h2.2v.04l.651-1.234c.113-.215.281-.389.482-.509v-.11h.235c.137-.049.283-.074.433-.074h1.553V9.584h-1.264a8.5 8.5 0 00.741-1.405l-1.078-.381c-.24.631-.501 1.23-.806 1.786h-1.503l.686-.305c-.228-.501-.5-.959-.806-1.394l-1.034.348c.294.392.566.839.817 1.35zm-1.7 5.502h2.16l-.564 1.068h-1.595v-1.068zm-2.498-1.863l.152-1.561h1.96V8.289H7.277v.969h2.048v1.435h-1.84l-.306 3.51h2.254c0 1.155-.043 1.906-.12 2.255-.076.348-.38.523-.925.523-.305 0-.61-.022-.893-.055l.294 1.056.061.005c.282.02.546.039.81.039.991-.065 1.547-.414 1.677-1.046.11-.631.175-1.883.175-3.757H8.334zm5.09-.8v.85h-1.188v-.85h1.187zm-1.188-.955h1.187v-.893h-1.187v.893zm2.322.007v-.893h1.241v.893h-1.241zm.528 2.757a1.26 1.26 0 011.087-.627l4.003-.009a1.26 1.26 0 011.094.63l1.721 2.982c.226.39.225.872-.001 1.263l-1.743 3a1.26 1.26 0 01-1.086.628l-4.003.009a1.26 1.26 0 01-1.094-.63l-1.722-2.982a1.26 1.26 0 01.002-1.263l1.742-3zm1.967.858a1.26 1.26 0 00-1.08.614l-.903 1.513a1.26 1.26 0 00-.002 1.289l.885 1.492c.227.384.64.62 1.086.618l2.192-.005a1.26 1.26 0 001.08-.615l.904-1.518a1.26 1.26 0 00.001-1.288l-.884-1.489a1.26 1.26 0 00-1.086-.616l-2.193.005zm2.517 2.76a1.4 1.4 0 11-2.8 0 1.4 1.4 0 012.8 0z"></path></svg>
<span class="label--not-pressed plyr__tooltip">弹幕设置</span>
</button>`));
			_defineProperty(this, "$danmaku", popover({
				target: this.$danmakuSettingButton,
				overlay: this.$danmakuOverlay,
				trigger: "click",
				onVisibleChange: (visible) => {
					var _this$player$plyr$ele;
					(_this$player$plyr$ele = this.player.plyr.elements.container) === null || _this$player$plyr$ele === void 0 || _this$player$plyr$ele.classList.toggle("k-player-controls-force-show", visible);
					if (visible) {
						var _this$player$plyr$ele2;
						const dom = document.createElement("div");
						dom.style.cssText = "position: absolute; inset: 0; z-index: 10;";
						dom.className = "k-player-danmaku-overlay-video-prevent-click";
						dom.addEventListener("click", (e) => {
							e.stopPropagation();
						});
						(_this$player$plyr$ele2 = this.player.plyr.elements.container) === null || _this$player$plyr$ele2 === void 0 || _this$player$plyr$ele2.prepend(dom);
					} else {
						var _this$player$plyr$ele3;
						(_this$player$plyr$ele3 = this.player.plyr.elements.container) === null || _this$player$plyr$ele3 === void 0 || (_this$player$plyr$ele3 = _this$player$plyr$ele3.querySelector(".k-player-danmaku-overlay-video-prevent-click")) === null || _this$player$plyr$ele3 === void 0 || _this$player$plyr$ele3.remove();
					}
				}
			}));
			_defineProperty(this, "$danmakuContainer", $("<div id=\"k-player-danmaku\"></div>"));
			_defineProperty(this, "$pbp", $(`
<svg
  viewBox="0 0 1000 100"
  preserveAspectRatio="none"
  id="k-player-pbp"
>
  <defs>
    <clipPath id="k-player-pbp-curve-path" clipPathUnits="userSpaceOnUse">
      <path d=""></path>
    </clipPath>
  </defs>

  <g
    fill-opacity="0.2"
    clip-path="url(#k-player-pbp-curve-path)"
  >
    <rect x="0" y="0" width="100%" height="100%" fill="rgb(255,255,255)"></rect>
    <rect id="k-player-pbp-played-path" x="0" y="0" width="0" height="100%" fill="currentColor"></rect>
  </g>
</svg>
`));
			_defineProperty(this, "$animeName", this.$danmaku.find("#animeName"));
			_defineProperty(this, "$animes", this.$danmaku.find("#animes"));
			_defineProperty(this, "$episodes", this.$danmaku.find("#episodes"));
			_defineProperty(this, "$openDanmakuList", this.$danmaku.find(".open-danmaku-list"));
			_defineProperty(this, "$tips", this.$danmaku.find("#tips"));
			_defineProperty(this, "$showDanmaku", this.$danmaku.find("[name='showDanmaku']"));
			_defineProperty(this, "$showPbp", this.$danmaku.find("[name='showPbp']"));
			_defineProperty(this, "$danmakuMerge", this.$danmaku.find("[name='danmakuMerge']"));
			_defineProperty(this, "$danmakuOverlap", this.$danmaku.find("[name='danmakuOverlap']"));
			_defineProperty(this, "$opacity", this.$danmaku.find("[name='opacity']"));
			_defineProperty(this, "$danmakuSpeed", this.$danmaku.find("[name='danmakuSpeed']"));
			_defineProperty(this, "$danmakuFontSize", this.$danmaku.find("[name='danmakuFontSize']"));
			_defineProperty(this, "$danmakuDensity", this.$danmaku.find("[name='danmakuDensity']"));
			_defineProperty(this, "$danmakuScrollAreaPercent", this.$danmaku.find("[name='danmakuScrollAreaPercent']"));
			_defineProperty(this, "$danmakuMode", this.$danmaku.find("[name='danmakuMode']"));
			_defineProperty(this, "$log", this.$danmakuOverlay.find("#k-player-danmaku-log"));
			this.$danmakuOverlay.attr("id", "k-player-danmaku-overlay");
		}
	};

//#endregion
//#region src/player/plugins/danmaku/index.scss
	injectStyle("#k-player-danmaku {\n  position: absolute;\n  left: 0;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  z-index: 10;\n  pointer-events: none;\n  font-family: system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Oxygen, Ubuntu, Cantarell, \"Open Sans\", \"Helvetica Neue\", sans-serif;\n}\n#k-player-danmaku-notification {\n  line-height: 1.6;\n}\n#k-player-danmaku-notification .title {\n  text-align: center;\n  font-weight: 500;\n  font-size: 16px;\n}\n#k-player-danmaku-notification img {\n  width: 40%;\n  display: block;\n  margin: 0 auto 8px;\n}\n#k-player-danmaku-notification a {\n  color: var(--k-player-primary-color);\n}\n#k-player-danmaku-notification p {\n  margin: 0;\n}\n#k-player-danmaku-notification p:not(:last-child) {\n  margin-bottom: 8px;\n}\n#k-player-danmaku .danmaku {\n  font-size: calc(var(--danmaku-font-size, 24px) * var(--danmaku-font-size-scale, 1));\n  font-family: SimHei, \"Microsoft JhengHei\", Arial, Helvetica, sans-serif;\n  font-weight: bold;\n  text-shadow: black 1px 0px 1px, black 0px 1px 1px, black 0px -1px 1px, black -1px 0px 1px;\n  line-height: 1.3;\n}\n@media (max-width: 576px) {\n  #k-player-danmaku .danmaku {\n    --danmaku-font-size: 16px;\n  }\n}\n#k-player-danmaku-overlay {\n  width: 210px;\n}\n#k-player-danmaku-search-form > * {\n  font-size: 14px;\n  box-sizing: border-box;\n  text-align: left;\n}\n#k-player-danmaku-search-form input,\n#k-player-danmaku-search-form select {\n  display: block;\n  margin-top: 4px;\n  width: 100%;\n}\n#k-player-danmaku-search-form label {\n  display: block;\n}\n#k-player-danmaku-search-form label span {\n  line-height: 1.4;\n}\n#k-player-danmaku-search-form label + label {\n  margin-top: 8px;\n}\n#k-player-danmaku-search-form .open-danmaku-list {\n  cursor: pointer;\n  transition: color 0.15s;\n}\n#k-player-danmaku-search-form .open-danmaku-list:hover * {\n  color: var(--k-player-primary-color);\n}\n#k-player-danmaku-search-form .specific-thanks {\n  color: #757575;\n  font-size: 12px;\n  position: absolute;\n  left: 8px;\n  bottom: 8px;\n  user-select: none;\n}\n#k-player-danmaku-setting-form {\n  padding: 0;\n}\n#k-player-danmaku-setting-form input {\n  margin: 0;\n}\n#k-player-danmaku-filter-form {\n  padding: 0;\n}\n#k-player-danmaku-filter-form .ft-input-wrapper {\n  display: flex;\n  align-items: center;\n}\n#k-player-danmaku-filter-form .ft-input-wrapper > div {\n  flex: 1;\n}\n#k-player-danmaku-filter-form .ft-input-wrapper > div input {\n  width: 100%;\n}\n#k-player-danmaku-filter-form .ft-input-wrapper label {\n  margin-left: 8px;\n  border: 0;\n  color: white;\n  cursor: pointer;\n  transition: color 0.15s;\n  white-space: nowrap;\n  user-select: none;\n}\n#k-player-danmaku-filter-form .ft-input-wrapper label:hover {\n  color: var(--k-player-primary-color);\n}\n#k-player-danmaku-filter-table {\n  margin-top: 8px;\n}\n#k-player-danmaku-filter-table .ft-body {\n  height: 200px;\n  overflow: auto;\n}\n#k-player-danmaku-filter-table .ft-body::-webkit-scrollbar {\n  display: none;\n}\n#k-player-danmaku-filter-table .ft-row {\n  display: flex;\n  border-radius: 4px;\n  transition: all 0.15s;\n}\n#k-player-danmaku-filter-table .ft-row:hover {\n  background: var(--k-player-background-highlight);\n}\n#k-player-danmaku-filter-table .ft-content {\n  padding: 4px 8px;\n  flex: 1px;\n  min-width: 0;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n#k-player-danmaku-filter-table .ft-op {\n  flex-shrink: 0;\n  padding: 4px 8px;\n}\n#k-player-danmaku-filter-table a {\n  color: white;\n  cursor: pointer;\n  transition: color 0.15s;\n  user-select: none;\n}\n#k-player-danmaku-filter-table a:hover {\n  color: var(--k-player-primary-color);\n}\n#k-player-danmaku-log {\n  position: absolute;\n  inset: 0;\n  padding: 8px;\n  overflow: auto;\n}\n#k-player-danmaku-log .k-player-danmaku-log-item {\n  border-bottom: 1px solid rgba(255, 255, 255, 0.2);\n  padding-bottom: 4px;\n  margin-bottom: 4px;\n  line-height: 1.4;\n}\n#k-player-danmaku-log .k-player-danmaku-log-content {\n  padding: 4px 8px;\n  border-radius: 4px;\n  background: rgba(255, 255, 255, 0.2);\n  margin-top: 4px;\n}\n#k-player-danmaku-log .k-player-danmaku-log-code {\n  white-space: pre-wrap;\n  word-wrap: break-word;\n  display: -webkit-box;\n  -webkit-line-clamp: 3;\n  line-clamp: 3;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  max-height: 60px;\n  font-size: 12px;\n}\n\n#k-player-pbp {\n  position: absolute;\n  top: -17px;\n  height: 28px;\n  -webkit-appearance: none;\n  appearance: none;\n  left: 0;\n  position: absolute;\n  margin-left: calc(var(--plyr-range-thumb-height, 13px) * -0.5);\n  margin-right: calc(var(--plyr-range-thumb-height, 13px) * -0.5);\n  width: calc(100% + var(--plyr-range-thumb-height, 13px));\n  pointer-events: none;\n}\n\n#k-player-pbp-played-path {\n  color: var(--k-player-primary-color);\n}\n\n.plyr__controls__item.plyr__progress__container:hover #k-player-pbp {\n  top: -18px;\n}\n\n.plyr__switch-danmaku .icon--pressed {\n  --color: var(--k-player-primary-color);\n  transition: 0.3s all ease;\n}\n\n.plyr__switch-danmaku:hover .icon--pressed {\n  --color: white;\n}\n\n.k-popover-active .plyr__tooltip {\n  display: none;\n}\n\n.k-player-controls-force-show.plyr .plyr__controls {\n  opacity: 1;\n  pointer-events: auto;\n  transform: translateY(0);\n}\n\n.k-player-danmaku-list * {\n  box-sizing: border-box;\n  font-size: 14px;\n  line-height: normal;\n  font-family: system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Oxygen, Ubuntu, Cantarell, \"Open Sans\", \"Helvetica Neue\", sans-serif;\n}\n.k-player-danmaku-list .k-modal-body {\n  padding: 0;\n}\n.k-player-danmaku-list-wrapper {\n  height: 500px;\n  max-height: 80vh;\n  display: flex;\n  flex-direction: column;\n}\n.k-player-danmaku-list-source-filter {\n  display: flex;\n  align-items: center;\n  white-space: nowrap;\n  padding: 16px;\n}\n.k-player-danmaku-list-source {\n  flex: 1;\n  min-width: 0;\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n}\n.k-player-danmaku-list-table-wrapper {\n  flex: 1;\n  min-height: 0;\n  overflow-y: scroll;\n  position: relative;\n}\n.k-player-danmaku-list-table-wrapper::-webkit-scrollbar {\n  width: 8px;\n}\n.k-player-danmaku-list-table-wrapper::-webkit-scrollbar-thumb {\n  background: rgba(0, 0, 0, 0.15);\n  border-radius: 4px;\n}\n.k-player-danmaku-list-table-wrapper::-webkit-scrollbar-thumb:hover {\n  background-color: rgba(0, 0, 0, 0.45);\n}\n.k-player-danmaku-list-table {\n  width: 100%;\n  border-spacing: 0;\n  border-collapse: separate;\n  table-layout: fixed;\n}\n.k-player-danmaku-list-table th,\n.k-player-danmaku-list-table td {\n  padding: 8px;\n  border-bottom: 1px solid #f1f1f1;\n  word-wrap: break-word;\n  word-break: break-all;\n  white-space: nowrap;\n}\n.k-player-danmaku-list-table th {\n  position: sticky;\n  background-color: white;\n  top: 0;\n  z-index: 1;\n}\n.k-player-danmaku-list-table th:nth-child(1) {\n  width: 55px;\n}\n.k-player-danmaku-list-table td:nth-child(2) {\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.k-player-danmaku-list-table th:nth-child(3) {\n  width: 100px;\n}\n.k-player-danmaku-list a {\n  color: var(--k-player-primary-color);\n  margin: -4px 0 -4px -8px;\n  padding: 4px 8px;\n  border-radius: 4px;\n  text-decoration: none;\n  cursor: pointer;\n  display: inline-block;\n  white-space: nowrap;\n}\n.k-player-danmaku-list a:hover {\n  color: var(--k-player-primary-color);\n  background-color: var(--k-player-primary-color-highlight);\n}");

//#endregion
//#region src/player/plugins/danmaku/parser.ts
	function parsePakkuDanmakuXML(xml) {
		return $(xml).find("d").map((_, el) => {
			const [time, type, fontSize, color, sendTime, pool, senderHash, id, weight] = el.getAttribute("p").split(",");
			return {
				mode: {
					1: "rtl",
					4: "bottom",
					5: "top"
				}[type] || "rtl",
				text: el.textContent,
				time: parseFloat(time),
				style: { color: convert32ToHex(color) },
				user: {
					source: "Pakku",
					id: senderHash
				}
			};
		}).toArray();
	}

//#endregion
//#region src/player/plugins/danmaku/progressBarPower.ts
/**
	* 逻辑源自 bilibili 高能进度条 svg path 规则
	*/
	function createProgressBarPower($pbp, duration, comments) {
		const data = comments.map((cmt) => cmt.time);
		const svgMaxLength = 1e3;
		const size = 100;
		const stepLength = svgMaxLength / size;
		const stepTime = duration / size;
		const counts = [];
		let i = 0, j = 0;
		while (i++ <= size) {
			const base = stepTime * i;
			let count = 0;
			while (data[j++] < base) count++;
			counts.push(count);
		}
		let start = "M 0 100 L ";
		let end = " 1000.0 80.0 L 1000 100 Z";
		const maxCount = Math.max(Math.max(...counts), 1);
		const points = [];
		counts.forEach((count, i) => {
			const x = i * stepLength;
			const y = (1 - count / maxCount) * 80;
			if (i !== 0) points.push({
				x: (x - stepLength / 2).toFixed(2),
				y: y.toFixed(2)
			});
			if (i !== counts.length - 1) points.push({
				x: x.toFixed(2),
				y: y.toFixed(2)
			});
		});
		for (let i = 0; i < points.length;) {
			const p1 = points[i++];
			const p2 = points[i++];
			start += `${p1.x} ${p1.y} C ${p2.x} ${p1.y}, ${p2.x} ${p2.y},`;
		}
		$pbp.find("path").attr("d", start + end);
		$(".plyr__controls__item.plyr__progress__container .plyr__progress").append($pbp);
	}

//#endregion
//#region src/player/plugins/danmaku/danmaku.ts
	const defaultConfig = {
		showDanmaku: false,
		opacity: .6,
		showPbp: false,
		danmakuSpeed: 1,
		danmakuFontSize: 1,
		danmakuMode: ["top", "color"],
		danmakuFilter: [],
		danmakuScrollAreaPercent: 1,
		danmakuMerge: false,
		danmakuDensity: 1,
		danmakuOverlap: false,
		danmakuSourceDisabledList: []
	};
	var RunState = /* @__PURE__ */ function(RunState) {
		RunState[RunState["unSearched"] = 0] = "unSearched";
		RunState[RunState["searchedAnimes"] = 1] = "searchedAnimes";
		RunState[RunState["findEpisodes"] = 2] = "findEpisodes";
		RunState[RunState["getComments"] = 3] = "getComments";
		return RunState;
	}(RunState || {});
	var DanmakuPlugin = class {
		constructor(player, videoInfo) {
			var _this = this;
			_defineProperty(this, "elements", void 0);
			_defineProperty(this, "player", void 0);
			_defineProperty(this, "core", void 0);
			_defineProperty(this, "state", void 0);
			_defineProperty(this, "baseDanmkuSpeed", 130);
			_defineProperty(this, "refreshDanmaku", () => {
				this.stop();
				this.autoStart();
			});
			_defineProperty(this, "showTips", (message, duration = 3e3) => {
				this.elements.$tips.finish().text(message).fadeIn("fast");
				if (duration > 0) this.elements.$tips.delay(duration).fadeOut("fast");
			});
			_defineProperty(this, "messageLog", (message, options) => {
				const { duration = 3e3, detail } = options || {};
				this.showTips(message, duration);
				this.player.message.info(message, duration);
				this.log(message, detail);
			});
			_defineProperty(this, "count", 0);
			_defineProperty(this, "log", (message, detail) => {
				const $details = $("<div class=\"k-player-danmaku-log-item\"></div>");
				const $title = $("<div class=\"k-player-danmaku-log-title\"></div>");
				$title.text(`[${this.count++}] ${message}`);
				$details.append($title);
				if (detail) {
					const $content = $("<div class=\"k-player-danmaku-log-content\"></div>");
					const $code = $("<div class=\"k-player-danmaku-log-code\"></div>");
					$code.text(JSON.stringify(detail));
					$code.attr("title", JSON.stringify(detail, null, 2));
					$content.append($code);
					$details.append($content);
				}
				this.elements.$log.append($details);
			});
			_defineProperty(this, "stop", () => {
				var _this$core;
				(_this$core = this.core) === null || _this$core === void 0 || _this$core.hide();
			});
			_defineProperty(this, "start", () => {
				const run = () => {
					if (!this.player.media.duration) return requestAnimationFrame(run);
					if (!this.state.comments) return;
					const nextComments = this.adjustCommentCount(this.state.comments);
					this.elements.$openDanmakuList.find("[data-id=\"count\"]").text(`(${nextComments.length}/${this.state.comments.length})`);
					if (this.player.localConfig.showDanmaku) {
						if (!this.core) this.core = new _ironkinoko_danmaku.default({
							container: this.elements.$danmakuContainer[0],
							media: this.player.media,
							comments: nextComments,
							merge: this.player.localConfig.danmakuMerge,
							scrollAreaPercent: this.player.localConfig.danmakuScrollAreaPercent,
							overlap: this.player.localConfig.danmakuOverlap
						});
						else {
							this.core.reload(nextComments);
							this.core.show();
						}
						this.core.speed = this.baseDanmkuSpeed * this.player.localConfig.danmakuSpeed;
					}
					if (this.player.localConfig.showPbp) createProgressBarPower(this.elements.$pbp, this.player.media.duration, nextComments);
				};
				requestAnimationFrame(run);
			});
			_defineProperty(this, "adjustCommentCount", (comments) => {
				let ret = comments;
				ret = ret.filter((cmt) => {
					return !this.player.localConfig.danmakuFilter.some((filter) => {
						if (/^\/.*\/$/.test(filter)) return new RegExp(filter.slice(1, -1)).test(cmt.text);
						else return cmt.text.includes(filter);
					});
				});
				ret = ret.filter((cmt) => {
					return !this.player.localConfig.danmakuSourceDisabledList.includes(cmt.user.source);
				});
				const mode = this.player.localConfig.danmakuMode;
				if (!mode.includes("color")) ret = ret.filter((cmt) => cmt.style.color === "#ffffff");
				if (!mode.includes("bottom")) ret = ret.filter((cmt) => cmt.mode !== "bottom");
				if (!mode.includes("top")) ret = ret.filter((cmt) => cmt.mode !== "top");
				const maxLength = Math.round(3e3 / 1440 * this.player.media.duration * this.player.localConfig.danmakuDensity);
				if (ret.length > maxLength) {
					let ratio = ret.length / maxLength;
					ret = [...new Array(maxLength)].map((_, i) => ret[Math.floor(i * ratio)]);
				}
				return ret;
			});
			_defineProperty(this, "loadEpisode", async (episodeId) => {
				_this.stop();
				_this.state.comments = await getComments(episodeId);
				_this.state.syncDiff = 0;
				_this.state.state = RunState.getComments;
				_this.start();
				_this.player.message.destroy();
				_this.messageLog(`番剧：${_this.elements.$animes.find(":selected").text()}`);
				_this.messageLog(`章节：${_this.elements.$episodes.find(":selected").text()}`);
				_this.messageLog(`已加载 ${_this.state.comments.length} 条弹幕`);
			});
			_defineProperty(this, "setAnimes", (animes) => {
				this.state.animes = animes;
				renderSelectOptions(this.elements.$animes, this.state.animes);
			});
			_defineProperty(this, "setEpisodes", (episodes) => {
				this.state.episodes = episodes;
				renderSelectOptions(this.elements.$episodes, this.state.episodes);
			});
			_defineProperty(this, "searchAnime", lockWrap(async (name) => {
				_this.log(`搜索番剧: ${name}`);
				if (!name || name.length < 2) return _this.messageLog("番剧名称不少于2个字");
				try {
					_this.setAnimes([]);
					_this.setEpisodes([]);
					_this.messageLog("正在搜索番剧中...");
					_this.setAnimes(await queryAnimes(name));
					_this.messageLog(`找到 ${_this.state.animes.length} 部番剧`, { detail: _this.state.animes });
					_this.state.state = RunState.searchedAnimes;
					_this.autoMatchAnime();
				} catch (error) {
					console.error(error);
					_this.messageLog("弹幕服务异常，" + error.message, { detail: error.toString() });
				}
			}));
			_defineProperty(this, "searchEpisodes", async (animeId) => {
				_this.log("搜索剧集", { animeId });
				try {
					_this.setEpisodes([]);
					_this.messageLog("正在搜索剧集中...");
					_this.setEpisodes(await queryEpisodes(animeId));
					_this.messageLog(`找到 ${_this.state.episodes.length} 集`, { detail: _this.state.episodes });
					_this.state.state = RunState.findEpisodes;
					_this.autoMatchEpisode();
				} catch (error) {
					console.error(error);
					_this.messageLog("弹幕服务异常，" + error.message, { detail: error.toString() });
				}
			});
			_defineProperty(this, "autoMatchAnime", () => {
				let anime = this.state.animes.find((anime) => {
					const storeAnime = storageAnimeName(this.state.videoInfo.rawName);
					if (storeAnime) return anime.id === storeAnime.id;
					return anime.name === this.state.videoInfo.rawName;
				});
				if (!anime) anime = this.state.animes[0];
				this.elements.$animes.val("");
				if (anime) {
					this.elements.$animes.val(anime.id);
					this.elements.$animes.trigger("change");
				} else this.messageLog("弹幕未能自动匹配数据源，请手动搜索");
			});
			_defineProperty(this, "autoMatchEpisode", async () => {
				let episodeName = _this.state.videoInfo.episode;
				let episode;
				let storedEpisodeId = storageEpisodeName(`${_this.state.videoInfo.rawName}.${_this.state.videoInfo.episode}`);
				if (storedEpisodeId) episode = _this.state.episodes.find((episode) => String(episode.id) === storedEpisodeId);
				if (!episode && !isNaN(+episodeName)) {
					episode = _this.state.episodes.find((episode) => new RegExp(`${+episodeName}[话集]`).test(episode.name));
					if (!episode) episode = _this.state.episodes.find((episode) => episode.name.includes(episodeName));
				}
				_this.elements.$episodes.val("");
				if (episode) {
					_this.elements.$episodes.val(episode.id);
					_this.elements.$episodes.trigger("change");
				} else _this.messageLog("弹幕未能自动匹配数据源，请手动搜索");
			});
			_defineProperty(this, "injectDanmakuDropEvent", () => {
				this.player.onDrop((e) => {
					var _e$dataTransfer;
					e.preventDefault();
					const file = (_e$dataTransfer = e.dataTransfer) === null || _e$dataTransfer === void 0 ? void 0 : _e$dataTransfer.files[0];
					if ((file === null || file === void 0 ? void 0 : file.type) === "text/xml") {
						const reader = new FileReader();
						reader.onload = async () => {
							_this.stop();
							_this.state.comments = parsePakkuDanmakuXML(reader.result);
							_this.state.syncDiff = 0;
							_this.state.state = RunState.getComments;
							_this.start();
							_this.messageLog(`已加载 ${_this.state.comments.length} 条弹幕`);
						};
						reader.readAsText(file);
					}
				});
			});
			_defineProperty(this, "initEvents", (name) => {
				this.elements.$animeName.val(name);
				this.elements.$animeName.on("keypress", (e) => {
					if (e.key === "Enter") this.searchAnime(this.elements.$animeName.val());
				});
				this.elements.$animeName.on("blur", (e) => {
					this.searchAnime(this.elements.$animeName.val());
				});
				this.elements.$animes.on("change", (e) => {
					const animeId = this.elements.$animes.val();
					const anime = this.state.animes.find((anime) => anime.id === animeId);
					if (!anime) return;
					storageAnimeName(this.state.videoInfo.rawName, {
						id: anime.id,
						name: anime.name,
						keyword: this.elements.$animeName.val()
					});
					this.searchEpisodes(anime.id);
				});
				this.elements.$episodes.on("change", (e) => {
					const episodeId = this.elements.$episodes.val();
					const animeId = this.elements.$animes.val();
					const anime = this.state.animes.find((anime) => anime.id === animeId);
					if (!anime || !episodeId) return;
					storageAnimeName(this.state.videoInfo.rawName, {
						id: anime.id,
						name: anime.name,
						keyword: this.elements.$animeName.val()
					});
					storageEpisodeName(`${this.state.videoInfo.rawName}.${this.state.videoInfo.episode}`, episodeId);
					this.loadEpisode(episodeId);
				});
				this.elements.$danmakuSwitch.toggleClass("plyr__control--pressed", this.player.localConfig.showDanmaku).on("click", () => {
					this.switchDanmaku();
				});
				new ResizeObserver(() => {
					var _this$core2;
					(_this$core2 = this.core) === null || _this$core2 === void 0 || _this$core2.resize();
				}).observe(this.elements.$danmakuContainer[0]);
				new MutationObserver(async () => {
					Object.assign(_this.state.videoInfo, await runtime.getCurrentVideoNameAndEpisode());
					_this.state.state = RunState.searchedAnimes;
					_this.autoStart();
				}).observe(this.player.media, { attributeFilter: ["src"] });
				this.player.initInputEvent();
				this.elements.$showDanmaku.prop("checked", this.player.localConfig.showDanmaku).on("change", (e) => {
					this.switchDanmaku(e.target.checked);
				});
				this.elements.$showPbp.prop("checked", this.player.localConfig.showPbp).on("change", (e) => {
					const chekced = e.target.checked;
					this.elements.$pbp.toggle(chekced);
					this.player.configSaveToLocal("showPbp", chekced);
					if (chekced) this.autoStart();
				});
				this.elements.$pbp.toggle(this.player.localConfig.showPbp || false);
				const $pbpPlayed = this.elements.$pbp.find("#k-player-pbp-played-path");
				this.player.on("timeupdate", () => {
					$pbpPlayed.attr("width", (this.player.currentTime / this.player.plyr.duration || 0) * 100 + "%");
				});
				this.elements.$danmakuMerge.prop("checked", this.player.localConfig.danmakuMerge).on("change", (e) => {
					const chekced = e.target.checked;
					this.player.configSaveToLocal("danmakuMerge", chekced);
					if (this.core) this.core.merge = chekced;
				});
				this.elements.$danmakuOverlap.prop("checked", this.player.localConfig.danmakuOverlap).on("change", (e) => {
					const chekced = e.target.checked;
					this.player.configSaveToLocal("danmakuOverlap", chekced);
					if (this.core) this.core.overlap = chekced;
				});
				addRangeListener({
					$dom: this.elements.$opacity,
					name: "opacity",
					onInput: (v) => {
						this.elements.$danmakuContainer.css({ opacity: v });
					},
					player: this.player
				});
				addRangeListener({
					$dom: this.elements.$danmakuFontSize,
					name: "danmakuFontSize",
					onInput: (v) => {
						this.elements.$danmakuContainer.css("--danmaku-font-size-scale", v);
					},
					player: this.player
				});
				addRangeListener({
					$dom: this.elements.$danmakuSpeed,
					name: "danmakuSpeed",
					onChange: (v) => {
						if (this.core) this.core.speed = this.baseDanmkuSpeed * v;
					},
					player: this.player
				});
				addRangeListener({
					$dom: this.elements.$danmakuDensity,
					name: "danmakuDensity",
					onChange: this.refreshDanmaku,
					player: this.player
				});
				addRangeListener({
					$dom: this.elements.$danmakuScrollAreaPercent,
					name: "danmakuScrollAreaPercent",
					onChange: (val) => {
						if (this.core) this.core.scrollAreaPercent = val;
					},
					player: this.player
				});
				setCheckboxGroupValue(this.elements.$danmakuMode, this.player.localConfig.danmakuMode);
				this.elements.$danmakuMode.on("change", () => {
					const modes = getCheckboxGroupValue(this.elements.$danmakuMode);
					this.player.configSaveToLocal("danmakuMode", modes);
					if (this.core) this.refreshDanmaku();
				});
				createFilter(this.player, this.refreshDanmaku);
				createDanmakuList(this.player, () => this.state.comments, this.refreshDanmaku);
				this.injectDanmakuDropEvent();
			});
			_defineProperty(this, "switchDanmaku", (bool) => {
				var _bool;
				(_bool = bool) !== null && _bool !== void 0 || (bool = !this.player.localConfig.showDanmaku);
				this.player.configSaveToLocal("showDanmaku", bool);
				this.elements.$danmakuSwitch.toggleClass("plyr__control--pressed", bool);
				this.elements.$showDanmaku.prop("checked", bool);
				this.messageLog(`弹幕${bool ? "开启" : "关闭"}`);
				if (bool) this.autoStart();
				else this.stop();
			});
			_defineProperty(this, "autoStart", () => {
				if (!(this.player.localConfig.showDanmaku || this.player.localConfig.showPbp)) return;
				switch (this.state.state) {
					case RunState.unSearched:
						this.searchAnime(this.elements.$animeName.val());
						break;
					case RunState.searchedAnimes:
						this.searchEpisodes(this.elements.$animes.val());
						break;
					case RunState.findEpisodes:
						this.autoMatchEpisode();
						break;
					case RunState.getComments:
						this.start();
						break;
				}
			});
			this.player = player;
			this.elements = new DanmakuElements(player);
			this.player.danmaku = this;
			this.state = {
				state: RunState.unSearched,
				animes: [],
				episodes: [],
				comments: [],
				videoInfo,
				syncDiff: 0
			};
			this.player.localConfig = Object.assign({}, defaultConfig, this.player.localConfig);
			this.player.$videoWrapper.append(this.elements.$danmakuContainer);
			this.elements.$danmaku.insertBefore(player.$searchActions);
			this.elements.$danmaku.before(this.elements.$danmakuSwitch);
			let defaultSearchName = storageAnimeName(videoInfo.rawName) || videoInfo.name;
			this.initEvents(typeof defaultSearchName === "object" ? defaultSearchName.keyword : defaultSearchName);
			this.log("当前视频信息", {
				videoInfo,
				searchInfo: defaultSearchName
			});
			this.autoStart();
		}
	};
	Shortcuts.keyBindings.registerKeyBinding({
		command: Commands$1.danmakuSwitch,
		description: "显示/隐藏弹幕",
		key: "D"
	});
	Shortcuts.registerCommand(Commands$1.danmakuSwitch, function() {
		var _this$danmaku;
		(_this$danmaku = this.danmaku) === null || _this$danmaku === void 0 || _this$danmaku.switchDanmaku();
	});
	Shortcuts.keyBindings.registerKeyBinding({
		command: Commands$1.danmakuSyncBack,
		description: "弹幕滞后0.5s",
		key: ","
	});
	Shortcuts.registerCommand(Commands$1.danmakuSyncBack, function() {
		var _this$danmaku2;
		if (!((_this$danmaku2 = this.danmaku) === null || _this$danmaku2 === void 0 ? void 0 : _this$danmaku2.state.comments)) return;
		this.danmaku.state.comments.forEach((comment) => {
			comment.time += .5;
		});
		this.danmaku.state.syncDiff += .5;
		this.message.destroy();
		this.message.info(`弹幕同步：滞后了0.5s（${this.danmaku.state.syncDiff}s）`);
		this.danmaku.refreshDanmaku();
	});
	Shortcuts.keyBindings.registerKeyBinding({
		command: Commands$1.danmakuSyncForward,
		description: "弹幕超前0.5s",
		key: "."
	});
	Shortcuts.registerCommand(Commands$1.danmakuSyncForward, function() {
		var _this$danmaku3;
		if (!((_this$danmaku3 = this.danmaku) === null || _this$danmaku3 === void 0 ? void 0 : _this$danmaku3.state.comments)) return;
		this.danmaku.state.comments.forEach((comment) => {
			comment.time += -.5;
		});
		this.danmaku.state.syncDiff += -.5;
		this.message.destroy();
		this.message.info(`弹幕同步：超前了0.5s（${this.danmaku.state.syncDiff}s）`);
		this.danmaku.refreshDanmaku();
	});
	Shortcuts.keyBindings.registerKeyBinding({
		command: Commands$1.danmakuSyncRestore,
		description: "弹幕同步复位",
		key: "/"
	});
	Shortcuts.registerCommand(Commands$1.danmakuSyncRestore, function() {
		var _this$danmaku4;
		if (!((_this$danmaku4 = this.danmaku) === null || _this$danmaku4 === void 0 ? void 0 : _this$danmaku4.state.comments)) return;
		this.danmaku.state.comments.forEach((comment) => {
			comment.time += -this.danmaku.state.syncDiff;
		});
		this.danmaku.state.syncDiff = 0;
		this.message.destroy();
		this.message.info("弹幕同步：已复位");
		this.danmaku.refreshDanmaku();
	});
	const renderSelectOptions = (target, options) => {
		const html = options.reduce((html, option) => html + `<option value="${option.id}">${option.name}</option>`, "");
		target.html(html);
	};
	async function setup$1(player) {
		const info = await runtime.getCurrentVideoNameAndEpisode();
		if (!info) return;
		new DanmakuPlugin(player, info);
	}

//#endregion
//#region src/player/plugins/autoseek/index.scss
	injectStyle("#k-autoseek-config {\n  line-height: 32px;\n  font-size: 14px;\n}\n#k-autoseek-config .k-autoseek-config-tips {\n  font-size: 12px;\n  color: #666;\n  margin-top: 8px;\n  line-height: 1.6;\n}\n#k-autoseek-config .k-autoseek-config-tips summary {\n  cursor: pointer;\n}\n#k-autoseek-config .k-autoseek-config-tips .k-autoseek-config-tips-title {\n  color: #232323;\n  font-weight: 500;\n  margin-bottom: 4px;\n  margin-top: 8px;\n}\n\n#k-autoseek-overlay {\n  position: absolute;\n  inset: 0;\n  pointer-events: none;\n  z-index: 1000;\n}\n#k-autoseek-overlay .k-autoseek-segment {\n  position: absolute;\n  background: white;\n  top: 50%;\n  transform: translateY(-50%);\n  width: calc(var(--plyr-range-track-height) + 2px);\n  height: calc(var(--plyr-range-track-height) + 2px);\n  border-radius: 50%;\n}");

//#endregion
//#region src/player/plugins/autoseek/html.template.html
	var html_template_default = {
		"k-autoseek-config": "<div id=\"k-autoseek-config\">\n  <form class=\"k-settings-list\">\n    <div class=\"k-settings-item\">\n      <label class=\"k-checkbox\">\n        <input type=\"checkbox\" name=\"start.enabled\" >\n        跳过片头\n      </label>\n      <input         type=\"text\"\n        name=\"start.start\"\n        class=\"k-input-number\"\n        placeholder=\"起跳时间\"\n      >\n      <input         type=\"number\"\n        name=\"start.diff\"\n        class=\"k-input-number\"\n        placeholder=\"长度\"\n      >\n    </div>\n\n    <div class=\"k-settings-item\">\n      <label class=\"k-checkbox\">\n        <input type=\"checkbox\" name=\"end.enabled\" >\n        跳过片尾\n      </label>\n      <input         type=\"text\"\n        name=\"end.start\"\n        class=\"k-input-number\"\n        placeholder=\"起跳时间\"\n      >\n      <input         type=\"number\"\n        name=\"end.diff\"\n        class=\"k-input-number\"\n        placeholder=\"长度\"\n      >\n    </div>\n    <div class=\"k-autoseek-config-tips\">\n      <details>\n        <summary>使用说明</summary>\n        <div class=\"k-autoseek-config-tips-title\">\n          第一个值表示“起跳时间”，二个值表示“跳过多少时间”\n        </div>\n        <div>起跳时间格式：分秒时间(2:30)、秒数(150)</div>\n        <div>跳过多少时间：秒数(85)</div>\n        <div>\n          例如：在 2:30 位置起跳，跳过 85s 时长，视频最终会在 145s 处播放\n        </div>\n        <div class=\"k-autoseek-config-tips-title\">\n          结尾的起跳时间可以是小于等于 0 的数字\n        </div>\n        <div>\n          例子1：片尾填写 -10 与 60，那么视频倒数 10s 处再往前数 60s\n          的位置开始跳转，视频最终在倒数 10s 处播放\n        </div>\n        <div>\n          例子2：片尾填写 600 与 60，那么视频 10:00 处开始跳转 60s，视频最终在\n          660s 处播放\n        </div>\n      </details>\n    </div>\n    <div class=\"k-autoseek-config-tips\">\n      仅在当前番剧播放页生效，其他番剧需要重新配置\n    </div>\n  </form>\n</div>",
		"k-autoseek-overlay": "<div id=\"k-autoseek-overlay\"></div>"
	};

//#endregion
//#region src/player/plugins/autoseek/autoseek.ts
	var Commands = /* @__PURE__ */ function(Commands) {
		Commands["autoSeekConfig"] = "autoSeekConfig";
		return Commands;
	}(Commands || {});
	function bindFormEvent(formHTML, data) {
		const $form = $(formHTML);
		$form.find("input[name]").each((_, el) => {
			switch (el.getAttribute("type")) {
				case "checkbox":
					el.checked = get(data, el.name, false);
					break;
				case "number":
				case "text":
					el.value = get(data, el.name, "");
					break;
				default: break;
			}
		});
		return $form;
	}
	function parseStartTime(value) {
		if (typeof value === "number") return value;
		const [m, s] = value.split(":");
		return parseInt(m) * 60 + parseInt(s);
	}
	function getFormData(form) {
		const data = {};
		form.find("input[name]").each((_, el) => {
			switch (el.getAttribute("type")) {
				case "checkbox":
					set(data, el.name, el.checked);
					break;
				case "number": {
					const value = isNaN(parseInt(el.value)) ? void 0 : parseInt(el.value);
					set(data, el.name, value);
				}
				case "text": {
					const raw = el.value.trim();
					if (/^\d+[：:]\d+$/.test(raw)) set(data, el.name, raw.replace(/[：:]/g, ":"));
					else {
						const value = isNaN(parseInt(el.value)) ? void 0 : parseInt(el.value);
						set(data, el.name, value);
					}
				}
				default: break;
			}
		});
		return data;
	}
	Shortcuts.keyBindings.registerKeyBinding({
		command: Commands.autoSeekConfig,
		description: "设置跳过片段",
		key: "G"
	});
	Shortcuts.registerCommand(Commands.autoSeekConfig, (function() {
		let open = false;
		return function() {
			if (!this.autoSeek.scope) {
				this.message.info("该网站暂未适配自动跳过片段功能，敬请期待");
				return;
			}
			if (open) return;
			open = true;
			this.plyr.pause();
			modal({
				width: 350,
				title: "跳过片段设置",
				content: bindFormEvent(html_template_default["k-autoseek-config"], this.autoSeek.getConfig()),
				afterClose: () => {
					open = false;
					this.plyr.play();
				},
				handleOkOnEnter: true,
				onOk: () => {
					const config = getFormData($("#k-autoseek-config form"));
					if (config.start.enabled && (isNil(config.start.start) || isNil(config.start.diff))) {
						config.start.enabled = false;
						delete config.start.start;
						delete config.start.diff;
					}
					if (config.end.enabled && (isNil(config.end.start) || isNil(config.end.diff))) {
						config.end.enabled = false;
						delete config.end.start;
						delete config.end.diff;
					}
					if (config.start.diff) config.start.diff = Math.abs(config.start.diff);
					if (config.end.diff) config.end.diff = Math.abs(config.end.diff);
					this.autoSeek.setConfig(config);
				}
			});
		};
	})());
	const DefaultConfig = {
		start: {
			enabled: false,
			start: 0,
			diff: 85
		},
		end: { enabled: false }
	};
	var AutoSeek = class {
		constructor(player) {
			this.player = player;
			_defineProperty(this, "config", DefaultConfig);
			_defineProperty(this, "localStoreKey", "k-autoSeek-config");
			_defineProperty(this, "scope", void 0);
			this.player.autoSeek = this;
			this.player.getAnimeScope().then((scope) => {
				this.init(scope);
			});
		}
		getConfig() {
			if (!this.scope) throw new Error("AutoSeek scope is not set");
			return local.getItem(this.localStoreKey, {})[this.scope] || DefaultConfig;
		}
		setConfig(config) {
			if (!this.scope) throw new Error("AutoSeek scope is not set");
			this.config = config;
			local.setItem(this.localStoreKey, _objectSpread2(_objectSpread2({}, local.getItem(this.localStoreKey, {})), {}, { [this.scope]: config }));
			this.refresh();
		}
		init(scope) {
			this.scope = scope;
			this.config = this.getConfig();
			this.player.on("loadedmetadata", () => {
				this.refresh();
			});
			let isSeeking = false;
			const container = this.player.plyr.elements.controls;
			if (container) {
				const progressContainer = container.querySelector(".plyr__progress");
				if (progressContainer) {
					progressContainer.addEventListener("mousedown", () => {
						isSeeking = true;
					});
					progressContainer.addEventListener("mouseup", () => {
						isSeeking = false;
					});
					progressContainer.addEventListener("touchstart", () => {
						isSeeking = true;
					});
					progressContainer.addEventListener("touchend", () => {
						isSeeking = false;
					});
				}
			}
			this.player.on("timeupdate", throttle(() => {
				const media = this.player.media;
				const currentTime = media.currentTime;
				const duration = media.duration;
				const safeMaxTime = duration - .1;
				if (!(this.config.start.enabled || this.config.end.enabled) || isSeeking || currentTime >= duration - 3) return;
				if (this.config.start.enabled) {
					const start = parseStartTime(this.config.start.start || 0);
					const diff = this.config.start.diff || 0;
					if (currentTime >= start && currentTime <= start + diff) this.player.media.currentTime = Math.min(start + diff, safeMaxTime);
				}
				if (this.config.end.enabled) {
					const start = parseStartTime(this.config.end.start || 0);
					const diff = this.config.end.diff || 0;
					if (start <= 0) {
						if (currentTime >= start + duration - diff && currentTime <= start + duration) this.player.media.currentTime = Math.min(start + duration, safeMaxTime);
					} else if (currentTime >= start && currentTime <= start + diff) this.player.media.currentTime = Math.min(start + diff, safeMaxTime);
				}
			}, 300));
		}
		refresh() {
			var _this$player$plyr$ele;
			const duration = this.player.media.duration;
			if (!duration) return;
			$("#k-autoseek-overlay").remove();
			if (!(this.config.start.enabled || this.config.end.enabled)) return;
			const $overlay = $(html_template_default["k-autoseek-overlay"]);
			if (this.config.start.enabled) {
				const start = parseStartTime(this.config.start.start || 0);
				const $segment = $("<div class=\"k-autoseek-segment\" />");
				$segment.css({ left: `${start / duration * 100}%` });
				$overlay.append($segment);
			}
			if (this.config.end.enabled) {
				const start = parseStartTime(this.config.end.start || 0);
				const diff = this.config.end.diff || 0;
				const $segment = $("<div class=\"k-autoseek-segment\" />");
				if (start <= 0) $segment.css({ left: `${(start + duration - diff) / duration * 100}%` });
				else $segment.css({ left: `${start / duration * 100}%` });
				$overlay.append($segment);
			}
			(_this$player$plyr$ele = this.player.plyr.elements.container) === null || _this$player$plyr$ele === void 0 || (_this$player$plyr$ele = _this$player$plyr$ele.querySelector(".plyr__progress")) === null || _this$player$plyr$ele === void 0 || _this$player$plyr$ele.append($overlay[0]);
		}
	};
	function setup(player) {
		new AutoSeek(player);
	}

//#endregion
//#region src/player/index.ts
	KPlayer.register(setup$2);
	KPlayer.register(setup$1);
	KPlayer.register(setup);

//#endregion
//#region src/utils/execInUnsafeWindow.ts
	function execInUnsafeWindow(fn) {
		return new Promise((resolve, reject) => {
			const contextId = Math.random().toFixed(16).slice(2);
			window.addEventListener("message", function listener(e) {
				if (e.data && e.data.contextId === contextId) {
					const data = e.data.data;
					resolve(data);
					window.removeEventListener("message", listener);
					script.remove();
				}
			});
			const code = `
    ;(async function runInUnsafeWindow() {
      const data = await (${fn.toString()})()
      window.postMessage({ contextId: '${contextId}', data }, '*')
    })()
    `;
			const script = document.createElement("script");
			script.textContent = code;
			document.body.appendChild(script);
		});
	}

//#endregion
//#region src/utils/queryDom.ts
	function queryDom(selector) {
		return new Promise((resolve) => {
			let dom;
			function search() {
				dom = $(selector);
				if (dom.length === 0) requestAnimationFrame(search);
				else resolve(dom[0]);
			}
			search();
		});
	}

//#endregion
//#region src/utils/wait.ts
	async function wait(selector) {
		let bool = selector();
		while (!bool) {
			await sleep();
			bool = selector();
		}
	}

//#endregion
//#region src/adapter/_iframe_player_parser/parser.ts
	let player;
	const parser$6 = {
		"danmu.yhdmjx.com": async () => {
			function detectLoadError() {
				let timeId = setInterval(() => {
					if (document.body.innerText.includes("动漫专用解析")) {
						clearInterval(timeId);
						const dom = document.querySelector("b h1");
						const root = document.querySelector("table td");
						root.innerHTML = `
            <style>p,h1{ font-family: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif'; }</style>
            <h1>动漫解析失败</h1>
            <p>当前时间：<span id="current-time"></span></p>
            <p>检测到页面加载失败，<span id="status">2秒后自动重试</span></p>
            <p>如果一直无法加载，请尝试切换到其他线路</p>
            <p>${dom.innerHTML}</p>
            `;
						setInterval(() => {
							document.getElementById("current-time").innerText = (/* @__PURE__ */ new Date()).toLocaleTimeString();
						}, 16);
						setTimeout(() => {
							document.getElementById("status").innerText = "正在刷新重试中...";
							location.reload();
						}, 2e3);
					}
				}, 16);
				return () => clearInterval(timeId);
			}
			const dispose = detectLoadError();
			const video = await queryDom("video");
			video.src = "";
			dispose();
			player = new KPlayer("#player", { eventToParentWindow: true });
			player.src = await execInUnsafeWindow(() => window.v_decrypt(window.config.url, window._token_key, window.key_token));
		},
		"pro.ascepan.top": async () => {
			const video = await queryDom("video");
			video.src = "";
			player = new KPlayer("#player", { eventToParentWindow: true });
			player.src = await execInUnsafeWindow(() => window.config.url);
		},
		"sp-flv.com": async () => {
			const video = await queryDom("video");
			await wait(() => !!video.currentSrc);
			let url = video.currentSrc;
			if (url.startsWith("blob:")) {
				url = await execInUnsafeWindow(() => window.video_url);
				if (url) {
					video.src = "";
					player = new KPlayer("#mplayer-media-wrapper", { eventToParentWindow: true });
					player.src = url;
				}
			} else {
				video.src = "";
				player = new KPlayer("#mplayer-media-wrapper", { eventToParentWindow: true });
				player.src = url;
			}
		},
		"agefans-01": async () => {
			let url = "";
			while (!url) {
				url = await execInUnsafeWindow(() => {
					var _window$stray;
					return (_window$stray = window.stray) === null || _window$stray === void 0 ? void 0 : _window$stray.url;
				});
				await sleep(100);
			}
			$("#artplayer").remove();
			$("body").append("<div id=\"k-player-container\"/>");
			player = new KPlayer("#k-player-container", { eventToParentWindow: true });
			player.src = url;
		},
		"agefans-02": async () => {
			let url = "";
			while (!url) {
				url = await execInUnsafeWindow(() => {
					var _window$art;
					return ((_window$art = window.art) === null || _window$art === void 0 || (_window$art = _window$art.hls) === null || _window$art === void 0 ? void 0 : _window$art.url) || window.Vurl;
				});
				await sleep(100);
			}
			await execInUnsafeWindow(() => window.art.destroy(false));
			$("#loading").remove();
			$("body").append("<div id=\"k-player-container\"/>");
			player = new KPlayer("#k-player-container", { eventToParentWindow: true });
			player.src = url;
		}
	};

//#endregion
//#region src/adapter/_iframe_player_parser/index.scss
	injectStyle(".pro-ascepan-top #bkcl {\n  display: none !important;\n}");

//#endregion
//#region src/adapter/_iframe_player_parser/index.ts
	runtime.register({
		domains: [
			"pro.ascepan.top",
			"danmu.yhdmjx.com",
			"sp-flv.com",
			"43.240.74.134",
			"43.240.156.118",
			"jx.ejtsyc.com"
		],
		opts: [
			{
				test: () => window.location.href.includes("danmu.yhdmjx.com/m3u8.php"),
				runInIframe: true,
				run: parser$6["danmu.yhdmjx.com"]
			},
			{
				test: () => window.location.href.includes("pro.ascepan.top/player"),
				runInIframe: true,
				run: parser$6["pro.ascepan.top"],
				setup: () => $("body").addClass("pro-ascepan-top")
			},
			{
				test: () => !!window.location.href.match(/sp-flv\.com.*url=/),
				runInIframe: true,
				run: parser$6["sp-flv.com"]
			},
			{
				test: () => !!window.location.href.match(/((43.240.74.134)|(43.240.156.118)|(jx.ejtsyc.com)).*vip.*url=/),
				runInIframe: true,
				run: parser$6["agefans-01"]
			},
			{
				test: () => !!window.location.href.match(/((43.240.74.134)|(43.240.156.118)|(jx.ejtsyc.com)).*m3u8.*url=/),
				runInIframe: true,
				run: parser$6["agefans-02"]
			}
		],
		search: {
			getSearchName: () => {
				return new Promise((resolve) => {
					const fn = (e) => {
						if (e.data.key === "getSearchName") {
							resolve(e.data.name);
							window.removeEventListener("message", fn);
						}
					};
					window.addEventListener("message", fn);
					parent.postMessage({ key: "getSearchName" }, "*");
				});
			},
			getEpisode: () => {
				return new Promise((resolve) => {
					const fn = (e) => {
						if (e.data.key === "getEpisode") {
							resolve(e.data.name);
							window.removeEventListener("message", fn);
						}
					};
					window.addEventListener("message", fn);
					parent.postMessage({ key: "getEpisode" }, "*");
				});
			}
		}
	});

//#endregion
//#region src/adapter/agefans/index.scss
	injectStyle(".agefans-wrapper .video_detail_episode a:visited {\n  color: rgb(220, 53, 69) !important;\n}\n.agefans-wrapper .update-info {\n  font-size: 12px;\n  color: #f8f9fa;\n  font-family: system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Oxygen, Ubuntu, Cantarell, \"Open Sans\", \"Helvetica Neue\", sans-serif;\n}\n.agefans-wrapper .update-info:hover {\n  cursor: pointer;\n  text-decoration: underline;\n}\n.agefans-wrapper .sub-thumbnail-box {\n  transition: opacity 0.15s ease;\n  opacity: 0;\n  position: absolute;\n  top: -10px;\n  right: calc(100% + 12px);\n  width: 200px;\n  padding: 8px;\n  border-radius: 8px;\n  background-color: #282828;\n  border: 1px solid #404041;\n  box-shadow: 0px 6px 20px 8px rgba(0, 0, 0, 0.45);\n  pointer-events: none;\n  z-index: 10;\n}\n.agefans-wrapper .text_list_item li:hover .sub-thumbnail-box {\n  opacity: 1;\n}\n.agefans-wrapper .sub-thumbnail {\n  width: 100%;\n  border-radius: 6px;\n}\n.agefans-wrapper .sub-group-day {\n  margin-bottom: 4px;\n}");

//#endregion
//#region src/utils/date.ts
/** 返回与当前日期最接近的同一周几的日期 */
	function closestSameDay(value) {
		if (typeof value === "string") {
			const ret = value.match(/(\d+).*?(\d\d?).*?(\d\d?)/);
			if (!ret) throw new Error("Invalid date string");
			const [, y, m, d] = ret;
			value = `${y}-${m}-${d !== null && d !== void 0 ? d : "01"}`;
			if (new Date(value).toJSON().includes("Invalid Date")) throw new Error("Invalid date string");
		}
		let date = /* @__PURE__ */ new Date();
		const target = new Date(value);
		while (target.getDay() !== date.getDay()) date = /* @__PURE__ */ new Date(date.getTime() - 1440 * 60 * 1e3);
		return date;
	}

//#endregion
//#region src/utils/concurrency.ts
	async function concurrency(tasks, limit, onProgress) {
		if (limit <= 0) throw new Error("limit must be > 0");
		const results = new Array(tasks.length);
		let nextIndex = 0;
		let done = 0;
		async function worker() {
			while (true) {
				const current = nextIndex++;
				if (current >= tasks.length) break;
				results[current] = await tasks[current]();
				done++;
				onProgress === null || onProgress === void 0 || onProgress(done, tasks.length);
			}
		}
		const workers = Array.from({ length: Math.min(limit, tasks.length) }, () => worker());
		onProgress === null || onProgress === void 0 || onProgress(done, tasks.length);
		await Promise.all(workers);
		return results;
	}

//#endregion
//#region src/adapter/common/history.scss
	injectStyle(".k-episode-anchor:visited {\n  color: rgb(220, 53, 69) !important;\n}\n\n.k-his-table {\n  width: 100%;\n  line-height: 1.4;\n  border-spacing: 0;\n  border-collapse: separate;\n}\n.k-his-table th,\n.k-his-table td {\n  padding: 6px 8px;\n}\n.k-his-table tr {\n  transition: background 0.3s ease;\n}\n.k-his-table tr:hover {\n  background: #f1f1f1;\n}\n.k-his-table a {\n  text-decoration: none;\n  transition: color 0.15s ease;\n}\n.k-his-table a:hover {\n  color: var(--k-player-primary-color);\n}\n.k-his-table .k-btn {\n  color: var(--k-player-primary-color);\n}");

//#endregion
//#region src/adapter/common/history.ts
	const his = {
		key: "k-history",
		load() {
			return local.getItem(this.key, []);
		},
		save(data) {
			local.setItem(this.key, data.slice(0, 300));
		},
		log(info, time) {
			let data = this.load();
			data = data.filter((o) => o.id !== info.id);
			data.unshift(_objectSpread2(_objectSpread2({}, info), {}, { time }));
			this.save(data);
		},
		remove(id) {
			let data = this.load();
			data = data.filter((o) => o.id !== id);
			this.save(data);
		}
	};
	const logHis = throttle(his.log.bind(his), 1e3);
	function renderHistory() {
		const data = his.load();
		const $root = $(`
    <table class="k-table k-his-table">
      <colgroup>
        <col>
        <col style="width:80px">
        <col style="width:60px">
        <col style="width:60px">
      </colgroup>
      <thead>
        <tr>
          <th>标题</th>
          <th>章节</th>
          <th>时间</th>
          <th></th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
      `);
		const content = data.map((info) => `<tr>
    <td>
      <a href="${info.url}">${info.animeName}</a>
    </td>
    <td>
      <a href="${info.url}">${info.episodeName}</a>
    </td>
    <td>${parseTime(info.time)}</td>
    <td>
      <span class="k-btn delete-btn" data-id="${info.id}">删除</span>
    </td>
    </tr>`).join("");
		const $content = $(content);
		$content.find(".delete-btn").on("click", function() {
			const id = $(this).attr("data-id");
			his.remove(id);
			$(this).closest("tr").remove();
		});
		$root.find("tbody").append($content);
		modal({
			title: "历史记录",
			content: $root
		});
	}

//#endregion
//#region src/adapter/common/subscribe.ts
	var SubscriptionManager = class SubscriptionManager {
		constructor(storageKey) {
			this.storageKey = storageKey;
			_defineProperty(this, "listeners", /* @__PURE__ */ new Set());
			window.addEventListener("storage", (e) => {
				if (e.key === this.storageKey) this.notify();
			});
			window.addEventListener("popstate", () => {
				this.notify();
			});
		}
		static getInstance(storageKey) {
			if (!this.instances.has(storageKey)) this.instances.set(storageKey, new SubscriptionManager(storageKey));
			return this.instances.get(storageKey);
		}
		onChange(callback, options) {
			this.listeners.add(callback);
			if (options === null || options === void 0 ? void 0 : options.immediate) this.notify();
			return () => this.listeners.delete(callback);
		}
		notify() {
			this.listeners.forEach((cb) => cb(this.getSubscriptions()));
		}
		getSubscriptions() {
			return local.getItem(this.storageKey, []);
		}
		/** 根据更新顺序做排序，按天成组 */
		getSubscriptionsGroupByDay() {
			const subscriptions = this.getSubscriptions();
			const daysInChinese = [
				"周日",
				"周一",
				"周二",
				"周三",
				"周四",
				"周五",
				"周六"
			];
			let groups = Array.from({ length: 7 }, (_, idx) => ({
				dayNum: idx,
				day: daysInChinese[idx],
				list: []
			}));
			subscriptions.forEach((sub) => {
				const day = new Date(sub.updatedAt).getDay();
				groups[day].list.push(sub);
			});
			groups.forEach((group) => {
				group.list.sort((a, b) => a.updatedAt - b.updatedAt);
			});
			const day = (/* @__PURE__ */ new Date()).getDay();
			groups = [...groups.slice(0, day + 1).reverse(), ...groups.slice(day + 1).reverse()];
			return groups;
		}
		getSubscription(id) {
			return this.getSubscriptions().find((sub) => sub.id === id);
		}
		createSubscription(subscription) {
			const subscriptions = this.getSubscriptions();
			if (subscriptions.some((sub) => sub.id === subscription.id)) throw new Error("Subscription already exists");
			subscriptions.push(subscription);
			local.setItem(this.storageKey, subscriptions);
			this.notify();
			return subscription;
		}
		updateSubscription(id, updates) {
			const subscriptions = this.getSubscriptions();
			const index = subscriptions.findIndex((sub) => sub.id === id);
			if (index === -1) throw new Error("Subscription not found");
			subscriptions[index] = _objectSpread2(_objectSpread2({}, subscriptions[index]), updates);
			local.setItem(this.storageKey, subscriptions);
			this.notify();
			return subscriptions[index];
		}
		deleteSubscription(id) {
			const subscriptions = this.getSubscriptions();
			const filtered = subscriptions.filter((sub) => sub.id !== id);
			if (filtered.length === subscriptions.length) throw new Error("Subscription not found");
			local.setItem(this.storageKey, filtered);
			this.notify();
			return true;
		}
	};
	_defineProperty(SubscriptionManager, "instances", /* @__PURE__ */ new Map());

//#endregion
//#region src/adapter/common/defineIframePlayer.ts
	function defineIframePlayer(config) {
		const { iframeSelector, search } = config;
		function createIframeReadyToChangeIframeSrc(url) {
			const iframe = document.createElement("iframe");
			iframe.className = "ready-to-change-iframe-src";
			iframe.style.cssText = "position:fixed;left:0;top:0;z-index:9999;opacity:0;pointer-events:none;";
			iframe.src = url;
			document.body.appendChild(iframe);
		}
		function setActive(url) {
			if (window.location.href !== url) window.history.pushState(window.history.state, "", url);
			config.setActive(url);
			createIframeReadyToChangeIframeSrc(url);
		}
		function createHistory() {
			if (config.history) config.history.creator(renderHistory);
		}
		function isFocusInputElement() {
			if (!document.activeElement) return false;
			return [
				"input",
				"textarea",
				"select"
			].includes(document.activeElement.tagName.toLowerCase());
		}
		function runInTop() {
			$(iframeSelector).replaceWith($(iframeSelector).clone().attr({ allow: "autoplay; fullscreen" }));
			window.addEventListener("keydown", (e) => {
				var _window$getSelection;
				if (isFocusInputElement()) return;
				if ((_window$getSelection = window.getSelection()) === null || _window$getSelection === void 0 ? void 0 : _window$getSelection.toString()) return;
				if (e.key === " ") e.preventDefault();
				const iframe = $(iframeSelector)[0];
				if (document.activeElement !== iframe) {
					var _iframe$contentWindow;
					(_iframe$contentWindow = iframe.contentWindow) === null || _iframe$contentWindow === void 0 || _iframe$contentWindow.postMessage({
						key: "transportShortcut",
						data: {
							key: e.key,
							code: e.code,
							altKey: e.altKey,
							ctrlKey: e.ctrlKey,
							shiftKey: e.shiftKey,
							metaKey: e.metaKey,
							repeat: e.repeat,
							bubbles: true,
							cancelable: true
						}
					}, "*");
					iframe.blur();
					iframe.focus();
				}
			});
			window.addEventListener("popstate", () => {
				setActive(window.location.href);
			});
			config.getEpisodeList().each((_, el) => {
				el.classList.add("k-episode-anchor");
				el.addEventListener("click", (e) => {
					e.preventDefault();
					if ($(".ready-to-change-iframe-src").length) return;
					if (!el.href) return;
					setActive(el.href);
				});
			});
			window.addEventListener("message", async (e) => {
				var _config$onPlayerMessa;
				if (!e.data.key) return;
				switch (e.data.key) {
					case "getSearchName":
						var _e$source;
						(_e$source = e.source) === null || _e$source === void 0 || _e$source.postMessage({
							key: "getSearchName",
							name: await search.getSearchName()
						}, { targetOrigin: "*" });
						break;
					case "getEpisode":
						var _e$source2;
						(_e$source2 = e.source) === null || _e$source2 === void 0 || _e$source2.postMessage({
							key: "getEpisode",
							name: await search.getEpisode()
						}, { targetOrigin: "*" });
						break;
					case "openLink":
						window.open(e.data.url);
						break;
					case "changeIframeSrc":
						var _iframe$contentWindow2;
						(_iframe$contentWindow2 = $(iframeSelector)[0].contentWindow) === null || _iframe$contentWindow2 === void 0 || _iframe$contentWindow2.location.replace(e.data.url);
						document.title = e.data.title;
						$(".ready-to-change-iframe-src").remove();
						break;
					case "prev":
					case "next": {
						if ($(".ready-to-change-iframe-src").length) return;
						const url = config.getSwitchEpisodeURL(e.data.key === "next");
						if (url) setActive(url);
						break;
					}
					case "enterwidescreen":
						$("body").css("overflow", "hidden");
						$("body").addClass("widescreen");
						$(iframeSelector).css({
							position: "fixed",
							left: 0,
							right: 0,
							bottom: 0,
							top: 0,
							zIndex: 2147483648
						});
						break;
					case "exitwidescreen":
						$("body").css("overflow", "");
						$("body").removeClass("widescreen");
						$(iframeSelector).removeAttr("style");
						break;
					case "timeupdate":
						if (config.history) logHis({
							animeName: await search.getSearchName(),
							episodeName: await search.getEpisode(),
							id: await config.history.getId(),
							url: window.location.href
						}, e.data.video.currentTime);
						break;
					case "canplay": {
						if (!config.subscribe) break;
						const sm = SubscriptionManager.getInstance(config.subscribe.storageKey);
						const id = config.subscribe.getId();
						if (id && sm.getSubscription(id)) {
							sm.updateSubscription(id, { current: {
								title: await search.getEpisode(),
								url: window.location.href
							} });
							checkSubscriptionUpdate(id, true);
						}
					}
				}
				(_config$onPlayerMessa = config.onPlayerMessage) === null || _config$onPlayerMessa === void 0 || _config$onPlayerMessa.call(config, e.data.key, e.data, e);
			});
			renderSubscribeBtn();
		}
		function runInIframe() {
			var _top;
			(_top = top) === null || _top === void 0 || _top.postMessage({
				key: "changeIframeSrc",
				url: $(iframeSelector).attr("src"),
				title: document.title
			}, "*");
		}
		function renderSubscribedAnimes() {
			if (!config.subscribe) return;
			const sm = SubscriptionManager.getInstance(config.subscribe.storageKey);
			const $updateInfo = config.subscribe.renderSubscribedAnimes(sm).find(".update-info");
			let isChekingUpdate = false;
			async function checkSubscriptionsUpdate(force = false) {
				if (isChekingUpdate) return;
				isChekingUpdate = true;
				await concurrency(sm.getSubscriptions().map((sub) => () => checkSubscriptionUpdate(sub.id, force)), 3, (done, total) => {
					$updateInfo.text(`更新中(${done}/${total})`);
				});
				$updateInfo.text(`于 ${(/* @__PURE__ */ new Date()).toLocaleTimeString()} 完成更新检查`);
				isChekingUpdate = false;
			}
			$updateInfo.on("click", () => {
				checkSubscriptionsUpdate(true);
			});
			checkSubscriptionsUpdate();
		}
		function renderSubscribeBtn() {
			if (!config.subscribe) return;
			const $btn = $("<button></button>");
			const sm = SubscriptionManager.getInstance(config.subscribe.storageKey);
			const id = config.subscribe.getId();
			const ICON_SUBSCRIBE = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 -960 960 960"  fill="currentColor" style="display: inline-block; vertical-align: -0.125em;"><path d="M480-500Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80Zm240-360v-120H600v-80h120v-120h80v120h120v80H800v120h-80ZM160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q14 4 27.5 8.5T593-772q-15 14-27 30.5T545-706q-15-7-31.5-10.5T480-720q-66 0-113 47t-47 113v280h320v-112q18 11 38 18t42 11v83h80v80H160Z"/></svg>`;
			const ICON_SUBSCRIBED = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 -960 960 960"  fill="currentColor" style="display: inline-block; vertical-align: -0.125em;"><path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z"/></svg>`;
			sm.onChange(() => {
				const sub = sm.getSubscription(id);
				$btn.html(`
          ${sub ? ICON_SUBSCRIBED : ICON_SUBSCRIBE}
            <span>${sub ? "已订阅" : "订阅"}</span>
         `);
			}, { immediate: true });
			$btn.on("click", async () => {
				$btn.text("处理中...");
				if (sm.getSubscription(id)) sm.deleteSubscription(id);
				else {
					const sub = await config.subscribe.getAnimeInfo(id, sm);
					sm.createSubscription(sub);
				}
			});
			config.subscribe.renderSubscribeBtn($btn, sm);
		}
		async function checkSubscriptionUpdate(id, force = false) {
			if (!config.subscribe) return;
			const sm = SubscriptionManager.getInstance(config.subscribe.storageKey);
			const sub = sm.getSubscription(id);
			if (!sub) return;
			const now = Date.now();
			if (!force) {
				if (sub.checkedAt - sub.updatedAt > 1e3 * 60 * 60 * 24 * 15) return;
				if (now - sub.updatedAt < 1e3 * 60 * 60 * 163) return;
				if (now - sub.checkedAt < 1e3 * 60 * 60) return;
			}
			try {
				const animeInfo = await config.subscribe.getAnimeInfo(id, sm);
				Object.assign(animeInfo, { checkedAt: now });
				sm.updateSubscription(id, animeInfo);
			} catch (error) {}
		}
		return {
			runInTop,
			runInIframe,
			createHistory,
			subscribe: {
				renderSubscribedAnimes,
				renderSubscribeBtn
			}
		};
	}

//#endregion
//#region src/adapter/agefans/subscribe.template.html
	var subscribe_template_default$1 = {
		"subListContainer": "<div id=\"subListContainer\" class=\"text_list_box mb-4\">\r\n  <div class=\"text_list_box--hd\">\r\n    <h6 class=\"title\">\r\n      <span class=\"float-end\">\r\n        <span class=\"update-info\" title=\"点击可强制更新数据\"></span>\r\n      </span>\r\n      订阅列表\r\n    </h6>\r\n  </div>\r\n  <div id=\"subList\"></div>\r\n</div>",
		"subList": "<div id=\"subList\">\r\n  {{# if (groups.every(o => o.list.length === 0)) { }}\r\n  <div class=\"text_list_box--bd\">\r\n    <div class=\"text_list_box_wrapper\">\r\n      <ul class=\"text_list_item\">\r\n        <li>\r\n          <div class=\"d-flex position-relative\">\r\n            <div class=\"flex-grow-1 text-truncate pe-2\">\r\n              订阅喜欢的番剧，在播放页面标题右侧添加订阅\r\n            </div>\r\n          </div>\r\n        </li>\r\n      </ul>\r\n    </div>\r\n  </div>\r\n  {{# } }}\r\n  \r\n  {{# groups.filter(o => !!o.list.length).forEach(({list, day}) => { }}\r\n  <div class=\"text_list_box--bd\">\r\n    <div class=\"sub-group-day\">{{day}}</div>\r\n    <div class=\"text_list_box_wrapper\">\r\n      <ul class=\"text_list_item\">\r\n        {{# list.forEach(item => { }}\r\n        <li>\r\n          <div class=\"d-flex position-relative\">\r\n            <div class=\"text-truncate pe-2\">\r\n              <a \n                href=\"{{item.current.url}}\"\r\n                class=\"text-decoration-none link-light common_alink\"\r\n                >{{item.title}}</a>\r\n            </div>\r\n            <div class=\"flex-grow-1 title_new\"></div>\r\n            <div class=\"title_sub text-truncate\">\r\n              <a \n                class=\"text-decoration-none link-light common_alink\"\r\n                href=\"{{item.current.url}}\"\r\n                >{{item.current.title}}</a>\r\n              <span>/</span>\r\n              <a \n                class=\"text-decoration-none link-light common_alink\"\r\n                href=\"{{item.last.url}}\"\r\n                >{{item.last.title}}</a>\r\n            </div>\r\n\r\n            <div class=\"sub-thumbnail-box\">\r\n              <img \n                class=\"sub-thumbnail\"\r\n                src=\"{{item.thumbnail}}\"\r\n                alt=\"{{item.title}}\"\r\n              >\r\n            </div>\r\n          </div>\r\n        </li>\r\n        {{# }) }}\r\n      </ul>\r\n    </div>\r\n  </div>\r\n  {{# }) }}\r\n</div>"
	};

//#endregion
//#region src/adapter/agefans/play.ts
	function calcSortDirection() {
		var _$prev$text$match, _$next$text$match, _$active$text$match;
		const $active = getActive$6();
		const $prev = $active.prev();
		const $next = $active.next();
		const prevText = (_$prev$text$match = $prev.text().match(/\d+/)) === null || _$prev$text$match === void 0 ? void 0 : _$prev$text$match[0];
		const nextText = (_$next$text$match = $next.text().match(/\d+/)) === null || _$next$text$match === void 0 ? void 0 : _$next$text$match[0];
		const activeText = (_$active$text$match = $active.text().match(/\d+/)) === null || _$active$text$match === void 0 ? void 0 : _$active$text$match[0];
		const prev = Number(prevText);
		const current = Number(activeText);
		const next = Number(nextText);
		if (prevText) if (prev < current) local.setItem("sortDirection", "asc");
		else local.setItem("sortDirection", "desc");
		else if (nextText) if (next > current) local.setItem("sortDirection", "asc");
		else local.setItem("sortDirection", "desc");
		else local.setItem("sortDirection", "asc");
		return local.getItem("sortDirection");
	}
	function getActiveTabIndex() {
		const match = window.location.pathname.match(/play\/.*\/(\d+)\/(\d+)/);
		if (match) {
			const activeTab = match[1];
			return Number(activeTab) - 1;
		}
		return null;
	}
	function getSortButon() {
		return $("button:contains(\"更改排序\")");
	}
	function rememberSortDirection() {
		getSortButon().on("click", () => {
			setTimeout(() => {
				calcSortDirection();
				activeScrollIntoView();
			}, 100);
		});
	}
	function getSortDirection() {
		return local.getItem("sortDirection", "asc");
	}
	function restoreSortDirection() {
		if (getSortDirection() === "desc") getSortButon().trigger("click");
	}
	function activeScrollIntoView() {
		const $active = getActive$6();
		function getScrollParent() {
			let parent = $active.parent()[0];
			while (parent && parent.tagName !== "BODY") {
				const overflowY = getComputedStyle(parent).overflowY;
				if (overflowY === "auto" || overflowY === "scroll") return parent;
				parent = parent.parentElement;
			}
			return document.body;
		}
		const scrollEl = getScrollParent();
		const scrollRect = scrollEl.getBoundingClientRect();
		const activeRect = $active[0].getBoundingClientRect();
		scrollEl.scrollTop += activeRect.top - scrollRect.top - 100;
	}
	function insertFocusBtn() {
		$(`
  <button id="k-focus" type="button" class="btn btn-sm btn-outline-light btn-playlist-order">聚焦</button>
  `).on("click", async () => {
			const idx = getActiveTabIndex();
			if (idx != null) {
				const $activeTab = $(".playlist-source-tab button[data-bs-toggle]").eq(idx);
				if (!$activeTab.hasClass("active")) {
					$activeTab.trigger("click");
					await sleep(100);
				}
			}
			activeScrollIntoView();
		}).prependTo(".playlist-source-tab .float-end");
	}
	function getActive$6() {
		return $(".video_detail_episode .video_detail_spisode_playing").parent();
	}
	function switchPart$6(next) {
		var _$nextActive$find$get;
		const $active = getActive$6();
		const sortDirection = getSortDirection();
		let $nextActive;
		if (sortDirection === "asc") $nextActive = $active[next ? "next" : "prev"]();
		else $nextActive = $active[next ? "prev" : "next"]();
		return (_$nextActive$find$get = $nextActive.find("a").get(0)) === null || _$nextActive$find$get === void 0 ? void 0 : _$nextActive$find$get.href;
	}
	const iframePlayer$6 = defineIframePlayer({
		iframeSelector: ".video_play_wrapper iframe",
		getActive: getActive$6,
		setActive: (href) => {
			$(".video_detail_episode a").each((_, el) => {
				const $el = $(el);
				if (el.href === href) $(".video_detail_spisode_playing").appendTo($el.parent());
			});
			$("#k-focus").trigger("click");
		},
		search: {
			getSearchName: () => $(".video_detail_wrapper .cata_video_item .card-title").text(),
			getEpisode: () => getActive$6().text()
		},
		getEpisodeList: () => $(".video_detail_episode a"),
		getSwitchEpisodeURL: (next) => switchPart$6(next),
		subscribe: {
			storageKey: "agefans-subscribe",
			getId: () => window.location.pathname.match(/play\/(\d+)/)[1],
			async getAnimeInfo(id, sm) {
				const res = await fetch(`/detail/${id}/`);
				const html = await res.text();
				if (res.status < 200 || res.status >= 300) throw new Error("Failed to fetch anime info");
				const $doc = $(html);
				const buildLabelSelector = (labels) => labels.map((label) => `.detail_imform_tag:contains('${label}')`).join(",");
				const getLabelValue = ($context, keywords) => {
					var _$context$find$0$next, _$context$find$;
					return (_$context$find$0$next = (_$context$find$ = $context.find(buildLabelSelector(keywords))[0]) === null || _$context$find$ === void 0 || (_$context$find$ = _$context$find$.nextSibling) === null || _$context$find$ === void 0 || (_$context$find$ = _$context$find$.textContent) === null || _$context$find$ === void 0 ? void 0 : _$context$find$.trim()) !== null && _$context$find$0$next !== void 0 ? _$context$find$0$next : "";
				};
				const createdAtText = getLabelValue($doc, ["首播时间"]);
				const statusText = getLabelValue($doc, ["播放状态"]);
				const $lists = $doc.find(".video_detail_episode");
				const longest = $lists.get().reduce((max, el) => {
					return max.children.length >= el.children.length ? max : el;
				}, $lists[0]);
				const $last = $(longest).find("li a").last();
				let sub = sm.getSubscription(id);
				const updateInfo = {
					updatedAt: 0,
					status: statusText,
					last: {
						title: $last.text(),
						url: $last.attr("href")
					}
				};
				if (sub) if (sub.last.url !== $last.attr("href")) updateInfo.updatedAt = closestSameDay(createdAtText).getTime();
				else updateInfo.updatedAt = sub.updatedAt;
				else {
					updateInfo.updatedAt = closestSameDay(createdAtText).getTime();
					const $current = getActive$6();
					sub = _objectSpread2({
						id,
						title: $(".video_detail_wrapper .cata_video_item .card-title").text(),
						url: $(".player-title-link").attr("href"),
						thumbnail: $(".video_thumbs").attr("src"),
						createdAt: Date.now(),
						checkedAt: Date.now(),
						current: {
							title: $current.text(),
							url: $current.find("a").attr("href")
						}
					}, updateInfo);
				}
				return _objectSpread2(_objectSpread2({}, sub), updateInfo);
			},
			renderSubscribedAnimes: function(sm) {
				const $root = $(subscribe_template_default$1.subListContainer);
				$root.insertBefore(".weekly_list");
				sm.onChange(() => {
					const groups = sm.getSubscriptionsGroupByDay();
					$root.find("#subList").replaceWith(template(subscribe_template_default$1.subList)({ groups }));
				}, { immediate: true });
				return $root;
			},
			renderSubscribeBtn($btn) {
				$btn.addClass("btn video_detail_meta float-end");
				$btn.insertAfter($(".video_detail_meta.feedback-popover.float-end"));
			}
		}
	});
	function playModule() {
		$(".video_detail_episode a").each((_, el) => {
			if (el.href) el.href = el.href.replace("http://", "https://");
		});
		iframePlayer$6.runInTop();
		rememberSortDirection();
		restoreSortDirection();
		insertFocusBtn();
		activeScrollIntoView();
	}
	function playModuleInIframe() {
		iframePlayer$6.runInIframe();
	}

//#endregion
//#region src/adapter/agefans/index.ts
	runtime.register({
		domains: [
			"age.tv",
			"agefans",
			"agedm"
		],
		opts: [
			{
				test: "*",
				run: () => {
					$("body").addClass("agefans-wrapper");
				}
			},
			{
				test: "/",
				run: iframePlayer$6.subscribe.renderSubscribedAnimes
			},
			{
				test: "/play",
				run: playModule
			},
			{
				test: "/play",
				run: playModuleInIframe,
				runInIframe: true
			}
		],
		search: {
			name: "agefans",
			search: (cn) => `https://www.age.tv/search?query=${cn}`,
			getAnimeScope: () => window.location.href.match(/\/play\/(\d+)/)[1]
		}
	});

//#endregion
//#region src/adapter/bimiacg/index.scss
	injectStyle(".bimi-wrapper .play-full,\n.bimi-wrapper #bkcl,\n.bimi-wrapper marquee {\n  display: none !important;\n}\n.bimi-wrapper .k-episode-anchor:visited {\n  color: white !important;\n}\n.bimi-wrapper a.episode-active {\n  background: var(--k-player-primary-color) !important;\n  color: var(--k-player-color) !important;\n}");

//#endregion
//#region src/adapter/bimiacg/play.ts
	function getActive$5() {
		return $(".episode-active");
	}
	function switchPart$5(next) {
		var _getActive$parent$fin;
		return (_getActive$parent$fin = getActive$5().parent()[next ? "next" : "prev"]().find("a")[0]) === null || _getActive$parent$fin === void 0 ? void 0 : _getActive$parent$fin.href;
	}
	function runInTop$5() {
		var _$$get;
		$("#bkcl").remove();
		if (local.getItem("bangumi-history")) {
			local.setItem("k-history", local.getItem("bangumi-history"));
			local.removeItem("bangumi-history");
		}
		$(".player_list a").each((_, el) => {
			if (el.href === location.href) {
				el.classList.add("episode-active");
				const parent = el.offsetParent;
				parent.scrollTop = el.offsetTop;
			}
		});
		(_$$get = $(".tb.player").get(0)) === null || _$$get === void 0 || _$$get.scrollIntoView({
			behavior: "smooth",
			block: "start"
		});
		iframePlayer$5.runInTop();
	}
	const iframePlayer$5 = defineIframePlayer({
		iframeSelector: "#playleft iframe",
		getActive: getActive$5,
		setActive: (href) => {
			$(".player_list a").each((_, el) => {
				if (el.href === href) el.classList.add("episode-active");
				else el.classList.remove("episode-active");
			});
		},
		search: {
			getSearchName: () => $(".v_path a.current").text(),
			getEpisode: () => getActive$5().text()
		},
		getEpisodeList: () => $(".player_list a"),
		getSwitchEpisodeURL: (next) => switchPart$5(next),
		history: {
			creator: (renderHistory) => {
				const $btn = $("<li class=\"item\"><a>历史</a></li>");
				$btn.on("click", renderHistory);
				$(".header-top__nav ul").append($btn);
			},
			getId: () => location.pathname.match(/* @__PURE__ */ new RegExp("\\/(?<id>\\d+)\\/play", "")).groups.id
		},
		onPlayerMessage: (key, data) => {
			if (key === "canplay") {
				const video = data.video;
				const width = $("#video").width();
				if (width) $("#video").height(video.height / video.width * width);
			}
		}
	});
	async function parser$5() {
		const video = await queryDom("video");
		video.src = "";
		const url = await execInUnsafeWindow(() => window.url);
		const player = new KPlayer("#player", { eventToParentWindow: true });
		if (url.includes("m3u8")) player.setM3u8(url);
		else player.src = url;
	}

//#endregion
//#region src/adapter/bimiacg/index.ts
	runtime.register({
		domains: [/bimiacg\d+.net/],
		opts: [
			{
				test: "*",
				setup: () => $("body").addClass("bimi-wrapper"),
				run: iframePlayer$5.createHistory
			},
			{
				test: /^\/(video|bangumi)\/\d+\/play\//,
				run: runInTop$5
			},
			{
				test: /^\/(video|bangumi)\/\d+\/play\//,
				run: iframePlayer$5.runInIframe,
				runInIframe: true
			},
			{
				test: "/static/danmu",
				runInIframe: true,
				run: parser$5
			}
		],
		search: {
			name: "BIMI动漫",
			search: (cn) => `http://www.bimiacg14.net/vod/search/wd/${cn}/`,
			getSearchName: () => {
				return new Promise((resolve) => {
					const fn = (e) => {
						if (e.data.key === "getSearchName") {
							resolve(e.data.name);
							window.removeEventListener("message", fn);
						}
					};
					window.addEventListener("message", fn);
					parent.postMessage({ key: "getSearchName" }, "*");
				});
			},
			getEpisode: () => {
				return new Promise((resolve) => {
					const fn = (e) => {
						if (e.data.key === "getEpisode") {
							resolve(e.data.name);
							window.removeEventListener("message", fn);
						}
					};
					window.addEventListener("message", fn);
					parent.postMessage({ key: "getEpisode" }, "*");
				});
			},
			getAnimeScope: () => {
				var _window$location$href;
				return ((_window$location$href = window.location.href.match(/\/(\d+)\/play/)) === null || _window$location$href === void 0 ? void 0 : _window$location$href[1]) || "";
			}
		}
	});

//#endregion
//#region src/adapter/mutean/play.ts
	function getActive$4() {
		return $(".module-play-list .module-play-list-link.active");
	}
	function switchPart$4(next) {
		var _getActive$get;
		return (_getActive$get = getActive$4()[next ? "next" : "prev"]().get(0)) === null || _getActive$get === void 0 ? void 0 : _getActive$get.href;
	}
	function runInTop$4() {
		$("body").addClass("mutefun");
		iframePlayer$4.runInTop();
	}
	const iframePlayer$4 = defineIframePlayer({
		iframeSelector: "#playleft iframe",
		getActive: getActive$4,
		setActive: (href) => {
			$(".module-play-list-link").each((_, el) => {
				if (el.href === href) {
					el.classList.add("active");
					$(".playon").insertAfter($(el).find("span"));
				} else el.classList.remove("active");
			});
		},
		search: {
			getSearchName: () => $(".module-info-heading h1").text(),
			getEpisode: () => getActive$4().text()
		},
		getEpisodeList: () => $(".module-play-list-link"),
		getSwitchEpisodeURL: (next) => switchPart$4(next)
	});
	async function parser$4() {
		const video = await queryDom("video");
		await wait(() => !!video.currentSrc);
		let url = await execInUnsafeWindow(() => window.config.url);
		video.src = "";
		const player = new KPlayer("#player", { eventToParentWindow: true });
		player.src = url;
		$("#ADplayer,#ADtip").remove();
	}

//#endregion
//#region src/adapter/mutean/index.scss
	injectStyle(".mutefun.widescreen .header,\n.mutefun.widescreen .module-player-side,\n.mutefun.widescreen .fixedGroup {\n  visibility: hidden;\n  pointer-events: none;\n}");

//#endregion
//#region src/adapter/mutean/index.ts
	runtime.register({
		domains: [
			".mutedm.",
			".mutean.",
			".mute01."
		],
		opts: [
			{
				test: "/vodplay",
				run: runInTop$4
			},
			{
				test: "/vodplay",
				run: iframePlayer$4.runInIframe,
				runInIframe: true
			},
			{
				test: ["/addons/dp/player/dp.php"],
				run: parser$4,
				runInIframe: true
			}
		],
		search: {
			name: "MuteFun",
			search: (cn) => `https://www.mutean.com/vodsearch/${cn}-------------.html`,
			getSearchName: () => {
				return new Promise((resolve) => {
					const fn = (e) => {
						if (e.data.key === "getSearchName") {
							resolve(e.data.name);
							window.removeEventListener("message", fn);
						}
					};
					window.addEventListener("message", fn);
					parent.postMessage({ key: "getSearchName" }, "*");
				});
			},
			getEpisode: () => {
				return new Promise((resolve) => {
					const fn = (e) => {
						if (e.data.key === "getEpisode") {
							resolve(e.data.name);
							window.removeEventListener("message", fn);
						}
					};
					window.addEventListener("message", fn);
					parent.postMessage({ key: "getEpisode" }, "*");
				});
			},
			getAnimeScope: () => {
				var _window$location$href;
				return ((_window$location$href = window.location.href.match(/\/vodplay\/(\d+)-/)) === null || _window$location$href === void 0 ? void 0 : _window$location$href[1]) || "";
			}
		}
	});

//#endregion
//#region src/adapter/cycanime/play.ts
	function getActive$3() {
		return $(".anthology-list-play li.on > a");
	}
	function switchPart$3(next) {
		var _getActive$parent$fin;
		return (_getActive$parent$fin = getActive$3().parent()[next ? "next" : "prev"]().find("a")[0]) === null || _getActive$parent$fin === void 0 ? void 0 : _getActive$parent$fin.href;
	}
	function runInTop$3() {
		$("body").addClass("cycanime");
		iframePlayer$3.runInTop();
	}
	const iframePlayer$3 = defineIframePlayer({
		iframeSelector: "#playleft iframe",
		getActive: getActive$3,
		setActive: (href) => {
			$(".anthology-list-play li a").each((_, el) => {
				if (el.href === href) {
					el.parentElement.classList.add("ecnav-dt", "on");
					$(".play-on").insertAfter($(el).find("span"));
				} else el.parentElement.classList.remove("ecnav-dt", "on");
			});
		},
		search: {
			getSearchName: () => $(".player-title-link").text(),
			getEpisode: () => getActive$3().text()
		},
		getEpisodeList: () => $(".anthology-list-play li a"),
		getSwitchEpisodeURL: (next) => switchPart$3(next)
	});
	async function parser$3() {
		const video = await queryDom("video");
		await wait(() => !!video.currentSrc);
		let url = video.currentSrc;
		video.src = "";
		const player = new KPlayer("#mui-player", { eventToParentWindow: true });
		player.src = url;
	}

//#endregion
//#region src/adapter/cycanime/index.scss
	injectStyle(".cycanime.widescreen .header_nav0,\n.cycanime.widescreen .top-back.hoa,\n.cycanime.widescreen .fixedGroup {\n  visibility: hidden;\n  pointer-events: none;\n}");

//#endregion
//#region src/adapter/cycanime/index.ts
	runtime.register({
		domains: [
			".cycanime.",
			".cyc-anime.",
			".cycani.",
			".ciyuancheng."
		],
		opts: [
			{
				test: "/watch",
				run: runInTop$3
			},
			{
				test: "/watch",
				run: iframePlayer$3.runInIframe,
				runInIframe: true
			},
			{
				test: () => location.hostname.includes("player.cycanime"),
				run: parser$3,
				runInIframe: true
			}
		],
		search: {
			name: "次元城",
			search: (cn) => `https://www.cycani.org/search.html?wd=${cn}`,
			getSearchName: () => {
				return new Promise((resolve) => {
					const fn = (e) => {
						if (e.data.key === "getSearchName") {
							resolve(e.data.name);
							window.removeEventListener("message", fn);
						}
					};
					window.addEventListener("message", fn);
					parent.postMessage({ key: "getSearchName" }, "*");
				});
			},
			getEpisode: () => {
				return new Promise((resolve) => {
					const fn = (e) => {
						if (e.data.key === "getEpisode") {
							resolve(e.data.name);
							window.removeEventListener("message", fn);
						}
					};
					window.addEventListener("message", fn);
					parent.postMessage({ key: "getEpisode" }, "*");
				});
			},
			getAnimeScope: () => {
				var _window$location$href;
				return ((_window$location$href = window.location.href.match(/\/watch\/(\d+)\//)) === null || _window$location$href === void 0 ? void 0 : _window$location$href[1]) || "";
			}
		}
	});

//#endregion
//#region src/adapter/xfani/play.ts
	function getActive$2() {
		return $(".anthology-list-play li.on > a");
	}
	function switchPart$2(next) {
		var _getActive$parent$fin;
		return (_getActive$parent$fin = getActive$2().parent()[next ? "next" : "prev"]().find("a")[0]) === null || _getActive$parent$fin === void 0 ? void 0 : _getActive$parent$fin.href;
	}
	function sendVideoParams() {
		const script = Array.from(document.scripts).find((item) => item.innerHTML.includes("iframeObj.contentWindow.postMessage"));
		new Function(script.innerHTML)();
	}
	function runInTop$2() {
		$("body").addClass("xfani");
		$(".player-news").remove();
		iframePlayer$2.runInTop();
		sendVideoParams();
	}
	const iframePlayer$2 = defineIframePlayer({
		iframeSelector: "#playleft iframe",
		getActive: getActive$2,
		setActive: (href) => {
			$(".anthology-list-play li a").each((_, el) => {
				if (el.href === href) {
					el.parentElement.classList.add("ecnav-dt", "on");
					$(".play-on").insertAfter($(el).find("span"));
				} else el.parentElement.classList.remove("ecnav-dt", "on");
			});
		},
		search: {
			getSearchName: () => $(".player-title-link").text(),
			getEpisode: () => getActive$2().text()
		},
		getEpisodeList: () => $(".anthology-list-play li a"),
		getSwitchEpisodeURL: (next) => switchPart$2(next)
	});
	async function parser$2() {
		const video = await queryDom("video");
		const cleanly = () => {
			video.pause();
			video.volume = 0;
		};
		setInterval(cleanly, 16);
		$("#loading").hide();
		$("#player").hide();
		$("body").append("<div id=\"player2\"></div>");
		const player = new KPlayer("#player2", { eventToParentWindow: true });
		player.src = new URLSearchParams(window.location.search).get("url");
	}

//#endregion
//#region src/adapter/xfani/index.scss
	injectStyle(".xfani.widescreen .header_nav0,\n.xfani.widescreen .top-back.hoa,\n.xfani.widescreen .fixedGroup {\n  visibility: hidden;\n  pointer-events: none;\n}");

//#endregion
//#region src/adapter/xfani/index.ts
	runtime.register({
		domains: [".xifanacg.", "player.moedot"],
		opts: [
			{
				test: "/watch",
				run: runInTop$2
			},
			{
				test: "/watch",
				run: iframePlayer$2.runInIframe,
				runInIframe: true
			},
			{
				test: () => location.hostname.includes("player.moedot"),
				run: parser$2,
				runInIframe: true
			}
		],
		search: {
			name: "稀饭动漫",
			search: (cn) => `https://dm.xifanacg.com/search.html?wd=${cn}`,
			getSearchName: () => {
				return new Promise((resolve) => {
					const fn = (e) => {
						if (e.data.key === "getSearchName") {
							resolve(e.data.name);
							window.removeEventListener("message", fn);
						}
					};
					window.addEventListener("message", fn);
					parent.postMessage({ key: "getSearchName" }, "*");
				});
			},
			getEpisode: () => {
				return new Promise((resolve) => {
					const fn = (e) => {
						if (e.data.key === "getEpisode") {
							resolve(e.data.name);
							window.removeEventListener("message", fn);
						}
					};
					window.addEventListener("message", fn);
					parent.postMessage({ key: "getEpisode" }, "*");
				});
			},
			getAnimeScope: () => {
				var _window$location$href;
				return ((_window$location$href = window.location.href.match(/\/watch\/(\d+)\//)) === null || _window$location$href === void 0 ? void 0 : _window$location$href[1]) || "";
			}
		}
	});

//#endregion
//#region src/adapter/standalone/play.ts
	function main() {
		replacePlayer();
	}
	function getUrlId(url) {
		const key = "k-player-standalone-url-store";
		const store = local.getItem(key, {});
		let id = store[url];
		if (!id) {
			id = Math.random().toString(36).slice(2);
			store[url] = id;
			local.setItem(key, store);
		}
		return id;
	}
	function replacePlayer() {
		const player = new KPlayer("#player");
		player.message.info("请使用Ctrl+V粘贴视频地址，或者拖拽视频文件/链接到页面", 6e4);
		player.on("loadstart", (e) => {
			player.message.destroy();
			const id = getUrlId(player.src);
			history.replaceState(null, "", `#${id}`);
		});
		window.addEventListener("paste", (e) => {
			var _e$clipboardData;
			const text = (_e$clipboardData = e.clipboardData) === null || _e$clipboardData === void 0 ? void 0 : _e$clipboardData.getData("text");
			if (text && isUrl(text)) player.src = text;
		});
	}

//#endregion
//#region src/adapter/standalone/index.ts
	runtime.register({
		domains: ["127.0.0.1", "ironkinoko.github.io"],
		opts: [{
			test: "*",
			run: main
		}],
		search: {
			getEpisode: () => "",
			getSearchName: () => "",
			getAnimeScope: () => "standalone"
		}
	});

//#endregion
//#region src/adapter/anime1/history.ts
	function historyModule() {
		const $btn = $(`<li class="menu-item">
      <a href="javascript:void(0)" >歷史</a>
    </li>`).on("click", renderHistory);
		$(".menu.nav-menu").append($btn);
	}

//#endregion
//#region src/adapter/anime1/index.scss
	injectStyle(".anime1 {\n  overflow: visible;\n}\n.anime1 * {\n  font-family: system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Oxygen, Ubuntu, Cantarell, \"Open Sans\", \"Helvetica Neue\", sans-serif;\n}\n@media screen and (min-width: 769px) {\n  .anime1 .single-page .content-area {\n    width: 100%;\n    float: none;\n  }\n  .anime1 .single-page .widget-area {\n    margin: 0 auto;\n    float: none;\n  }\n  .anime1 .single-page .widget-area .search-form {\n    text-align: center;\n  }\n  .anime1 .single-page .vjscontainer {\n    width: 100%;\n    height: auto;\n    max-width: unset;\n  }\n  .anime1 .single-page .vjscontainer .video-js {\n    pointer-events: none;\n  }\n}\n.anime1 .category .vjscontainer {\n  cursor: pointer;\n}\n.anime1 .category .vjscontainer .video-js {\n  pointer-events: none;\n}\n.anime1 #k-player-wrapper button,\n.anime1 #k-player-wrapper input[type=text],\n.anime1 #k-player-wrapper input[type=checkbox],\n.anime1 #k-player-wrapper select,\n.anime1 #k-player-wrapper textarea,\n.anime1 #k-player-wrapper label,\n.anime1 .k-modal button,\n.anime1 .k-modal input[type=text],\n.anime1 .k-modal input[type=checkbox],\n.anime1 .k-modal select,\n.anime1 .k-modal textarea,\n.anime1 .k-modal label {\n  color: inherit;\n  font-size: inherit;\n  line-height: inherit;\n  font-weight: 400;\n  word-wrap: break-word;\n}\n.anime1 #k-player-wrapper input[type=text],\n.anime1 #k-player-wrapper select,\n.anime1 .k-modal input[type=text],\n.anime1 .k-modal select {\n  color: #232323;\n  padding: unset;\n  background: white;\n}\n.anime1 #k-player-wrapper table,\n.anime1 .k-modal table {\n  border: none;\n}\n.anime1 #k-player-wrapper th,\n.anime1 #k-player-wrapper td,\n.anime1 .k-modal th,\n.anime1 .k-modal td {\n  background: white;\n}\n.anime1 #k-player-wrapper .k-input,\n.anime1 #k-player-wrapper .k-select,\n.anime1 .k-modal .k-input,\n.anime1 .k-modal .k-select {\n  background: white;\n  border: 1px solid #f1f1f1;\n  color: black;\n  outline: 0;\n  border-radius: 2px;\n  transition: all 0.15s ease;\n}\n.anime1 #k-player-wrapper .k-input:focus, .anime1 #k-player-wrapper .k-input:hover,\n.anime1 #k-player-wrapper .k-select:focus,\n.anime1 #k-player-wrapper .k-select:hover,\n.anime1 .k-modal .k-input:focus,\n.anime1 .k-modal .k-input:hover,\n.anime1 .k-modal .k-select:focus,\n.anime1 .k-modal .k-select:hover {\n  border-color: var(--k-player-primary-color);\n}\n.anime1 #k-player-wrapper .k-input::placeholder,\n.anime1 #k-player-wrapper .k-select::placeholder,\n.anime1 .k-modal .k-input::placeholder,\n.anime1 .k-modal .k-select::placeholder {\n  color: #999;\n}");

//#endregion
//#region src/adapter/anime1/play.ts
	async function fetchVideoLinks(params) {
		const { apireq, tserver, vid } = params;
		return {
			src: (await $.ajax({
				xhrFields: { withCredentials: true },
				type: "POST",
				url: "//v.anime1.me/api",
				contentType: "application/x-www-form-urlencoded",
				data: "d=" + apireq
			})).s[0].src,
			thumbnails: `https://${tserver}.anime1.me/${vid}/thumbnails.vtt`
		};
	}
	function enhanceSinglePage() {
		$("body").addClass("single-page");
	}
	async function runInSingle() {
		enhanceSinglePage();
		const vlinks = await fetchVideoLinks($(".video-js").data());
		const player = new KPlayer(".video-js", { previewThumbnails: {
			enabled: true,
			src: vlinks.thumbnails
		} });
		player.src = vlinks.src;
		player.on("prev", () => {
			player.message.destroy();
			player.message.info("该网站不支持跳转上一集");
		});
		player.on("next", () => {
			player.message.destroy();
			const target = $("a:contains(\"下一集\")")[0];
			if (target && target.hasAttribute("href") && !target.hasAttribute("disabled")) target.click();
			else player.message.info("没有下一集了");
		});
		player.on("timeupdate", () => {
			try {
				const animeName = $(".entry-title").text().replace(/\[\d+\]/, "").trim();
				const episodeName = $(".entry-title").text().match(/\[(\d+)\]/)[1].replace(/^0+/, "");
				const target = $("a:contains(\"全集連結\")")[0];
				const id = new URL(target.href).searchParams.get("cat");
				logHis({
					animeName,
					episodeName,
					url: window.location.href,
					id
				}, player.currentTime);
			} catch (error) {}
		});
	}
	function runInCategory() {
		$("body").addClass("category");
		$(".vjscontainer").on("click", function() {
			$(this).parent().prev().find("a")[0].click();
		});
	}

//#endregion
//#region src/adapter/anime1/index.ts
	runtime.register({
		domains: ["anime1.me"],
		opts: [
			{
				test: "*",
				run: () => {
					$("html").addClass("anime1");
					historyModule();
				}
			},
			{
				test: "category",
				run: runInCategory
			},
			{
				test: /^\/\d+/,
				run: runInSingle
			}
		],
		search: {
			name: "Anime1",
			search: (cn, tw) => `https://anime1.me/?s=${tw}`,
			getSearchName: () => {
				return $(".entry-title").text().replace(/\[\d+\]/, "").trim();
			},
			getEpisode: () => {
				try {
					return $(".entry-title").text().match(/\[(\d+)\]/)[1].replace(/^0+/, "");
				} catch (error) {
					return "";
				}
			},
			getAnimeScope: () => {
				try {
					const target = $("a:contains(\"全集連結\")")[0];
					return new URL(target.href).searchParams.get("cat");
				} catch (error) {
					return "";
				}
			}
		}
	});

//#endregion
//#region src/adapter/gugufan/play.ts
	function getActive$1() {
		return $(".anthology-list-play li.on > a");
	}
	function switchPart$1(next) {
		var _getActive$parent$fin;
		return (_getActive$parent$fin = getActive$1().parent()[next ? "next" : "prev"]().find("a")[0]) === null || _getActive$parent$fin === void 0 ? void 0 : _getActive$parent$fin.href;
	}
	function runInTop$1() {
		$("body").addClass("gugufan");
		$(".player-news,#buffer,#install").remove();
		iframePlayer$1.runInTop();
	}
	const iframePlayer$1 = defineIframePlayer({
		iframeSelector: "#playleft iframe",
		getActive: getActive$1,
		setActive: (href) => {
			$(".anthology-list-play li a").each((_, el) => {
				if (el.href === href) {
					el.parentElement.classList.add("ecnav-dt", "on");
					$(".play-on").insertAfter($(el).find("span"));
				} else el.parentElement.classList.remove("ecnav-dt", "on");
			});
		},
		search: {
			getSearchName: () => $(".player-title-link").text(),
			getEpisode: () => getActive$1().text()
		},
		getEpisodeList: () => $(".anthology-list-play li a"),
		getSwitchEpisodeURL: (next) => switchPart$1(next)
	});
	async function parser$1() {
		const video = await queryDom("video");
		await wait(() => !!video.currentSrc);
		video.src = "";
		$("#ADplayer").remove();
		$("#ADtip").remove();
		await execInUnsafeWindow(() => {
			var _EC$ad, _EC$dp;
			(_EC$ad = EC.ad) === null || _EC$ad === void 0 || _EC$ad.destroy();
			(_EC$dp = EC.dp) === null || _EC$dp === void 0 || _EC$dp.destroy();
		});
		const player = new KPlayer("#player", { eventToParentWindow: true });
		player.src = await execInUnsafeWindow(() => window.config.url);
	}
	async function parser2() {
		const video = await queryDom("video");
		let url = "";
		while (!url) {
			url = await execInUnsafeWindow(() => window.MIZHI.player_url);
			await sleep(16);
		}
		await wait(() => !!video.currentSrc);
		URL.revokeObjectURL(video.currentSrc);
		video.src = "";
		await execInUnsafeWindow(() => {
			window.MIZHI.art.destroy();
		});
		const player = new KPlayer("#loading", { eventToParentWindow: true });
		player.src = url;
		$(".layui-layer").remove();
	}

//#endregion
//#region src/adapter/gugufan/index.scss
	injectStyle(".gugufan.widescreen .header_nav0,\n.gugufan.widescreen .header_nav1,\n.gugufan.widescreen .top-back.hoa,\n.gugufan.widescreen .fixedGroup {\n  visibility: hidden;\n  pointer-events: none;\n}");

//#endregion
//#region src/adapter/gugufan/index.ts
	runtime.register({
		domains: [".gugu3."],
		opts: [
			{
				test: /^\/index.php\/vod\/play/,
				run: runInTop$1
			},
			{
				test: /^\/index.php\/vod\/play/,
				run: iframePlayer$1.runInIframe,
				runInIframe: true
			},
			{
				test: "/addons/dp/player",
				run: parser$1,
				runInIframe: true
			},
			{
				test: "?url=",
				run: parser2,
				runInIframe: true
			}
		],
		search: {
			name: "咕咕番",
			search: (cn) => `https://www.gugu3.com/index.php/vod/search.html?wd=${cn}`,
			getSearchName: () => {
				return new Promise((resolve) => {
					const fn = (e) => {
						if (e.data.key === "getSearchName") {
							resolve(e.data.name);
							window.removeEventListener("message", fn);
						}
					};
					window.addEventListener("message", fn);
					parent.postMessage({ key: "getSearchName" }, "*");
				});
			},
			getEpisode: () => {
				return new Promise((resolve) => {
					const fn = (e) => {
						if (e.data.key === "getEpisode") {
							resolve(e.data.name);
							window.removeEventListener("message", fn);
						}
					};
					window.addEventListener("message", fn);
					parent.postMessage({ key: "getEpisode" }, "*");
				});
			},
			getAnimeScope: () => {
				var _window$location$href;
				return ((_window$location$href = window.location.href.match(/\/id\/(\d+)\//)) === null || _window$location$href === void 0 ? void 0 : _window$location$href[1]) || "";
			}
		}
	});

//#endregion
//#region src/adapter/girigirilove/subscribe.template.html
	var subscribe_template_default = {
		"subListContainer": "<div id=\"subListContainer\" class=\"box-width wow fadeInUp\">\r\n  <div class=\"overflow\">\r\n    <div class=\"title flex between top40 rel\">\r\n      <div class=\"title-left\">\r\n        <h4 class=\"title-h cor4\">订阅列表</h4>\r\n        <div class=\"update-info cor5\"></div>\r\n      </div>\r\n    </div>\r\n\r\n    <div id=\"subList\"></div>\r\n  </div>\r\n</div>",
		"subList": "<div id=\"subList\">\r\n  {{# if (groups.every(o => o.list.length === 0)) { }}\r\n  <div class=\"cor4 empty-tip\">订阅喜欢的番剧，在播放页面标题右侧添加订阅</div>\r\n  {{# } }}\r\n  \r\n  <div class=\"sub-list rel border-box public-r hide-b-2 diy-center1 mask2\">\r\n    <div class=\"swiper-wrapper\">\r\n      {{# groups.filter(o => !!o.list.length).forEach((group) => {\r\n      group.list.forEach((item) => { }}\r\n      <div class=\"public-list-box public-pic-b swiper-slide\">\r\n        <div class=\"public-list-div public-list-bj\">\r\n          <a \n            target=\"_blank\"\r\n            class=\"public-list-exp\"\r\n            href=\"{{item.current.url}}\"\r\n            title=\"{{item.title}}\"\r\n          >\r\n            <img \n              class=\"lazy lazy1 gen-movie-img entered loaded\"\r\n              referrerpolicy=\"no-referrer\"\r\n              src=\"{{item.thumbnail}}\"\r\n              alt=\"{{item.title}}\"\r\n              data-src=\"{{item.thumbnail}}\"\r\n              data-ll-status=\"loaded\"\r\n            >\r\n            <span class=\"public-bg\"></span>\r\n            <div class=\"public-prt k-day-{{group.dayNum}}\">\r\n              {{group.day + ' ' + new\r\n              Date(item.updatedAt).toLocaleTimeString().slice(0,-3) }}\r\n            </div>\r\n            <span class=\"public-list-prb hide ft2\">{{item.status}}</span>\r\n          </a>\r\n        </div>\r\n        <div class=\"public-list-button\">\r\n          <a \n            target=\"_blank\"\r\n            class=\"time-title hide ft4 bold\"\r\n            href=\"{{item.current.url}}\"\r\n            title=\"{{item.title}}\"\r\n            >{{item.title}}</a>\r\n          <div class=\"public-list-subtitle cor5 hide ft2\">\r\n            <span>观看至</span>\r\n            <a \n              target=\"_blank\"\r\n              href=\"{{item.current.url}}\"\r\n              title=\"{{item.current.title}}\"\r\n              >{{item.current.title}}</a>\r\n            <span>/</span>\r\n            <a \n              target=\"_blank\"\r\n              href=\"{{item.last.url}}\"\r\n              title=\"{{item.last.title}}\"\r\n              >{{item.last.title}}</a>\r\n          </div>\r\n        </div>\r\n      </div>\r\n      {{# })}) }}\r\n    </div>\r\n\r\n    <div class=\"vod-list-page\">\r\n      <a class=\"swiper-button-prev\" href=\"javascript:\" tabindex=\"-1\">\r\n        <i class=\"fa ds-fanhui\"></i>\r\n      </a>\r\n      <a class=\"swiper-button-next\" href=\"javascript:\" tabindex=\"0\">\r\n        <i class=\"fa ds-jiantouyou\"> </i>\r\n      </a>\r\n    </div>\r\n  </div>\r\n</div>"
	};

//#endregion
//#region src/adapter/girigirilove/play.ts
	function getActive() {
		return $(".anthology-list-play li.on > a");
	}
	function switchPart(next) {
		var _getActive$parent$fin;
		return (_getActive$parent$fin = getActive().parent()[next ? "next" : "prev"]().find("a")[0]) === null || _getActive$parent$fin === void 0 ? void 0 : _getActive$parent$fin.href;
	}
	function getEpisodeId() {
		var _window$location$path;
		return ((_window$location$path = window.location.pathname.match(/\/playGV(\d+)-/)) === null || _window$location$path === void 0 ? void 0 : _window$location$path[1]) || "";
	}
	function runInTop() {
		$(".player-news,#buffer,#install").remove();
		iframePlayer.runInTop();
	}
	const iframePlayer = defineIframePlayer({
		iframeSelector: "#playleft iframe",
		getActive,
		setActive: (href) => {
			$(".anthology-list-play li a").each((_, el) => {
				if (el.href === href) {
					el.parentElement.classList.add("ecnav-dt", "on");
					$(".play-on").insertAfter($(el).find("span"));
				} else el.parentElement.classList.remove("ecnav-dt", "on");
			});
		},
		search: {
			getSearchName: () => $(".player-title-link").text(),
			getEpisode: () => getActive().text()
		},
		getEpisodeList: () => $(".anthology-list-play li a"),
		getSwitchEpisodeURL: (next) => switchPart(next),
		subscribe: {
			storageKey: "girigirilove_subscriptions",
			getId: getEpisodeId,
			async getAnimeInfo(id, sm) {
				const res = await fetch(`/GV${id}/`);
				if (res.status < 200 || res.status >= 300) throw new Error("Failed to fetch anime info");
				const html = await res.text();
				const $doc = $(html);
				const buildLabelSelector = (labels) => labels.map((label) => `em.cor4:contains('${label}')`).join(",");
				const getLabelValue = ($context, keywords) => {
					var _$context$find$0$next, _$context$find$;
					return (_$context$find$0$next = (_$context$find$ = $context.find(buildLabelSelector(keywords))[0]) === null || _$context$find$ === void 0 || (_$context$find$ = _$context$find$.nextSibling) === null || _$context$find$ === void 0 || (_$context$find$ = _$context$find$.textContent) === null || _$context$find$ === void 0 ? void 0 : _$context$find$.trim()) !== null && _$context$find$0$next !== void 0 ? _$context$find$0$next : "";
				};
				const updatedAtText = getLabelValue($doc, ["更新"]);
				const statusText = getLabelValue($doc, [
					"状态",
					"狀态",
					"狀態"
				]);
				const $lists = $doc.find(".anthology-list-play");
				const longest = $lists.get().reduce((max, el) => {
					return max.children.length >= el.children.length ? max : el;
				}, $lists[0]);
				const $last = $(longest).find("li a").last();
				const updateInfo = {
					updatedAt: new Date(updatedAtText).getTime(),
					status: statusText,
					last: {
						title: $last.text(),
						url: $last.attr("href")
					}
				};
				let sub = sm.getSubscription(id);
				if (!sub) {
					const $current = getActive();
					sub = _objectSpread2({
						id,
						title: $(".player-title-link").text(),
						url: $(".player-title-link").attr("href"),
						thumbnail: $(".play-details-top .this-pic img").attr("data-src"),
						createdAt: Date.now(),
						checkedAt: Date.now(),
						current: {
							title: $current.text(),
							url: $current.attr("href")
						}
					}, updateInfo);
				}
				return _objectSpread2(_objectSpread2({}, sub), updateInfo);
			},
			renderSubscribedAnimes: (sm) => {
				const $root = $(subscribe_template_default.subListContainer);
				$root.insertBefore("#week-module-box");
				sm.onChange(() => {
					const groups = sm.getSubscriptionsGroupByDay();
					$root.find("#subList").replaceWith(template(subscribe_template_default.subList)({ groups }));
					execInUnsafeWindow(() => {
						if (typeof window.Swiper !== "undefined") new window.Swiper(".sub-list", {
							slidesPerView: "auto",
							slidesPerGroup: 2,
							navigation: {
								nextEl: ".swiper-button-next",
								prevEl: ".swiper-button-prev"
							}
						});
					});
				}, { immediate: true });
				return $root;
			},
			renderSubscribeBtn($btn) {
				$btn.addClass("cor5 r6");
				$btn.prependTo($(".anthology-header .function"));
			}
		}
	});
	async function parser() {
		const video = await queryDom("video");
		await wait(() => !!video.currentSrc);
		video.src = "";
		const player = new KPlayer("#APlayer", { eventToParentWindow: true });
		player.src = new URLSearchParams(location.search).get("url");
	}

//#endregion
//#region src/adapter/girigirilove/index.scss
	injectStyle(".girigirilove .empty-tip {\n  width: 100%;\n  padding: 40px 20px 20px;\n  text-align: center;\n}\n.girigirilove .update-info {\n  font-family: system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Oxygen, Ubuntu, Cantarell, \"Open Sans\", \"Helvetica Neue\", sans-serif;\n  font-size: 12px;\n  margin-top: 4px;\n}\n.girigirilove .update-info:hover {\n  cursor: pointer;\n  text-decoration: underline;\n}\n.girigirilove .k-day-0 {\n  background-color: rgb(232, 93, 188);\n}\n.girigirilove .k-day-1 {\n  background-color: rgb(255, 82, 82);\n}\n.girigirilove .k-day-2 {\n  background-color: rgb(255, 145, 77);\n}\n.girigirilove .k-day-3 {\n  background-color: rgb(255, 212, 61);\n}\n.girigirilove .k-day-4 {\n  background-color: rgb(72, 219, 151);\n}\n.girigirilove .k-day-5 {\n  background-color: rgb(66, 184, 221);\n}\n.girigirilove .k-day-6 {\n  background-color: rgb(141, 104, 232);\n}\n.girigirilove.widescreen .head,\n.girigirilove.widescreen .header_nav0,\n.girigirilove.widescreen .header_nav1,\n.girigirilove.widescreen .top-back.hoa,\n.girigirilove.widescreen .fixedGroup {\n  visibility: hidden;\n  pointer-events: none;\n}");

//#endregion
//#region src/adapter/girigirilove/index.ts
	runtime.register({
		domains: [".girigirilove."],
		opts: [
			{
				test: "*",
				run: () => $("body").addClass("girigirilove")
			},
			{
				test: "/",
				run: iframePlayer.subscribe.renderSubscribedAnimes
			},
			{
				test: "/playGV",
				run: runInTop
			},
			{
				test: "/playGV",
				run: iframePlayer.runInIframe,
				runInIframe: true
			},
			{
				test: "/addons/aplyer",
				run: parser,
				runInIframe: true
			}
		],
		search: {
			name: "girigiri爱",
			search: (cn) => `https://bgm.girigirilove.com/search/-------------/?wd=${cn}`,
			getSearchName: () => {
				return new Promise((resolve) => {
					const fn = (e) => {
						if (e.data.key === "getSearchName") {
							resolve(e.data.name);
							window.removeEventListener("message", fn);
						}
					};
					window.addEventListener("message", fn);
					parent.postMessage({ key: "getSearchName" }, "*");
				});
			},
			getEpisode: () => {
				return new Promise((resolve) => {
					const fn = (e) => {
						if (e.data.key === "getEpisode") {
							resolve(e.data.name);
							window.removeEventListener("message", fn);
						}
					};
					window.addEventListener("message", fn);
					parent.postMessage({ key: "getEpisode" }, "*");
				});
			},
			getAnimeScope: () => {
				var _window$location$href;
				return ((_window$location$href = window.location.href.match(/\/playGV(\d+)-/)) === null || _window$location$href === void 0 ? void 0 : _window$location$href[1]) || "";
			}
		}
	});

//#endregion
//#region src/index.ts
	templateSettings.interpolate = /{{([^#-][\s\S]+?)}}/g;
	templateSettings.escape = /{{-([\s\S]+?)}}/g;
	templateSettings.evaluate = /{{#([\s\S]+?)}}/g;
	runtime.run();

//#endregion
})(OpenCC, Hls, Plyr, Danmaku);