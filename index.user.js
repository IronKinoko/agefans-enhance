// ==UserScript==
// @name         agefans Enhance
// @namespace    https://github.com/IronKinoko/agefans-enhance
// @version      1.0.0
// @description  增强agefans播放功能，实现自动换集、画中画、历史记录、断点续播等功能
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
      this.his = JSON.parse(localStorage.getItem(this.cacheKey) || '[]');
    }
    getAll() {
      return this.his
    }
    get(id) {
      return this.his.find((o) => o.id === id)
    }
    setTime(id, time = 0) {
      this.get(id).time = time;
      this.save();
    }
    log(item) {
      this.his.unshift(item);
      this.save();
    }
    refresh(id, data) {
      const index = this.his.findIndex((o) => o.id === id);
      const item = this.his.splice(index, 1)[0];
      this.his.unshift(data || item);
      this.save();
    }
    save() {
      localStorage.setItem(this.cacheKey, JSON.stringify(this.his.slice(0, 50)));
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
    $(
      '<style>#history{background:#202020;border:4px solid #303030;}.history-list{padding:16px;display:flex;flex-wrap:wrap;}.history-item{width:120px;display:inline-block;margin:4px}.history-item img{width:120px;border-radius:2px}.history-item .desc .title{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:14px;margin:4px 0}.history-item .desc .position{font-size:14px}</style>'
    ).appendTo('head');
    $('<div id="history"></div>').insertBefore('#footer').hide();

    $(`<a class="nav_button">历史</a>`)
      .appendTo('#nav')
      .on('click', () => {
        renderHistoryList();
        $('#container').hide();
        $('#history').show();
      });
    renderHistoryList();

    $('.nav_button_current')
      .on('click', () => {
        $('#container').show();
        $('#history').hide();
      })
      .removeAttr('href');

    $('.nav_button').on('click', (e) => {
      $('.nav_button_current').removeClass('nav_button_current');
      $(e.currentTarget).addClass('nav_button_current');
    });
  }

  function historyModule() {
    renderHistoryPage();
    renderHistoryList();
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
        }
      }
    };

    const mutationOb = new MutationObserver(fn);
    mutationOb.observe(dom, { attributes: true });
    fn();
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

  function playModule() {
    addListener();
    his.logHistory();
    initPlayPageStyle();
    replacePlayer();
    prerenderNextPartHTML();
  }

  {
    document.cookie = 'username=admin; path=/; max-age=99999999;';
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
