import { runtime } from '../../runtime'
import { playModule } from './play'

runtime.register({
  domains: ['new-ani.me', 'bangumi.online'],
  opts: [{ test: '/watch', run: playModule }],
  search: {
    getSearchName: () => $('.watch-content-info-text-title-name').text(),
    getEpisode: () => $('.watch-right-series-block-volumes-active').text(),
  },
})
