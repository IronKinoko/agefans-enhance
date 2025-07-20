import { defineIframePlayer } from '../common/defineIframePlayer'
import { renderFavoriteBtn, updateCurrentPageFavorite } from './favorite'
function getActive() {
  return $('.active-play')
}
function switchPart(next: boolean) {
  return $('.active-play').parent()[next ? 'next' : 'prev']().find('a').get(0)
    ?.href
}

export function runInTop() {
  parseURLJumpParams()

  iframePlayer.runInTop()
  renderFavoriteBtn()
}

function parseURLJumpParams() {
  const url = new URL(window.location.href)
  const jumpToLast = url.searchParams.get('jumpToLast')
  if (jumpToLast) {
    window.location.replace($('.movurl:visible a').last().attr('href')!)
  }
}

export const iframePlayer = defineIframePlayer({
  iframeSelector: '#playleft iframe',
  getActive: () => $('.active-play'),
  setActive: (href) => {
    $<HTMLAnchorElement>('.movurl a').each((_, el) => {
      if (el.href === href) {
        el.classList.add('active-play')
      } else {
        el.classList.remove('active-play')
      }
    })
  },
  search: {
    getSearchName: () => $('#detailname a:nth-child(1)').text(),
    getEpisode: () => getActive().text(),
  },
  getEpisodeList: () => $('.movurl a'),
  getSwitchEpisodeURL: (next) => switchPart(next),
  history: {
    creator: (renderHistory) => {
      const $btn = $(`<a class="nav_button" href="javascript:void(0)">历史</a>`)
      $btn.on('click', renderHistory)
      $btn.insertBefore('#top_search_from')
    },
    getId: () => location.pathname.match(/\/(\d+)-/)![1],
  },
  onPlayerMessage: (key, data) => {
    if (key === 'canplay') {
      const video = data.video
      const width = $('#ageframediv').width()
      if (width) $('#ageframediv').height((video.height / video.width) * width)

      updateCurrentPageFavorite()
    }
  },
})
