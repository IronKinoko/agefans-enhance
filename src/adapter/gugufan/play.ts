import { KPlayer } from '../../player'
import { execInUnsafeWindow } from '../../utils/execInUnsafeWindow'
import { queryDom } from '../../utils/queryDom'
import { sleep } from '../../utils/sleep'
import { wait } from '../../utils/wait'
import { defineIframePlayer } from '../common/defineIframePlayer'
function getActive() {
  return $<HTMLAnchorElement>('.anthology-list-play li.on > a')
}
function switchPart(next: boolean) {
  return getActive().parent()[next ? 'next' : 'prev']().find('a')[0]?.href
}

export function runInTop() {
  $('body').addClass('gugufan')
  $('.player-news,#buffer,#install').remove()
  iframePlayer.runInTop()
}

export const iframePlayer = defineIframePlayer({
  iframeSelector: '#playleft iframe',
  getActive,
  setActive: (href) => {
    $<HTMLAnchorElement>('.anthology-list-play li a').each((_, el) => {
      if (el.href === href) {
        el.parentElement!.classList.add('ecnav-dt', 'on')
        $('.play-on').insertAfter($(el).find('span'))
      } else {
        el.parentElement!.classList.remove('ecnav-dt', 'on')
      }
    })
  },
  search: {
    getSearchName: () => $('.player-title-link').text(),
    getEpisode: () => getActive().text(),
  },
  getEpisodeList: () => $('.anthology-list-play li a'),
  getSwitchEpisodeURL: (next) => switchPart(next),
})

// /addons/dp/player
export async function parser() {
  const video = await queryDom<HTMLVideoElement>('video')

  await wait(() => !!video.currentSrc)
  video.src = ''

  $('#ADplayer').remove()
  $('#ADtip').remove()

  await execInUnsafeWindow(() => {
    // @ts-ignore
    EC.ad?.destroy()
    // @ts-ignore
    EC.dp?.destroy()
  })

  const player = new KPlayer('#player', {
    eventToParentWindow: true,
  })
  player.src = await execInUnsafeWindow(() => window.config.url)
}

// ?url=<videoId>
export async function parser2() {
  const video = await queryDom<HTMLVideoElement>('video')

  await wait(() => !!video.currentSrc)
  video.src = ''

  let url = ''
  while (!url) {
    url = await execInUnsafeWindow(() => window.MIZHI.player_url)
    await sleep(100)
  }

  const player = new KPlayer('#loading', {
    eventToParentWindow: true,
  })
  player.src = url

  $('.layui-layer').remove()
}
