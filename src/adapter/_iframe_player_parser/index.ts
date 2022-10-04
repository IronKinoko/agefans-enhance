import { runtime } from '../../runtime'
import { parser } from './parser'

// 这是个解析器网站，里面只有一个播放器。将其替换成 KPlayer
runtime.register({
  domains: ['pro.ascepan.top', 'danmu.yhdmjx.com'],
  opts: [
    {
      test: () => window.location.href.includes('danmu.yhdmjx.com/m3u8.php'),
      runInIframe: true,
      run: parser['danmu.yhdmjx.com'],
    },
    {
      test: () => window.location.href.includes('pro.ascepan.top/player'),
      runInIframe: true,
      run: parser['pro.ascepan.top'],
    },
  ],
  search: {
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
