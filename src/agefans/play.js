import { his, parseTime } from './history'
import { getVurlWithLocal, initGetAllVideoURL } from './getAllVideoURL'
import { KPlayer } from '../player'

function replacePlayer() {
  const dom = document.getElementById('age_playfram')

  const fn = () => {
    let url = new URL(dom.src)

    if (url.hostname.includes('agefans')) {
      let videoURL = url.searchParams.get('url')
      if (videoURL) {
        initPlayer(videoURL)
        mutationOb.disconnect()
      }
    }
  }

  const mutationOb = new MutationObserver(fn)
  mutationOb.observe(dom, { attributes: true })
  fn()
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
`).insertBefore($('.baseblock:contains(网盘资源)'))
}

function gotoPrevPart() {
  const dom = getActivedom().parent().prev().find('a')

  if (dom.length) {
    switchPart(dom.data('href'), dom)
  }
}

function gotoNextPart() {
  const dom = getActivedom().parent().next().find('a')

  if (dom.length) {
    switchPart(dom.data('href'), dom)
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
    const vurl = await getVurlWithLocal(href)
    player.src = vurl
    showCurrentLink(vurl)
    const $active = getActivedom()
    $active.css('color', '')
    $active.css('border', '')
    const title = document.title.replace($active.text(), $dom.text())
    push && history.pushState({}, title, href)
    document.title = title
    $dom.css('color', 'rgb(238, 0, 0)')
    $dom.css('border', '1px solid rgb(238, 0, 0)')
    his.logHistory()
  } catch (error) {
    console.error(error)
    window.location.href = href
  }
}

function initPlayPageStyle() {
  let dom = document.querySelector('.fullscn')
  dom.remove()

  let ageframediv = document.getElementById('ageframediv')
  let { width } = ageframediv.getBoundingClientRect()
  ageframediv.style.height = (width / 16) * 9 + 'px'
}

function updateTime(time = 0) {
  const id = location.pathname.match(/\/play\/(\d*)/)?.[1]
  if (!id) return

  his.setTime(id, Math.floor(time))
}

function videoJumpHistoryPosition() {
  const id = location.pathname.match(/\/play\/(\d*)/)?.[1]
  if (!id) return

  if (his.get(id)?.time > 3) {
    player.currentTime = his.get(id).time
    player.message.info(
      `已自动跳转至历史播放位置 ${parseTime(his.get(id).time)}`
    )
  }
}

function addListener() {
  player.on('next', () => {
    gotoNextPart()
  })

  player.on('ended', () => {
    gotoNextPart()
  })

  player.on('prev', () => {
    gotoPrevPart()
  })

  player.plyr.once('canplay', () => {
    videoJumpHistoryPosition()
  })

  player.on('timeupdate', () => {
    if (Math.floor(player.currentTime) % 3 === 0) {
      updateTime(player.currentTime)
    }
  })

  window.addEventListener('popstate', () => {
    const href = location.pathname + location.search
    const $dom = $(`[data-href='${href}']`)

    if ($dom.length) {
      switchPart(href, $dom, false)
    } else {
      location.reload()
    }
  })
}

function replaceHref() {
  $('.movurl:visible li a').each(function () {
    const href = $(this).attr('href')
    $(this)
      .removeAttr('href')
      .attr('data-href', href)
      .on('click', (e) => {
        e.preventDefault()
        switchPart(href, $(this))
      })
  })
}

/** @type {KPlayer} */
let player
function initPlayer(vurl) {
  player = new KPlayer('#age_playfram')
  showCurrentLink(vurl)
  addListener()
  player.src = vurl
}

function removeCpraid() {
  $('#cpraid').remove()
}

export function playModule() {
  his.logHistory()
  initPlayPageStyle()
  replaceHref()
  replacePlayer()
  removeCpraid()
  initGetAllVideoURL()
}
