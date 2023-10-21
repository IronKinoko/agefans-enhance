import { runtime } from '../../runtime'
import { iframePlayer } from './play'

runtime.register({
  domains: ['.ntdm9.'],
  opts: [
    { test: '/play', run: iframePlayer.runInTop },
    { test: '/play', run: iframePlayer.runInIframe, runInIframe: true },
  ],
  search: {
    name: 'NT动漫',
    search: (name) =>
      `http://www.ntdm9.com/search/-------------.html?wd=${name}&page=1`,
  },
})
