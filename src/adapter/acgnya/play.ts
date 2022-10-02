import { KPlayer } from '../../player'
import { queryDom } from '../../utils/queryDom'

async function replacePlayer() {
  const dom = await queryDom<HTMLVideoElement>('video')
  dom.src = ''

  const player = new KPlayer('#player', {
    eventToParentWindow: true,
    logTimeId: window.location.href,
  })

  player.src = unsafeWindow.config.url
}

function switchPart(next: boolean) {
  if (next) {
    if (unsafeWindow.MacPlayer.PlayLinkNext)
      window.location.href = unsafeWindow.MacPlayer.PlayLinkNext
  } else {
    if (unsafeWindow.MacPlayer.PlayLinkPre)
      window.location.href = unsafeWindow.MacPlayer.PlayLinkPre
  }
}
export async function playModule() {
  const iframe = await queryDom<HTMLIFrameElement>(
    `#playleft iframe[src*='url=']`
  )

  window.addEventListener('message', (e) => {
    if (!e.data?.key) return

    const key = e.data.key

    if (key === 'prev') switchPart(false)
    if (key === 'next') switchPart(true)
    if (key === 'enterwidescreen') {
      $('body').css('overflow', 'hidden')
      $('body').addClass('widescreen')
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
      $('body').removeClass('widescreen')
      $(iframe).removeAttr('style')
    }

    if (key === 'getSearchName') {
      iframe.contentWindow?.postMessage(
        { key: 'getSearchName', name: $('.module-info-heading h1 a').text() },
        '*'
      )
    }
    if (key === 'getEpisode') {
      iframe.contentWindow?.postMessage(
        {
          key: 'getEpisode',
          name: $('.module-play-list-link.active > span').text(),
        },
        '*'
      )
    }

    if (key === 'openLink') {
      window.open(e.data.url)
    }
  })

  iframe.focus()
  window.addEventListener('keydown', (e) => {
    if (document.activeElement !== document.body) return
    iframe.focus()
    if (e.key === ' ') e.preventDefault()
  })
  $('#buffer').hide()
}
