import { runtime } from '../../runtime'
import { iframePlayer, runInTop, parser } from './play'
import { isNextXifan, runInNextTop, getAnimeName, getEpisodeName } from './next'
import './index.scss'
import './next.scss'

/**
 * 旧站是 iframe 播放器，通过 postMessage 从 iframe 里取信息；
 * 新站（next.xifanacg.com）是 SPA + 原生 video，直接在页面里读 DOM。
 */
function fromIframe(key: 'getSearchName' | 'getEpisode') {
  return () => {
    return new Promise<string>((resolve) => {
      const fn = (e: MessageEvent<any>) => {
        if (e.data.key === key) {
          resolve(e.data.name)
          window.removeEventListener('message', fn)
        }
      }
      window.addEventListener('message', fn)
      parent.postMessage({ key }, '*')
    })
  }
}

runtime.register({
  // next.xifanacg.com 同样命中 .xifanacg.，因此新旧站共用同一个 register
  domains: ['.xifanacg.', 'player.moedot'],
  opts: [
    // 新站是 SPA，首页进入播放页不会重新执行脚本，
    // 所以用一个覆盖全站的 opt，由内部的轮询接管路由与切集
    { test: () => isNextXifan(), run: runInNextTop },
    { test: '/watch', run: runInTop },
    { test: '/watch', run: iframePlayer.runInIframe, runInIframe: true },
    {
      test: () => location.hostname.includes('player.moedot'),
      run: parser,
      runInIframe: true,
    },
  ],
  search: {
    name: '稀饭动漫',
    search: (cn) => `https://next.xifanacg.com/search?q=${cn}`,
    getSearchName: () =>
      isNextXifan() ? getAnimeName() : fromIframe('getSearchName')(),
    getEpisode: () =>
      isNextXifan() ? getEpisodeName() : fromIframe('getEpisode')(),
    getAnimeScope: () =>
      isNextXifan()
        ? window.location.href.match(/\/anime\/(\d+)\//)?.[1] || ''
        : window.location.href.match(/\/watch\/(\d+)\//)?.[1] || '',
  },
})
