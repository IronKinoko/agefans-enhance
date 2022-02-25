// ==UserScript==
// @name         agefans Enhance
// @namespace    https://github.com/IronKinoko/agefans-enhance
// @icon         https://www.agemys.com/favicon.ico
// @version      1.22.1
// @description  增强agefans播放功能，实现自动换集、无缝换集、画中画、历史记录、断点续播、弹幕等功能
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
// @require      https://cdn.jsdelivr.net/npm/@ironkinoko/danmaku@1.0.0/dist/danmaku.min.js
// @resource     plyrCSS https://cdn.jsdelivr.net/npm/plyr@3.6.4/dist/plyr.min.css
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @license      MIT
// ==/UserScript==

(function() {
    let plyrCSS = GM_getResourceText('plyrCSS')  
    GM_addStyle(plyrCSS)
})();

(function (Hls, Plyr, Danmaku) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var Hls__default = /*#__PURE__*/_interopDefaultLegacy(Hls);
  var Plyr__default = /*#__PURE__*/_interopDefaultLegacy(Plyr);
  var Danmaku__default = /*#__PURE__*/_interopDefaultLegacy(Danmaku);

  var e=[],t=[];function n(n,r){if(n&&"undefined"!=typeof document){var a,s=!0===r.prepend?"prepend":"append",d=!0===r.singleTag,i="string"==typeof r.container?document.querySelector(r.container):document.getElementsByTagName("head")[0];if(d){var u=e.indexOf(i);-1===u&&(u=e.push(i)-1,t[u]={}),a=t[u]&&t[u][s]?t[u][s]:t[u][s]=c();}else a=c();65279===n.charCodeAt(0)&&(n=n.substring(1)),a.styleSheet?a.styleSheet.cssText+=n:a.appendChild(document.createTextNode(n));}function c(){var e=document.createElement("style");if(e.setAttribute("type","text/css"),r.attributes)for(var t=Object.keys(r.attributes),n=0;n<t.length;n++)e.setAttribute(t[n],r.attributes[t[n]]);var a="prepend"===s?"afterbegin":"beforeend";return i.insertAdjacentElement(a,e),e}}

  var css$e = ":root {\n  --k-player-background-highlight: rgba(95, 95, 95, 0.65);\n  --k-player-background: rgba(0, 0, 0, 0.65);\n  --k-player-color: white;\n  --k-player-primary-color: #00b3ff;\n}\n\n.k-menu {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n  border-radius: 4px;\n  overflow: hidden;\n}\n.k-menu-item {\n  padding: 0 16px;\n  line-height: 36px;\n  height: 36px;\n  cursor: pointer;\n  width: 100%;\n  white-space: nowrap;\n  color: white;\n  transition: all 0.3s;\n  text-align: center;\n}\n.k-menu-item:hover {\n  background: var(--k-player-background-highlight);\n}\n\n.k-menu-item.k-menu-active {\n  color: var(--k-player-primary-color);\n}\n\n.k-settings-list {\n  margin: 0;\n  padding: 8px;\n  text-align: left;\n}\n.k-settings-item {\n  width: 100%;\n  white-space: nowrap;\n  color: white;\n  display: flex;\n  align-items: center;\n}\n.k-settings-item + .k-settings-item {\n  margin-top: 8px;\n}\n.k-settings-item input {\n  margin: 0 4px 0 0;\n}";
  n(css$e,{});

  function createTest(target) {
      return (test) => typeof test === 'string'
          ? target.includes(test) || test === '*'
          : test.test(target);
  }
  class Runtime {
      constructor() {
          this.list = [];
      }
      register(item) {
          this.list.push(item);
      }
      async getSearchActions() {
          const isInIframe = parent !== self;
          const searchs = this.list
              .map((o) => o.search)
              .filter(Boolean)
              .filter((o) => !(isInIframe && o.disabledInIframe));
          const register = this.getActiveRegister();
          const info = await this.getCurrentVideoNameAndEpisode();
          if (!(info === null || info === void 0 ? void 0 : info.name))
              return [];
          let name = info.name;
          return searchs
              .filter((search) => search !== register.search)
              .map((search) => ({
              name: search.name,
              search: () => {
                  const url = search.search(encodeURIComponent(name));
                  if (!url)
                      return;
                  if (isInIframe)
                      parent.postMessage({ key: 'openLink', url }, '*');
                  else
                      window.open(url);
              },
          }));
      }
      async getCurrentVideoNameAndEpisode() {
          var _a, _b, _c;
          const register = this.getActiveRegister();
          if (!((_a = register.search) === null || _a === void 0 ? void 0 : _a.getSearchName))
              return;
          let rawName = await register.search.getSearchName();
          let episode = (await ((_c = (_b = register.search).getEpisode) === null || _c === void 0 ? void 0 : _c.call(_b))) || '';
          if (!rawName)
              return;
          let name = rawName
              .replace(/第.季/, '')
              .replace(/[<>《》''‘’""“”\[\]]/g, '')
              .trim();
          episode = episode.replace(/[第集]/g, '');
          return { name, rawName, episode };
      }
      getActiveRegister() {
          const registers = this.list.filter(({ domains }) => domains.some(createTest(location.origin)));
          if (registers.length !== 1)
              throw new Error('激活的域名应该就一个');
          return registers[0];
      }
      getActiveOpts() {
          const register = this.getActiveRegister();
          return register.opts.filter(({ test }) => {
              const testArr = Array.isArray(test) ? test : [test];
              return testArr.some(createTest(location.pathname + location.search));
          });
      }
      run() {
          let setupList = [];
          let runList = [];
          const opts = this.getActiveOpts();
          opts.forEach(({ run, runInIframe, setup }) => {
              if (runInIframe || parent === self) {
                  setup && setupList.push(setup);
                  runList.push(run);
              }
          });
          setupList.forEach((setup) => setup());
          window.addEventListener('DOMContentLoaded', () => {
              runList.forEach((run) => run());
          });
      }
  }
  const runtime = new Runtime();

  var css$d = ".agefans-wrapper .loginout a {\n  cursor: pointer;\n  text-decoration: underline;\n}\n.agefans-wrapper .loginout a + a {\n  margin-left: 8px;\n}\n.agefans-wrapper .nav_button {\n  cursor: pointer;\n}\n.agefans-wrapper .res_links {\n  word-break: break-all;\n  word-wrap: break-word;\n}\n\n@media (max-width: 480px) {\n  .nav_button:nth-child(n+6) {\n    display: inline-block;\n  }\n\n  #nav {\n    position: relative;\n    overflow-x: auto;\n    white-space: nowrap;\n    height: 91px;\n  }\n  #nav::-webkit-scrollbar {\n    display: none;\n  }\n  #nav .nav_button {\n    white-space: nowrap;\n  }\n\n  #top_search_from {\n    width: calc(100% - 16px);\n    float: left;\n    margin-top: 10px;\n    position: sticky;\n    left: 8px;\n    margin: 8px;\n  }\n\n  #new_tip1 {\n    margin-top: 10px !important;\n  }\n}";
  n(css$d,{});

  var css$c = ".agefans-wrapper .page-preview-trigger .page-preview {\n  position: fixed;\n  pointer-events: none;\n  background-color: #202020;\n  border: 1px solid #404041;\n  z-index: 1000;\n  display: flex;\n  border-radius: 4px;\n  overflow: hidden;\n}\n.agefans-wrapper .page-preview-trigger .page-preview-center {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n.agefans-wrapper .page-preview-trigger .page-preview .baseblock2 {\n  border: none;\n  border-left: 1px solid #404041;\n  border-radius: 0;\n}\n.agefans-wrapper .page-preview-trigger .blocktitle.detail_title1 {\n  color: #e0e0e0;\n  border-bottom: 1px solid #404041;\n}\n.agefans-wrapper .page-preview-trigger .detail_imform_tag {\n  display: inline-block;\n  color: #808081;\n  min-width: 5em;\n}\n.agefans-wrapper .page-preview-trigger .detail_imform_value {\n  color: #e0e0e0;\n}\n.agefans-wrapper .page-preview-trigger .detail_imform_show_full {\n  display: none;\n}\n.agefans-wrapper .page-preview-trigger .detail_imform_kv {\n  min-width: 200px;\n  max-width: 256px;\n  display: inline-block;\n  margin: 3px 0px;\n  word-break: break-all;\n  word-wrap: break-word;\n}\n.agefans-wrapper .page-preview-trigger .detail_imform_desc_pre {\n  font-size: 15px;\n}\n.agefans-wrapper .page-preview-trigger .detail_imform_desc_pre * {\n  color: #e0e0e0;\n}\n.agefans-wrapper .page-preview-trigger .detail_imform_name {\n  margin: 0px;\n  color: #d0e0f0;\n  font-size: 1.2em;\n  font-weight: bold;\n  display: inline-block;\n}";
  n(css$c,{});

  function createStorage$1(storage) {
      function getItem(key, defaultValue) {
          try {
              const value = storage.getItem(key);
              if (value)
                  return JSON.parse(value);
              return defaultValue;
          }
          catch (error) {
              return defaultValue;
          }
      }
      return {
          getItem,
          setItem(key, value) {
              storage.setItem(key, JSON.stringify(value));
          },
          removeItem: storage.removeItem.bind(storage),
          clear: storage.clear.bind(storage),
      };
  }
  const session = createStorage$1(window.sessionStorage);
  const local = createStorage$1(window.localStorage);
  const gm = {
      getItem: GM_getValue,
      setItem: GM_setValue,
  };

  function parseToURL(url, count = 0) {
      if (count > 4)
          throw new Error('url解析失败 ' + url);
      try {
          url = new URL(url);
      }
      catch (error) {
          url = decodeURIComponent(url);
          url = parseToURL(url, ++count);
      }
      return url.toString();
  }

  function ageBlock(params) {
      const { title, content } = params;
      return `<div class="baseblock">
  <div class="blockcontent">
    <div class="baseblock2">
      <div class="blocktitle">${title}</div>
      <div class="blockcontent">${content}</div>
    </div>
  </div>
</div>`;
  }

  function set(name, value, _in_days = 1) {
      var Days = _in_days;
      var exp = new Date();
      exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
      document.cookie =
          name +
              '=' +
              escape(String(value)) +
              ';expires=' +
              exp.toUTCString() +
              ';path=/';
  }
  function get(name) {
      let reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
      let arr = document.cookie.match(reg);
      if (arr) {
          return decodeURIComponent(arr[2]);
      }
      else {
          return null;
      }
  }
  const Cookie = {
      get,
      set,
      remove: function (name) {
          set(name, '', 0);
      },
  };

  /**
   * agefans 安全机制：
   * 1. 从服务端获取cookie `t1` `k1`
   * 2. 本地根据规则生成cookie `t2` `k2`
   * 3. 获取链接时候生成cookie `fa_t` `fa_c`
   *
   * t1 t2 fa_t 均为时间，相差太多就报错超时
   * k1 k2 类似密钥
   * fa_c 不重要
   */
  /**
   * 获取视频链接的请求地址
   */
  function getPlayUrl(_url) {
      const _rand = Math.random();
      var _getplay_url = _url.replace(/.*\/play\/(\d+?)\?playid=(\d+)_(\d+).*/, '/_getplay?aid=$1&playindex=$2&epindex=$3') +
          '&r=' +
          _rand;
      /**
       * fa_t 取当前时间
       * fa_c 1-9之间随便取 固定1就行
       */
      Cookie.set('fa_t', Date.now(), 1);
      Cookie.set('fa_c', 1, 1);
      return _getplay_url;
  }
  /**
   * 因为agefans的安全策略，需要刷新下cookie才能正常访问
   *
   * 这个方法实现了 t1 k1 t2 k2 全部刷新
   */
  function updateCookie(href) {
      href = href ? location.origin + href : location.href;
      return new Promise((resolve, reject) => {
          var _a, _b, _c;
          const doneFn = () => {
              resolve();
              dom.remove();
          };
          // DOMContentLoaded is faster than load
          const dom = document.createElement('iframe');
          dom.style.display = 'none';
          dom.src = href;
          document.body.append(dom);
          (_a = dom.contentWindow) === null || _a === void 0 ? void 0 : _a.addEventListener('DOMContentLoaded', doneFn);
          (_b = dom.contentWindow) === null || _b === void 0 ? void 0 : _b.addEventListener('load', doneFn);
          (_c = dom.contentWindow) === null || _c === void 0 ? void 0 : _c.addEventListener('error', reject);
      });
  }

  const LOCAL_PLAY_URL_KEY = 'play-url-key';
  function insertBTSites() {
      const title = $('#detailname a').text();
      const encodedTitle = encodeURIComponent(title);
      const sites = [
          {
              title: '蜜柑计划',
              url: `https://mikanani.me/Home/Search?searchstr=${encodedTitle}`,
          },
      ];
      $(ageBlock({
          title: '种子资源：',
          content: sites
              .map((site) => `<a href="${site.url}" rel="noreferrer" target="_blank" class="res_links_a">${site.title}</a>`)
              .join(''),
      })).insertAfter('.baseblock:contains(网盘资源)');
  }
  const loadingIcon = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin-right:4px;" width="1em" height="1em" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
  <circle cx="50" cy="50" fill="none" stroke="#5699d2" stroke-width="10" r="40" stroke-dasharray="164.93361431346415 56.97787143782138">
    <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="0.6s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform>
  </circle>
</svg>`;
  function getLocal(href) {
      const map = session.getItem(LOCAL_PLAY_URL_KEY, {});
      if (href) {
          const item = map[href];
          if (!item)
              return null;
          return item.url;
      }
      return map;
  }
  function saveLocal(href, url) {
      const map = getLocal();
      map[href] = { url };
      session.setItem(LOCAL_PLAY_URL_KEY, map);
  }
  function removeLocal(href) {
      const map = getLocal();
      delete map[href];
      session.setItem(LOCAL_PLAY_URL_KEY, map);
  }
  class AGEfansError extends Error {
      constructor(message) {
          super(message);
          this.name = 'AGEfans Enhance Exception';
      }
  }
  async function getVurl(href) {
      const res = await fetch(getPlayUrl(href), {
          referrerPolicy: 'strict-origin-when-cross-origin',
      });
      const text = await res.text();
      if (text.includes('ipchk')) {
          throw new AGEfansError(`你被限流了，请5分钟后重试（${text}）`);
      }
      if (text.includes('timeout')) {
          throw new AGEfansError(`Cookie过期，请刷新页面重试（${text}）`);
      }
      function __qpic_chkvurl_converting(_in_vurl) {
          const vurl = decodeURIComponent(_in_vurl);
          const match_resl = vurl.match(/^http.+\.f20\.mp4\?ptype=http\?w5=0&h5=0&state=1$/);
          return !!match_resl;
      }
      const _json_obj = JSON.parse(text);
      const _purl = _json_obj['purl'];
      const _vurl = _json_obj['vurl'];
      const _playid = _json_obj['playid'];
      if (__qpic_chkvurl_converting(_vurl)) {
          throw new AGEfansError('视频转码中，请稍后再试');
      }
      if (_playid === '<play>QLIVE</play>') {
          throw new AGEfansError('脚本不支持QLIVE模式，请使用关闭脚本使用原生播放');
      }
      let _url = _purl + _vurl;
      let url = new URL(_url, location.origin);
      const vurl = url.searchParams.get('url');
      return parseToURL(vurl);
  }
  async function getVurlWithLocal(href) {
      let vurl = getLocal(href);
      if (vurl) {
          return vurl;
      }
      await updateCookie(href);
      vurl = await getVurl(href);
      saveLocal(href, vurl);
      return vurl;
  }
  function initGetAllVideoURL() {
      insertBTSites();
  }

  var css$b = ".k-modal {\n  position: fixed;\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: 1000;\n  text-align: left;\n  animation: fadeIn 0.3s ease forwards;\n  color: rgba(0, 0, 0, 0.85);\n}\n@keyframes fadeIn {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n.k-modal * {\n  color: inherit;\n}\n.k-modal-mask {\n  position: fixed;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  top: 0;\n  background: rgba(0, 0, 0, 0.45);\n  cursor: pointer;\n}\n.k-modal-wrap {\n  position: fixed;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  top: 0;\n  overflow: auto;\n  text-align: center;\n  user-select: none;\n}\n.k-modal-wrap::before {\n  content: \"\";\n  display: inline-block;\n  width: 0;\n  height: 100%;\n  vertical-align: middle;\n}\n.k-modal-container {\n  margin: 20px 0;\n  display: inline-block;\n  vertical-align: middle;\n  text-align: left;\n  position: relative;\n  width: 520px;\n  min-height: 100px;\n  background: white;\n  border-radius: 2px;\n  user-select: text;\n}\n.k-modal-header {\n  font-size: 16px;\n  padding: 16px;\n  border-bottom: 1px solid #f1f1f1;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n.k-modal-close {\n  cursor: pointer;\n  height: 55px;\n  width: 55px;\n  position: absolute;\n  right: 0;\n  top: 0;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  user-select: none;\n}\n.k-modal-close * {\n  color: rgba(0, 0, 0, 0.45);\n  transition: color 0.15s ease;\n}\n.k-modal-close:hover * {\n  color: rgba(0, 0, 0, 0.85);\n}\n.k-modal-body {\n  padding: 16px;\n  font-size: 14px;\n}\n.k-modal-footer {\n  padding: 10px 16px;\n  font-size: 14px;\n  border-top: 1px solid #f1f1f1;\n  display: flex;\n  justify-content: flex-end;\n}\n.k-modal-btn {\n  user-select: none;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: 32px;\n  line-height: 32px;\n  border-radius: 2px;\n  border: 1px solid #1890ff;\n  background: #1890ff;\n  color: white;\n  min-width: 64px;\n  cursor: pointer;\n  padding: 0 8px;\n}";
  n(css$b,{});

  function modal(opts) {
      const { title, content, onClose, onOk, okText = '确 定' } = opts;
      const store = {
          width: document.body.style.width,
          overflow: document.body.style.overflow,
      };
      const ID = Math.random().toString(16).slice(2);
      $(`
<div class="k-modal" role="dialog" id="${ID}">
  <div class="k-modal-mask"></div>
  <div class="k-modal-wrap">
    <div class="k-modal-container">
      <div class="k-modal-header">
        <div class="k-modal-title"></div>
        <a class="k-modal-close">
          <svg viewBox="64 64 896 896" focusable="false" data-icon="close" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 00203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path></svg>
        </a>
      </div>
      <div class="k-modal-body">
      </div>
    </div>
  </div>
</div>`).appendTo('body');
      // init css
      $('body').css({
          width: `calc(100% - ${window.innerWidth - document.body.clientWidth}px)`,
          overflow: 'hidden',
      });
      $(`#${ID} .k-modal-title`).append(title);
      $(`#${ID} .k-modal-body`).append(content);
      $(`#${ID} .k-modal-close`).on('click', () => {
          handleClose();
      });
      $(`#${ID} .k-modal-container`).on('click', (e) => {
          e.stopPropagation();
      });
      $(`#${ID} .k-modal-wrap`).on('click', () => {
          handleClose();
      });
      function reset() {
          $(`#${ID}`).remove();
          $('body').css(store);
          window.removeEventListener('keydown', fn, { capture: true });
      }
      function handleClose() {
          onClose === null || onClose === void 0 ? void 0 : onClose();
          reset();
      }
      function handleOk() {
          onOk === null || onOk === void 0 ? void 0 : onOk();
          reset();
      }
      function fn(e) {
          if (['Escape', '?', '？'].includes(e.key)) {
              handleClose();
          }
          e.stopPropagation();
      }
      window.addEventListener('keydown', fn, { capture: true });
      if (onOk) {
          $(`#${ID} .k-modal-container`).append(`
      <div class="k-modal-footer">
        <button class="k-modal-btn k-modal-ok">${okText}</button>
      </div>
    `);
          $(`#${ID} .k-modal-ok`).on('click', () => {
              handleOk();
          });
      }
  }

  var css$a = ".k-alert {\n  margin-bottom: 16px;\n  box-sizing: border-box;\n  color: #000000d9;\n  font-size: 14px;\n  font-variant: tabular-nums;\n  line-height: 1.5715;\n  list-style: none;\n  font-feature-settings: \"tnum\";\n  position: relative;\n  display: flex;\n  align-items: center;\n  padding: 8px 15px;\n  word-wrap: break-word;\n  border-radius: 2px;\n}\n.k-alert-icon {\n  margin-right: 8px;\n  display: inline-block;\n  color: inherit;\n  font-style: normal;\n  line-height: 0;\n  text-align: center;\n  text-transform: none;\n  vertical-align: -0.125em;\n  text-rendering: optimizeLegibility;\n  -webkit-font-smoothing: antialiased;\n  color: #1890ff;\n}\n.k-alert-content {\n  flex: 1;\n  min-width: 0;\n}\n.k-alert-info {\n  background-color: #e6f7ff;\n  border: 1px solid #91d5ff;\n}";
  n(css$a,{});

  function alert(html) {
      return `<div class="k-alert k-alert-info">
  <span class="k-alert-icon">
    <svg viewBox="64 64 896 896" focusable="false" data-icon="info-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true">
      <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm32 664c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V456c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272zm-32-344a48.01 48.01 0 010-96 48.01 48.01 0 010 96z"></path>
    </svg>
  </span>
  <div class="k-alert-content">
    <div class="k-alert-message">${html}</div>
  </div>
</div>`;
  }

  var css$9 = ".agefans-setting-item {\n  cursor: pointer;\n  width: 100%;\n  white-space: nowrap;\n  display: flex;\n  align-items: center;\n  line-height: 1;\n}\n.agefans-setting-item + .agefans-setting-item {\n  margin-top: 12px;\n}\n.agefans-setting-item input {\n  margin-right: 4px;\n}";
  n(css$9,{});

  const LOCAL_SETTING_KEY = 'agefans-setting';
  const defaultSetting = {
      usePreview: true,
  };
  function ensureDefaultSetting() {
      let setting = gm.getItem(LOCAL_SETTING_KEY, defaultSetting);
      setting = Object.assign({}, defaultSetting, setting);
      gm.setItem(LOCAL_SETTING_KEY, setting);
  }
  function setSetting(key, value) {
      const setting = gm.getItem(LOCAL_SETTING_KEY);
      setting[key] = value;
      gm.setItem(LOCAL_SETTING_KEY, setting);
  }
  function getSetting(key) {
      const setting = gm.getItem(LOCAL_SETTING_KEY);
      if (key)
          return setting[key];
      return setting;
  }
  function showSetting() {
      const setting = getSetting();
      const $usePreview = $(`<label class="agefans-setting-item"><input type="checkbox" />启用番剧信息预览（鼠标悬浮时预览番剧基础信息）</label>`);
      $usePreview
          .find('input')
          .prop('checked', setting.usePreview)
          .on('change', (e) => {
          setSetting('usePreview', e.target.checked);
      });
      const $stopUseKPlayer = $(`<label class="agefans-setting-item"><input type="checkbox" /><b>暂时</b>使用原生播放器</label>`);
      $stopUseKPlayer
          .find('input')
          .prop('checked', session.getItem('stop-use'))
          .on('change', (e) => {
          session.setItem('stop-use', e.target.checked);
      });
      modal({
          title: '脚本设置',
          okText: '刷新页面',
          onOk: () => location.reload(),
          content: $('<div></div>').append(alert('这些配置需要刷新页面才能生效'), $usePreview, $stopUseKPlayer),
      });
  }
  function settingModule() {
      ensureDefaultSetting();
      $('<a>设置</a>').on('click', showSetting).insertBefore('.loginout a');
  }

  function pagePreview(trigger, previewURL) {
      if (!getSetting('usePreview'))
          return;
      const $popover = $(`<div class='page-preview' style="display:none">
       <div class="page-preview-center">${loadingIcon}加载中...</div>
     </div>`).appendTo($(trigger));
      function caclPosition(e) {
          const safeArea = 16;
          const offset = 20;
          const width = $popover.width() || 0;
          const height = $popover.height() || 0;
          const { innerWidth, innerHeight } = window;
          const { clientX, clientY } = e;
          const maxLeft = innerWidth - width - safeArea * 2;
          const maxTop = innerHeight - height - safeArea;
          const left = Math.min(clientX + offset, maxLeft);
          const top = 
          // 当指针与 popover 重叠时，切换位置
          clientX + offset > maxLeft && clientY + offset > maxTop
              ? clientY - offset - height
              : Math.min(clientY + offset, maxTop);
          $popover.css({ left, top });
      }
      let isLoaded = false;
      let timeId;
      $(trigger)
          .addClass('page-preview-trigger')
          .on('mouseenter', (e) => {
          $popover.show();
          caclPosition(e);
          if (isLoaded)
              return;
          clearTimeout(timeId);
          timeId = window.setTimeout(async () => {
              if (isLoaded)
                  return;
              isLoaded = true;
              let { img, info } = session.getItem(previewURL, { img: '', info: '' });
              if (!info) {
                  const $root = $(await fetch(previewURL).then((r) => r.text()));
                  img = $root
                      .find('#container > div.div_left > div:nth-child(1) > div > img')
                      .css({
                      display: 'block',
                      width: 256,
                      height: 356,
                  })
                      .prop('outerHTML');
                  const $info = $root
                      .find('#container > div.div_left > div:nth-child(2) > div > div')
                      .width(256);
                  $info
                      .find('.blocktitle.detail_title1')
                      .text($root.find('.detail_imform_name').text());
                  info = $info.prop('outerHTML');
                  session.setItem(previewURL, { img, info });
              }
              $popover.empty().append(img, info);
              caclPosition(e);
          }, 100);
      })
          .on('mousemove', (e) => {
          caclPosition(e);
      })
          .on('mouseleave', () => {
          clearTimeout(timeId);
          $popover.hide();
      });
  }

  function renderHistroyStyle() {
      $('<style/>').html(`.movurl li a:visited { color: red; }`).appendTo('head');
  }
  function detailModule() {
      renderHistroyStyle();
      $('.div_left li > a:nth-child(1), .ul_li_a4 li > a:nth-child(1)').each((_, anchor) => pagePreview(anchor.parentElement, anchor.href));
  }

  var css$8 = ".agefans-wrapper #history {\n  background: #202020;\n  border: 4px solid #303030;\n}\n.agefans-wrapper #history .history-list {\n  padding: 8px;\n  display: flex;\n  flex-wrap: wrap;\n}\n.agefans-wrapper #history .history-item {\n  width: 115px;\n  display: inline-block;\n  margin: 4px;\n}\n.agefans-wrapper #history .history-item img {\n  width: 100%;\n  border-radius: 2px;\n}\n.agefans-wrapper #history .history-item .desc .title {\n  overflow: hidden;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  font-size: 14px;\n  margin: 4px 0;\n}\n.agefans-wrapper #history .history-item .desc .position {\n  font-size: 14px;\n}\n@media (max-width: 480px) {\n  .agefans-wrapper #history .history-list {\n    display: grid;\n    grid-template-columns: repeat(3, 1fr);\n    grid-gap: 8px;\n  }\n  .agefans-wrapper #history .history-item {\n    width: auto;\n    margin: 0;\n    display: block;\n    min-width: 0;\n  }\n}";
  n(css$8,{});

  function parseTime(time = 0) {
      return `${Math.floor(time / 60)
        .toString()
        .padStart(2, '0')}:${(time % 60).toString().padStart(2, '0')}`;
  }

  const LOCAL_HISTORY_KEY = 'v-his';
  const MAX_HISTORY_LENGTH = 100;
  class History {
      get his() {
          return gm.getItem(LOCAL_HISTORY_KEY, []);
      }
      set his(value) {
          if (Array.isArray(value)) {
              gm.setItem(LOCAL_HISTORY_KEY, value.slice(0, MAX_HISTORY_LENGTH));
          }
      }
      getAll() {
          return this.his;
      }
      get(id) {
          return this.his.find((o) => o.id === id);
      }
      setTime(id, time = 0) {
          const his = this.his;
          his.find((o) => o.id === id).time = time;
          this.his = his;
      }
      log(item) {
          const his = this.his;
          his.unshift(item);
          this.his = his;
      }
      refresh(id, data) {
          const his = this.his;
          const index = his.findIndex((o) => o.id === id);
          const item = his.splice(index, 1)[0];
          his.unshift(data || item);
          this.his = his;
      }
      has(id) {
          return Boolean(this.his.find((o) => o.id === id));
      }
      logHistory() {
          var _a;
          const id = (_a = location.pathname.match(/\/play\/(\d*)/)) === null || _a === void 0 ? void 0 : _a[1];
          if (!id)
              return;
          const hisItem = {};
          hisItem.id = id;
          hisItem.title = $('#detailname a').text();
          hisItem.href = location.pathname + location.search;
          hisItem.section = $('li a[style*="color: rgb(238, 0, 0);"]').text();
          hisItem.time = 0;
          hisItem.logo = $('#play_poster_img').attr('src');
          if (this.has(id)) {
              const oldItem = this.get(id);
              if (oldItem.href !== hisItem.href) {
                  this.refresh(id, hisItem);
              }
              else {
                  this.refresh(id);
              }
          }
          else {
              this.log(hisItem);
          }
      }
  }
  const his = new History();
  function renderHistoryList() {
      $('#history')
          .html('')
          .append(() => {
          /** @type {any[]} */
          const histories = his.getAll();
          let html = '';
          histories.forEach((o) => {
              html += `<a class="history-item" href="${o.href}" data-id="${o.id}" data-detail-href="/detail/${o.id}">
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
      })
          .find('a')
          .each((_, anchor) => pagePreview(anchor, anchor.dataset.detailHref));
  }
  function changeHash(hash) {
      if (hash) {
          history.replaceState(null, '', `#${hash}`);
      }
      else {
          const url = new URL(location.href);
          url.hash = '';
          history.replaceState(null, '', url);
      }
  }
  function refreshHistoryList() {
      const list = his.getAll();
      const $doms = $('#history .history-item');
      if (list.length !== $doms.length)
          return renderHistoryList();
      list.forEach((item) => {
          const $dom = $(`#history a[data-id='${item.id}']`);
          $dom.attr('href', item.href);
          $dom.find('.title').text(item.title);
          $dom.find('.position').text(`${item.section} ${parseTime(item.time)}`);
      });
  }
  const { startRefresh, stopRefresh } = (function () {
      let time;
      return {
          startRefresh: () => {
              clearInterval(time);
              time = window.setInterval(refreshHistoryList, 1000);
          },
          stopRefresh: () => {
              clearInterval(time);
          },
      };
  })();
  function renderHistoryPage() {
      const currentDom = $('.nav_button_current');
      $('<div id="history"></div>').insertAfter('#container').hide();
      const $hisNavBtn = $(`<a class="nav_button">历史</a>`)
          .insertBefore('#nav form')
          .on('click', (e) => {
          if ($('#history').is(':visible')) {
              $('#container').show();
              $('#history').hide();
              stopRefresh();
              changeHash();
              changeActive(currentDom);
          }
          else {
              refreshHistoryList();
              $('#container').hide();
              $('#history').show();
              startRefresh();
              changeHash('/history');
              changeActive($(e.currentTarget));
          }
      });
      // 移除默认激活的 nav 上的 href 与增加点击事件
      $('.nav_button_current')
          .on('click', (e) => {
          $('#container').show();
          $('#history').hide();
          stopRefresh();
          changeActive(e.currentTarget);
          changeHash();
      })
          .removeAttr('href');
      if (window.location.hash === '#/history') {
          $('#container').hide();
          $('#history').show();
          startRefresh();
          changeActive($hisNavBtn);
      }
  }
  function changeActive(dom) {
      $('.nav_button_current').removeClass('nav_button_current');
      $(dom).addClass('nav_button_current');
  }
  function historyModule() {
      renderHistoryPage();
      renderHistoryList();
  }

  function homeModule() {
      $('#container li > a:nth-child(1)').each((_, anchor) => pagePreview(anchor.parentElement, anchor.href));
      $('#new_anime_btns li').on('click', () => {
          $('#new_anime_page > li > a.one_new_anime_name').each((_, anchor) => pagePreview(anchor.parentElement, anchor.href));
      });
  }

  /** Detect free variable `global` from Node.js. */
  var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

  /** Detect free variable `self`. */
  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

  /** Used as a reference to the global object. */
  var root = freeGlobal || freeSelf || Function('return this')();

  /** Built-in value references. */
  var Symbol = root.Symbol;

  /** Used for built-in method references. */
  var objectProto$1 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty = objectProto$1.hasOwnProperty;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString$1 = objectProto$1.toString;

  /** Built-in value references. */
  var symToStringTag$1 = Symbol ? Symbol.toStringTag : undefined;

  /**
   * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the raw `toStringTag`.
   */
  function getRawTag(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag$1),
        tag = value[symToStringTag$1];

    try {
      value[symToStringTag$1] = undefined;
      var unmasked = true;
    } catch (e) {}

    var result = nativeObjectToString$1.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag$1] = tag;
      } else {
        delete value[symToStringTag$1];
      }
    }
    return result;
  }

  /** Used for built-in method references. */
  var objectProto = Object.prototype;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString = objectProto.toString;

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

  /** `Object#toString` result references. */
  var nullTag = '[object Null]',
      undefinedTag = '[object Undefined]';

  /** Built-in value references. */
  var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

  /**
   * The base implementation of `getTag` without fallbacks for buggy environments.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */
  function baseGetTag(value) {
    if (value == null) {
      return value === undefined ? undefinedTag : nullTag;
    }
    return (symToStringTag && symToStringTag in Object(value))
      ? getRawTag(value)
      : objectToString(value);
  }

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
    return value != null && typeof value == 'object';
  }

  /** `Object#toString` result references. */
  var symbolTag = '[object Symbol]';

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
    return typeof value == 'symbol' ||
      (isObjectLike(value) && baseGetTag(value) == symbolTag);
  }

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

    while (index-- && reWhitespace.test(string.charAt(index))) {}
    return index;
  }

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
    return string
      ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, '')
      : string;
  }

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
    return value != null && (type == 'object' || type == 'function');
  }

  /** Used as references for various `Number` constants. */
  var NAN = 0 / 0;

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
    if (typeof value == 'number') {
      return value;
    }
    if (isSymbol(value)) {
      return NAN;
    }
    if (isObject(value)) {
      var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
      value = isObject(other) ? (other + '') : other;
    }
    if (typeof value != 'string') {
      return value === 0 ? value : +value;
    }
    value = baseTrim(value);
    var isBinary = reIsBinary.test(value);
    return (isBinary || reIsOctal.test(value))
      ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
      : (reIsBadHex.test(value) ? NAN : +value);
  }

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

  /** Error message constants. */
  var FUNC_ERROR_TEXT$1 = 'Expected a function';

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeMax = Math.max,
      nativeMin = Math.min;

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
    var lastArgs,
        lastThis,
        maxWait,
        result,
        timerId,
        lastCallTime,
        lastInvokeTime = 0,
        leading = false,
        maxing = false,
        trailing = true;

    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT$1);
    }
    wait = toNumber(wait) || 0;
    if (isObject(options)) {
      leading = !!options.leading;
      maxing = 'maxWait' in options;
      maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
      trailing = 'trailing' in options ? !!options.trailing : trailing;
    }

    function invokeFunc(time) {
      var args = lastArgs,
          thisArg = lastThis;

      lastArgs = lastThis = undefined;
      lastInvokeTime = time;
      result = func.apply(thisArg, args);
      return result;
    }

    function leadingEdge(time) {
      // Reset any `maxWait` timer.
      lastInvokeTime = time;
      // Start the timer for the trailing edge.
      timerId = setTimeout(timerExpired, wait);
      // Invoke the leading edge.
      return leading ? invokeFunc(time) : result;
    }

    function remainingWait(time) {
      var timeSinceLastCall = time - lastCallTime,
          timeSinceLastInvoke = time - lastInvokeTime,
          timeWaiting = wait - timeSinceLastCall;

      return maxing
        ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke)
        : timeWaiting;
    }

    function shouldInvoke(time) {
      var timeSinceLastCall = time - lastCallTime,
          timeSinceLastInvoke = time - lastInvokeTime;

      // Either this is the first call, activity has stopped and we're at the
      // trailing edge, the system time has gone backwards and we're treating
      // it as the trailing edge, or we've hit the `maxWait` limit.
      return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
        (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
    }

    function timerExpired() {
      var time = now();
      if (shouldInvoke(time)) {
        return trailingEdge(time);
      }
      // Restart the timer.
      timerId = setTimeout(timerExpired, remainingWait(time));
    }

    function trailingEdge(time) {
      timerId = undefined;

      // Only invoke if we have `lastArgs` which means `func` has been
      // debounced at least once.
      if (trailing && lastArgs) {
        return invokeFunc(time);
      }
      lastArgs = lastThis = undefined;
      return result;
    }

    function cancel() {
      if (timerId !== undefined) {
        clearTimeout(timerId);
      }
      lastInvokeTime = 0;
      lastArgs = lastCallTime = lastThis = timerId = undefined;
    }

    function flush() {
      return timerId === undefined ? result : trailingEdge(now());
    }

    function debounced() {
      var time = now(),
          isInvoking = shouldInvoke(time);

      lastArgs = arguments;
      lastThis = this;
      lastCallTime = time;

      if (isInvoking) {
        if (timerId === undefined) {
          return leadingEdge(lastCallTime);
        }
        if (maxing) {
          // Handle invocations in a tight loop.
          clearTimeout(timerId);
          timerId = setTimeout(timerExpired, wait);
          return invokeFunc(lastCallTime);
        }
      }
      if (timerId === undefined) {
        timerId = setTimeout(timerExpired, wait);
      }
      return result;
    }
    debounced.cancel = cancel;
    debounced.flush = flush;
    return debounced;
  }

  /** Error message constants. */
  var FUNC_ERROR_TEXT = 'Expected a function';

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
    var leading = true,
        trailing = true;

    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    if (isObject(options)) {
      leading = 'leading' in options ? !!options.leading : leading;
      trailing = 'trailing' in options ? !!options.trailing : trailing;
    }
    return debounce(func, wait, {
      'leading': leading,
      'maxWait': wait,
      'trailing': trailing
    });
  }

  function genIssueURL({ title, body }) {
      const url = new URL(`https://github.com/IronKinoko/agefans-enhance/issues/new`);
      url.searchParams.set('title', title);
      url.searchParams.set('body', body);
      return url.toString();
  }

  const SHIFT_KEY = '~!@#$%^&*()_+{}|:"<>?' + '～！@#¥%…&*（）——+「」｜：“《》？';
  function keybind(keys, cb) {
      const isMac = /macintosh|mac os x/i.test(navigator.userAgent);
      keys = keys.filter((key) => !key.includes(isMac ? 'ctrl' : 'meta'));
      $(window).on('keydown', (e) => {
          var _a;
          if (((_a = document.activeElement) === null || _a === void 0 ? void 0 : _a.tagName) === 'INPUT')
              return;
          let keyArr = [];
          e.ctrlKey && keyArr.push('ctrl');
          e.metaKey && keyArr.push('meta');
          e.shiftKey && !SHIFT_KEY.includes(e.key) && keyArr.push('shift');
          e.altKey && keyArr.push('alt');
          if (!['Control', 'Meta', 'Shift', 'Alt'].includes(e.key)) {
              keyArr.push(e.key);
          }
          keyArr = [...new Set(keyArr)];
          const key = keyArr.join('+');
          if (keys.includes(key)) {
              cb(e.originalEvent, key);
          }
      });
  }

  var css$7 = "#k-player-message {\n  z-index: 999;\n  position: absolute;\n  left: 20px;\n  bottom: 60px;\n}\n#k-player-message .k-player-message-item {\n  display: block;\n  width: max-content;\n  padding: 8px 16px;\n  background: var(--k-player-background);\n  border-radius: 4px;\n  color: white;\n  font-size: 14px;\n  white-space: nowrap;\n  overflow: hidden;\n  box-sizing: border-box;\n  margin-top: 4px;\n}\n#k-player-message .k-player-message-item:hover {\n  background: var(--k-player-background-highlight);\n  transition: all 0.3s;\n}";
  n(css$7,{});

  class Message {
      constructor(selector) {
          this.$message = $('<div id="k-player-message">');
          this.$message.appendTo($(selector));
      }
      info(message, ms = 1500) {
          return new Promise((resolve) => {
              $(`<div class="k-player-message-item"></div>`)
                  .append(message)
                  .hide()
                  .appendTo(this.$message)
                  .show(150)
                  .delay(ms)
                  .hide(150, function () {
                  $(this).remove();
                  resolve();
              });
          });
      }
      destroy() {
          this.$message.empty();
      }
  }

  var css$6 = ".k-popover {\n  position: relative;\n}\n.k-popover-overlay {\n  position: absolute;\n  display: none;\n  bottom: 100%;\n  left: 50%;\n  transform: translateX(-50%);\n  z-index: 100;\n  padding-bottom: 20px;\n}\n.k-popover-content {\n  background: var(--k-player-background);\n  border-radius: 4px;\n  overflow: hidden;\n}";
  n(css$6,{});

  function popover(target, overlay) {
      const $target = $(target);
      const $content = $(`<div class="k-popover-overlay"><div class="k-popover-content"></div></div>`);
      $content.find('.k-popover-content').append(overlay);
      let timeID;
      $target.addClass('k-popover');
      $target.on('mouseenter', () => {
          clearTimeout(timeID);
          $content.fadeIn('fast');
      });
      $target.on('mouseleave', () => {
          clearTimeout(timeID);
          timeID = window.setTimeout(() => {
              $content.fadeOut('fast');
          }, 100);
      });
      $target.append($content);
      return $target;
  }

  const isMac = /macintosh|mac os x/i.test(navigator.userAgent);
  const macKeyMap = {
      ctrl: '⌘',
      alt: '⌥',
      shift: '⇧',
  };
  function renderKey(key) {
      const lowerCaseKey = key.toLowerCase();
      if (isMac && Reflect.has(macKeyMap, lowerCaseKey)) {
          return macKeyMap[lowerCaseKey];
      }
      return key;
  }

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
    <span class="plyr__tooltip">下一集(N)</span>
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
    <span class="label--not-pressed plyr__tooltip">网页全屏(W)</span>
    <span class="label--pressed plyr__tooltip">退出网页全屏(W)</span>
  </button>
</template>

`;
  $('body').append(icons);
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
  const speedList = [0.5, 0.75, 1, 1.25, 1.5, 2, 4];
  const speedHTML = popover(`
<div id="k-speed" class="plyr__controls__item k-popover k-text-btn">
  <span id="k-speed-text" class="k-text-btn-text">倍速</span>
</div>
`, `<ul class="k-menu">
${[...speedList]
    .reverse()
    .map((speed) => `<li class="k-menu-item k-speed-item" data-speed="${speed}">${speed}x</li>`)
    .join('')}
</ul>`);
  const settingsHTML = popover(`
<button id="k-settings" type="button" class="plyr__control plyr__controls__item">
  <svg><use href="#plyr-settings" /></svg>
</button>
`, `
<div class="k-settings-list">
  <label class="k-settings-item">
    <input type="checkbox" name="showSearchActions" />
    显示拓展搜索
  </label>
  <label class="k-settings-item">
    <input type="checkbox" name="autoNext" />
    自动下一集
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
`);
  const searchActionsHTML = popover(`
<div class="plyr__controls__item k-popover k-text-btn">
  <span class="k-text-btn-text">友链</span>
</div>
`, `<ul class="k-menu"></ul>`);
  const scriptInfo = (video, githubIssueURL) => `
<table class="script-info">
  <tbody>
  <tr><td>脚本版本</td><td>${"1.22.1"}</td></tr>
  <tr>
    <td>脚本源码</td>
    <td>
      <a target="_blank" rel="noreferrer" href="https://github.com/IronKinoko/agefans-enhance">GitHub</a>
      <a target="_blank" rel="noreferrer" href="https://github.com/IronKinoko/agefans-enhance/releases">更新记录</a>
      </td>
  </tr>
  <tr>
    <td>报错/意见</td>
    <td>
      <a target="_blank" rel="noreferrer" href="${githubIssueURL}">GitHub Issues</a>
      <a target="_blank" rel="noreferrer" href="https://greasyfork.org/zh-CN/scripts/424023-agefans-enhance/feedback">Greasy Fork 反馈</a>
    </td>
  </tr>
  ${video
    ? `<tr><td colspan="2" class="info-title">视频信息</td></tr>
     <tr><td>视频链接</td><td>${video.src}</td></tr>
     <tr><td>视频信息</td><td>${video.videoWidth} x ${video.videoHeight}</td></tr>`
    : ''}
  <tr><td colspan="2" class="info-title">快捷键</td></tr>
  <tr>
    <td colspan="2">
      <div class="shortcuts-wrap">
        <table class="shortcuts-table">
          <tbody>
            <tr><td><span class="key">W</span></td><td>宽屏</td></tr>
            <tr><td><span class="key">F</span></td><td>全屏</td></tr>
            <tr><td><span class="key">←</span></td><td>步退5s</td></tr>
            <tr><td><span class="key">→</span></td><td>步进5s</td></tr>
            <tr><td><span class="key">${renderKey('Shift')} ←</span></td><td>步退30s</td></tr>
            <tr><td><span class="key">${renderKey('Shift')} →</span></td><td>步进30s</td></tr>
            <tr><td><span class="key">${renderKey('Alt')} ←</span></td><td>步退60s</td></tr>
            <tr><td><span class="key">${renderKey('Alt')} →</span></td><td>步进60s</td></tr>
            <tr><td><span class="key">${renderKey('Ctrl')} ←</span></td><td>步退90s</td></tr>
            <tr><td><span class="key">${renderKey('Ctrl')} →</span></td><td>步进90s</td></tr>
            <tr><td><span class="key">D</span></td><td>弹幕开关</td></tr>
            </tbody>
        </table>
        <table class="shortcuts-table">
          <tbody>
            <tr><td><span class="key">esc</span></td><td>退出全屏/宽屏</td></tr>
            <tr>
              <td>
                <span class="key carousel">
                  <span>[</span>
                  <span>P</span>
                  <span>PgUp</span>
                </span>
              </td>
              <td>上一集</td>
            </tr>
            <tr>
              <td>
                <span class="key carousel">
                  <span>]</span>
                  <span>N</span>
                  <span>PgDn</span>
                </span>
              </td>
              <td>下一集</td>
            </tr>
            <tr><td><span class="key">Z</span></td><td>原速播放</td></tr>
            <tr><td><span class="key">X</span></td><td>减速播放</td></tr>
            <tr><td><span class="key">C</span></td><td>加速播放</td></tr>
            <tr><td><span class="key">↑</span></td><td>音量+</td></tr>
            <tr><td><span class="key">↓</span></td><td>音量-</td></tr>
            <tr><td><span class="key">M</span></td><td>静音</td></tr>
            <tr><td><span class="key">I</span></td><td>画中画</td></tr>
            <tr><td><span class="key">?</span></td><td>脚本信息</td></tr>
          </tbody>
        </table>
      </div>
    </td>
  </tr>
  </tbody>
</table>
`;
  const issueBody = (src = '') => `# 文字描述
<!-- 如果有需要额外描述，或者提意见可以写在下面空白处 -->


# 网址链接
${window.location.href}

# 视频链接
${src}

# 环境
userAgent: ${navigator.userAgent}
脚本版本: ${"1.22.1"}
`;
  const progressHTML = `
<div class="k-player-progress">
  <div class="k-player-progress-current"></div>
  <div class="k-player-progress-buffer"></div>
</div>
`;

  var css$5 = "#k-player-wrapper {\n  position: relative;\n  width: 100%;\n  height: 100%;\n  background: #000;\n  overflow: hidden;\n  font-size: 14px;\n  --k-player-error-background: url(data:image/png;base64,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);\n  --k-player-tsuma-length: 2;\n  --plyr-line-height: 1;\n  --plyr-tooltip-background: var(--k-player-background);\n  --plyr-tooltip-color: var(--k-player-color);\n  --plyr-range-thumb-background: url(data:image/png;base64,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) no-repeat\n    center/contain;\n  --plyr-range-thumb-width: 18px;\n  --plyr-range-thumb-height: 18px;\n  --plyr-color-main: var(--k-player-primary-color);\n}\n#k-player-wrapper .plyr--full-ui.plyr--video input[type=range] {\n  cursor: pointer;\n}\n#k-player-wrapper .plyr--full-ui.plyr--video input[type=range]::-webkit-slider-thumb {\n  transform: scale(0);\n}\n#k-player-wrapper .plyr--full-ui.plyr--video input[type=range]:hover::-webkit-slider-thumb {\n  transform: scale(1);\n}\n#k-player-wrapper .plyr--full-ui.plyr--video input[type=range]:active::-webkit-slider-thumb {\n  transition: all 0.1s linear;\n  box-shadow: none;\n}\n#k-player-wrapper .plyr--full-ui.plyr--video input[type=range].shake-0:active::-webkit-slider-thumb {\n  transform: scale(1.3) rotate(15deg);\n}\n#k-player-wrapper .plyr--full-ui.plyr--video input[type=range].shake-1:active::-webkit-slider-thumb {\n  transform: scale(1.3) rotate(-15deg);\n}\n#k-player-wrapper.k-player-widescreen {\n  position: fixed;\n  left: 0;\n  top: 0;\n  z-index: 10000;\n}\n#k-player-wrapper .k-player-contianer {\n  width: 100%;\n  height: 100%;\n}\n#k-player-wrapper #k-player-loading,\n#k-player-wrapper #k-player-error {\n  position: absolute;\n  left: 0;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  z-index: 10;\n  font-size: 66px;\n  color: white;\n  pointer-events: none;\n  background: black;\n}\n#k-player-wrapper .k-player-error-img {\n  background: var(--k-player-error-background) no-repeat center/contain;\n  width: 200px;\n  height: 200px;\n  opacity: 0.4;\n}\n#k-player-wrapper .k-player-error-info {\n  text-align: center;\n  padding: 24px;\n  font-size: 18px;\n}\n#k-player-wrapper #k-player-pip {\n  position: absolute;\n  left: 0;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  z-index: 10;\n  pointer-events: none;\n}\n#k-player-wrapper .k-player-tsuma {\n  width: 200px;\n  height: 200px;\n  position: absolute;\n  bottom: 0;\n  right: 0;\n  background: no-repeat center/contain;\n  opacity: 0.1;\n  z-index: -1;\n  pointer-events: none;\n}\n#k-player-wrapper .k-player-tsuma[data-bg-idx=\"0\"] {\n  background-image: url(data:image/png;base64,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);\n}\n#k-player-wrapper .k-player-tsuma[data-bg-idx=\"1\"] {\n  background-image: url(data:image/png;base64,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);\n}\n#k-player-wrapper .k-player-center {\n  width: 100%;\n  height: 100%;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n}\n#k-player-wrapper #k-player-header {\n  transform: translateY(0);\n  transition: transform 0.3s;\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  padding: 8px;\n  text-align: right;\n}\n#k-player-wrapper #k-player-header .k-player-question-icon {\n  font-size: 24px;\n  width: 1em;\n  height: 1em;\n  color: white;\n  cursor: pointer;\n}\n#k-player-wrapper .plyr--hide-controls #k-player-header {\n  transform: translateY(-100%);\n}\n#k-player-wrapper .plyr {\n  width: 100%;\n  height: 100%;\n}\n#k-player-wrapper .plyr__control svg {\n  font-size: 18px;\n}\n#k-player-wrapper video {\n  display: block;\n}\n#k-player-wrapper .plyr__next svg {\n  transform: scale(1.7);\n}\n#k-player-wrapper .plyr__widescreen svg {\n  transform: scale(1.3);\n}\n#k-player-wrapper .plyr--hide-cursor {\n  cursor: none;\n}\n#k-player-wrapper .plyr__control span:not(.plyr__tooltip) {\n  color: inherit;\n}\n#k-player-wrapper .plyr--hide-controls .k-player-progress {\n  opacity: 1;\n  transition: opacity 0.3s ease-in 0.2s;\n}\n#k-player-wrapper .k-player-fullscreen .k-player-progress {\n  display: none;\n}\n#k-player-wrapper .k-player-progress {\n  opacity: 0;\n  transition: opacity 0.2s ease-out;\n  height: 2px;\n  width: 100%;\n  position: absolute;\n  bottom: 0;\n}\n#k-player-wrapper .k-player-progress .k-player-progress-current {\n  position: absolute;\n  left: 0;\n  top: 0;\n  height: 100%;\n  z-index: 2;\n  background-color: #23ade5;\n}\n#k-player-wrapper .k-player-progress .k-player-progress-buffer {\n  position: absolute;\n  left: 0;\n  top: 0;\n  z-index: 1;\n  height: 100%;\n  background-color: var(--plyr-video-progress-buffered-background, rgba(255, 255, 255, 0.25));\n}\n#k-player-wrapper .plyr__controls {\n  z-index: 20;\n}\n#k-player-wrapper .plyr__controls .plyr__controls__item:first-child {\n  margin-right: 0;\n}\n#k-player-wrapper .plyr__controls .plyr__controls__item.plyr__progress__container {\n  position: absolute;\n  top: 15px;\n  left: 10px;\n  right: 10px;\n  --plyr-range-track-height: 2px;\n}\n#k-player-wrapper .plyr__controls .plyr__controls__item.plyr__progress__container:hover {\n  --plyr-range-track-height: 4px;\n}\n#k-player-wrapper .plyr__controls .plyr__controls__item.plyr__time--duration.plyr__time {\n  margin-right: auto;\n}\n#k-player-wrapper .plyr__controls .k-text-btn {\n  display: inline-block;\n  padding: 0 16px;\n  text-align: center;\n}\n#k-player-wrapper .plyr__controls .k-text-btn-text {\n  line-height: 32px;\n}\n#k-player-wrapper .plyr__controls .k-text-btn + .k-text-btn {\n  margin-left: 8px;\n  padding-left: 0;\n}\n@media (max-width: 480px) {\n  #k-player-wrapper .plyr__controls {\n    padding-top: 30px;\n  }\n  #k-player-wrapper [data-plyr=pip],\n#k-player-wrapper [data-plyr=snapshot],\n#k-player-wrapper [data-plyr=widescreen] {\n    display: none;\n  }\n}\n\n.lds-spinner {\n  color: official;\n  display: inline-block;\n  position: relative;\n  width: 80px;\n  height: 80px;\n}\n.lds-spinner div {\n  transform-origin: 40px 40px;\n  animation: lds-spinner 1.2s linear infinite;\n}\n.lds-spinner div::after {\n  content: \" \";\n  display: block;\n  position: absolute;\n  top: 3px;\n  left: 37px;\n  width: 6px;\n  height: 18px;\n  border-radius: 20%;\n  background: #fff;\n}\n.lds-spinner div:nth-child(1) {\n  transform: rotate(0deg);\n  animation-delay: -1.1s;\n}\n.lds-spinner div:nth-child(2) {\n  transform: rotate(30deg);\n  animation-delay: -1s;\n}\n.lds-spinner div:nth-child(3) {\n  transform: rotate(60deg);\n  animation-delay: -0.9s;\n}\n.lds-spinner div:nth-child(4) {\n  transform: rotate(90deg);\n  animation-delay: -0.8s;\n}\n.lds-spinner div:nth-child(5) {\n  transform: rotate(120deg);\n  animation-delay: -0.7s;\n}\n.lds-spinner div:nth-child(6) {\n  transform: rotate(150deg);\n  animation-delay: -0.6s;\n}\n.lds-spinner div:nth-child(7) {\n  transform: rotate(180deg);\n  animation-delay: -0.5s;\n}\n.lds-spinner div:nth-child(8) {\n  transform: rotate(210deg);\n  animation-delay: -0.4s;\n}\n.lds-spinner div:nth-child(9) {\n  transform: rotate(240deg);\n  animation-delay: -0.3s;\n}\n.lds-spinner div:nth-child(10) {\n  transform: rotate(270deg);\n  animation-delay: -0.2s;\n}\n.lds-spinner div:nth-child(11) {\n  transform: rotate(300deg);\n  animation-delay: -0.1s;\n}\n.lds-spinner div:nth-child(12) {\n  transform: rotate(330deg);\n  animation-delay: 0s;\n}\n\n@keyframes lds-spinner {\n  0% {\n    opacity: 1;\n  }\n  100% {\n    opacity: 0;\n  }\n}\n.script-info {\n  width: 100%;\n}\n.script-info * {\n  box-sizing: border-box;\n  font-size: 14px;\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Oxygen, Ubuntu, Cantarell, \"Open Sans\", \"Helvetica Neue\", sans-serif;\n}\n.script-info tbody tr td:first-child {\n  white-space: nowrap;\n  width: 77px;\n}\n.script-info td {\n  padding: 8px;\n  border-bottom: 1px solid #f1f1f1;\n  word-wrap: break-word;\n  word-break: break-all;\n}\n.script-info .info-title {\n  font-weight: 600;\n  padding-top: 24px;\n}\n.script-info a {\n  color: var(--k-player-primary-color);\n  padding: 4px 8px;\n  border-radius: 4px;\n  text-decoration: none;\n}\n.script-info a:hover {\n  text-decoration: underline;\n  background-color: #f1f1f1;\n}\n.script-info .shortcuts-wrap {\n  display: flex;\n  width: 100%;\n  margin: -8px;\n}\n.script-info .shortcuts-table {\n  flex: 1;\n}\n.script-info .key {\n  display: inline-block;\n  position: relative;\n  background: #333;\n  text-align: center;\n  color: #eee;\n  border-radius: 4px;\n  padding: 2px 0;\n  width: 56px;\n  box-sizing: border-box;\n  border: 1px solid #444;\n  box-shadow: 0 2px 0 1px #222;\n  border-bottom-color: #555;\n  user-select: none;\n}\n.script-info .carousel {\n  position: relative;\n  display: flex;\n  flex-wrap: nowrap;\n  overflow: hidden;\n}\n.script-info .carousel span {\n  display: block;\n  width: 100%;\n  height: 100%;\n  flex-basis: 100%;\n  flex-shrink: 0;\n  animation: carousel-3 6s infinite alternate;\n}\n\n@keyframes carousel-3 {\n  0% {\n    transform: translateX(0);\n  }\n  20% {\n    transform: translateX(0);\n  }\n  40% {\n    transform: translateX(-100%);\n  }\n  60% {\n    transform: translateX(-100%);\n  }\n  80% {\n    transform: translateX(-200%);\n  }\n  100% {\n    transform: translateX(-200%);\n  }\n}";
  n(css$5,{});

  const MediaErrorMessage = {
      1: '你中止了媒体播放',
      2: '网络错误',
      3: '文件损坏',
      4: '资源有问题看不了',
      5: '资源被加密了',
  };
  class KPlayer {
      /**
       * @typedef {Object} EnhanceOpts
       * @property {HTMLVideoElement} [video]
       * @property {boolean} [eventToParentWindow]
       *
       * Creates an instance of KPlayer.
       * @param {string|Element} selector
       * @param {Plyr.Options & EnhanceOpts} [opts]
       */
      constructor(selector, opts = {}) {
          this.setCurrentTimeLogThrottled = throttle(() => {
              this.setCurrentTimeLog();
          }, 1000);
          this.hideControlsDebounced = debounce(() => {
              const dom = document.querySelector('.plyr');
              if (!this.isHoverControls)
                  dom === null || dom === void 0 ? void 0 : dom.classList.add('plyr--hide-controls');
          }, 1000);
          this.hideCursorDebounced = debounce(() => {
              const dom = document.querySelector('.plyr');
              dom === null || dom === void 0 ? void 0 : dom.classList.add('plyr--hide-cursor');
          }, 1000);
          this.isJumped = false;
          this.jumpToLogTime = throttle(() => {
              if (this.isJumped)
                  return;
              if (this.currentTime < 3) {
                  this.isJumped = true;
                  const logTime = this.getCurrentTimeLog();
                  if (logTime && this.plyr.duration - logTime > 10) {
                      this.message.info(`已自动跳转至历史播放位置 ${parseTime(logTime)}`);
                      this.currentTime = logTime;
                  }
              }
          }, 1000);
          const $wrapper = $('<div id="k-player-wrapper"/>').replaceAll(selector);
          const $loading = $(loadingHTML);
          const $error = $(errorHTML);
          const $pip = $(pipHTML);
          const $video = (opts.video ? $(opts.video) : $('<video />')).attr('id', 'k-player');
          const $progress = $(progressHTML);
          const $header = $('<div id="k-player-header"/>');
          $wrapper.append($video);
          this.localConfigKey = 'kplayer';
          this.statusSessionKey = 'k-player-status';
          this.localPlayTimeKey = 'k-player-play-time';
          this.localConfig = {
              speed: 1,
              continuePlay: true,
              autoNext: true,
              showProgress: true,
              volume: 1,
              showSearchActions: true,
          };
          this.localConfig = Object.assign(this.localConfig, gm.getItem(this.localConfigKey));
          this.plyr = new Plyr__default['default']('#k-player', Object.assign({ autoplay: true, keyboard: { global: true }, controls: [
                  'play',
                  'progress',
                  'current-time',
                  'duration',
                  'mute',
                  'volume',
                  'pip',
                  'fullscreen',
              ], storage: { enabled: false }, seekTime: 5, volume: this.localConfig.volume, speed: { options: speedList, selected: 1 }, i18n: {
                  restart: '重播',
                  rewind: '快退 {seektime}s',
                  play: '播放(空格键)',
                  pause: '暂停(空格键)',
                  fastForward: '快进 {seektime}s',
                  seek: 'Seek',
                  seekLabel: '{currentTime} / {duration}',
                  played: '已播放',
                  buffered: '已缓冲',
                  currentTime: '当前时间',
                  duration: '片长',
                  volume: '音量',
                  mute: '静音(M)',
                  unmute: '取消静音(M)',
                  enableCaptions: '显示字幕',
                  disableCaptions: '隐藏字幕',
                  download: '下载',
                  enterFullscreen: '进入全屏(F)',
                  exitFullscreen: '退出全屏(F)',
                  frameTitle: '标题名称： {title}',
                  captions: '字幕',
                  settings: '设置',
                  pip: '画中画(I)',
                  menuBack: '返回上级',
                  speed: '倍速',
                  normal: '1.0x',
                  quality: '分辨率',
                  loop: '循环',
                  start: '开始',
                  end: '结束',
                  all: '全部',
                  reset: '重置',
                  disabled: '禁用',
                  enabled: '启用',
                  advertisement: '广告',
                  qualityBadge: {
                      2160: '4K',
                      1440: 'HD',
                      1080: 'HD',
                      720: 'HD',
                      576: 'SD',
                      480: 'SD',
                  },
              }, tooltips: {
                  controls: true,
                  seek: true,
              } }, opts));
          this.$wrapper = $wrapper;
          this.$loading = $loading;
          this.$error = $error;
          this.$video = $video;
          this.$progress = $progress;
          this.$header = $header;
          this.$pip = $pip;
          this.$videoWrapper = $wrapper.find('.plyr');
          this.$videoWrapper
              .append($loading)
              .append($error)
              .append($pip)
              .append($progress)
              .append($header);
          this.message = new Message(this.$videoWrapper);
          this.eventMap = {};
          this.isWideScreen = false;
          this.wideScreenBodyStyles = {};
          this.tsumaLength = +getComputedStyle(this.$wrapper[0])
              .getPropertyValue('--k-player-tsuma-length')
              .trim();
          this.curentTsuma = -1;
          this.injectSettings();
          this.injectSpeed();
          this.injectQuestion();
          this.injectNext();
          this.injectSreen();
          this.initEvent();
          this.injectSearchActions();
          KPlayer.plguinList.forEach((setup) => setup(this));
          /** @private */
          this.isHoverControls = false;
          const status = session.getItem(this.statusSessionKey);
          if (status) {
              session.removeItem(this.statusSessionKey);
              this.toggleWidescreen(status);
          }
          if (opts.eventToParentWindow) {
              this.eventToParentWindow();
          }
      }
      static register(setup) {
          this.plguinList.push(setup);
      }
      setCurrentTimeLog(time) {
          const store = local.getItem(this.localPlayTimeKey, {});
          store[this.playTimeStoreKey] = Math.floor(time !== null && time !== void 0 ? time : this.plyr.currentTime);
          local.setItem(this.localPlayTimeKey, store);
      }
      getCurrentTimeLog() {
          const store = local.getItem(this.localPlayTimeKey, {});
          return store[this.playTimeStoreKey];
      }
      get playTimeStoreKey() {
          if (this.src.startsWith('blob')) {
              return location.origin + location.pathname + location.search;
          }
          else {
              return this.src;
          }
      }
      initEvent() {
          this.on('loadstart', () => {
              this.$loading.show();
              this.hideError();
          });
          this.on('canplay', () => {
              this.$loading.hide();
              this.plyr.play();
              if (this.localConfig.continuePlay) {
                  this.jumpToLogTime();
              }
          });
          this.on('error', () => {
              this.setCurrentTimeLog(0);
              const code = this.media.error.code;
              this.$loading.hide();
              this.showError(MediaErrorMessage[code] || this.src);
              if (code === 3) {
                  const countKey = 'skip-error-retry-count' + window.location.search;
                  let skipErrorRetryCount = parseInt(session.getItem(countKey) || '0');
                  if (skipErrorRetryCount < 3) {
                      skipErrorRetryCount++;
                      const duration = 2 * skipErrorRetryCount;
                      this.message
                          .info(`视频源出现问题，第${skipErrorRetryCount}次尝试跳过${duration}s错误片段`, 4000)
                          .then(() => {
                          this.trigger('skiperror', 2 * skipErrorRetryCount);
                      });
                      session.setItem(countKey, skipErrorRetryCount.toString());
                  }
                  else {
                      this.message
                          .info(`视频源出现问题，多次尝试失败，请手动跳过错误片段`, 4000)
                          .then(() => {
                          this.trigger('skiperror', 0);
                      });
                      session.removeItem(countKey);
                  }
              }
              else {
                  const $dom = $('<div>视频播放失败，点击此处暂时关闭脚本功能，使用原生播放器观看</div>').css('cursor', 'pointer');
                  $dom.on('click', () => {
                      this.message.destroy();
                      session.setItem('stop-use', true);
                      window.location.reload();
                  });
                  this.message.info($dom, 10000);
              }
          });
          this.on('pause', () => {
              this.hideControlsDebounced();
          });
          this.on('enterfullscreen', () => {
              this.$videoWrapper.addClass('k-player-fullscreen');
          });
          this.on('exitfullscreen', () => {
              this.$videoWrapper.removeClass('k-player-fullscreen');
          });
          this.on('volumechange', () => {
              this.configSaveToLocal('volume', this.plyr.volume);
          });
          this.on('timeupdate', () => {
              this.setCurrentTimeLogThrottled();
              this.$progress
                  .find('.k-player-progress-current')
                  .css('width', (this.currentTime / this.plyr.duration) * 100 + '%');
              this.$progress
                  .find('.k-player-progress-buffer')
                  .css('width', this.plyr.buffered * 100 + '%');
          });
          this.on('ended', () => {
              if (this.localConfig.autoNext) {
                  this.trigger('next');
              }
          });
          this.on('enterpictureinpicture', () => {
              this.setRandomTsuma();
              this.$pip.fadeIn();
          });
          this.on('leavepictureinpicture', () => {
              this.$pip.fadeOut();
          });
          keybind([
              // 进退 30s
              'shift+ArrowLeft',
              'shift+ArrowRight',
              // 进退 60s
              'alt+ArrowLeft',
              'alt+ArrowRight',
              // 进退 90s
              'ctrl+ArrowLeft',
              'ctrl+ArrowRight',
              'meta+ArrowLeft',
              'meta+ArrowRight',
              // 下一集
              'n',
              ']',
              '】',
              'PageDown',
              // 上一集
              'p',
              '[',
              '【',
              'PageUp',
              // 切换网页全屏
              'w',
              // 关闭网页全屏
              'Escape',
              // 播放速度
              'z',
              'x',
              'c',
              // 截图
              'ctrl+s',
              'meta+s',
              // 画中画,
              'i',
          ], (e, key) => {
              switch (key) {
                  case 'ctrl+ArrowLeft':
                  case 'meta+ArrowLeft':
                  case 'shift+ArrowLeft':
                  case 'alt+ArrowLeft':
                  case 'ctrl+ArrowRight':
                  case 'meta+ArrowRight':
                  case 'shift+ArrowRight':
                  case 'alt+ArrowRight': {
                      e.stopPropagation();
                      e.preventDefault();
                      const time = {
                          'ctrl+ArrowLeft': 90,
                          'meta+ArrowLeft': 90,
                          'shift+ArrowLeft': 30,
                          'alt+ArrowLeft': 60,
                          'ctrl+ArrowRight': 90,
                          'meta+ArrowRight': 90,
                          'shift+ArrowRight': 30,
                          'alt+ArrowRight': 60,
                      }[key];
                      this.message.destroy();
                      if (e.key === 'ArrowLeft') {
                          this.currentTime = Math.max(0, this.currentTime - time);
                          this.message.info(`步退${time}s`);
                      }
                      else {
                          this.currentTime = Math.min(this.currentTime + time, this.plyr.duration);
                          this.message.info(`步进${time}s`);
                      }
                      break;
                  }
                  case 'n':
                  case ']':
                  case '】':
                  case 'PageDown':
                      e.preventDefault();
                      this.trigger('next');
                      break;
                  case 'p':
                  case '[':
                  case '【':
                  case 'PageUp':
                      e.preventDefault();
                      this.trigger('prev');
                      break;
                  case 'w':
                      if (this.plyr.fullscreen.active)
                          break;
                      this.toggleWidescreen();
                      break;
                  case 'Escape':
                      if (this.plyr.fullscreen.active || !this.isWideScreen)
                          break;
                      this.toggleWidescreen(false);
                      break;
                  case 'z':
                      this.speed = 1;
                      break;
                  case 'x':
                  case 'c': {
                      let idx = speedList.indexOf(this.speed);
                      const newIdx = key === 'x'
                          ? Math.max(0, idx - 1)
                          : Math.min(speedList.length - 1, idx + 1);
                      if (newIdx === idx)
                          break;
                      const speed = speedList[newIdx];
                      this.speed = speed;
                      break;
                  }
                  case 'i':
                      this.plyr.pip = !this.plyr.pip;
                      break;
              }
          });
          document
              .querySelectorAll('.plyr__controls .plyr__control')
              .forEach((dom) => {
              dom.addEventListener('click', (e) => e.currentTarget.blur());
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
          this.initInputEvent();
      }
      initInputEvent() {
          let timeId;
          const $dom = $("#k-player-wrapper input[type='range']");
          $dom.off('mousedown').off('mouseup');
          $dom.on('mousedown', function () {
              clearInterval(timeId);
              let i = 0;
              timeId = window.setInterval(() => {
                  $(this)
                      .removeClass()
                      .addClass(`shake-${i++ % 2}`);
              }, 100);
          });
          $dom.on('mouseup', function () {
              clearInterval(timeId);
              $(this).removeClass();
          });
      }
      on(event, callback) {
          if ([
              'prev',
              'next',
              'enterwidescreen',
              'exitwidescreen',
              'skiperror',
          ].includes(event)) {
              if (!this.eventMap[event])
                  this.eventMap[event] = [];
              this.eventMap[event].push(callback);
          }
          else {
              this.plyr.on(event, callback);
          }
      }
      trigger(event, params) {
          const fnList = this.eventMap[event] || [];
          fnList.forEach((fn) => {
              fn(this, params);
          });
      }
      injectSettings() {
          this.$settings = $(settingsHTML);
          this.$settings
              .find('[name=showSearchActions]')
              .prop('checked', this.localConfig.showSearchActions)
              .on('change', (e) => {
              const checked = e.target.checked;
              this.configSaveToLocal('showSearchActions', checked);
              this.$searchActions.toggle(checked);
          });
          this.$settings
              .find('[name=autoNext]')
              .prop('checked', this.localConfig.autoNext)
              .on('change', (e) => {
              const checked = e.target.checked;
              this.configSaveToLocal('autoNext', checked);
          });
          this.$settings
              .find('[name=showProgress]')
              .prop('checked', this.localConfig.showProgress)
              .on('change', (e) => {
              const checked = e.target.checked;
              this.configSaveToLocal('showProgress', checked);
              this.$progress.toggle(checked);
          });
          if (!this.localConfig.showProgress) {
              this.$progress.css('display', 'none');
          }
          this.$settings
              .find('[name=continuePlay]')
              .prop('checked', this.localConfig.continuePlay)
              .on('change', (e) => {
              const checked = e.target.checked;
              this.configSaveToLocal('continuePlay', checked);
          });
          this.$settings.insertAfter('.plyr__controls__item.plyr__volume');
      }
      configSaveToLocal(key, value) {
          this.localConfig[key] = value;
          gm.setItem(this.localConfigKey, this.localConfig);
      }
      injectSpeed() {
          this.$speed = $(speedHTML);
          const speedItems = this.$speed.find('.k-speed-item');
          const localSpeed = this.localConfig.speed;
          speedItems.each((_, el) => {
              const speed = +el.dataset.speed;
              if (speed === localSpeed) {
                  el.classList.add('k-menu-active');
              }
              $(el).on('click', () => {
                  this.speed = speed;
              });
          });
          this.plyr.speed = localSpeed;
          this.$speed
              .find('#k-speed-text')
              .text(localSpeed === 1 ? '倍速' : localSpeed + 'x');
          this.$speed.insertBefore('.plyr__controls__item.plyr__volume');
      }
      injectQuestion() {
          $(`<svg class="k-player-question-icon"><use xlink:href="#question"/></svg>`)
              .appendTo(this.$header)
              .on('click', () => {
              showInfo();
          });
      }
      injectNext() {
          $($('#plyr__next').html())
              .insertBefore('.plyr__controls__item.plyr__progress__container')
              .on('click', () => {
              this.trigger('next');
          });
      }
      injectSreen() {
          $($('#plyr__widescreen').html())
              .insertBefore('[data-plyr="fullscreen"]')
              .on('click', () => {
              this.toggleWidescreen();
          });
      }
      async injectSearchActions() {
          if (!this.localConfig.showSearchActions)
              return;
          this.$searchActions = $(searchActionsHTML);
          const actions = await runtime.getSearchActions();
          if (actions.length === 0)
              return;
          this.$searchActions.find('.k-menu').append(actions.map(({ name, search }) => {
              return $(`<li class="k-menu-item k-speed-item">${name}</li>`).on('click', search);
          }));
          this.$searchActions.insertBefore(this.$speed);
      }
      toggleWidescreen(bool = !this.isWideScreen) {
          if (this.isWideScreen === bool)
              return;
          this.isWideScreen = bool;
          session.setItem(this.statusSessionKey, this.isWideScreen);
          if (this.isWideScreen) {
              this.wideScreenBodyStyles = $('body').css(['overflow']);
              $('body').css('overflow', 'hidden');
              this.$wrapper.addClass('k-player-widescreen');
              $('.plyr__widescreen').addClass('plyr__control--pressed');
          }
          else {
              $('body').css(this.wideScreenBodyStyles);
              this.$wrapper.removeClass('k-player-widescreen');
              $('.plyr__widescreen').removeClass('plyr__control--pressed');
          }
          this.trigger(this.isWideScreen ? 'enterwidescreen' : 'exitwidescreen');
      }
      get media() {
          return this.$video[0];
      }
      set src(src) {
          this.isJumped = false;
          if (src.includes('.m3u8')) {
              if (!Hls__default['default'].isSupported())
                  throw new Error('不支持播放 hls 文件');
              const hls = new Hls__default['default']();
              hls.loadSource(src);
              hls.attachMedia(this.media);
          }
          else {
              this.$video.attr('src', src);
          }
      }
      get src() {
          return this.media.src;
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
          const speedItems = this.$speed.find('.k-speed-item');
          speedItems.each((_, el) => {
              if (speed === +el.dataset.speed) {
                  el.classList.add('k-menu-active');
              }
              else {
                  el.classList.remove('k-menu-active');
              }
          });
          this.$speed.find('#k-speed-text').text(speed === 1 ? '倍速' : speed + 'x');
          this.message.destroy();
          this.message.info(`视频速度：${speed}`);
          this.configSaveToLocal('speed', speed);
      }
      showError(text) {
          this.setRandomTsuma();
          this.$error.show().find('.k-player-error-info').text(text);
      }
      hideError() {
          this.$error.hide();
      }
      setRandomTsuma() {
          this.curentTsuma = ++this.curentTsuma % this.tsumaLength;
          this.$wrapper.find('.k-player-tsuma').attr('data-bg-idx', this.curentTsuma);
      }
      eventToParentWindow() {
          const evnetKeys = [
              'prev',
              'next',
              'enterwidescreen',
              'exitwidescreen',
              'skiperror',
              'progress',
              'playing',
              'play',
              'pause',
              'timeupdate',
              'volumechange',
              'seeking',
              'seeked',
              'ratechange',
              'ended',
              'enterfullscreen',
              'exitfullscreen',
              'captionsenabled',
              'captionsdisabled',
              'languagechange',
              'controlshidden',
              'controlsshown',
              'ready',
              'loadstart',
              'loadeddata',
              'loadedmetadata',
              'canplay',
              'canplaythrough',
              'stalled',
              'waiting',
              'emptied',
              'cuechange',
              'error',
          ];
          evnetKeys.forEach((key) => {
              this.on(key, () => {
                  const video = this.media;
                  const info = {
                      width: video.videoWidth,
                      height: video.videoHeight,
                      currentTime: video.currentTime,
                      src: video.src,
                      duration: video.duration,
                  };
                  window.parent.postMessage({ key, video: info }, '*');
              });
          });
      }
  }
  KPlayer.plguinList = [];
  function addReferrerMeta(content) {
      if ($('meta[name=referrer]').length === 0) {
          $('head').append(`<meta name="referrer" content="${content}">`);
      }
      else {
          const $meta = $('meta[name=referrer]');
          $meta.attr('content', content);
      }
  }
  function showInfo() {
      const video = $('#k-player')[0];
      const githubIssueURL = genIssueURL({
          title: '🐛[Bug]',
          body: issueBody(video === null || video === void 0 ? void 0 : video.src),
      });
      modal({
          title: '脚本信息',
          content: scriptInfo(video, githubIssueURL),
      });
  }
  keybind(['?', '？'], (e) => {
      if (!document.fullscreenElement) {
          e.stopPropagation();
          e.preventDefault();
          showInfo();
      }
  });

  function request(opts) {
      let { url, method, params } = opts;
      if (params) {
          let u = new URL(url);
          Object.keys(params).forEach((key) => {
              const value = params[key];
              if (value !== undefined && value !== null) {
                  u.searchParams.set(key, params[key]);
              }
          });
          url = u.toString();
      }
      return new Promise((resolve, reject) => {
          GM_xmlhttpRequest({
              url,
              method: method || 'GET',
              onload: (res) => {
                  try {
                      const data = JSON.parse(res.responseText);
                      console.log(data);
                      resolve(data);
                  }
                  catch (error) {
                      console.log(res.responseText);
                      resolve(res.responseText);
                  }
              },
              onerror: reject,
          });
      });
  }

  function createStorage(storageKey) {
      function storage(key, value) {
          const store = local.getItem(storageKey, {});
          if (value) {
              store[key] = value;
              local.setItem(storageKey, store);
          }
          else {
              return store[key];
          }
      }
      return storage;
  }
  const storageAnimeName = createStorage('k-player-danmaku-anime-name');
  const storageEpisodeName = createStorage('k-player-danmaku-episode-name');
  function createLock() {
      let prev;
      return function check(deps) {
          if (prev === deps)
              return true;
          prev = deps;
          return false;
      };
  }
  const episodeIdLock = createLock();
  const searchAnimeLock = createLock();
  function convert32ToHex(color) {
      return '#' + parseInt(color).toString(16);
  }

  async function getComments(episodeId) {
      const res = await request({
          url: `https://api.acplay.net/api/v2/comment/${episodeId}?withRelated=true&chConvert=1`,
      });
      return res.comments
          .map((o) => {
          const [time, type, color] = o.p.split(',');
          return {
              mode: { 1: 'rtl', 4: 'bottom', 5: 'top' }[type] || 'rtl',
              text: o.m,
              time: parseFloat(time),
              style: { color: convert32ToHex(color) },
          };
      })
          .sort((a, b) => a.time - b.time);
  }
  async function searchAnimeWithEpisode(anime, episode) {
      const res = await request({
          url: 'https://api.acplay.net/api/v2/search/episodes',
          params: { anime, episode },
      });
      return res.animes;
  }

  var css$4 = ".k-tab {\n  flex: 1;\n  white-space: nowrap;\n  cursor: pointer;\n  text-align: center;\n  padding: 8px 16px;\n}\n.k-tabs {\n  display: flex;\n  position: relative;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.2);\n}\n.k-tabs-wrapper {\n  text-align: left;\n}\n.k-tabs-wrapper * {\n  box-sizing: border-box;\n}\n.k-tab-indicator {\n  position: absolute;\n  width: 0;\n  height: 1px;\n  left: 0;\n  bottom: -1px;\n  background-color: var(--k-player-primary-color);\n  transition: all 0.3s;\n}\n.k-tabs-panes {\n  display: flex;\n  flex-wrap: nowrap;\n  transition: all 0.3s;\n}\n.k-tab-pane {\n  flex: 0 0 100%;\n  padding: 8px;\n}";
  n(css$4,{});

  function tabs(opts) {
      const tabsHTML = [];
      const tabsContentHTML = [];
      opts.forEach((tab, idx) => {
          const tabHTML = `<div class="k-tab" data-idx="${idx}">${tab.name}</div>`;
          const contentHTML = `<div class="k-tab-pane">${tab.content}</div>`;
          tabsHTML.push(tabHTML);
          tabsContentHTML.push(contentHTML);
      });
      const $root = $(`<div class="k-tabs-wrapper">
    <div class="k-tabs">
      ${tabsHTML.join('')}
      <div class="k-tab-indicator"></div>
    </div>
    <div class="k-tabs-panes">${tabsContentHTML.join('')}</div>
  </div>`);
      const $indicator = $root.find('.k-tab-indicator');
      $root.find('.k-tab').on('click', (e) => {
          $root.find('.k-tab').removeClass('active');
          const $tab = $(e.target).addClass('active');
          const idx = parseInt($tab.attr('data-idx'));
          $root.find('.k-tabs-panes').css('transform', `translateX(-${idx * 100}%)`);
          function updateIndictor() {
              const width = $tab.outerWidth();
              if (width)
                  $indicator.css({ width, left: idx * width });
              else
                  requestAnimationFrame(updateIndictor);
          }
          updateIndictor();
      });
      $root.find('.k-tab:first').trigger('click');
      return $root;
  }

  const $danmakuOverlay = tabs([
      {
          name: '搜索',
          content: `<div id="k-player-danmaku-search-form">
      <label>
        <span>搜索番剧名称</span>
        <input type="text" id="animeName" />
      </label>
      <div style="min-height:24px; padding-top:4px">
        <span id="tips"></span>
      </div>
      <label>
        <span>番剧名称</span>
        <select id="animes"></select>
      </label>
      <label>
        <span>章节</span>
        <select id="episodes"></select>
      </label>
    </div>`,
      },
      {
          name: '设置',
          content: `
    <div id="k-player-danmaku-setting-form" class="k-settings-list">
      <label class="k-settings-item">
        <input type="checkbox" name="showDanmaku" />
        显示弹幕
      </label>
      <label class="k-settings-item" style="flex-direction:column;align-items:flex-start;">
        <div>透明度</div>
        <input type="range" name="opacity" step="0.01" min="0" max="1" />
      </label>
    </div>
    `,
      },
  ]);
  $danmakuOverlay.attr('id', 'k-player-danmaku-overlay');
  const $danmakuBtn = $(`<div class="plyr__controls__item k-popover k-text-btn">
<span class="k-text-btn-text">弹幕</span>
</div>`);
  const $danmaku = popover($danmakuBtn, $danmakuOverlay);
  const $danmakuContainer = $('<div id="k-player-danmaku"></div>');

  var css$3 = "#k-player-danmaku {\n  position: absolute;\n  left: 0;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  z-index: 10;\n  pointer-events: none;\n}\n#k-player-danmaku * {\n  font-size: 25px;\n  font-family: SimHei, \"Microsoft JhengHei\", Arial, Helvetica, sans-serif;\n  font-weight: bold;\n  text-shadow: black 1px 0px 1px, black 0px 1px 1px, black 0px -1px 1px, black -1px 0px 1px;\n  line-height: 1.3;\n}\n#k-player-danmaku-overlay {\n  width: 200px;\n}\n#k-player-danmaku-search-form > * {\n  font-size: 14px;\n  box-sizing: border-box;\n  text-align: left;\n}\n#k-player-danmaku-search-form input,\n#k-player-danmaku-search-form select {\n  display: block;\n  margin-top: 4px;\n  width: 100%;\n}\n#k-player-danmaku-search-form label {\n  display: block;\n}\n#k-player-danmaku-search-form label * {\n  line-height: 1.4;\n}\n#k-player-danmaku-search-form label + label {\n  margin-top: 8px;\n}\n#k-player-danmaku-setting-form {\n  padding: 0;\n}";
  n(css$3,{});

  var State;
  (function (State) {
      State[State["unSearched"] = 0] = "unSearched";
      State[State["searched"] = 1] = "searched";
      State[State["findEpisode"] = 2] = "findEpisode";
      State[State["getComments"] = 3] = "getComments";
  })(State || (State = {}));
  let state = State.unSearched;
  const $animeName = $danmaku.find('#animeName');
  const $animes = $danmaku.find('#animes');
  const $episodes = $danmaku.find('#episodes');
  const $tips = $danmaku.find('#tips');
  const $showDanmaku = $danmaku.find("[name='showDanmaku']");
  const $opacity = $danmaku.find("[name='opacity']");
  let core;
  let comments;
  let player$5;
  let videoInfo;
  const showTips = (message) => {
      $tips.text(message).fadeIn('fast').delay(1500).fadeOut('fast');
  };
  const stop = () => {
      core === null || core === void 0 ? void 0 : core.destroy();
      core = undefined;
  };
  const start = () => {
      core = new Danmaku__default['default']({
          container: $danmakuContainer[0],
          media: player$5.media,
          comments: adjustCommentCount(comments),
      });
      core.speed = 130;
  };
  const adjustCommentCount = (comments) => {
      if (!comments)
          return;
      let ret = comments;
      // 24 分钟 3000 弹幕，按比例缩放
      const maxLength = Math.round((3000 / (24 * 60)) * player$5.media.duration);
      // 均分
      if (comments.length > maxLength) {
          let ratio = comments.length / maxLength;
          ret = [...new Array(maxLength)].map((_, i) => comments[Math.floor(i * ratio)]);
      }
      return ret;
  };
  const loadEpisode = async (episodeId) => {
      if (!player$5.localConfig.showDanmaku)
          return;
      if (episodeIdLock(episodeId))
          return;
      stop();
      comments = await getComments(episodeId);
      state = State.getComments;
      start();
      player$5.message.info(`番剧：${$animes.find(':selected').text()}`, 2000);
      player$5.message.info(`章节：${$episodes.find(':selected').text()}`, 2000);
      player$5.message.info(`已加载 ${comments.length} 条弹幕`, 2000);
  };
  const searchAnime = async (name) => {
      state = State.searched;
      name || (name = $animeName.val());
      if (!name || name.length < 2)
          return showTips('番剧名称不少于2个字');
      if (searchAnimeLock(name))
          return;
      const animes = await searchAnimeWithEpisode(name);
      if (animes.length === 0)
          return showTips('未搜索到番剧');
      updateAnimes(animes);
      findEpisode(animes);
  };
  const findEpisode = async (animes) => {
      if (!animes)
          return;
      const anime = animes.find((anime) => anime.animeTitle ===
          (storageAnimeName(videoInfo.rawName) || videoInfo.rawName));
      if (anime) {
          let episodeName = videoInfo.episode;
          let episode;
          let storedEpisodeId = storageEpisodeName(`${videoInfo.rawName}.${videoInfo.episode}`);
          if (storedEpisodeId) {
              episode = anime.episodes.find((episode) => String(episode.episodeId) === storedEpisodeId);
          }
          if (!episode && !isNaN(+episodeName)) {
              episode = anime.episodes.find((episode) => episode.episodeTitle.includes(episodeName));
          }
          if (episode) {
              state = State.findEpisode;
              $animeName.val(anime.animeTitle);
              $animes.val(anime.animeId);
              $animes.trigger('change');
              $episodes.val(episode.episodeId);
              $episodes.trigger('change');
              return;
          }
      }
      player$5.message.info('弹幕未能自动匹配数据源，请手动搜索');
  };
  const initEvents = (name) => {
      $animeName.val(name);
      $animeName.on('keypress', (e) => {
          if (e.key === 'Enter')
              searchAnime($animeName.val());
      });
      $animes.on('change', (e) => {
          const animeId = $(e.target).val();
          const animes = $animes.data('animes');
          const anime = animes.find((anime) => String(anime.animeId) === animeId);
          if (!anime)
              return;
          storageAnimeName(videoInfo.rawName, anime.animeTitle);
          updateEpisodes(anime);
      });
      $episodes.on('change', (e) => {
          const episodeId = $(e.target).val();
          storageEpisodeName(`${videoInfo.rawName}.${videoInfo.episode}`, episodeId);
          loadEpisode(episodeId);
      });
      const resizeOb = new ResizeObserver(() => {
          core === null || core === void 0 ? void 0 : core.resize();
      });
      resizeOb.observe(player$5.$videoWrapper[0]);
      const mutationOb = new MutationObserver(async () => {
          searchAnimeLock(Math.random());
          Object.assign(videoInfo, await runtime.getCurrentVideoNameAndEpisode());
          const animes = $animes.data('animes');
          if (animes)
              findEpisode(animes);
      });
      mutationOb.observe(player$5.media, { attributeFilter: ['src'] });
      // 绑定快捷键
      keybind(['d'], () => switchDanmaku());
      $showDanmaku
          .prop('checked', player$5.localConfig.showDanmaku)
          .on('change', (e) => {
          switchDanmaku(e.target.checked);
      });
      // 重新绑定 input 效果
      player$5.initInputEvent();
      // 绑定 Opacity 效果
      const setOpacityStyle = () => {
          const opacity = parseFloat($opacity.val());
          $opacity.css('--value', parseFloat($opacity.val()) * 100 + '%');
          $danmakuContainer.css({ opacity });
          player$5.configSaveToLocal('opacity', opacity);
      };
      $opacity.val(player$5.localConfig.opacity || 0.8);
      setOpacityStyle();
      $opacity.on('input', setOpacityStyle);
  };
  function switchDanmaku(bool) {
      bool !== null && bool !== void 0 ? bool : (bool = !player$5.localConfig.showDanmaku);
      player$5.configSaveToLocal('showDanmaku', bool);
      $showDanmaku.prop('checked', bool);
      player$5.message.info(`弹幕${bool ? '开启' : '关闭'}`);
      if (bool) {
          autoStart();
      }
      else {
          stop();
      }
  }
  // 更新 anime select
  const updateAnimes = (animes) => {
      const html = animes.reduce((html, anime) => html + `<option value="${anime.animeId}">${anime.animeTitle}</option>`, '');
      $animes.data('animes', animes);
      $animes.html(html);
      updateEpisodes(animes[0]);
      showTips(`找到 ${animes.length} 部番剧`);
  };
  // 更新 episode select
  const updateEpisodes = (anime) => {
      const { episodes } = anime;
      const html = episodes.reduce((html, episode) => html +
          `<option value="${episode.episodeId}">${episode.episodeTitle}</option>`, '');
      $episodes.data('anime', anime);
      $episodes.html(html);
      $episodes.val('');
  };
  function autoStart() {
      switch (state) {
          case State.unSearched:
              searchAnime();
              break;
          case State.searched:
              findEpisode($animes.data('animes'));
              break;
          case State.findEpisode:
              $episodes.trigger('change');
              break;
          case State.getComments:
              start();
              break;
      }
  }
  async function setup(_player) {
      player$5 = _player;
      const info = await runtime.getCurrentVideoNameAndEpisode();
      if (!info)
          return;
      videoInfo = info;
      player$5.$videoWrapper.append($danmakuContainer);
      $danmaku.insertBefore(player$5.$speed);
      let defaultSearchName = storageAnimeName(videoInfo.rawName) || videoInfo.name;
      initEvents(defaultSearchName);
      if (player$5.localConfig.showDanmaku)
          searchAnime();
  }

  KPlayer.register(setup);

  var css$2 = ".agefans-wrapper #relates-series .relates_series {\n  display: block;\n  padding: 4px 0px;\n}";
  n(css$2,{});

  let player$4;
  function replacePlayer$5() {
      const dom = document.querySelector('#age_playfram');
      const fn = () => {
          if (!dom.src)
              return;
          let url = new URL(dom.src);
          if (url.origin === location.origin) {
              let videoURL = url.searchParams.get('url');
              if (videoURL) {
                  addReferrerMeta('same-origin');
                  initPlayer(parseToURL(videoURL));
                  mutationOb.disconnect();
              }
          }
          else {
              const message = new Message('#ageframediv');
              message.info('这个视频似乎是第三方链接，并非由agefans自身提供，将使用默认播放器播放', 3000);
              mutationOb.disconnect();
          }
      };
      const mutationOb = new MutationObserver(fn);
      mutationOb.observe(dom, { attributes: true });
      fn();
  }
  function showCurrentLink(vurl) {
      const decodeVurl = parseToURL(vurl);
      const title = [$('#detailname a').text(), getActivedom$2().text()].join(' ');
      if ($('#current-link').length) {
          $('#current-link').text(decodeVurl);
          $('#current-link').attr('href', decodeVurl);
          return;
      }
      $(ageBlock({
          title: '本集链接：',
          content: `<a class="res_links" id="current-link" download="${title}" rel="noreferrer" href="${decodeVurl}">${decodeVurl}</a>`,
      })).insertBefore($('.baseblock:contains(网盘资源)'));
  }
  function gotoPrevPart() {
      const dom = getActivedom$2().parent().prev().find('a');
      if (dom.length) {
          switchPart$7(dom.data('href'), dom);
      }
  }
  function gotoNextPart() {
      const dom = getActivedom$2().parent().next().find('a');
      if (dom.length) {
          switchPart$7(dom.data('href'), dom);
      }
  }
  function getActivedom$2() {
      return $("li a[style*='color: rgb(238, 0, 0)']");
  }
  // switch part retry count
  let retryCount = 0;
  let switchLoading = false;
  /**
   *
   * @param {string} href
   * @param {JQuery<HTMLAnchorElement>} $dom
   * @param {boolean} [push]
   */
  async function switchPart$7(href, $dom, push = true) {
      try {
          if (switchLoading === true)
              return;
          switchLoading = true;
          retryCount++;
          push && player$4.message.info(`即将播放${$dom.text()}`);
          const vurl = await getVurlWithLocal(href);
          push && player$4.message.destroy();
          const speed = player$4.plyr.speed;
          player$4.src = vurl;
          player$4.plyr.speed = speed;
          const $active = getActivedom$2();
          $active.css({ color: '', border: '' });
          $dom.css({ color: 'rgb(238, 0, 0)', border: '1px solid rgb(238, 0, 0)' });
          const title = document.title.replace($active.text(), $dom.text());
          push && history.pushState({}, title, href);
          document.title = title;
          showCurrentLink(vurl);
          his.logHistory();
          retryCount = 0;
          switchLoading = false;
      }
      catch (error) {
          switchLoading = false;
          if (retryCount > 3) {
              console.error(error);
              window.location.href = href.toString();
          }
          else {
              switchPart$7(href, $dom, push);
          }
      }
  }
  function resetVideoHeight() {
      const $root = $('#ageframediv');
      /** @type {HTMLVideoElement} */
      const video = player$4.media;
      const ratio = video.videoWidth / video.videoHeight;
      const width = $root.width();
      $root.height(width / ratio);
  }
  function updateTime(time = 0) {
      var _a;
      const id = (_a = location.pathname.match(/\/play\/(\d*)/)) === null || _a === void 0 ? void 0 : _a[1];
      if (!id)
          return;
      his.setTime(id, Math.floor(time));
  }
  function addListener() {
      player$4.on('next', () => {
          gotoNextPart();
      });
      player$4.on('prev', () => {
          gotoPrevPart();
      });
      player$4.plyr.once('canplay', () => {
          resetVideoHeight();
      });
      player$4.on('error', () => {
          removeLocal(getActivedom$2().data('href'));
      });
      const update = throttle(() => {
          updateTime(player$4.currentTime);
      }, 1000);
      player$4.on('timeupdate', () => {
          update();
      });
      player$4.on('skiperror', (_, duration) => {
          if (duration === 0) {
              updateTime(0);
          }
          else {
              updateTime(player$4.currentTime + duration);
          }
          window.location.reload();
      });
      window.addEventListener('popstate', () => {
          const href = location.pathname + location.search;
          const $dom = $(`[data-href='${href}']`);
          if ($dom.length) {
              switchPart$7(href, $dom, false);
          }
          else {
              window.location.reload();
          }
      });
  }
  function replaceHref() {
      $('.movurl:visible li a').each(function () {
          const href = $(this).attr('href');
          $(this)
              .removeAttr('href')
              .attr('data-href', href)
              .css('cursor', 'pointer')
              .on('click', (e) => {
              e.preventDefault();
              switchPart$7(href, $(this));
          });
      });
  }
  function initPlayer(vurl) {
      player$4 = new KPlayer('#age_playfram');
      showCurrentLink(vurl);
      addListener();
      player$4.src = vurl;
      saveLocal(getActivedom$2().data('href'), vurl);
  }
  function useOriginPlayer() {
      const message = new Message('#ageframediv');
      message.info('脚本功能已暂时禁用，使用原生播放器观看，右下角可启动脚本', 3000);
      const $dom = $(`<span>启用脚本</span>`)
          .css({ color: '#60b8cc', cursor: 'pointer' })
          .on('click', () => {
          session.removeItem('stop-use');
          window.location.reload();
      });
      $('#wangpan-div .blocktitle')
          .css({ display: 'flex', justifyContent: 'space-between' })
          .append($dom);
  }
  async function showRelatesSeries() {
      const info = await fetch(location.pathname.replace('play', 'detail')).then((r) => r.text());
      const $series = $(info).find('li.relates_series');
      $series.find('a').each((_, anchor) => pagePreview(anchor, anchor.href));
      $(ageBlock({ title: '相关动画：', content: '<ul id="relates-series"></ul>' }))
          .insertAfter('.baseblock:contains(种子资源)')
          .find('ul')
          .append($series);
  }
  function playModule$9() {
      $('#cpraid').remove();
      if (session.getItem('stop-use')) {
          useOriginPlayer();
          return;
      }
      his.logHistory();
      $('.fullscn').remove();
      replaceHref();
      replacePlayer$5();
      initGetAllVideoURL();
      showRelatesSeries();
      $('.ul_li_a8 > .anime_icon1 > a:nth-child(1)').each((_, anchor) => pagePreview(anchor.parentElement, anchor.href));
  }

  function rankModule() {
      $('.div_right_r_3 ul > li > a').each((_, anchor) => pagePreview(anchor, anchor.href));
  }

  function recommendModule() {
      $('ul.ul_li_a6 > li > a').each((_, anchor) => pagePreview(anchor.parentElement, anchor.href));
  }

  function updateModule() {
      $('ul.ul_li_a6 > li > a').each((_, anchor) => pagePreview(anchor.parentElement, anchor.href));
  }

  runtime.register({
      domains: ['age.tv', 'agemys', 'agefans'],
      opts: [
          {
              test: '*',
              run: () => {
                  $('body').addClass('agefans-wrapper');
                  settingModule();
                  historyModule();
              },
          },
          { test: '/play', run: playModule$9 },
          { test: '/detail', run: detailModule },
          { test: '/recommend', run: recommendModule },
          { test: '/update', run: updateModule },
          { test: '/rank', run: rankModule },
          { test: /^\/$/, run: homeModule },
      ],
      search: {
          name: 'agefans',
          search: (name) => `https://www.agemys.com/search?query=${name}&page=1`,
          getSearchName: () => $('#detailname a').text(),
          getEpisode: () => $("li a[style*='color: rgb(238, 0, 0)']").text(),
      },
  });

  let player$3;
  function replacePlayer$4() {
      const dom = document.querySelector('#playleft iframe[allowfullscreen="true"]');
      const fn = () => {
          if (!dom.src)
              return;
          let url = new URL(dom.src);
          let videoURL = url.searchParams.get('url');
          if (videoURL) {
              player$3 = new KPlayer('#beyond-play-box');
              player$3.src = parseToURL(videoURL);
              initEvent$2();
              mutationOb.disconnect();
          }
      };
      const mutationOb = new MutationObserver(fn);
      mutationOb.observe(dom, { attributes: true });
      fn();
  }
  function initEvent$2() {
      player$3.on('prev', () => unsafeWindow.MacPlayer.GoPreUrl());
      player$3.on('next', () => unsafeWindow.MacPlayer.GoNextUrl());
  }
  function playModule$8() {
      $('body').addClass('www88dmw-wrapper');
      $('.kp_flash_box .mb').remove();
      replacePlayer$4();
  }

  var css$1 = ".www88dmw-wrapper .menuBoxbg {\n  z-index: 999;\n}\n.www88dmw-wrapper #k-player-wrapper div:not(.plyr__progress) {\n  margin: initial;\n}";
  n(css$1,{});

  function searchAction(name) {
      const $form = $(`
  <form action="http://www.88dmw.com/index.php?m=vod-search" method="post">
    <input type="text" id="wd" name="wd">
  </form>
  `);
      $form.hide();
      $form.find('#wd').val(decodeURIComponent(name));
      $form.appendTo('body');
      $form.trigger('submit');
  }

  function www88dmwSetup() {
      try {
          Object.defineProperty(unsafeWindow, 'devtoolsDetector', {
              writable: false,
              value: null,
          });
          document.oncontextmenu = null;
          // eslint-disable-next-line no-empty
      }
      catch (error) { }
  }
  runtime.register({
      domains: ['88dmw'],
      opts: [{ test: '/play', setup: www88dmwSetup, run: playModule$8 }],
      search: {
          name: '动漫岛',
          search: searchAction,
          getSearchName: () => $('.play_menu a:last').text(),
          disabledInIframe: true,
      },
  });

  var css = ".yhdm-wrapper {\n  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;\n}\n.yhdm-wrapper .play,\n.yhdm-wrapper #playbox,\n.yhdm-wrapper .bofang,\n.yhdm-wrapper .pp .player {\n  height: 540px;\n}";
  n(css,{});

  let player$2;
  function replacePlayer$3() {
      const dom = document.querySelector('#play2');
      const fn = () => {
          if (!dom.src)
              return;
          let url = new URL(dom.src);
          let videoURL = url.searchParams.get('vid');
          if (videoURL) {
              player$2 = new KPlayer('#play2');
              player$2.src = parseToURL(videoURL);
              initEvent$1();
              mutationOb.disconnect();
          }
      };
      const mutationOb = new MutationObserver(fn);
      mutationOb.observe(dom, { attributes: true });
      fn();
  }
  function switchPart$6(next) {
      var _a;
      (_a = getActivedom$1().parent()[next ? 'next' : 'prev']().find('a')[0]) === null || _a === void 0 ? void 0 : _a.click();
  }
  function getActivedom$1() {
      return $(`.movurls:visible li a[href='${location.pathname}']`);
  }
  function initEvent$1() {
      player$2.on('prev', () => switchPart$6(false));
      player$2.on('next', () => switchPart$6(true));
  }
  function playModule$7() {
      $('body').addClass('yhdm-wrapper');
      $('#adl').remove();
      $('#adr').remove();
      $('#adv').remove();
      $('.fullscn').remove();
      replacePlayer$3();
  }

  runtime.register({
      domains: ['imomoe.live'],
      opts: [{ test: '/player', run: playModule$7 }],
  });

  function replacePlayer$2() {
      new KPlayer('#dplayer', {
          video: $('video')[0],
          eventToParentWindow: true,
      });
  }
  function switchPart$5(next) {
      var _a;
      let directionRight = true;
      const re = /\/v\/\d+-(\d+)/;
      let prevID;
      Array.from($('.movurls a')).forEach((a) => {
          if (re.test(a.href)) {
              const [, id] = a.href.match(re);
              if (prevID)
                  directionRight = +prevID < +id;
              prevID = id;
          }
      });
      let direction = ['prev', 'next'];
      if (!next)
          direction.reverse();
      if (!directionRight)
          direction.reverse();
      (_a = $('.movurls .sel')[direction[1]]().find('a')[0]) === null || _a === void 0 ? void 0 : _a.click();
  }
  function playModule$6() {
      $('body').addClass('yhdm-wrapper');
      window.addEventListener('message', (e) => {
          var _a;
          if (!Reflect.has(e.data, 'key'))
              return;
          const key = e.data.key;
          if (key === 'prev')
              switchPart$5(false);
          if (key === 'next')
              switchPart$5(true);
          if (key === 'enterwidescreen') {
              $('body').css('overflow', 'hidden');
              $('#playbox iframe').css({
                  position: 'fixed',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  top: 0,
              });
          }
          if (key === 'exitwidescreen') {
              $('body').css('overflow', '');
              $('#playbox iframe').removeAttr('style');
          }
          if (key === 'getSearchName') {
              const iframe = $('#playbox iframe')[0];
              (_a = iframe.contentWindow) === null || _a === void 0 ? void 0 : _a.postMessage({ key: 'getSearchName', name: $('.gohome.l > h1 > a').text() }, '*');
          }
          if (key === 'openLink') {
              window.open(e.data.url);
          }
      });
      window.addEventListener('keydown', (e) => {
          if (document.activeElement !== document.body)
              return;
          $('#playbox iframe')[0].focus();
          if (e.key === ' ')
              e.preventDefault();
      });
  }
  function playInIframeModule() {
      if (location.search.includes('vid')) {
          replacePlayer$2();
      }
  }

  runtime.register({
      domains: ['yhdm.so', 'yinghuacd.com'],
      opts: [
          { test: ['/v'], run: playModule$6 },
          { test: ['vid'], runInIframe: true, run: playInIframeModule },
      ],
      search: {
          name: '樱花动漫1',
          search: (name) => `http://www.yinghuacd.com/search/${name}/`,
          getSearchName: async () => {
              return new Promise((resolve) => {
                  window.addEventListener('message', (e) => {
                      if (e.data.key === 'getSearchName') {
                          resolve(e.data.name);
                      }
                  });
                  parent.postMessage({ key: 'getSearchName' }, '*');
              });
          },
      },
  });

  let player$1;
  function replacePlayer$1() {
      const dom = document.querySelector('#yh_playfram');
      const fn = () => {
          if (!dom.src)
              return;
          let url = new URL(dom.src);
          let videoURL = url.searchParams.get('url');
          if (videoURL) {
              player$1 = new KPlayer('#yh_playfram');
              player$1.src = parseToURL(videoURL);
              initEvent();
              mutationOb.disconnect();
          }
      };
      const mutationOb = new MutationObserver(fn);
      mutationOb.observe(dom, { attributes: true });
      fn();
  }
  function switchPart$4(next) {
      var _a;
      (_a = getActivedom().parent()[next ? 'next' : 'prev']().find('a')[0]) === null || _a === void 0 ? void 0 : _a.click();
  }
  function getActivedom() {
      return $(".movurl:visible li a[style*='color: rgb(255, 255, 255)']");
  }
  function initEvent() {
      player$1.on('prev', () => switchPart$4(false));
      player$1.on('next', () => switchPart$4(true));
  }
  function playModule$5() {
      $('body').addClass('yhdm-wrapper');
      $('#ipchk_getplay').remove();
      $('.fullscn').remove();
      replacePlayer$1();
  }

  runtime.register({
      domains: ['yhdmp.cc'],
      opts: [{ test: '/vp', run: playModule$5 }],
      search: {
          name: '樱花动漫2',
          search: (name) => `https://www.yhdmp.cc/s_all?ex=1&kw=${name}`,
          getSearchName: () => $('.gohome > a:last').text(),
      },
  });

  function queryDom(selector) {
      return new Promise((resolve) => {
          let dom;
          function search() {
              dom = $(selector);
              if (dom.length === 0) {
                  requestAnimationFrame(search);
              }
              else {
                  resolve(dom[0]);
              }
          }
          search();
      });
  }

  let player;
  function switchPart$3(next) {
      player.on('prev', () => {
          var _a;
          (_a = $('.meida-content-main-window-right-series-list-volume-active')[next ? 'next' : 'prev']()
              .prev()
              .find('a')[0]) === null || _a === void 0 ? void 0 : _a.click();
      });
  }
  function injectEvent() {
      player.on('prev', () => switchPart$3(false));
      player.on('next', () => switchPart$3(true));
  }
  function replacePlayer(video) {
      const fn = () => {
          if (!video.src || video.src === location.href)
              return;
          player = new KPlayer('.player.meida-content-main-window-left', { video });
          injectEvent();
      };
      const ob = new MutationObserver(fn);
      ob.observe(video, { attributes: true, attributeFilter: ['src'] });
      fn();
  }
  async function playModule$4() {
      const video = await queryDom('video');
      replacePlayer(video);
  }

  runtime.register({
      domains: ['new-ani.me'],
      opts: [{ test: '/watch', run: playModule$4 }],
  });

  async function playModule$3() {
      const video = await queryDom('video');
      new KPlayer('#player', { video, eventToParentWindow: true });
  }

  // 这是个解析器网站，里面只有一个播放器。将其替换成 KPlayer
  runtime.register({
      domains: ['danmu.4dm.cc'],
      opts: [{ test: '/m3u8.php', runInIframe: true, run: playModule$3 }],
  });

  function switchPart$2(next) {
      var _a;
      (_a = $('.active-play').parent()[next ? 'next' : 'prev']().find('a')[0]) === null || _a === void 0 ? void 0 : _a.click();
  }
  const iframeSelector = '#playleft iframe';
  function playModule$2() {
      window.addEventListener('message', (e) => {
          if (!Reflect.has(e.data, 'key'))
              return;
          const { key, video } = e.data;
          if (key === 'prev')
              switchPart$2(false);
          if (key === 'next')
              switchPart$2(true);
          if (key === 'enterwidescreen') {
              $('body').css('overflow', 'hidden');
              $(iframeSelector).css({
                  position: 'fixed',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  top: 0,
              });
          }
          if (key === 'exitwidescreen') {
              $('body').css('overflow', '');
              $(iframeSelector).removeAttr('style');
          }
          if (key === 'canplay') {
              const width = $('#ageframediv').width();
              if (width)
                  $('#ageframediv').height((video.height / video.width) * width);
          }
      });
      window.addEventListener('keydown', (e) => {
          if (document.activeElement !== document.body)
              return;
          $(iframeSelector)[0].focus();
          if (e.key === ' ')
              e.preventDefault();
      });
  }

  runtime.register({
      domains: ['.ntyou.'],
      opts: [{ test: '/play', run: playModule$2 }],
      search: {
          name: 'NT动漫',
          search: (name) => `https://www.ntyou.com/search/-------------.html?wd=${name}&page=1`,
      },
  });

  function switchPart$1(next) {
      var _a;
      (_a = $('.eplist-eppic li[style]')[next ? 'next' : 'prev']().find('a')[0]) === null || _a === void 0 ? void 0 : _a.click();
  }
  async function playModule$1() {
      const iframe = await queryDom('#id_main_playiframe');
      const fn = () => {
          if (!iframe.src)
              return;
          const url = new URL(iframe.src);
          const vurl = url.searchParams.get('url');
          if (!vurl)
              return;
          const player = new KPlayer('#player_back');
          player.src = vurl;
          player.on('prev', () => switchPart$1(false));
          player.on('next', () => switchPart$1(true));
      };
      const ob = new MutationObserver(fn);
      ob.observe(iframe, { attributes: true, attributeFilter: ['src'] });
      fn();
  }

  runtime.register({
      domains: ['.dm233.'],
      opts: [{ test: '/play', run: playModule$1 }],
      search: {
          name: '233动漫网',
          search: (name) => `https://www.dm233.org/search?keyword=${name}&seaex=1`,
          getSearchName: () => $('.playtitle span a').text(),
      },
  });

  function switchPart(next) {
      var _a;
      (_a = $(`.play_but.bline a:contains(${next ? '下集' : '上集'})`)[0]) === null || _a === void 0 ? void 0 : _a.click();
  }
  function playModule() {
      const url = unsafeWindow.MacPlayer.PlayUrl;
      const player = new KPlayer('.MacPlayer');
      player.src = url;
      player.on('prev', () => switchPart(false));
      player.on('next', () => switchPart(true));
      function toggle(bool) {
          $('.hot_banner').toggle(bool);
          $('#play_page > div.foot.foot_nav.clearfix').toggle(bool);
      }
      if (player.isWideScreen) {
          toggle(false);
      }
      player.on('enterwidescreen', () => toggle(false));
      player.on('exitwidescreen', () => toggle(true));
      $('#play_page > div.hidden_xs.hidden_mi.pannel.clearfix').remove();
  }

  runtime.register({
      domains: ['.olevod.'],
      opts: [{ test: '/play', run: playModule }],
      search: {
          name: '欧乐影院',
          search: (name) => `https://www.olevod.com/index.php/vod/search.html?wd=${name}&submit=`,
          getSearchName: () => $('.video_title > .title').text(),
      },
  });

  runtime.run();

}(Hls, Plyr, Danmaku));
