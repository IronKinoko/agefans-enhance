import { KPlayer } from '../../player'
import { execInUnsafeWindow } from '../../utils/execInUnsafeWindow'
import { queryDom } from '../../utils/queryDom'

let player: KPlayer

export const parser = {
  'danmu.yhdmjx.com': async () => {
    const video = await queryDom<HTMLVideoElement>('video')
    video.src = ''

    player = new KPlayer('#player', { eventToParentWindow: true })

    player.src = await execInUnsafeWindow(() =>
      window.v_decrypt(window.config.url, window._token_key, window.key_token)
    )
  },
  'pro.ascepan.top': async () => {
    const video = await queryDom<HTMLVideoElement>('video')
    video.src = ''

    player = new KPlayer('#player', { eventToParentWindow: true })
    player.src = await execInUnsafeWindow(() => window.config.url)
  },
}
