import { runtime } from '../../runtime'
import { renderFavoriteList } from './favorite'
import { iframePlayer, runInTop } from './play'

runtime.register({
  domains: ['.ntdm8.'],
  opts: [
    { test: '*', run: iframePlayer.createHistrory },
    { test: /^\/$/, run: renderFavoriteList },
    { test: '/play', run: runInTop },
    { test: '/play', run: iframePlayer.runInIframe, runInIframe: true },
  ],
  search: {
    name: 'NT动漫',
    search: (name) =>
      `http://www.ntdm8.com/search/-------------.html?wd=${name}&page=1`,
    getAnimeScope: () => window.location.pathname.match(/\/play\/(\d+)-/)![1],
  },
})
