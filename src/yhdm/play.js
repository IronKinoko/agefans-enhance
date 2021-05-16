import { KPlayer } from '../player'

/** @type {KPlayer} */
let player
function replacePlayer() {
  const vurl = $('#playbox').data('vid')

  player = new KPlayer('.bofang iframe')

  player.src = vurl.split('$')[0]
}

export function playmodule() {
  replacePlayer()
}
