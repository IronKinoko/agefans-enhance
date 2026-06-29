import { KPlayer } from '../../player'
import { wait } from '../../utils/wait'

export function main() {
  replacePlayer()
}

async function replacePlayer() {
  await wait(() => !!$('.dplayer-video-wrap video').attr('src'))
  const url = $('.dplayer-video-wrap video').attr('src')!

  const player = new KPlayer('#v_link_p')
  player.src = url

  player.on('prev', () => $('#prevLink').trigger('click'))
  player.on('next', () => $('#nextLink').trigger('click'))
}
