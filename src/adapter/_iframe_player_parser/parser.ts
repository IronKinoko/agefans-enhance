import { KPlayer } from '../../player'
import { queryDom } from '../../utils/queryDom'

let player: KPlayer

export const parser = {
  'danmu.yhdmjx.com': async () => {
    const video = await queryDom<HTMLVideoElement>('video')
    video.src = ''

    player = new KPlayer('#player', { eventToParentWindow: true })

    player.src = unsafeWindow.v_decrypt(
      unsafeWindow.config.url,
      unsafeWindow._token_key,
      unsafeWindow.key_token
    )
  },
  'pro.ascepan.top': async () => {
    const video = await queryDom<HTMLVideoElement>('video')
    video.src = ''

    player = new KPlayer('#player', { eventToParentWindow: true })
    player.src = unsafeWindow.config.url
  },
}
