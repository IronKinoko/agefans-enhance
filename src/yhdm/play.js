import $ from 'jquery'
import { KPlayer } from '../player'

/** @type {KPlayer} */
let player
function replacePlayer() {
  const vurl = $('#playbox').data('vid')
  player = new KPlayer('.bofang iframe')
  player.src = vurl.split('$')[0]
}

function gotoNextPart() {
  let directionRight = true
  const re = /\/v\/\d+-(\d+)/
  let prevID
  Array.from($('.movurls a')).forEach((a) => {
    if (re.test(a.href)) {
      const [, id] = a.href.match(re)
      if (prevID) directionRight = +prevID < +id
      prevID = id
    }
  })

  if (directionRight) {
    $('.movurls .sel').next().find('a')[0].click()
  } else {
    $('.movurls .sel').prev().find('a')[0].click()
  }
}

function initEvent() {
  player.on('next', gotoNextPart)
}
export function playModule() {
  replacePlayer()
  initEvent()
}
