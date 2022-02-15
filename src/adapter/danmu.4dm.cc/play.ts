import { KPlayer } from '../../player'
import { queryDom } from '../../utils/queryDom'

let player: KPlayer

export async function playModule() {
  const video = await queryDom<HTMLVideoElement>('video')

  player = new KPlayer('#player', { video, eventToParentWindow: true })
}
