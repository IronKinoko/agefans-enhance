import { runtime } from '../../runtime'
import {
  getModernCurrentEpisodeTitle,
  migrateLegacySubscriptions,
  runInDetail,
  runInHome,
  runInModernPlay,
} from './play'
import './index.scss'

runtime.register({
  domains: ['.girigirilove.', 'giri.moemoekyu.com'],
  spa: true,
  opts: [
    {
      test: '*',
      setup: () => {
        $('body').addClass('girigirilove')
        migrateLegacySubscriptions()
      },
    },
    {
      test: [/^\/$/, /^\/home\/?(?:\?.*)?$/],
      run: runInHome,
    },
    { test: /^\/detail\/\d+\/?(?:\?.*)?$/, run: runInDetail },
    { test: /^\/play\/\d+\/?(?:\?.*)?$/, run: runInModernPlay },
  ],
  search: {
    name: 'girigiri爱',
    search: (cn) =>
      `https://ani.girigirilove.com/search/-------------/?wd=${cn}`,
    getSearchName: () =>
      document.querySelector('#main-content h1')?.textContent?.trim() || '',
    getEpisode: () => getModernCurrentEpisodeTitle() || '',
    getAnimeScope: () =>
      window.location.pathname.match(
        /^\/(?:detail|play)\/(\d+)(?:\/|$)/
      )?.[1] || '',
  },
})
