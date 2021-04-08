// ==UserScript==
// @name         agefans Enhance
// @namespace    https://github.com/IronKinoko/agefans-enhance
// @version      0.1.11
// @description  more powerful agefans
// @author       IronKinoko
// @match        https://www.agefans.net/play/*
// @match        https://www.agefans.net/detail/*
// @match        https://www.agefans.net/age/player/ckx1*
// @grant        none
// @license      MIT
// @run-at       document-start
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

  function genNextPartBtn() {
    let $0 = document.querySelector('[class^=timetext]')
    if (!$0) return requestAnimationFrame(genNextPartBtn)

    let div = document.createElement('div')

    /** @type {CSSStyleDeclaration}*/
    let styles = {
      lineHeight: '38px',
      color: 'rgb(255, 255, 255)',
      fontFamily: 'arial',
      fontSize: '16px',
      paddingLeft: '10px',
      float: 'left',
      overflow: 'hidden',
      cursor: 'pointer',
    }

    Object.entries(styles).forEach(([key, value]) => {
      div.style[key] = value
    })

    div.innerText = '下一集'
    div.onclick = () => {
      parent.postMessage({
        source: 'ckx1',
        code: 2,
        message: 'switch to next part',
      })
    }

    $0.parentNode.insertBefore(div, $0.nextSibling)

    autoPlay()
  }

  function autoPlay() {
    let videoEl = document.querySelector('video')
    videoEl.addEventListener('loadeddata', function () {
      if (videoEl.readyState >= 2) {
        videoEl.play().then(() => {
          log('success palyed')
        })
      }
    })

    let played = false
    const fn = () => {
      if (played) return false
      played = true
      videoEl.onended = () => {
        parent.postMessage({
          source: 'ckx1',
          code: 1,
          message: 'auto switch',
        })
      }
      videoEl.removeEventListener('play', fn)
    }
    videoEl.addEventListener('play', fn)
  }

  function replacePlayer() {
    const dom = document.getElementById('age_playfram')
    if (!dom) requestAnimationFrame(replacePlayer)

    // player like bilibili
    const prefix = 'https://vip.parwix.com:4433/player/?url='

    const mutationOb = new MutationObserver(() => {
      let url = new URL(dom.src)

      if (url.hostname.includes('agefans')) {
        let videoURL = url.searchParams.get('url')
        log(videoURL)
        dom.src = prefix + videoURL
      }
    })
    mutationOb.observe(dom, { attributes: true })
  }

  function inject() {
    let dom = document.querySelector('.fullscn')

    if (!dom) return requestAnimationFrame(inject)

    dom.onclick = () => {
      if (document.body.style.overflow === 'hidden') {
        document.body.style.overflow = ''
      } else {
        document.body.style.overflow = 'hidden'
      }
    }

    let ageframediv = document.getElementById('ageframediv')
    let { width, height } = ageframediv.getBoundingClientRect()
    ageframediv.style.height = (width / 16) * 9 + 'px'

    replacePlayer()
  }

  if (parent === self) {
    // inject window message listener
    window.addEventListener('message', (e) => {
      if (e.data && e.data.source === 'ckx1') {
        gotoNextPart()
      }
    })

    // log page to history
    if (location.pathname.startsWith('/play')) {
      requestAnimationFrame(inject)
      saveToHistory()
    }

    // in detail pages show view history
    if (location.pathname.startsWith('/detail')) {
      renderHistory()
    }
  } else {
    // requestAnimationFrame(genNextPartBtn)
    autoPlay()
  }
})()
