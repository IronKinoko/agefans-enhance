// ==UserScript==
// @name         agefans Enhance
// @namespace    https://github.com/IronKinoko/agefans-enhance
// @version      1.3.0
// @description  增强agefans播放功能，实现自动换集、无缝换集、画中画、历史记录、断点续播、显示视频源、获取当前页面全部视频等功能
// @author       IronKinoko
// @match        https://www.agefans.net/*
// @match        https://www.agefans.net/play/*
// @match        https://www.agefans.net/detail/*
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

  var e=[],t=[];function n(n,r){if(n&&"undefined"!=typeof document){var a,s=!0===r.prepend?"prepend":"append",d=!0===r.singleTag,i="string"==typeof r.container?document.querySelector(r.container):document.getElementsByTagName("head")[0];if(d){var u=e.indexOf(i);-1===u&&(u=e.push(i)-1,t[u]={}),a=t[u]&&t[u][s]?t[u][s]:t[u][s]=c();}else a=c();65279===n.charCodeAt(0)&&(n=n.substring(1)),a.styleSheet?a.styleSheet.cssText+=n:a.appendChild(document.createTextNode(n));}function c(){var e=document.createElement("style");if(e.setAttribute("type","text/css"),r.attributes)for(var t=Object.keys(r.attributes),n=0;n<t.length;n++)e.setAttribute(t[n],r.attributes[t[n]]);var a="prepend"===s?"afterbegin":"beforeend";return i.insertAdjacentElement(a,e),e}}

  var css$3 = ".nav_button {\n  cursor: pointer;\n}";
  n(css$3,{});

  function renderHistroyStyle() {
    // add a tag visited style
    let styleDom = document.createElement('style');
    styleDom.innerHTML = `.movurl li a:visited { color: red; }`;
    document.head.appendChild(styleDom);
  }

  function detailModule() {
    renderHistroyStyle();
  }

  var css$2 = "#history {\n  background: #202020;\n  border: 4px solid #303030;\n}\n#history .history-list {\n  padding: 16px;\n  display: flex;\n  flex-wrap: wrap;\n}\n#history .history-item {\n  width: 115px;\n  display: inline-block;\n  margin: 4px;\n}\n#history .history-item img {\n  width: 100%;\n  border-radius: 2px;\n}\n#history .history-item .desc .title {\n  overflow: hidden;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  font-size: 14px;\n  margin: 4px 0;\n}\n#history .history-item .desc .position {\n  font-size: 14px;\n}";
  n(css$2,{});

  class History {
    constructor() {
      this.cacheKey = 'v-his';
    }
    get his() {
      return JSON.parse(localStorage.getItem(this.cacheKey) || '[]')
    }
    set his(value) {
      if (Array.isArray(value)) {
        localStorage.setItem(this.cacheKey, JSON.stringify(value.slice(0, 100)));
      }
    }
    getAll() {
      return this.his
    }
    get(id) {
      return this.his.find((o) => o.id === id)
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
      return Boolean(this.his.find((o) => o.id === id))
    }

    logHistory() {
      const id = location.pathname.match(/\/play\/(\d*)/)?.[1];
      if (!id) return

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
    return `${Math.floor(time / 60)
    .toString()
    .padStart(2, '0')}:${(time % 60).toString().padStart(2, '0')}`
  }
  function renderHistoryList() {
    $('#history')
      .html('')
      .append(() => {
        /** @type {any[]} */
        const histories = his.getAll();
        let html = '';
        histories.forEach((o) => {
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
        return `<div class="history-list">${
        html || '<center>暂无数据</center>'
      }</div>`
      });
  }

  function renderHistoryPage() {
    const currentDom = $('.nav_button_current');

    $('<div id="history"></div>').insertBefore('#footer').hide();

    $(`<a class="nav_button">历史</a>`)
      .appendTo('#nav')
      .on('click', (e) => {
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

    $('.nav_button_current')
      .on('click', (e) => {
        $('#container').show();
        $('#history').hide();
        changeActive(e.currentTarget);
      })
      .removeAttr('href');
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

  var css$1 = ".k-modal {\n  position: fixed;\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.k-modal * {\n  color: rgba(0, 0, 0, 0.85);\n}\n.k-modal .k-modal-mask {\n  position: absolute;\n  z-index: 100;\n  width: 100%;\n  height: 100%;\n  background: rgba(0, 0, 0, 0.45);\n  cursor: pointer;\n}\n.k-modal .k-modal-container {\n  position: absolute;\n  z-index: 101;\n  width: 520px;\n  min-height: 100px;\n  background: white;\n  border-radius: 2px;\n}\n.k-modal .k-modal-header {\n  font-size: 16px;\n  padding: 16px;\n  border-bottom: 1px solid #f1f1f1;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n.k-modal .k-modal-close {\n  cursor: pointer;\n}\n.k-modal .k-modal-body,\n.k-modal .k-modal-footer {\n  padding: 16px;\n  font-size: 14px;\n}\n.k-modal .k-modal-footer {\n  border-top: 1px solid #f1f1f1;\n  display: flex;\n  justify-content: flex-end;\n}\n.k-modal .k-modal-btn {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: 32px;\n  border-radius: 2px;\n  border: 1px solid #2af;\n  background: #2af;\n  color: white;\n  min-width: 64px;\n  cursor: pointer;\n}";
  n(css$1,{});

  function modal({ title, content, onClose, onOk }) {
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
      $(`#${ID}`).remove();
      onClose && onClose();
    });
    $(`#${ID} .k-modal-mask`).on('click', () => {
      $(`#${ID}`).remove();
      onClose && onClose();
    });

    if (onOk) {
      $(`#${ID} .k-modal-container`).append(`
      <div class="k-modal-footer">
        <button class="k-modal-btn k-modal-ok">确 定</button>
      </div>
    `);
      $(`#${ID} .k-modal-ok`).on('click', () => {
        onOk();
        $(`#${ID}`).remove();
      });
    }
  }

  function __setCookie(name, value, _in_days) {
    var Days = _in_days;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
    document.cookie =
      name + '=' + escape(value) + ';expires=' + exp.toGMTString() + ';path=/';
  }
  function __getCookie(name) {
    var arr,
      reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
    if ((arr = document.cookie.match(reg))) {
      return unescape(arr[2])
    } else {
      return null
    }
  }
  function getCookie2(name) {
    return __getCookie(name)
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
    }

    //
    if (time_curr - fa_t > 6000) {
      fa_t = 0;
      fa_c = 0;
    }

    //
    fa_c += 1;
    fa_t = time_curr;

    //
    if (fa_c > 10) {
      fa_t = 0;
      fa_c = 0;
      //
      if (hf_epi > 1) {
        hf_epi = time_curr % hf_epi;
        if (!hf_epi) {
          hf_epi = 1;
        }
      }
    }

    __setCookie('fa_t', fa_t, 1);
    __setCookie('fa_c', fa_c, 1);

    return hf_epi
  }
  function getPlayUrl(_url) {
    const _rand = Math.random();
    var _getplay_url =
      _url.replace(
        /.*\/play\/(\d+?)\?playid=(\d+)_(\d+).*/,
        '/_getplay?aid=$1&playindex=$2&epindex=$3'
      ) +
      '&r=' +
      _rand;
    var re_resl = _getplay_url.match(/[&?]+epindex=(\d+)/);
    const hf_epi = '' + FEI2(re_resl[1]);
    const t_epindex_ = 'epindex=';
    _getplay_url = _getplay_url.replace(
      t_epindex_ + re_resl[1],
      t_epindex_ + hf_epi
    );
    return _getplay_url
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
          <a id="all-select" class="res_links_a" style="cursor:pointer">复制内容</a>
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
      modal({
        title: '选择需要的链接',
        content: insertModalForm(),
        onOk: () => {
          let list = [];
          $('#modal-form input').each(function (_, el) {
            if (el.checked) {
              list.push({
                title: $(this).data('title'),
                href: $(this).attr('name'),
              });
            }
          });
          insertResult(list);
        },
      });
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
        href: aTag.getAttribute('href'),
      });
    });

    return aTags
  }

  function insertModalForm() {
    const list = getAllVideoUrlList();

    let $dom = $(`
  <div id="modal-form">
    <ul>
      ${list
        .map(
          (aTag) => `
        <li>
          <label><input type="checkbox" name="${aTag.href}" data-title="${aTag.title}" checked />${aTag.title}</label>
        </li>`
        )
        .join('')}
    </ul>
  </div>
  `);

    return $dom
  }

  function genUrlItem(title, content = '加载中...') {
    return `<div>
  <div style="white-space: nowrap;">[${title}]</div>
  <div class="url" data-status='0' style="word-break:break-all; word-wrap:break-word;">${content}</div>
</div>`
  }
  /**
   * @param {ATag[]} list
   */
  function insertResult(list) {
    const $parent = $('#url-list');
    $parent.empty();
    list.forEach((item) => {
      let $dom = $(genUrlItem(item.title)).appendTo($parent);

      let $msg = $dom.find('.url');
      function _getUrl() {
        getVurl(item.href)
          .then((vurl) => {
            const url = decodeURIComponent(vurl);
            saveLocal(item.href, url);
            $msg.text(url);
            $msg.data('status', '1');
          })
          .catch((error) => {
            console.error(error);
            $msg.empty();
            $msg.data('status', '2');
            $(`<a style="cursor:pointer">加载出错，重试</a>`)
              .appendTo($msg)
              .on('click', () => {
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
    return JSON.parse(window.localStorage.getItem(PLAY_URL_KEY) || '{}')
  }
  function saveLocal(href, url) {
    const map = getLocal();
    map[href] = { url };
    window.localStorage.setItem(PLAY_URL_KEY, JSON.stringify(map));
  }
  function insertLocal() {
    const map = getLocal();
    const list = getAllVideoUrlList();
    const $parent = $('#url-list');
    $(
      list
        .map((item) => {
          if (map[item.href]) {
            return genUrlItem(item.title, map[item.href].url)
          } else {
            return ''
          }
        })
        .join('')
    ).appendTo($parent);
  }

  async function getVurl(href) {
    const res = await fetch(getPlayUrl(href)).then((res) => res.json());
    return res.vurl
  }
  async function getVurlWithLocal(href) {
    const map = getLocal();
    if (map[href]) {
      return map[href].url
    }

    const vurl = await getVurl(href);
    saveLocal(href, vurl);
    return vurl
  }

  function initGetAllVideoURL() {
    insertBtn();
    insertLocal();
  }

  var css = "#k-player-wrapper {\n  position: relative;\n  width: 100%;\n  height: 100%;\n  background: #000;\n}\n#k-player-wrapper .k-player-contianer {\n  width: 100%;\n  height: 100%;\n}\n#k-player-wrapper #k-player-loading,\n#k-player-wrapper #k-player-error {\n  position: absolute;\n  left: 0;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  z-index: 10;\n  font-size: 88px;\n  color: white;\n}\n#k-player-wrapper .k-player-center {\n  width: 100%;\n  height: 100%;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n}\n#k-player-wrapper .error-info {\n  text-align: center;\n  padding: 24px;\n  font-size: 18px;\n}\n#k-player-wrapper .plyr {\n  width: 100%;\n  height: 100%;\n}\n#k-player-wrapper video {\n  display: block;\n}\n#k-player-wrapper .plyr__next svg {\n  transform: scale(1.7);\n}\n#k-player-wrapper .plyr__widescreen svg {\n  transform: scale(1.3);\n}\n#k-player-wrapper .plyr__fullscreen svg {\n  transform: scale(1.3);\n}\n#k-player-wrapper .plyr--hide-cursor {\n  cursor: none;\n}\n#k-player-wrapper .plyr__control span {\n  color: inherit;\n}\n\n.lds-spinner {\n  color: official;\n  display: inline-block;\n  position: relative;\n  width: 80px;\n  height: 80px;\n}\n\n.lds-spinner div {\n  transform-origin: 40px 40px;\n  animation: lds-spinner 1.2s linear infinite;\n}\n\n.lds-spinner div:after {\n  content: \" \";\n  display: block;\n  position: absolute;\n  top: 3px;\n  left: 37px;\n  width: 6px;\n  height: 18px;\n  border-radius: 20%;\n  background: #fff;\n}\n\n.lds-spinner div:nth-child(1) {\n  transform: rotate(0deg);\n  animation-delay: -1.1s;\n}\n\n.lds-spinner div:nth-child(2) {\n  transform: rotate(30deg);\n  animation-delay: -1s;\n}\n\n.lds-spinner div:nth-child(3) {\n  transform: rotate(60deg);\n  animation-delay: -0.9s;\n}\n\n.lds-spinner div:nth-child(4) {\n  transform: rotate(90deg);\n  animation-delay: -0.8s;\n}\n\n.lds-spinner div:nth-child(5) {\n  transform: rotate(120deg);\n  animation-delay: -0.7s;\n}\n\n.lds-spinner div:nth-child(6) {\n  transform: rotate(150deg);\n  animation-delay: -0.6s;\n}\n\n.lds-spinner div:nth-child(7) {\n  transform: rotate(180deg);\n  animation-delay: -0.5s;\n}\n\n.lds-spinner div:nth-child(8) {\n  transform: rotate(210deg);\n  animation-delay: -0.4s;\n}\n\n.lds-spinner div:nth-child(9) {\n  transform: rotate(240deg);\n  animation-delay: -0.3s;\n}\n\n.lds-spinner div:nth-child(10) {\n  transform: rotate(270deg);\n  animation-delay: -0.2s;\n}\n\n.lds-spinner div:nth-child(11) {\n  transform: rotate(300deg);\n  animation-delay: -0.1s;\n}\n\n.lds-spinner div:nth-child(12) {\n  transform: rotate(330deg);\n  animation-delay: 0s;\n}\n\n@keyframes lds-spinner {\n  0% {\n    opacity: 1;\n  }\n  100% {\n    opacity: 0;\n  }\n}";
  n(css,{});

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

  function debounce(fn, delay = 300) {
    if (typeof fn !== 'function') {
      throw new TypeError('fn is not a function')
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
    }
  }

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
        keyboard: { global: true },
        controls: [
          // 'play-large', // The large play button in the center
          'play', // Play/pause playback
          'progress', // The progress bar and scrubber for playback and buffering
          'current-time', // The current time of playback
          'duration', // The full duration of the media
          'mute', // Toggle mute
          'volume', // Volume control
          'settings', // Settings menu
          'pip', // Picture-in-picture (currently Safari only)
          'fullscreen', // Toggle fullscreen
        ],
        ...opts,
      });

      this.$wrapper = $wrapper;
      this.$loading = $loading;
      this.$error = $error;
      this.$video = $video;

      this.eventMap = {};
      this.ispip = false;

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
        this.plyr.play();
      });
      this.on('error', () => {
        this.$loading.hide();
        this.showError(this.src);
      });
      this.on('pause', () => {
        this.hideControlsDebounced();
      });

      document
        .querySelectorAll('.plyr__controls .plyr__control')
        .forEach((dom) => {
          dom.addEventListener('click', (e) => {
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
      fnList.forEach((fn) => {
        fn(this, params);
      });
    }

    /** @private */
    _injectNext() {
      $($('#plyr__next').html())
        .insertBefore('.plyr__controls__item.plyr__progress__container')
        .on('click', () => {
          this.trigger('next');
        });
    }

    /** @private */
    _injectSreen() {
      $($('#plyr__fullscreen').html())
        .insertBefore('[data-plyr="fullscreen"]')
        .on('click', () => {
          this._toggleFullscreen();
        });
    }

    /** @private */
    _toggleFullscreen(bool = !this.ispip) {
      if (this.ispip === bool) return
      this.ispip = bool;

      this._setFullscreenIcon(this.ispip);

      this.trigger(this.ispip ? 'enterwidescreen' : 'exitwidescreen');
    }

    /** @private */
    _setFullscreenIcon(bool = this.ispip) {
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
      return this.$video.attr('src')
    }

    set currentTime(value) {
      this.plyr.currentTime = value;
    }
    get currentTime() {
      return this.plyr.currentTime
    }

    showError(text) {
      this.$error.show().find('.error-info').text(text);
    }

    hideError() {
      this.$error.hide();
    }
  }

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
    mutationOb.observe(dom, { attributes: true });
    fn();
  }

  function showCurrentLink(vurl) {
    if ($('#current-link').length) {
      return $('#current-link').text(vurl)
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
    const dom = $("li a[style*='color: rgb(238, 0, 0)']")
      .parent()
      .next()
      .find('a');

    if (dom.length) {
      switchPart(dom.data('href'), dom);
    }
  }

  function getActivedom() {
    return $("li a[style*='color: rgb(238, 0, 0)']")
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
      player.src = vurl;

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

  function toggleFullScreen() {
    let dom = document.querySelector('.fullscn');
    dom.click();
  }

  function notifyChildToggleFullScreen(isFull) {
    const dom = document.getElementById('age_playfram');
    dom.contentWindow.postMessage({ code: 666, isFull }, '*');
  }

  function initPlayPageStyle() {
    let dom = document.querySelector('.fullscn');
    dom.onclick = () => {
      if (document.body.style.overflow === 'hidden') {
        document.body.style.overflow = '';
        notifyChildToggleFullScreen(false);
      } else {
        document.body.style.overflow = 'hidden';
        notifyChildToggleFullScreen(true);
      }
    };
    dom.style.opacity = 0;

    let ageframediv = document.getElementById('ageframediv');
    let { width } = ageframediv.getBoundingClientRect();
    ageframediv.style.height = (width / 16) * 9 + 'px';
  }

  function updateTime(time = 0) {
    const id = location.pathname.match(/\/play\/(\d*)/)?.[1];
    if (!id) return

    his.setTime(id, Math.floor(time));
  }

  function videoJumpHistoryPosition() {
    const id = location.pathname.match(/\/play\/(\d*)/)?.[1];
    if (!id) return

    if (his.get(id)?.time > 3) {
      player.currentTime = his.get(id).time;
    }
  }

  function addListener() {
    player.on('next', () => {
      gotoNextPart();
    });

    player.on('ended', () => {
      gotoNextPart();
    });

    player.plyr.once('canplay', () => {
      videoJumpHistoryPosition();
    });

    player.on('timeupdate', () => {
      if (Math.floor(player.currentTime) % 3 === 0) {
        updateTime(player.currentTime);
      }
    });

    player.on('enterwidescreen', () => {
      toggleFullScreen();
    });
    player.on('exitwidescreen', () => {
      toggleFullScreen();
    });

    $('.movurl:visible li a').each(function () {
      const href = $(this).attr('href');
      $(this)
        .removeAttr('href')
        .attr('data-href', href)
        .on('click', (e) => {
          e.preventDefault();
          switchPart(href, $(this));
        });
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

  /** @type {KPlayer} */
  let player;
  function initPlayer(vurl) {
    player = new KPlayer('#age_playfram');
    showCurrentLink(vurl);
    addListener();
    player.src = vurl;
  }

  function removeCpraid() {
    $('#cpraid').remove();
  }

  function playModule() {
    his.logHistory();
    initPlayPageStyle();
    replacePlayer();
    removeCpraid();
    initGetAllVideoURL();
  }

  function agefans() {

    historyModule();

    // log page to history
    if (location.pathname.startsWith('/play')) {
      playModule();
    }

    // in detail pages show view history
    if (location.pathname.startsWith('/detail')) {
      detailModule();
    }
  }

  if (window.location.href.includes('agefans')) {
    agefans();
  }

}());
