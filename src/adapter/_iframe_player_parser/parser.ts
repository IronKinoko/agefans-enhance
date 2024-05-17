import { KPlayer } from '../../player'
import { execInUnsafeWindow } from '../../utils/execInUnsafeWindow'
import { queryDom } from '../../utils/queryDom'
import { sleep } from '../../utils/sleep'
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
  /**
   * agefans-01
   * @include 43.240.74.134:8443/vip/?url=
   */
  'agefans-01': async () => {
    let url: string = ''
    while (!url) {
      url = await execInUnsafeWindow(() => window.stray?.url)
      await sleep(100)
    }
    $('#artplayer').remove()
    $('body').append('<div id="k-player-container"/>')
    player = new KPlayer('#k-player-container', { eventToParentWindow: true })
    player.src = url
  },
  /**
   * agefans-02
   * @include 43.240.74.134:8443/m3u8/?url=
   */
  'agefans-02': async () => {
    let url: string = ''
    while (!url) {
      url = await execInUnsafeWindow(() => window.art?.hls?.url || window.Vurl)
      await sleep(100)
    }

    await execInUnsafeWindow(() => window.art.destroy(false))

    $('#loading').remove()
    $('body').append('<div id="k-player-container"/>')
    player = new KPlayer('#k-player-container', { eventToParentWindow: true })
    player.src = url
  },
}
