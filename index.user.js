// ==UserScript==
// @name         agefans Enhance
// @namespace    https://github.com/IronKinoko/agefans-enhance
// @version      1.6.3
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


(function () {
  'use strict';

  var e = [],
      t = [];

  function n(n, r) {
    if (n && "undefined" != typeof document) {
      var a,
          s = !0 === r.prepend ? "prepend" : "append",
          d = !0 === r.singleTag,
          i = "string" == typeof r.container ? document.querySelector(r.container) : document.getElementsByTagName("head")[0];

      if (d) {
        var u = e.indexOf(i);
        -1 === u && (u = e.push(i) - 1, t[u] = {}), a = t[u] && t[u][s] ? t[u][s] : t[u][s] = c();
      } else a = c();

      65279 === n.charCodeAt(0) && (n = n.substring(1)), a.styleSheet ? a.styleSheet.cssText += n : a.appendChild(document.createTextNode(n));
    }

    function c() {
      var e = document.createElement("style");
      if (e.setAttribute("type", "text/css"), r.attributes) for (var t = Object.keys(r.attributes), n = 0; n < t.length; n++) e.setAttribute(t[n], r.attributes[t[n]]);
      var a = "prepend" === s ? "afterbegin" : "beforeend";
      return i.insertAdjacentElement(a, e), e;
    }
  }

  var css$5 = ".agefans-wrapper .nav_button {\n  cursor: pointer;\n}\n.agefans-wrapper .res_links {\n  word-break: break-all;\n  word-wrap: break-word;\n}";
  n(css$5,{});

  function renderHistroyStyle() {
    // add a tag visited style
    let styleDom = document.createElement('style');
    styleDom.innerHTML = `.movurl li a:visited { color: red; }`;
    document.head.appendChild(styleDom);
  }

  function detailModule() {
    renderHistroyStyle();
  }

  var css$4 = ".agefans-wrapper #history {\n  background: #202020;\n  border: 4px solid #303030;\n}\n.agefans-wrapper #history .history-list {\n  padding: 16px;\n  display: flex;\n  flex-wrap: wrap;\n}\n.agefans-wrapper #history .history-item {\n  width: 115px;\n  display: inline-block;\n  margin: 4px;\n}\n.agefans-wrapper #history .history-item img {\n  width: 100%;\n  border-radius: 2px;\n}\n.agefans-wrapper #history .history-item .desc .title {\n  overflow: hidden;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  font-size: 14px;\n  margin: 4px 0;\n}\n.agefans-wrapper #history .history-item .desc .position {\n  font-size: 14px;\n}";
  n(css$4,{});

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
    $('<div id="history"></div>').insertAfter('#container').hide();
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

  function copyToClipboard(element) {
    var $temp = $("<textarea>");
    $("body").append($temp);
    $temp.val($(element).text()).trigger('select');
    document.execCommand("copy");
    $temp.remove();
  }

  var css$3 = ".k-modal {\n  position: fixed;\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: 1000;\n  text-align: left;\n  animation: fadeIn 0.3s ease forwards;\n}\n@keyframes fadeIn {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n.k-modal * {\n  color: rgba(0, 0, 0, 0.85);\n}\n.k-modal .k-modal-mask {\n  position: fixed;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  top: 0;\n  background: rgba(0, 0, 0, 0.45);\n  cursor: pointer;\n}\n.k-modal .k-modal-wrap {\n  position: fixed;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  top: 0;\n  overflow: auto;\n  text-align: center;\n  user-select: none;\n}\n.k-modal .k-modal-wrap::before {\n  content: \"\";\n  display: inline-block;\n  width: 0;\n  height: 100%;\n  vertical-align: middle;\n}\n.k-modal .k-modal-container {\n  margin: 20px 0;\n  display: inline-block;\n  vertical-align: middle;\n  text-align: left;\n  position: relative;\n  width: 520px;\n  min-height: 100px;\n  background: white;\n  border-radius: 2px;\n  user-select: text;\n}\n.k-modal .k-modal-header {\n  font-size: 16px;\n  padding: 16px;\n  border-bottom: 1px solid #f1f1f1;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n.k-modal .k-modal-close {\n  cursor: pointer;\n  height: 55px;\n  width: 55px;\n  position: absolute;\n  right: 0;\n  top: 0;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  user-select: none;\n}\n.k-modal .k-modal-close * {\n  color: rgba(0, 0, 0, 0.45);\n  transition: color 0.15s ease;\n}\n.k-modal .k-modal-close:hover * {\n  color: rgba(0, 0, 0, 0.85);\n}\n.k-modal .k-modal-body,\n.k-modal .k-modal-footer {\n  padding: 16px;\n  font-size: 14px;\n}\n.k-modal .k-modal-footer {\n  border-top: 1px solid #f1f1f1;\n  display: flex;\n  justify-content: flex-end;\n}\n.k-modal .k-modal-btn {\n  user-select: none;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: 32px;\n  border-radius: 2px;\n  border: 1px solid #2af;\n  background: #2af;\n  color: white;\n  min-width: 64px;\n  cursor: pointer;\n}";
  n(css$3,{});

  function modal({
    title,
    content,
    onClose,
    onOk
  }) {
    const store = $('body').css(['width', 'overflow']);
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
</div>`).appendTo('body'); // init css

    $('body').css({
      width: `calc(100% - ${window.innerWidth - document.body.clientWidth}px)`,
      overflow: 'hidden'
    });
    $(`#${ID} .k-modal-title`).append(title);
    $(`#${ID} .k-modal-body`).append(content);
    $(`#${ID} .k-modal-close`).on('click', () => {
      handleClose();
    });
    $(`#${ID} .k-modal-container`).on('click', e => {
      e.stopPropagation();
    });
    $(`#${ID} .k-modal-wrap`).on('click', () => {
      handleClose();
    });

    function reset() {
      $(`#${ID}`).remove();
      $('body').css(store);
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
          <a id="clean-all" class="res_links_a" style="cursor:pointer">清空</a>
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
    $('#clean-all').on('click', () => {
      getAllVideoUrlList().forEach(o => {
        removeLocal(o.href);
      });
      insertLocal();
    });
    $('#open-modal').on('click', function () {
      modal({
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
      const baseURL = 'https://ironkinoko.github.io/agefans-enhance/thunder.html';
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
  function removeLocal(href) {
    const map = getLocal();
    delete map[href];
    window.localStorage.setItem(PLAY_URL_KEY, JSON.stringify(map));
  }

  function insertLocal() {
    const map = getLocal();
    const list = getAllVideoUrlList();
    const $parent = $('#url-list');
    $parent.empty();
    $(list.map(item => {
      if (map[item.href]) {
        return genUrlItem(item.title, map[item.href].url);
      } else {
        return '';
      }
    }).join('')).appendTo($parent);
  }

  async function getVurl(href) {
    const res = await fetch(getPlayUrl(href), {
      referrerPolicy: 'strict-origin-when-cross-origin'
    }).then(res => res.json());
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

  var css$2 = "#k-player-wrapper {\n  position: relative;\n  width: 100%;\n  height: 100%;\n  background: #000;\n  overflow: hidden;\n}\n#k-player-wrapper.k-player-widescreen {\n  position: fixed;\n  left: 0;\n  top: 0;\n  z-index: 100;\n}\n#k-player-wrapper .k-player-contianer {\n  width: 100%;\n  height: 100%;\n}\n#k-player-wrapper #k-player-loading,\n#k-player-wrapper #k-player-error {\n  position: absolute;\n  left: 0;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  z-index: 10;\n  font-size: 88px;\n  color: white;\n  pointer-events: none;\n}\n#k-player-wrapper .k-player-center {\n  width: 100%;\n  height: 100%;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n}\n#k-player-wrapper .error-info {\n  text-align: center;\n  padding: 24px;\n  font-size: 18px;\n}\n#k-player-wrapper .plyr {\n  width: 100%;\n  height: 100%;\n}\n#k-player-wrapper video {\n  display: block;\n}\n#k-player-wrapper .plyr__next svg {\n  transform: scale(1.7);\n}\n#k-player-wrapper .plyr__widescreen svg {\n  transform: scale(1.3);\n}\n#k-player-wrapper .plyr--hide-cursor {\n  cursor: none;\n}\n#k-player-wrapper .plyr__control span:not(.plyr__tooltip) {\n  color: inherit;\n}\n\n.lds-spinner {\n  color: official;\n  display: inline-block;\n  position: relative;\n  width: 80px;\n  height: 80px;\n}\n\n.lds-spinner div {\n  transform-origin: 40px 40px;\n  animation: lds-spinner 1.2s linear infinite;\n}\n\n.lds-spinner div:after {\n  content: \" \";\n  display: block;\n  position: absolute;\n  top: 3px;\n  left: 37px;\n  width: 6px;\n  height: 18px;\n  border-radius: 20%;\n  background: #fff;\n}\n\n.lds-spinner div:nth-child(1) {\n  transform: rotate(0deg);\n  animation-delay: -1.1s;\n}\n\n.lds-spinner div:nth-child(2) {\n  transform: rotate(30deg);\n  animation-delay: -1s;\n}\n\n.lds-spinner div:nth-child(3) {\n  transform: rotate(60deg);\n  animation-delay: -0.9s;\n}\n\n.lds-spinner div:nth-child(4) {\n  transform: rotate(90deg);\n  animation-delay: -0.8s;\n}\n\n.lds-spinner div:nth-child(5) {\n  transform: rotate(120deg);\n  animation-delay: -0.7s;\n}\n\n.lds-spinner div:nth-child(6) {\n  transform: rotate(150deg);\n  animation-delay: -0.6s;\n}\n\n.lds-spinner div:nth-child(7) {\n  transform: rotate(180deg);\n  animation-delay: -0.5s;\n}\n\n.lds-spinner div:nth-child(8) {\n  transform: rotate(210deg);\n  animation-delay: -0.4s;\n}\n\n.lds-spinner div:nth-child(9) {\n  transform: rotate(240deg);\n  animation-delay: -0.3s;\n}\n\n.lds-spinner div:nth-child(10) {\n  transform: rotate(270deg);\n  animation-delay: -0.2s;\n}\n\n.lds-spinner div:nth-child(11) {\n  transform: rotate(300deg);\n  animation-delay: -0.1s;\n}\n\n.lds-spinner div:nth-child(12) {\n  transform: rotate(330deg);\n  animation-delay: 0s;\n}\n\n@keyframes lds-spinner {\n  0% {\n    opacity: 1;\n  }\n  100% {\n    opacity: 0;\n  }\n}\n.script-info {\n  width: 100%;\n}\n.script-info * {\n  box-sizing: border-box;\n}\n.script-info tbody tr td:first-child {\n  white-space: nowrap;\n  width: 77px;\n}\n.script-info td {\n  padding: 8px;\n  border-bottom: 1px solid #f1f1f1;\n  word-wrap: break-word;\n  word-break: break-all;\n}\n.script-info .info-title {\n  font-weight: 600;\n  padding-top: 24px;\n}\n.script-info a {\n  color: #2af;\n  padding: 4px 8px;\n  border-radius: 4px;\n}\n.script-info a:hover {\n  background-color: #f1f1f1;\n}\n.script-info .shortcuts-wrap {\n  display: flex;\n  width: 100%;\n  margin: -8px;\n}\n.script-info .shortcuts-table {\n  flex: 1;\n}\n.script-info .key {\n  position: relative;\n  background: #333;\n  text-align: center;\n  color: #eee;\n  float: left;\n  border-radius: 0.3em;\n  padding: 0.2em;\n  width: 3.3em;\n  height: 100%;\n  box-sizing: border-box;\n  border: 1px solid #444;\n  box-shadow: 0 0.2em 0 0.05em #222;\n  border-bottom-color: #555;\n  user-select: none;\n}";
  n(css$2,{});

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
    <span class="plyr__tooltip">下一集</span>
  </button>
</template>

<template id="plyr__widescreen">
  <button
    class="plyr__controls__item plyr__control plyr__widescreen plyr__custom"
    type="button"
    data-plyr="next"
    aria-label="widescreen"
  >
    <svg class="icon--not-pressed" focusable="false">
      <use xlink:href="#widescreen"></use>
    </svg>
    <svg class="icon--pressed" focusable="false">
      <use xlink:href="#widescreen-quit"></use>
    </svg>
    <span class="label--not-pressed plyr__tooltip">网页全屏</span>
    <span class="label--pressed plyr__tooltip">退出网页全屏</span>
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
  <tr><td>脚本版本</td><td>${"1.6.3"}</td></tr>
  <tr>
    <td>脚本源码</td>
    <td>
      <a target="_blank" href="https://github.com/IronKinoko/agefans-enhance">GitHub</a>
      <a target="_blank" href="https://github.com/IronKinoko/agefans-enhance/releases">更新记录</a>
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
  <tr><td>视频链接</td><td>${video === null || video === void 0 ? void 0 : video.src}</td></tr>
  <tr><td>视频信息</td><td>${video === null || video === void 0 ? void 0 : video.videoWidth} x ${video === null || video === void 0 ? void 0 : video.videoHeight}</td></tr>
  <tr><td colspan="2" class="info-title">快捷键</td></tr>
  <tr>
    <td colspan="2">
      <div class="shortcuts-wrap">
        <table class="shortcuts-table">
          <tbody>
            <tr><td><span class="key">W</span></td><td>宽屏</td></tr>
            <tr><td><span class="key">F</span></td><td>全屏</td></tr>
            <tr><td><span class="key">←</span></td><td>后退10s</td></tr>
            <tr><td><span class="key">→</span></td><td>前进10s</td></tr>
            <tr><td><span class="key">↑</span></td><td>音量+</td></tr>
            <tr><td><span class="key">↓</span></td><td>音量-</td></tr>
            <tr><td><span class="key">M</span></td><td>静音</td></tr>
          </tbody>
        </table>
        <table class="shortcuts-table">
          <tbody>
            <tr><td><span class="key">esc</span></td><td>退出全屏/宽屏</td></tr>
            <tr><td><span class="key">P</span></td><td>上一集</td></tr>
            <tr><td><span class="key">N</span></td><td>下一集</td></tr>
            <tr><td><span class="key">Z</span></td><td>原速播放</td></tr>
            <tr><td><span class="key">X</span></td><td>减速播放</td></tr>
            <tr><td><span class="key">C</span></td><td>加速播放</td></tr>
            <tr><td><span class="key">?</span></td><td>脚本信息</td></tr>
          </tbody>
        </table>
      </div>
    </td>
  </tr>
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
脚本版本: ${"1.6.3"}
`;

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

  function genIssueURL({
    title,
    body
  }) {
    const url = new URL(`https://github.com/IronKinoko/agefans-enhance/issues/new`);
    url.searchParams.set('title', title);
    url.searchParams.set('body', body);
    return url.toString();
  }

  var css$1 = "#k-player-message {\n  z-index: 999;\n  position: absolute;\n  left: 20px;\n  bottom: 60px;\n}\n#k-player-message .k-player-message-item {\n  display: block;\n  width: max-content;\n  padding: 8px 16px;\n  background: rgba(0, 0, 0, 0.45);\n  border-radius: 4px;\n  color: white;\n  font-size: 14px;\n  white-space: nowrap;\n  overflow: hidden;\n  box-sizing: border-box;\n  margin-top: 4px;\n}";
  n(css$1,{});

  class Message {
    constructor(selector) {
      this.$message = $('<div id="k-player-message">');
      this.$message.appendTo($(selector));
    }

    info(text, duration = 1500) {
      this.$message.empty();
      $(`<div class="k-player-message-item">${text}</div>`).hide().appendTo(this.$message).fadeIn(150).delay(duration).fadeOut(150, function () {
        $(this).remove();
      });
    }

    destroy() {
      this.$message.empty();
    }

  }

  const speedList = [0.5, 0.75, 1, 1.25, 1.5, 2, 4];

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
      const $video = $('<video id="k-player" />');
      $wrapper.append($video);
      this.plyr = new Plyr('#k-player', {
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
        seekTime: 5,
        speed: {
          options: speedList
        },
        i18n: {
          restart: '重播',
          rewind: '快退 {seektime}s',
          play: '播放',
          pause: '暂停',
          fastForward: '快进 {seektime}s',
          seek: 'Seek',
          seekLabel: '{currentTime} / {duration}',
          played: '已播放',
          buffered: '已缓冲',
          currentTime: '当前时间',
          duration: '片长',
          volume: '音量',
          mute: '静音',
          unmute: '取消静音',
          enableCaptions: '显示字幕',
          disableCaptions: '隐藏字幕',
          download: '下载',
          enterFullscreen: '进入全屏',
          exitFullscreen: '退出全屏',
          frameTitle: '标题名称： {title}',
          captions: '字幕',
          settings: '设置',
          pip: '画中画',
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
            480: 'SD'
          }
        },
        tooltips: {
          controls: true,
          seek: true
        },
        ...opts
      });
      this.$wrapper = $wrapper;
      this.$loading = $loading;
      this.$error = $error;
      this.$video = $video;
      this.$videoWrapper = $wrapper.find('.plyr');
      this.$videoWrapper.append($loading).append($error);
      this.message = new Message(this.$videoWrapper);
      this.eventMap = {};
      this.isWideScreen = false;
      this.wideScreenBodyStyles = {};
      this.statusSessionKey = 'k-player-status';

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
      const status = window.sessionStorage.getItem(this.statusSessionKey);

      if (status) {
        window.sessionStorage.removeItem(this.statusSessionKey);

        this._toggleFullscreen(JSON.parse(status));
      }
    }
    /** @private */


    _initEvent() {
      this.on('loadstart', () => {
        this.$loading.show();
        this.hideError();
      });
      this.on('canplay', () => {
        this.$loading.hide();
        this.plyr.play();
      });
      this.on('error', () => {
        this.$loading.hide();
        this.showError(this.src);
      });
      this.on('pause', () => {
        this.hideControlsDebounced();
      });
      $(window).on('keydown', e => {
        let idx = speedList.indexOf(this.plyr.speed);
        if (e.metaKey || e.shiftKey || e.altKey || e.ctrlKey) return;

        switch (e.key) {
          case 'n':
          case 'PageDown':
            e.preventDefault();
            this.trigger('next');
            break;

          case 'p':
          case 'PageUp':
            e.preventDefault();
            this.trigger('prev');
            break;

          case 'w':
            if (this.plyr.fullscreen.active) break;

            this._toggleFullscreen();

            break;

          case 'Escape':
            if (this.plyr.fullscreen.active || !this.isWideScreen) break;

            this._toggleFullscreen(false);

            break;

          case 'z':
            this.plyr.speed = 1;
            this.message.info(`视频速度：${1}`);
            break;

          case 'x':
          case 'c':
            {
              const newIdx = e.key === 'x' ? Math.max(0, idx - 1) : Math.min(speedList.length - 1, idx + 1);
              if (newIdx === idx) break;
              const speed = speedList[newIdx];
              this.message.info(`视频速度：${speed}`);
              this.plyr.speed = speed;
              break;
            }
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
    /** @typedef {'prev'|'next'|'enterwidescreen'|'exitwidescreen'} CustomEventMap */

    /**
     * @param {CustomEventMap | keyof Plyr.PlyrEventMap} event
     * @param {function} callback
     * @private
     */


    on(event, callback) {
      if (['prev', 'next', 'enterwidescreen', 'exitwidescreen'].includes(event)) {
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
      $($('#plyr__widescreen').html()).insertBefore('[data-plyr="fullscreen"]').on('click', () => {
        this._toggleFullscreen();
      });
    }
    /** @private */


    _toggleFullscreen(bool = !this.isWideScreen) {
      if (this.isWideScreen === bool) return;
      this.isWideScreen = bool;
      window.sessionStorage.setItem(this.statusSessionKey, JSON.stringify(this.isWideScreen));

      if (this.isWideScreen) {
        this.wideScreenBodyStyles = $('body').css(['overflow']);
        $('body').css('overflow', 'hidden');
        this.$wrapper.addClass('k-player-widescreen');
        $('.plyr__widescreen').addClass('plyr__control--pressed');
      } else {
        $('body').css(this.wideScreenBodyStyles);
        this.$wrapper.removeClass('k-player-widescreen');
        $('.plyr__widescreen').removeClass('plyr__control--pressed');
      }

      this.trigger(this.isWideScreen ? 'enterwidescreen' : 'exitwidescreen');
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

  function addReferrerMeta() {
    if ($('meta[name=referrer]').length === 0) {
      $('head').append('<meta name="referrer" content="same-origin">');
    } else {
      const $meta = $('meta[name=referrer]');
      $meta.attr('content', 'same-origin');
    }
  }
  function showInfo() {
    const video = $('#k-player')[0];
    const githubIssueURL = genIssueURL({
      title: '🐛[Bug]',
      body: issueBody(video === null || video === void 0 ? void 0 : video.src)
    });
    modal({
      title: '脚本信息',
      content: scriptInfo(video, githubIssueURL)
    });
  }
  $(window).on('keydown', e => {
    if ('?？'.includes(e.key) && !document.fullscreenElement) {
      e.stopPropagation();
      e.preventDefault();
      showInfo();
    }
  });

  function replacePlayer$1() {
    const dom = document.getElementById('age_playfram');

    const fn = () => {
      if (!dom.src) return;
      let url = new URL(dom.src);

      if (url.hostname.includes('agefans')) {
        let videoURL = url.searchParams.get('url');

        if (videoURL) {
          addReferrerMeta();
          initPlayer(videoURL);
          mutationOb.disconnect();
        }
      } else {
        const message = new Message('#ageframediv');
        message.info('这个视频似乎是第三方链接，并非由agefans自身提供，将使用默认播放器播放', 3000);
        mutationOb.disconnect();
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

  function gotoPrevPart() {
    const dom = getActivedom().parent().prev().find('a');

    if (dom.length) {
      switchPart(dom.data('href'), dom);
    }
  }

  function gotoNextPart$1() {
    const dom = getActivedom().parent().next().find('a');

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
      player$1.src = vurl;
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
      player$1.currentTime = his.get(id).time;
      player$1.message.info(`已自动跳转至历史播放位置 ${parseTime(his.get(id).time)}`);
    }
  }

  function addListener() {
    player$1.on('next', () => {
      gotoNextPart$1();
    });
    player$1.on('ended', () => {
      gotoNextPart$1();
    });
    player$1.on('prev', () => {
      gotoPrevPart();
    });
    player$1.plyr.once('canplay', () => {
      videoJumpHistoryPosition();
    });
    player$1.on('error', () => {
      removeLocal(getActivedom().data('href'));
    });
    player$1.on('timeupdate', () => {
      if (Math.floor(player$1.currentTime) % 3 === 0) {
        updateTime(player$1.currentTime);
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
      $(this).removeAttr('href').attr('data-href', href).css('cursor', 'pointer').on('click', e => {
        e.preventDefault();
        switchPart(href, $(this));
      });
    });
  }
  /** @type {KPlayer} */


  let player$1;

  function initPlayer(vurl) {
    player$1 = new KPlayer('#age_playfram');
    showCurrentLink(vurl);
    addListener();
    player$1.src = vurl;
    saveLocal(getActivedom().data('href'), vurl);
  }

  function removeCpraid() {
    $('#cpraid').remove();
  }

  function playModule$1() {
    his.logHistory();
    initPlayPageStyle();
    replaceHref();
    replacePlayer$1();
    removeCpraid();
    initGetAllVideoURL();
  }

  function agefans() {
    $('body').addClass('agefans-wrapper');

    historyModule(); // log page to history

    if (location.pathname.startsWith('/play')) {
      playModule$1();
    } // in detail pages show view history


    if (location.pathname.startsWith('/detail')) {
      detailModule();
    }
  }

  /** @type {KPlayer} */

  let player;

  function replacePlayer() {
    const vurl = $('#playbox').data('vid');
    player = new KPlayer('.bofang iframe');
    player.src = vurl.split('$')[0];
  }

  function gotoNextPart() {
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
    player.on('next', gotoNextPart);
  }

  function playModule() {
    replacePlayer();
    initEvent();
  }

  var css = ".yhdm-wrapper {\n  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;\n}\n.yhdm-wrapper .play,\n.yhdm-wrapper #playbox,\n.yhdm-wrapper .bofang {\n  height: 540px;\n}";
  n(css,{});

  function yhdm() {
    $('body').addClass('yhdm-wrapper');

    if (window.location.pathname.includes('/v/')) {
      playModule();
    }
  }

  if (window.location.href.includes('agefans')) {
    agefans();
  }

  if (window.location.href.includes('yhdm')) {
    yhdm();
  }

}());
