import { queryDom } from '../../../utils/queryDom'

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
        { key: 'getSearchName', name: $('h3.title a.title').text() },
        '*'
      )
    }
    if (key === 'getEpisode') {
      iframe.contentWindow?.postMessage(
        {
          key: 'getEpisode',
          name: $('h3.title small').text(),
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
