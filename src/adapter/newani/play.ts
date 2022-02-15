import $ from 'jquery'
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
    player = new KPlayer('.player.meida-content-main-window-left', { video })
    injectEvent()
  }
  const ob = new MutationObserver(fn)
  ob.observe(video, { attributes: true, attributeFilter: ['src'] })
  fn()
}
export async function playModule() {
  const video = await queryDom<HTMLVideoElement>('video')
  replacePlayer(video)
}
