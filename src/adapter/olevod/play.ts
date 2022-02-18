import { KPlayer } from '../../player'

function switchPart(next: boolean) {
  $(`.play_but.bline a:contains(${next ? '下集' : '上集'})`)[0]?.click()
}

export function playModule() {
  const url = unsafeWindow.MacPlayer.PlayUrl
  const player = new KPlayer('.MacPlayer')
  player.src = url
  player.on('prev', () => switchPart(false))
  player.on('next', () => switchPart(true))

  function toggle(bool: boolean) {
    $('.hot_banner').toggle(bool)
    $('#play_page > div.foot.foot_nav.clearfix').toggle(bool)
  }
  if (player.isWideScreen) {
    toggle(false)
  }
  player.on('enterwidescreen', () => toggle(false))
  player.on('exitwidescreen', () => toggle(true))

  $('#play_page > div.hidden_xs.hidden_mi.pannel.clearfix').remove()
}
