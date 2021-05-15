import { KPlayer } from '../player'

/** @type {KPlayer} */
let player
function replacePlayer() {
  const vurl = $('.bofang > div ').data('vid')

  player = new KPlayer('.bofang iframe')

  player.src = vurl.split('$')[0]
  player.plyr.once('error', () => {
    player.src = vurl
  })
}

export function playmodule() {
  replacePlayer()
}
