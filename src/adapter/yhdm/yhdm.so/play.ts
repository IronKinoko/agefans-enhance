import { KPlayer } from '../../../player'

function replacePlayer() {
  new KPlayer('#dplayer', {
    video: $('video')[0] as HTMLVideoElement,
    eventToParentWindow: true,
  })
}

function switchPart(next: boolean) {
  let directionRight = true
  const re = /\/v\/\d+-(\d+)/
  let prevID: string
  Array.from($<HTMLAnchorElement>('.movurls a')).forEach((a) => {
    if (re.test(a.href)) {
      const [, id] = a.href.match(re)!
      if (prevID) directionRight = +prevID < +id
      prevID = id
    }
  })

  let direction = ['prev', 'next']
  if (!next) direction.reverse()
  if (!directionRight) direction.reverse()

  $('.movurls .sel')[direction[1] as 'prev' | 'next']().find('a')[0]?.click()
}

export function playModule() {
  $('body').addClass('yhdm-wrapper')

  window.addEventListener('message', (e) => {
    if (!e.data?.key) return
    const key = e.data.key
    const video = e.data.video

    if (key === 'prev') switchPart(false)
    if (key === 'next') switchPart(true)
    if (key === 'enterwidescreen') {
      $('body').css('overflow', 'hidden')
      $('#playbox iframe').css({
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
      })
    }
    if (key === 'exitwidescreen') {
      $('body').css('overflow', '')
      $('#playbox iframe').removeAttr('style')
    }

    if (key === 'getSearchName') {
      const iframe = $<HTMLIFrameElement>('#playbox iframe')[0]

      iframe.contentWindow?.postMessage(
        { key: 'getSearchName', name: $('.gohome.l > h1 > a').text() },
        '*'
      )
    }
    if (key === 'openLink') {
      window.open(e.data.url)
    }

    if (key === 'canplay') {
      const $iframe = $<HTMLIFrameElement>('#playbox iframe')

      const height = ($iframe.width()! / video.width) * video.height
      $iframe.height(height)
    }
  })

  window.addEventListener('keydown', (e) => {
    if (document.activeElement !== document.body) return
    $('#playbox iframe')[0].focus()
    if (e.key === ' ') e.preventDefault()
  })
}

export function playInIframeModule() {
  if (location.search.includes('vid')) {
    replacePlayer()
  }
}
