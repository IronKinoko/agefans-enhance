import { runtime } from '../../runtime'
// import './index.scss'
import play from './play'

runtime.register({
  domains: ['127.0.0.1', 'ironkinoko.github.io'],
  opts: [{ test: '*', run: play }],
  search: {
    getEpisode: () => '',
    getSearchName: () => '',
    getAnimeScope: () => 'standalone',
  },
})
