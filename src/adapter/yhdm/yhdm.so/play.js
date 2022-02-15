import $ from 'jquery'
import { KPlayer } from '../../../player'

/** @type {KPlayer} */
let player
function replacePlayer() {
  const url = new URL(location.href).searchParams.get('vid').split('$')[0]
  player = new KPlayer('#dplayer')
  player.src = url
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
  player.on('prev', () =>
    window.parent.postMessage('prev', { targetOrigin: '*' })
  )
  player.on('next', () =>
    window.parent.postMessage('next', { targetOrigin: '*' })
  )
}
export function playModule() {
  $('body').addClass('yhdm-wrapper')

  if (location.pathname.includes('/v')) {
    window.addEventListener('message', (e) => {
      if (e.data === 'prev') switchPart(false)
      if (e.data === 'next') switchPart(true)
    })
  }
  if (location.search.includes('vid')) {
    replacePlayer()
    initEvent()
  }
}
