import { KPlayer } from '../../player'
import { queryDom } from '../../utils/queryDom'

let player: KPlayer

export async function playModule() {
  const video = await queryDom<HTMLVideoElement>('video')

  video.src = ''

  player = new KPlayer('#player', { eventToParentWindow: true })
  player.src = unsafeWindow.config.url
}
