import { his } from './history'
function replacePlayer() {
  const dom = document.getElementById('age_playfram')

  dom.setAttribute('allow', 'autoplay')
  const prefix = 'https://ironkinoko.github.io/agefans-enhance/?url='

  const fn = () => {
    let url = new URL(dom.src)

    if (url.hostname.includes('agefans')) {
      let videoURL = url.searchParams.get('url')
      if (videoURL) {
        dom.src = prefix + encodeURIComponent(videoURL)
        showCurrentLink(videoURL)
      }
    }
    // 移除版权规避提示
    if ($(dom).css('display') === 'none') {
      $(dom).show()
    }
  }

  const mutationOb = new MutationObserver(fn)
  mutationOb.observe(dom, { attributes: true })
  fn()
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
`).insertBefore($('.baseblock:contains(网盘资源)'))
}

function gotoNextPart() {
  const dom = document.querySelector("li a[style*='color: rgb(238, 0, 0);']")
    .parentElement.nextElementSibling

  if (dom) {
    dom.children[0].click()
  }
}

function toggleFullScreen() {
  let dom = document.querySelector('.fullscn')
  dom.click()
}

function notifyChildToggleFullScreen(isFull) {
  const dom = document.getElementById('age_playfram')
  dom.contentWindow.postMessage({ code: 666, isFull }, '*')
}

function initPlayPageStyle() {
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
  dom.style.opacity = 0

  let ageframediv = document.getElementById('ageframediv')
  let { width } = ageframediv.getBoundingClientRect()
  ageframediv.style.height = (width / 16) * 9 + 'px'
}

function prerenderNextPartHTML() {
  const dom = document.querySelector("li a[style*='color: rgb(238, 0, 0);']")
    .parentElement.nextElementSibling
  if (dom) {
    const link = document.createElement('link')
    link.rel = 'prerender'
    link.href = dom.children[0].href
    document.head.appendChild(link)
  }
}

function updateTime(time = 0) {
  const id = location.pathname.match(/\/play\/(\d*)/)?.[1]
  if (!id) return

  his.setTime(id, Math.floor(time))
}

function notifyChildJumpToHistoryPosition() {
  const id = location.pathname.match(/\/play\/(\d*)/)?.[1]
  if (!id) return

  if (his.get(id)?.time && his.get(id)?.time > 3) {
    const dom = document.getElementById('age_playfram')
    dom.contentWindow.postMessage({ code: 999, time: his.get(id).time }, '*')
  }
}

function addListener() {
  window.addEventListener('message', (e) => {
    if (e.data?.code === 233) {
      gotoNextPart()
    }

    if (e.data?.code === 200) {
      notifyChildJumpToHistoryPosition()
    }

    if (e.data?.code === 666) {
      toggleFullScreen()
    }

    if (e.data?.code === 999) {
      updateTime(e.data.time)
    }
  })
}

function removeCpraid() {
  $('#cpraid').remove()
}

export function playModule() {
  addListener()
  his.logHistory()
  initPlayPageStyle()
  replacePlayer()
  prerenderNextPartHTML()
  removeCpraid()
}
