import { KPlayer } from '../../player'
import { queryDom } from '../../utils/queryDom'

let player: KPlayer

function switchPart(next: boolean) {
  player.on('prev', () => {
    $('.meida-content-main-window-right-series-list-volume-active')
      [next ? 'next' : 'prev']()
      .prev()
      .find('a')[0]
      ?.click()
  })
}
function injectEvent() {
  player.on('prev', () => switchPart(false))
  player.on('next', () => switchPart(true))
}

function replacePlayer(video: HTMLVideoElement) {
  const fn = () => {
    if (!video.src || video.src === location.href) return
    console.log(video)

    player = new KPlayer(document.querySelector('.bangumi-player-box')!, {
      video,
    })
    injectEvent()
  }
  const ob = new MutationObserver(fn)
  ob.observe(video, { attributes: true, attributeFilter: ['src'] })
  fn()
}

function resizeWrapper() {
  const wrapper = $('.bangumi-player.watch-content-player')
  const w = wrapper.width()!
  wrapper.height((w / 16) * 9)
}
export async function playModule() {
  const video = await queryDom<HTMLVideoElement>('video:not([src=""])')
  resizeWrapper()
  window.addEventListener('resize', resizeWrapper)
  replacePlayer(video)
}
