import { runtime } from '../../runtime'
import { playModule } from './play'

runtime.register({
  domains: ['.ntyou.'],
  opts: [{ test: '/play', run: playModule }],
  search: {
    name: 'NT动漫',
    search: (name) =>
      `http://www.ntyou.cc/search/-------------.html?wd=${name}&page=1`,
  },
})
