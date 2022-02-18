import { runtime } from '../../../runtime/index'
import { playInIframeModule, playModule } from './play'

import { queryDom } from '../../../utils/queryDom'

runtime.register({
  domains: ['yhdm.so', 'yinghuacd.com'],
  opts: [
    { test: ['/v'], run: playModule },
    { test: ['vid'], runInIframe: true, run: playInIframeModule },
  ],
  search: {
    name: '樱花动漫1',
    search: (name) => `http://www.yinghuacd.com/search/${name}/`,
    getSearchName: async () => {
      return new Promise((resolve) => {
        window.addEventListener('message', (e) => {
          if (e.data.key === 'getSearchName') {
            resolve(e.data.name)
          }
        })
        parent.postMessage({ key: 'getSearchName' }, '*')
      })
    },
  },
})
