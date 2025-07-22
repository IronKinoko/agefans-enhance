import { runtime } from '../../runtime'
import { iframePlayer, runInTop, parser } from './play'
import './index.scss'

runtime.register({
  domains: ['.cycanime.', '.cyc-anime.', '.cycani.', '.ciyuancheng.'],
  opts: [
    { test: '/watch', run: runInTop },
    { test: '/watch', run: iframePlayer.runInIframe, runInIframe: true },
    {
      test: () => location.hostname.includes('player.cycanime'),
      run: parser,
      runInIframe: true,
    },
  ],
  search: {
    name: '次元城',
    search: (cn) => `https://www.cycani.org/search.html?wd=${cn}`,
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
    getAnimeScope: () =>
      window.location.href.match(/\/watch\/(\d+)\//)?.[1] || '',
  },
})
