import $ from 'jquery'
import { KPlayer } from '../../../player'
import parseToURL from '../../../utils/parseToURL'

/** @type {KPlayer} */
let player

function replacePlayer() {
  const dom = document.getElementById('play2')
  const fn = () => {
    if (!dom.src) return
    let url = new URL(dom.src)
    let videoURL = url.searchParams.get('vid')
    if (videoURL) {
      player = new KPlayer('#play2')
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
  return $(`.movurls:visible li a[href='${location.pathname}']`)
}

function initEvent() {
  player.on('prev', () => switchPart(false))
  player.on('next', () => switchPart(true))
}
export function playModule() {
  $('body').addClass('yhdm-wrapper')
  $('#adl').remove()
  $('#adr').remove()
  $('#adv').remove()
  $('.fullscn').remove()
  replacePlayer()
}
