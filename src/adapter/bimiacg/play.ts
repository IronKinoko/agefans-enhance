import { KPlayer } from '../../player'
import { execInUnsafeWindow } from '../../utils/execInUnsafeWindow'
import { queryDom } from '../../utils/queryDom'
import { local } from '../../utils/storage'
import { wait } from '../../utils/wait'
import { defineIframePlayer } from '../common/defineIframePlayer'

function getActive() {
  return $<HTMLAnchorElement>('.episode-active')
}
function switchPart(next: boolean) {
  return getActive().parent()[next ? 'next' : 'prev']().find('a')[0]?.href
}

export function runInTop() {
  $('#bkcl').remove()

  if (local.getItem('bangumi-history')) {
    local.setItem('k-history', local.getItem('bangumi-history'))
    local.removeItem('bangumi-history')
  }

  $<HTMLAnchorElement>('.player_list a').each((_, el) => {
    if (el.href === location.href) {
      el.classList.add('episode-active')

      // 滚动到最高处
      const parent = el.offsetParent!
      parent.scrollTop = el.offsetTop
    }
  })

  $('.tb.player').get(0)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  iframePlayer.runInTop()
}

export const iframePlayer = defineIframePlayer({
  iframeSelector: '#playleft iframe',
  getActive,
  setActive: (href) => {
    $<HTMLAnchorElement>('.player_list a').each((_, el) => {
      if (el.href === href) {
        el.classList.add('episode-active')
      } else {
        el.classList.remove('episode-active')
      }
    })
  },
  search: {
    getSearchName: () => $('.v_path a.current').text(),
    getEpisode: () => getActive().text(),
  },
  getEpisodeList: () => $('.player_list a'),
  getSwitchEpisodeURL: (next) => switchPart(next),
  history: {
    creator: (renderHistory) => {
      const $btn = $('<li class="item"><a>历史</a></li>')
      $btn.on('click', renderHistory)

      $('.header-top__nav ul').append($btn)
    },
    getId: () => location.pathname.match(/\/(?<id>\d+)\/play/)!.groups!.id,
  },
  onPlayerMessage: (key, data) => {
    if (key === 'canplay') {
      const video = data.video
      const width = $('#video').width()
      if (width) $('#video').height((video.height / video.width) * width)
    }
  },
})

export async function parser() {
  const video = await queryDom<HTMLVideoElement>('video')
  video.src = ''

  const url = await execInUnsafeWindow(() => window.url)
  const player = new KPlayer('#player', { eventToParentWindow: true })
  if (url.includes('m3u8')) {
    player.setM3u8(url)
  } else {
    player.src = url
  }
}
