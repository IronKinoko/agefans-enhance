function getActive() {
  return $('.video_detail_episode .video_detail_spisode_playing').parent()
}
function switchPart(next: boolean) {
  const $active = getActive()
  console.log('🚀 ~ file: play.ts:6 ~ switchPart ~ $active:', $active)
  $active[next ? 'next' : 'prev']().find('a')[0]?.click()
}

const iframeSelector = '.video_play_wrapper iframe'
export function playModule() {
  window.addEventListener('message', (e) => {
    if (!e.data?.key) return
    const { key, video } = e.data
    if (key === 'prev') switchPart(false)
    if (key === 'next') switchPart(true)
    if (key === 'enterwidescreen') {
      $('body').css('overflow', 'hidden')
      $(iframeSelector).css({
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
        zIndex: 9999,
      })
    }
    if (key === 'exitwidescreen') {
      $('body').css('overflow', '')
      $(iframeSelector).removeAttr('style')
    }

    // 这里的事件由 vip.sp-flv.com 触发
    if (key === 'getSearchName') {
      const iframe = $<HTMLIFrameElement>(iframeSelector)[0]

      iframe.contentWindow?.postMessage(
        {
          key: 'getSearchName',
          name: $('.video_detail_wrapper .cata_video_item .card-title').text(),
        },
        '*'
      )
    }
    if (key === 'getEpisode') {
      const iframe = $<HTMLIFrameElement>(iframeSelector)[0]

      iframe.contentWindow?.postMessage(
        { key: 'getEpisode', name: getActive().text() },
        '*'
      )
    }
    if (key === 'openLink') {
      window.open(e.data.url)
    }
  })

  window.addEventListener('keydown', (e) => {
    if (document.activeElement !== document.body) return
    $(iframeSelector)[0].focus()
    if (e.key === ' ') e.preventDefault()
  })

  $(iframeSelector).attr({ gesture: 'media', allow: 'autoplay; fullscreen' })
}
