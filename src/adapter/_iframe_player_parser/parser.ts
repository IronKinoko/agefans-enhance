import { KPlayer } from '../../player'
import { queryDom } from '../../utils/queryDom'

let player: KPlayer

export const parser = {
  'danmu.yhdmjx.com': async () => {
    const video = await queryDom<HTMLVideoElement>('video')

    player = new KPlayer('#player', { video, eventToParentWindow: true })
  },
  'pro.ascepan.top': async () => {
    const video = await queryDom<HTMLVideoElement>('video')
    video.src = ''

    player = new KPlayer('#player', { eventToParentWindow: true })
    player.src = unsafeWindow.config.url
  },
}
