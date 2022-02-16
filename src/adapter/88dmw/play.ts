import $ from 'jquery'
import { KPlayer } from '../../player'
import parseToURL from '../../utils/parseToURL'

let player: KPlayer

function replacePlayer() {
  const dom = document.querySelector<HTMLIFrameElement>(
    '#playleft iframe[allowfullscreen="true"]'
  )!
  const fn = () => {
    if (!dom.src) return
    let url = new URL(dom.src)
    let videoURL = url.searchParams.get('url')
    if (videoURL) {
      player = new KPlayer('#beyond-play-box')
      player.src = parseToURL(videoURL)
      initEvent()
      mutationOb.disconnect()
    }
  }

  const mutationOb = new MutationObserver(fn)
  mutationOb.observe(dom, { attributes: true })
  fn()
}

function initEvent() {
  player.on('prev', () => unsafeWindow.MacPlayer.GoPreUrl())
  player.on('next', () => unsafeWindow.MacPlayer.GoNextUrl())
}

export function playModule() {
  $('body').addClass('www88dmw-wrapper')
  $('.kp_flash_box .mb').remove()
  replacePlayer()
}
