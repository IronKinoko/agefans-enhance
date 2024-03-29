import { defineIframePlayer } from '../common/defineIframePlayer'

function getActive() {
  return $('.active-play')
}
function switchPart(next: boolean) {
  return $('.active-play').parent()[next ? 'next' : 'prev']().find('a')[0].href
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
    getSearchName: () => $('#detailname').text(),
    getEpisode: () => getActive().text(),
  },
  getEpisodeList: () => $('.movurl a'),
  switchEpisode: (next) => switchPart(next),
  onIframeMessage: (key, data) => {
    if (key === 'canplay') {
      const video = data.video
      const width = $('#ageframediv').width()
      if (width) $('#ageframediv').height((video.height / video.width) * width)
    }
  },
})
