import { runtime } from '../../runtime'
import { runInTop, runInHome } from './play'
import './index.scss'
import { wait } from '../../utils/wait'

runtime.register({
  domains: ['.cycani.'],
  opts: [
    {
      test: '*',
      setup: () => $('body').addClass('cycanime'),
    },
    { test: /^\/(\?.*)?$/, run: runInHome },
    { test: /anime\/\d+\/play/, run: runInTop },
  ],
  spa: true,
  search: {
    name: '次元城',
    search: (cn) => `https://www.cycani.org/category?q=${cn}`,
    getSearchName: () => {
      return $<HTMLAnchorElement>('a[href^="/anime/"]')
        .filter((_, el) => !el.href.includes('/play'))
        .text()
    },
    getEpisode: async () => {
      await wait(() => !!$('[aria-current="page"]').first().text())
      return $('[aria-current="page"]').first().text()
    },
    getAnimeScope: () =>
      window.location.href.match(/\/anime\/(\d+)\//)?.[1] || '',
  },
})
