// ==UserScript==
// @name         agefans Enhance
// @namespace    https://github.com/IronKinoko/agefans-enhance
// @version      0.1.13
// @description  more powerful agefans
// @author       IronKinoko
// @match        https://www.agefans.net/play/*
// @match        https://www.agefans.net/detail/*
// @grant        none
// @license      MIT
// ==/UserScript==

;(function () {
  'use strict'

  window.log = console.log
  delete window.console
  document.cookie = 'username=admin; path=/; max-age=99999999;'
  const his = new (class {
    cacheKey = 'view-history'
    his = JSON.parse(localStorage.getItem(this.cacheKey) || '{}')
    getAll() {
      return this.his
    }
    get(key) {
      return this.his[key]
    }
    set(key, value = true) {
      this.his[key] = value
      localStorage.setItem(this.cacheKey, JSON.stringify(this.his))
    }
    has(key) {
      return Boolean(this.his[key])
    }
  })()

  function gotoNextPart() {
    let dom = document.querySelector("li a[style*='color: rgb(238, 0, 0);']")
      .parentElement.nextElementSibling

    if (dom) {
      dom.children[0].click()
    }
  }

  function saveToHistory() {
    const key = location.pathname + location.search
    his.set(key, true)
  }

  function renderHistory() {
    const aEls = document.querySelectorAll('.movurl li a')

    if (aEls.length === 0) return requestAnimationFrame(renderHistory)

    // add a tag visited style
    let styleDom = document.createElement('style')
    styleDom.innerHTML = `.movurl li a:visited { color: red; }`
    document.head.appendChild(styleDom)

    aEls.forEach((a) => {
      const href = a.getAttribute('href')
      if (his.has(href)) {
        a.style.border = '1px solid red'
      }
    })
  }

  function replacePlayer() {
    const dom = document.getElementById('age_playfram')

    dom.setAttribute('allow', 'autoplay; fullscreen')
    const prefix = 'https://ironkinoko.github.io/agefans-enhance/?url='

    const fn = () => {
      let url = new URL(dom.src)

      if (url.hostname.includes('agefans')) {
        let videoURL = url.searchParams.get('url')
        if (videoURL) {
          dom.src = prefix + encodeURIComponent(videoURL)
        }
      }
    }

    const mutationOb = new MutationObserver(fn)
    mutationOb.observe(dom, { attributes: true })
    fn()
  }

  function toggleFullScreen(bool) {
    let dom = document.querySelector('.fullscn')
    dom.click()
  }

  function notifyChildToggleFullScreen(isFull) {
    const dom = document.getElementById('age_playfram')
    dom.contentWindow.postMessage({ code: 999, isFull }, '*')
  }

  function inject() {
    let dom = document.querySelector('.fullscn')
    dom.onclick = () => {
      if (document.body.style.overflow === 'hidden') {
        document.body.style.overflow = ''
        notifyChildToggleFullScreen(false)
      } else {
        document.body.style.overflow = 'hidden'
        notifyChildToggleFullScreen(true)
      }
    }

    let ageframediv = document.getElementById('ageframediv')
    let { width, height } = ageframediv.getBoundingClientRect()
    ageframediv.style.height = (width / 16) * 9 + 'px'
  }

  if (parent === self) {
    // inject window message listener
    window.addEventListener('message', (e) => {
      if (e.data && e.data.code === 233) {
        gotoNextPart()
      }

      if (e.data && e.data.code === 666) {
        toggleFullScreen()
      }
    })

    // log page to history
    if (location.pathname.startsWith('/play')) {
      inject()
      replacePlayer()
      saveToHistory()
    }

    // in detail pages show view history
    if (location.pathname.startsWith('/detail')) {
      renderHistory()
    }
  }
})()
