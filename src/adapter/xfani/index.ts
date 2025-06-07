import { runtime } from '../../runtime'
import { iframePlayer, runInTop, parser } from './play'
import './index.scss'

runtime.register({
  domains: ['.xifanacg.', 'player.moedot'],
  opts: [
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
    search: (name) => `https://dm.xifanacg.com/search.html?wd=${name}`,
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
  },
})
