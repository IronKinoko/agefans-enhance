import './index.scss'
import { runtime } from '../../runtime/index'
import { playModule, playInIframeModule } from './play'

import { queryDom } from '../../utils/queryDom'
import { histroyModule } from './history'

runtime.register({
  domains: ['bimiacg10.net'],
  opts: [
    {
      test: /.*/,
      setup: () => $('body').addClass('bimi-wrapper'),
      run: histroyModule,
    },
    { test: ['/play/'], run: playModule },
    { test: [/.*/], runInIframe: true, run: playInIframeModule },
  ],
  search: {
    name: 'BIMI动漫',
    search: (name) => `https://www.bimiacg10.net/vod/search/wd/${name}/`,
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
