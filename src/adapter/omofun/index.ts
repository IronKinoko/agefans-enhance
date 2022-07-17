import { runtime } from '../../runtime/index'
import { playModule, playInIframeModule } from './play'
import './index.scss'

runtime.register({
  domains: ['omofun'],
  opts: [
    {
      test: ['/play/'],
      setup: () => {
        $('body').addClass('omofun-wrapper')
      },
      run: playModule,
    },
    {
      test: [/.*/],
      runInIframe: true,
      run: playInIframeModule,
    },
  ],
  search: {
    name: 'omofun',
    search: (name) => `https://omofun.tv/vod/search.html?wd=${name}`,
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
