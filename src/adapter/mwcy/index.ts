import { runtime } from '../../runtime'
import { iframePlayer, runInTop, parser } from './play'
import './index.scss'

runtime.register({
  domains: ['mwcy.net', 'play.catw.moe'],
  opts: [
    { test: '/play/', run: runInTop },
    { test: '/play/', run: iframePlayer.runInIframe, runInIframe: true },
    {
      test: () => location.hostname.includes('play.catw.moe'),
      run: parser,
      runInIframe: true,
    },
  ],
  search: {
    name: '喵物次元',
    search: (cn) => `https://www.mwcy.net/search/-------------.html?wd=${cn}`,
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
      window.location.href.match(/\/play\/([^\/]+)\.html/)?.[1] || '',
  },
})
