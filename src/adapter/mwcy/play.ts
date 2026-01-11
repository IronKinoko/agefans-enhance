import { KPlayer } from '../../player'
import { queryDom } from '../../utils/queryDom'
import { defineIframePlayer } from '../common/defineIframePlayer'

function getActive() {
  return $<HTMLAnchorElement>('.anthology-list-play li.on > a')
}

function switchPart(next: boolean) {
  return getActive().parent()[next ? 'next' : 'prev']().find('a')[0]?.href
}

export function runInTop() {
  iframePlayer.runInTop()
}

export const iframePlayer = defineIframePlayer({
  iframeSelector: '#playleft iframe',
  getActive,
  setActive: (href) => {
    $<HTMLAnchorElement>('.anthology-list-play li a').each((_, el) => {
      if (el.href === href) {
        el.parentElement!.classList.add('on')
      } else {
        el.parentElement!.classList.remove('on')
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

export async function parser() {
  const video = await queryDom<HTMLVideoElement>('video')

  // Wait for valid src (skip empty or current page url if that happens)
  await new Promise<void>((resolve) => {
    const check = () => {
      if (video.src && video.src !== location.href) {
        resolve()
      } else {
        setTimeout(check, 100)
      }
    }
    check()
  })

  let url = video.src
  if (url.startsWith('blob:')) {
    const w = window as any
    // Common global variables for video/player
    url = w.video_url || w.config?.url || w.v_url || w.url || url
  }

  // Use interval to ensure original video stays suppressed (like xfani)
  const cleanly = () => {
    video.pause()
    video.volume = 0
  }
  setInterval(cleanly, 16)

  // Hide original player instead of removing to avoid script errors
  $('#player, #playbox, .art-video-player').hide()

  // Append our player container
  $('body').append('<div id="k-player-container"></div>')

  const player = new KPlayer('#k-player-container', {
    eventToParentWindow: true,
  })
  player.src = url
}
