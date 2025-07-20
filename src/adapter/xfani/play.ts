import { KPlayer } from '../../player'
import { execInUnsafeWindow } from '../../utils/execInUnsafeWindow'
import { queryDom } from '../../utils/queryDom'
import { wait } from '../../utils/wait'
import { defineIframePlayer } from '../common/defineIframePlayer'
function getActive() {
  return $<HTMLAnchorElement>('.anthology-list-play li.on > a')
}
function switchPart(next: boolean) {
  return getActive().parent()[next ? 'next' : 'prev']().find('a')[0]?.href
}

export function runInTop() {
  $('body').addClass('xfani')
  $('.player-news').remove()
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

export async function parser() {
  const video = await queryDom<HTMLVideoElement>('video')

  await wait(() => !!video.currentSrc)
  let url = video.currentSrc
  video.src = ''

  const player = new KPlayer('#player', {
    eventToParentWindow: true,
  })
  player.src = url

  $('#loading').remove()

  await execInUnsafeWindow(() => {
    // @ts-ignore
    PlayEr.void.destroy()
  })
}
