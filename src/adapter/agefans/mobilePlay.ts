import { wait } from '../../utils/wait'
import { defineIframePlayer } from '../common/defineIframePlayer'

function getActive() {
  return $('.van-grid-item.van-grid-item--active')
}
function switchPart(next: boolean) {
  const $active = getActive()

  let $nextActive = $active[next ? 'next' : 'prev']()

  $nextActive[0]?.click()

  return null
}

const iframePlayer = defineIframePlayer({
  iframeSelector: '#playerIFrame iframe',
  getActive,
  setActive: (href) => {},
  search: {
    getSearchName: () => $('.detail-box h2').text(),
    getEpisode: () => getActive().text(),
  },
  getEpisodeList: () => $('.video-source-box .van-grid-item'),
  switchEpisode: (next) => switchPart(next),
})

export async function mobilePlayModule() {
  await wait(() => getActive().length > 0)

  iframePlayer.runInTop()
}
export function playModuleInIframe() {
  iframePlayer.runInIframe()
}
