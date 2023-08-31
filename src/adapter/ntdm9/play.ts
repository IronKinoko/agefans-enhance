function switchPart(next: boolean) {
  $('.active-play').parent()[next ? 'next' : 'prev']().find('a')[0]?.click()
}

const iframeSelector = '#playleft iframe'
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
      })
    }
    if (key === 'exitwidescreen') {
      $('body').css('overflow', '')
      $(iframeSelector).removeAttr('style')
    }

    if (key === 'canplay') {
      const width = $('#ageframediv').width()
      if (width) $('#ageframediv').height((video.height / video.width) * width)
    }

    // 这里的事件由 danmu.yhdmjx.com 触发
    if (key === 'getSearchName') {
      const iframe = $<HTMLIFrameElement>(iframeSelector)[0]

      iframe.contentWindow?.postMessage(
        { key: 'getSearchName', name: $('#detailname').text() },
        '*'
      )
    }
    if (key === 'getEpisode') {
      const iframe = $<HTMLIFrameElement>(iframeSelector)[0]

      iframe.contentWindow?.postMessage(
        { key: 'getEpisode', name: $('.movurl .active-play').text() },
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
