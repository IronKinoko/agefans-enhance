import $ from 'jquery'
import { KPlayer } from '../../player'

function replacePlayer() {
  let player = new KPlayer('#beyond-play-box')
  player.src = unsafeWindow.MacPlayer.PlayUrl

  player.on('prev', () => unsafeWindow.MacPlayer.GoPreUrl())
  player.on('next', () => unsafeWindow.MacPlayer.GoNextUrl())
}

export function playModule() {
  $('body').addClass('www88dmw-wrapper')
  $('.kp_flash_box .mb').remove()
  replacePlayer()
}
