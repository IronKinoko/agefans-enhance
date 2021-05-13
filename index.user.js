// ==UserScript==
// @name         agefans Enhance
// @namespace    https://github.com/IronKinoko/agefans-enhance
// @version      1.2.0
// @description  增强agefans播放功能，实现自动换集、画中画、历史记录、断点续播、显示视频源、获取当前页面全部视频等功能
// @author       IronKinoko
// @match        https://www.agefans.net/*
// @match        https://www.agefans.net/play/*
// @match        https://www.agefans.net/detail/*
// @require      https://cdn.jsdelivr.net/npm/jquery@1.12.4/dist/jquery.min.js
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';

  var e=[],t=[];function n(n,r){if(n&&"undefined"!=typeof document){var a,s=!0===r.prepend?"prepend":"append",d=!0===r.singleTag,i="string"==typeof r.container?document.querySelector(r.container):document.getElementsByTagName("head")[0];if(d){var u=e.indexOf(i);-1===u&&(u=e.push(i)-1,t[u]={}),a=t[u]&&t[u][s]?t[u][s]:t[u][s]=c();}else a=c();65279===n.charCodeAt(0)&&(n=n.substring(1)),a.styleSheet?a.styleSheet.cssText+=n:a.appendChild(document.createTextNode(n));}function c(){var e=document.createElement("style");if(e.setAttribute("type","text/css"),r.attributes)for(var t=Object.keys(r.attributes),n=0;n<t.length;n++)e.setAttribute(t[n],r.attributes[t[n]]);var a="prepend"===s?"afterbegin":"beforeend";return i.insertAdjacentElement(a,e),e}}

  var css = ".k-modal {\n  position: fixed;\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.k-modal * {\n  color: rgba(0, 0, 0, 0.85);\n}\n.k-modal .k-modal-mask {\n  position: absolute;\n  z-index: 100;\n  width: 100%;\n  height: 100%;\n  background: rgba(0, 0, 0, 0.45);\n  cursor: pointer;\n}\n.k-modal .k-modal-container {\n  position: absolute;\n  z-index: 101;\n  width: 520px;\n  min-height: 100px;\n  background: white;\n  border-radius: 2px;\n}\n.k-modal .k-modal-header {\n  font-size: 16px;\n  padding: 16px;\n  border-bottom: 1px solid #f1f1f1;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n.k-modal .k-modal-close {\n  cursor: pointer;\n}\n.k-modal .k-modal-body,\n.k-modal .k-modal-footer {\n  padding: 16px;\n  font-size: 14px;\n}\n.k-modal .k-modal-footer {\n  border-top: 1px solid #f1f1f1;\n  display: flex;\n  justify-content: flex-end;\n}\n.k-modal .k-modal-btn {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: 32px;\n  border-radius: 2px;\n  border: 1px solid #2af;\n  background: #2af;\n  color: white;\n  min-width: 64px;\n  cursor: pointer;\n}\n\n.nav_button {\n  cursor: pointer;\n}\n\n#history {\n  background: #202020;\n  border: 4px solid #303030;\n}\n#history .history-list {\n  padding: 16px;\n  display: flex;\n  flex-wrap: wrap;\n}\n#history .history-item {\n  width: 115px;\n  display: inline-block;\n  margin: 4px;\n}\n#history .history-item img {\n  width: 100%;\n  border-radius: 2px;\n}\n#history .history-item .desc .title {\n  overflow: hidden;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  font-size: 14px;\n  margin: 4px 0;\n}\n#history .history-item .desc .position {\n  font-size: 14px;\n}";
  n(css,{});

  function renderHistroyStyle() {
    // add a tag visited style
    let styleDom = document.createElement('style');
    styleDom.innerHTML = `.movurl li a:visited { color: red; }`;
    document.head.appendChild(styleDom);
  }

  function detailModule() {
    renderHistroyStyle();
  }

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
        fetch(getPlayUrl(item.href))
          .then((res) => res.json())
          .then((res) => {
            const url = decodeURIComponent(res.vurl);
            saveLocal(item.href, item.title, url);
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
  function getLocal() {
    return JSON.parse(window.localStorage.getItem(PLAY_URL_KEY) || '{}')
  }
  function saveLocal(href, title, url) {
    const map = getLocal();
    map[href] = { title, url };
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
  function initGetAllVideoURL() {
    insertBtn();
    insertLocal();
  }

  function replacePlayer() {
    const dom = document.getElementById('age_playfram');

    dom.setAttribute('allow', 'autoplay');
    const prefix = 'https://ironkinoko.github.io/agefans-enhance/?url=';

    const fn = () => {
      let url = new URL(dom.src);

      if (url.hostname.includes('agefans')) {
        let videoURL = url.searchParams.get('url');
        if (videoURL) {
          dom.src = prefix + encodeURIComponent(videoURL);
          showCurrentLink(videoURL);
        }
      }
      // 移除版权规避提示
      if ($(dom).css('display') === 'none') {
        $(dom).show();
      }
    };

    const mutationOb = new MutationObserver(fn);
    mutationOb.observe(dom, { attributes: true });
    fn();
  }

  function showCurrentLink(url) {
    $(`
  <div class="baseblock">
    <div class="blockcontent">
      <div id="wangpan-div" class="baseblock2">
        <div class="blocktitle">本集链接：</div>
        <div class="blockcontent">
          <span class="res_links">
            ${decodeURIComponent(url)}
          </span>
          <br>
        </div>
      </div>
    </div>
  </div>
`).insertBefore($('.baseblock:contains(网盘资源)'));
  }

  function gotoNextPart() {
    const dom = document.querySelector("li a[style*='color: rgb(238, 0, 0);']")
      .parentElement.nextElementSibling;

    if (dom) {
      dom.children[0].click();
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

  function prerenderNextPartHTML() {
    const dom = document.querySelector("li a[style*='color: rgb(238, 0, 0);']")
      .parentElement.nextElementSibling;
    if (dom) {
      const link = document.createElement('link');
      link.rel = 'prerender';
      link.href = dom.children[0].href;
      document.head.appendChild(link);
    }
  }

  function updateTime(time = 0) {
    const id = location.pathname.match(/\/play\/(\d*)/)?.[1];
    if (!id) return

    his.setTime(id, Math.floor(time));
  }

  function notifyChildJumpToHistoryPosition() {
    const id = location.pathname.match(/\/play\/(\d*)/)?.[1];
    if (!id) return

    if (his.get(id)?.time && his.get(id)?.time > 3) {
      const dom = document.getElementById('age_playfram');
      dom.contentWindow.postMessage({ code: 999, time: his.get(id).time }, '*');
    }
  }

  function addListener() {
    window.addEventListener('message', (e) => {
      if (e.data?.code === 233) {
        gotoNextPart();
      }

      if (e.data?.code === 200) {
        notifyChildJumpToHistoryPosition();
      }

      if (e.data?.code === 666) {
        toggleFullScreen();
      }

      if (e.data?.code === 999) {
        updateTime(e.data.time);
      }
    });
  }

  function removeCpraid() {
    $('#cpraid').remove();
  }

  function playModule() {
    addListener();
    his.logHistory();
    initPlayPageStyle();
    replacePlayer();
    prerenderNextPartHTML();
    removeCpraid();
    initGetAllVideoURL();
  }

  if (parent === self) {
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

}());
