import { KPlayer } from '../../player'
import { queryDom } from '../../utils/queryDom'

async function replacePlayer() {
  const player = new KPlayer('#player', {
    eventToParentWindow: true,
    logTimeId: window.location.href,
  })

  // 有个配置文件被解密后重新加密了，现在重新解密一下就能获取到视频的m3u8地址
  player.src = unsafeWindow.v_decrypt(
    unsafeWindow.config.url,
    unsafeWindow._token_key,
    unsafeWindow.key_token
  )
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
    if (!Reflect.has(e.data, 'key')) return

    const key = e.data.key

    if (key === 'initDone') {
      iframe.contentWindow?.postMessage({ key: 'initDone' }, '*')
    }
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
  iframe.contentWindow?.postMessage({ key: 'initDone' }, '*')

  iframe.focus()
  window.addEventListener('keydown', (e) => {
    if (document.activeElement !== document.body) return
    iframe.focus()
    if (e.key === ' ') e.preventDefault()
  })
  $('#buffer').hide()
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
