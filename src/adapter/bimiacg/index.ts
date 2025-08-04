import './index.scss'
import { runtime } from '../../runtime/index'
import { parser, runInTop, iframePlayer } from './play'

runtime.register({
  domains: [/bimiacg\d+.net/],
  opts: [
    {
      test: '*',
      setup: () => $('body').addClass('bimi-wrapper'),
      run: iframePlayer.createHistory,
    },
    { test: /^\/bangumi\/\d+\/play\//, run: runInTop },
    {
      test: /^\/bangumi\/\d+\/play\//,
      run: iframePlayer.runInIframe,
      runInIframe: true,
    },
    { test: '/static/danmu', runInIframe: true, run: parser },
  ],
  search: {
    name: 'BIMI动漫',
    search: (cn) => `http://www.bimiacg10.net/vod/search/wd/${cn}/`,
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
    getAnimeScope: () => window.location.href.match(/\/(\d+)\/play/)?.[1] || '',
  },
})
