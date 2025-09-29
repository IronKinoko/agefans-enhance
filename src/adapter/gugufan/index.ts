import { runtime } from '../../runtime'
import { iframePlayer, runInTop, parser, parser2 } from './play'
import './index.scss'

runtime.register({
  domains: ['.gugu3.'],
  opts: [
    { test: /^\/index.php\/vod\/play/, run: runInTop },
    {
      test: /^\/index.php\/vod\/play/,
      run: iframePlayer.runInIframe,
      runInIframe: true,
    },
    { test: '/addons/dp/player', run: parser, runInIframe: true },
    { test: '?url=', run: parser2, runInIframe: true },
  ],
  search: {
    name: '咕咕番',
    search: (cn) => `https://www.gugu3.com/index.php/vod/search.html?wd=${cn}`,
    getSearchName: () => {
      return new Promise((resolve) => {
        const fn = (e: MessageEvent<any>) => {
          if (e.data.key === 'getSearchName') {
            resolve(e.data.name)
            window.removeEventListener('message', fn)
          }
        }
        window.addEventListener('message', fn)
        parent.postMessage({ key: 'getSearchName' }, '*')
      })
    },
    getEpisode: () => {
      return new Promise((resolve) => {
        const fn = (e: MessageEvent<any>) => {
          if (e.data.key === 'getEpisode') {
            resolve(e.data.name)
            window.removeEventListener('message', fn)
          }
        }
        window.addEventListener('message', fn)
        parent.postMessage({ key: 'getEpisode' }, '*')
      })
    },
    getAnimeScope: () => window.location.href.match(/\/id\/(\d+)\//)?.[1] || '',
  },
})
