import { KPlayer } from '../../player'
import { wait } from '../../utils/wait'

export function main() {
  replacePlayer()
}

async function replacePlayer() {
  await wait(() => !!$('.dplayer-video-wrap video').attr('src'))

  const video = $('.dplayer-video-wrap video')[0] as HTMLVideoElement
  const url = video.src

  // 防止原生播放器继续播放，导致声音叠加
  video.pause()
  video.muted = true
  video.src = ''
  video.remove()

  const player = new KPlayer('#v_link_p')
  player.src = url

  player.on('prev', () => $('#prevLink').trigger('click'))
  player.on('next', () => $('#nextLink').trigger('click'))
}
