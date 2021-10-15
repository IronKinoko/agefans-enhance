import $ from 'jquery'
import { KPlayer } from '../../player'
import parseToURL from '../../utils/parseToURL'

/** @type {KPlayer} */
let player

function replacePlayer() {
  const dom = document.getElementById('yh_playfram')
  const fn = () => {
    if (!dom.src) return
    let url = new URL(dom.src)
    let videoURL = url.searchParams.get('url')
    if (videoURL) {
      player = new KPlayer('#yh_playfram')
      player.src = parseToURL(videoURL)
      initEvent()
      mutationOb.disconnect()
    }
  }

  const mutationOb = new MutationObserver(fn)
  mutationOb.observe(dom, { attributes: true })
  fn()
}

function switchPart(next) {
  getActivedom().parent()[next ? 'next' : 'prev']().find('a')[0]?.click()
}
function getActivedom() {
  return $(".movurl:visible li a[style*='color: rgb(255, 255, 255)']")
}

function initEvent() {
  player.on('prev', () => switchPart(false))
  player.on('next', () => switchPart(true))
}

export function playModule() {
  $('body').addClass('yhdm-wrapper')
  $('#ipchk_getplay').remove()
  $('.fullscn').remove()
  replacePlayer()
}
