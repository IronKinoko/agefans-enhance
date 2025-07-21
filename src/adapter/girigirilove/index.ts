import { runtime } from '../../runtime'
import { iframePlayer, runInTop, parser } from './play'
import './index.scss'

runtime.register({
  domains: ['.girigirilove.'],
  opts: [
    { test: '/playGV', run: runInTop },
    { test: '/playGV', run: iframePlayer.runInIframe, runInIframe: true },
    { test: '/addons/aplyer', run: parser, runInIframe: true },
  ],
  search: {
    name: '咕咕番',
    search: (name) =>
      `https://anime.girigirilove.com/search/-------------/?wd=${name}`,
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
      window.location.href.match(/\/playGV(\d+)-/)?.[1] || '',
  },
})
