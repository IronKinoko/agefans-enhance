import $ from 'jquery'
import { KPlayer } from '../../player'
import { queryDom } from '../../utils/queryDom'

let player: KPlayer

function injectEvent() {
  player.on('prev', () => {
    $('.meida-content-main-window-right-series-list-volume-active')
      .parent()
      .prev()
      .find('a')[0]
      ?.click()
  })
  player.on('next', () => {
    $('.meida-content-main-window-right-series-list-volume-active')
      .parent()
      .next()
      .find('a')[0]
      ?.click()
  })
}

function replacePlayer(video: HTMLVideoElement) {
  const fn = () => {
    if (!video.src || video.src === location.href) return
    $(video).appendTo('body')
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
