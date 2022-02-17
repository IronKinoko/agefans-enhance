import { runtime } from '../../runtime'
import { playModule } from './play'
import $ from 'jquery'

runtime.register({
  domains: ['.ntyou.'],
  opts: [{ test: '/play', run: playModule }],
  search: {
    name: 'NT动漫',
    search: (name) =>
      `https://www.ntyou.com/search/-------------.html?wd=${name}&page=1`,
  },
})
