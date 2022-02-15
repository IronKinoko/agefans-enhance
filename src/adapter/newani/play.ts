import $ from 'jquery'
import { KPlayer } from '../../player'

let player: KPlayer
function queryVideoDom() {
  return new Promise<JQuery<HTMLVideoElement>>((resolve) => {
    let $video: JQuery<HTMLVideoElement>
    function search() {
      $video = $('video')
      if ($video.length === 0) {
        requestAnimationFrame(search)
      } else {
        resolve($video)
      }
    }
    search()
  })
}

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
  const $video = await queryVideoDom()
  replacePlayer($video[0])
}
