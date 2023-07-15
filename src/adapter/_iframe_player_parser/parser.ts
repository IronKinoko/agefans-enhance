import { KPlayer } from '../../player'
import { execInUnsafeWindow } from '../../utils/execInUnsafeWindow'
import { queryDom } from '../../utils/queryDom'
import { wait } from '../../utils/wait'

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
  'sp-flv.com': async () => {
    const video = await queryDom<HTMLVideoElement>('video')

    await wait(() => !!video.currentSrc)
    let url = video.currentSrc

    if (url.startsWith('blob:')) {
      url = await execInUnsafeWindow(() => window.video_url)

      if (url) {
        video.src = ''
        player = new KPlayer('#mplayer-media-wrapper', {
          eventToParentWindow: true,
        })
        player.src = url
      }
    } else {
      video.src = ''
      player = new KPlayer('#mplayer-media-wrapper', {
        eventToParentWindow: true,
      })
      player.src = url
    }

    console.log("🚀 ~ file: parser.ts:29 ~ 'vip.sp-flv.com': ~ url:", url)
  },
}
