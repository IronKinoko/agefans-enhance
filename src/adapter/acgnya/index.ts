import { runtime } from '../../runtime/index'
import { playModule } from './play'
import './index.scss'

runtime.register({
  domains: ['acgnya'],
  opts: [
    {
      test: ['/vodplay/'],
      setup: () => {
        $('body').addClass('acgnya-wrapper')
      },
      run: playModule,
    },
  ],
  search: {
    name: 'acgnya',
    search: (name) =>
      `https://www.acgnya.com/vodsearch/-------------/?wd=${name}`,
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
