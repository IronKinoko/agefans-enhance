import { KPlayer } from '../../player'
import { queryDom } from '../../utils/queryDom'
import { Info, logHis } from './history'

function replacePlayer() {
  new KPlayer('#player', {
    video: $('video')[0] as HTMLVideoElement,
    eventToParentWindow: true,
    logTimeId: parent.location.href,
  })
}

function switchPart(next: boolean) {
  $(
    `.player-info .play-qqun .${next ? 'next' : 'pre'}:not(.btns_disad)`
  )[0]?.click()
}

function getPlayInfo(): Info {
  const animeName = $('.v_path a.current').text()
  const episodeName = (() => {
    let name = ''
    let pre = $('.player-info .play-qqun .pre').attr('href')
    let next = $('.player-info .play-qqun .next').attr('href')
    if (pre) {
      name = $(`.player_list a[href='${pre}']`).parent().next().find('a').text()
    } else if (next) {
      name = $(`.player_list a[href='${next}']`)
        .parent()
        .prev()
        .find('a')
        .text()
    } else {
      name = $(`.player_list a[href='${location.pathname}']`).text()
    }
    return name
  })()

  const url = location.pathname
  const id = location.pathname.match(/\/(?<id>\d+)\/play/)!.groups!.id

  return { id, url, animeName, episodeName }
}

export async function playModule() {
  $('#bkcl').remove()

  const info = getPlayInfo()

  const iframe = await queryDom<HTMLIFrameElement>(
    `#playleft iframe[src*='url=']`
  )

  window.addEventListener('message', (e) => {
    if (!Reflect.has(e.data, 'key')) return

    const key = e.data.key
    const video = e.data.video

    if (key === 'initDone') {
      iframe.contentWindow?.postMessage({ key: 'initDone' }, '*')
    }
    if (key === 'prev') switchPart(false)
    if (key === 'next') switchPart(true)
    if (key === 'enterwidescreen') {
      $('body').css('overflow', 'hidden')
      $(iframe).css({
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
        zIndex: 99999,
      })
    }
    if (key === 'exitwidescreen') {
      $('body').css('overflow', '')
      $(iframe).removeAttr('style')
    }

    if (key === 'getSearchName') {
      iframe.contentWindow?.postMessage(
        { key: 'getSearchName', name: info.animeName },
        '*'
      )
    }
    if (key === 'getEpisode') {
      iframe.contentWindow?.postMessage(
        { key: 'getEpisode', name: info.episodeName },
        '*'
      )
    }

    if (key === 'openLink') {
      window.open(e.data.url)
    }

    if (key === 'canplay') {
      const height = ($('#video').width()! / video.width) * video.height
      $('#video').height(height)
    }

    if (key === 'timeupdate') {
      logHis(info, video.currentTime)
    }
  })
  iframe.contentWindow?.postMessage({ key: 'initDone' }, '*')

  iframe.focus()
  window.addEventListener('keydown', (e) => {
    if (document.activeElement !== document.body) return
    iframe.focus()
    if (e.key === ' ') e.preventDefault()
  })
}

export function playInIframeModule() {
  const fn = (e: MessageEvent) => {
    if (!Reflect.has(e.data, 'key')) return
    if (e.data.key === 'initDone') {
      replacePlayer()
      window.removeEventListener('message', fn)
    }
  }

  window.addEventListener('message', fn)
  parent.postMessage({ key: 'initDone' }, '*')
}
