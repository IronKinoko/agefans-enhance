import $ from 'jquery'
import { KPlayer } from '../../player'

/** @type {KPlayer} */
let player
function replacePlayer() {
  const vurl = $('#playbox').data('vid')
  player = new KPlayer('.bofang iframe')
  player.src = vurl.split('$')[0]
}

function switchPart(next) {
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

  let direction = ['prev', 'next']
  if (!next) direction.reverse()
  if (!directionRight) direction.reverse()

  $('.movurls .sel')[direction[1]]().find('a')[0]?.click()
}

function initEvent() {
  player.on('prev', () => switchPart(false))
  player.on('next', () => switchPart(true))
}
export function playModule() {
  $('body').addClass('yhdm-wrapper')
  replacePlayer()
  initEvent()
}
