import { runtime } from '../../runtime'
import { renderFavoriteList } from './favorite'
import { iframePlayer, runInTop } from './play'

runtime.register({
  domains: ['.ntdm9.'],
  opts: [
    { test: '/', run: renderFavoriteList },
    { test: '/play', run: runInTop },
    { test: '/play', run: iframePlayer.runInIframe, runInIframe: true },
  ],
  search: {
    name: 'NT动漫',
    search: (name) =>
      `http://www.ntdm9.com/search/-------------.html?wd=${name}&page=1`,
  },
})
