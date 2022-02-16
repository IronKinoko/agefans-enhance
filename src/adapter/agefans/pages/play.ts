import $ from 'jquery'
import { addReferrerMeta, KPlayer } from '../../../player'
import { Message } from '../../../utils/message'
import parseToURL from '../../../utils/parseToURL'
import { session } from '../../../utils/storage'
import {
  getVurlWithLocal,
  initGetAllVideoURL,
  removeLocal,
  saveLocal,
  showLocalURL,
} from '../utils/getAllVideoURL'
import { his, parseTime } from './history'
import { pagePreview } from '../utils/pagePreview'
import './play.scss'

function replacePlayer() {
  const dom = document.querySelector<HTMLIFrameElement>('#age_playfram')!

  const fn = () => {
    if (!dom.src) return
    let url = new URL(dom.src)

    if (url.origin === location.origin) {
      let videoURL = url.searchParams.get('url')
      if (videoURL) {
        addReferrerMeta()
        initPlayer(parseToURL(videoURL))
        mutationOb.disconnect()
      }
    } else {
      const message = new Message('#ageframediv')
      message.info(
        '这个视频似乎是第三方链接，并非由agefans自身提供，将使用默认播放器播放',
        3000
      )
      mutationOb.disconnect()
    }
  }

  const mutationOb = new MutationObserver(fn)
  mutationOb.observe(dom, { attributes: true })
  fn()
}

function showCurrentLink(vurl: string | URL) {
  const decodeVurl = parseToURL(vurl)
  const isSteaming = decodeVurl.includes('.m3u8')

  const title = [$('#detailname a').text(), getActivedom().text()].join(' ')

  if ($('#current-link').length) {
    $('#current-link').text(decodeVurl)
    $('#current-link').attr('href', decodeVurl)
    return
  }
  $(`
  <div class="baseblock">
    <div class="blockcontent">
      <div id="wangpan-div" class="baseblock2">
        <div class="blocktitle">本集链接：${
          isSteaming ? '(流媒体视频暂时不支持下载)' : ''
        }</div>
        <div class="blockcontent">
          <a class="res_links" id="current-link" download="${title}" rel="noreferrer" href="${decodeVurl}">${decodeVurl}</a>
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

// switch part retry count
let retryCount = 0
let switchLoading = false
/**
 *
 * @param {string} href
 * @param {JQuery<HTMLAnchorElement>} $dom
 * @param {boolean} [push]
 */
async function switchPart(
  href: string,
  $dom: JQuery<HTMLElement>,
  push = true
) {
  try {
    if (switchLoading === true) return
    switchLoading = true
    retryCount++

    push && player.message.info(`即将播放${$dom.text()}`)
    const vurl = await getVurlWithLocal(href)
    push && player.message.destroy()

    const speed = player.plyr.speed
    player.src = vurl
    player.plyr.speed = speed

    const $active = getActivedom()
    $active.css({ color: '', border: '' })
    $dom.css({ color: 'rgb(238, 0, 0)', border: '1px solid rgb(238, 0, 0)' })

    const title = document.title.replace($active.text(), $dom.text())
    push && history.pushState({}, title, href)
    document.title = title

    showCurrentLink(vurl)
    showLocalURL()
    his.logHistory()
    retryCount = 0
    switchLoading = false
  } catch (error) {
    switchLoading = false
    if (retryCount > 3) {
      console.error(error)
      window.location.href = href.toString()
    } else {
      switchPart(href, $dom, push)
    }
  }
}

function resetVideoHeight() {
  const $root = $('#ageframediv')
  /** @type {HTMLVideoElement} */
  const video = player.$video[0]
  const ratio = video.videoWidth / video.videoHeight
  const width = $root.width()!
  $root.height(width / ratio)
}

function updateTime(time = 0) {
  const id = location.pathname.match(/\/play\/(\d*)/)?.[1]
  if (!id) return

  his.setTime(id, Math.floor(time))
}

function videoJumpHistoryPosition() {
  const id = location.pathname.match(/\/play\/(\d*)/)?.[1]
  if (!id) return

  if (his.get(id)?.time! > 3) {
    player.currentTime = his.get(id)!.time
    player.message.info(
      `已自动跳转至历史播放位置 ${parseTime(his.get(id)!.time)}`
    )
  }
}

function addListener() {
  player.on('next', () => {
    gotoNextPart()
  })

  player.on('prev', () => {
    gotoPrevPart()
  })

  player.plyr.once('canplay', () => {
    if (player.localConfig.continuePlay) {
      videoJumpHistoryPosition()
    }
    resetVideoHeight()
  })

  player.on('error', () => {
    removeLocal(getActivedom().data('href'))
  })

  player.on('timeupdate', () => {
    if (Math.floor(player.currentTime) % 3 === 0) {
      updateTime(player.currentTime)
    }
  })

  player.on('skiperror', (_, duration) => {
    if (duration === 0) {
      updateTime(0)
    } else {
      updateTime(player.currentTime + duration)
    }
    window.location.reload()
  })

  window.addEventListener('popstate', () => {
    const href = location.pathname + location.search
    const $dom = $(`[data-href='${href}']`)

    if ($dom.length) {
      switchPart(href, $dom, false)
    } else {
      window.location.reload()
    }
  })
}

function replaceHref() {
  $('.movurl:visible li a').each(function () {
    const href = $(this).attr('href')!
    $(this)
      .removeAttr('href')
      .attr('data-href', href)
      .css('cursor', 'pointer')
      .on('click', (e) => {
        e.preventDefault()
        switchPart(href, $(this))
      })
  })
}

let player: KPlayer
function initPlayer(vurl: string) {
  player = new KPlayer('#age_playfram')
  showCurrentLink(vurl)
  addListener()
  player.src = vurl

  saveLocal(getActivedom().data('href'), vurl)
  showLocalURL()
}

function useOriginPlayer() {
  const message = new Message('#ageframediv')
  message.info('脚本功能已暂时禁用，使用原生播放器观看，右下角可启动脚本', 3000)

  const $dom = $(`<span>启用脚本</span>`)
    .css({ color: '#60b8cc', cursor: 'pointer' })
    .on('click', () => {
      session.removeItem('stop-use')
      window.location.reload()
    })
  $('#wangpan-div .blocktitle')
    .css({ display: 'flex', justifyContent: 'space-between' })
    .append($dom)
}

async function showRelatesSeries() {
  const info = await fetch(location.pathname.replace('play', 'detail')).then(
    (r) => r.text()
  )

  const $series = $(info).find('li.relates_series')
  $series.find('a').each((_, anchor) => pagePreview(anchor, anchor.href))

  $(`
  <div class="spaceblock1"></div>
  <div id="relates-series" class="baseblock">
    <div class="blocktitle">相关动画：</div>
    <div class="line"></div>
    <div class="blockcontent">
      <ul></ul>
    </div>
  </div>
`)
    .insertAfter($('.baseblock:contains(简介：)'))
    .find('ul')
    .append($series)
}

export function playModule() {
  $('#cpraid').remove()

  if (session.getItem('stop-use')) {
    useOriginPlayer()
    return
  }

  his.logHistory()
  $('.fullscn').remove()
  replaceHref()
  replacePlayer()
  initGetAllVideoURL()
  showRelatesSeries()

  $<HTMLAnchorElement>('.ul_li_a8 > .anime_icon1 > a:nth-child(1)').each(
    (_, anchor) => pagePreview(anchor.parentElement!, anchor.href)
  )
}
