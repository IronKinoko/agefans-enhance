import { KPlayer } from '../../player'
import { execInUnsafeWindow } from '../../utils/execInUnsafeWindow'
import { queryDom } from '../../utils/queryDom'
import { wait } from '../../utils/wait'
import { defineIframePlayer } from '../common/defineIframePlayer'
function getActive() {
  return $<HTMLAnchorElement>('.module-play-list .module-play-list-link.active')
}
function switchPart(next: boolean) {
  return getActive()[next ? 'next' : 'prev']().get(0)?.href
}

export function runInTop() {
  $('body').addClass('mutefun')
  iframePlayer.runInTop()
}

export const iframePlayer = defineIframePlayer({
  iframeSelector: '#playleft iframe',
  getActive,
  setActive: (href) => {
    $<HTMLAnchorElement>('.module-play-list-link').each((_, el) => {
      if (el.href === href) {
        el.classList.add('active')
        $('.playon').insertAfter($(el).find('span'))
      } else {
        el.classList.remove('active')
      }
    })
  },
  search: {
    getSearchName: () => $('.module-info-heading h1').text(),
    getEpisode: () => getActive().text(),
  },
  getEpisodeList: () => $('.module-play-list-link'),
  switchEpisode: (next) => switchPart(next),
})

export async function parser() {
  const video = await queryDom<HTMLVideoElement>('video')

  await wait(() => !!video.currentSrc)
  let url = video.currentSrc

  url = await execInUnsafeWindow(() => window.config.url)

  video.src = ''
  const player = new KPlayer('#player', {
    eventToParentWindow: true,
  })
  player.src = url

  $('#ADplayer,#ADtip').remove()
}
