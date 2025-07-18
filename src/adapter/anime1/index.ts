import { runtime } from '../../runtime'
import { historyModule } from './history'
import './index.scss'
import { runInSingle, runInCategory } from './play'

runtime.register({
  domains: ['anime1.me'],
  opts: [
    {
      test: '*',
      run: () => {
        $('html').addClass('anime1')
        historyModule()
      },
    },
    { test: 'category', run: runInCategory },
    { test: /^\/\d+/, run: runInSingle },
  ],
  search: {
    name: 'Anime1',
    search: (name) => `https://anime1.me/?s=${name}`,
    getSearchName: () => {
      return $('.entry-title')
        .text()
        .replace(/\[\d+\]/, '')
        .trim()
    },
    getEpisode: () => {
      try {
        return $('.entry-title')
          .text()
          .match(/\[(\d+)\]/)![1]
          .replace(/^0+/, '')
      } catch (error) {
        return ''
      }
    },
    getAnimeScope: () => {
      try {
        const target = $<HTMLAnchorElement>('a:contains("全集連結")')[0]
        const url = new URL(target.href)
        return url.searchParams.get('cat')!
      } catch (error) {
        return ''
      }
    },
  },
})
