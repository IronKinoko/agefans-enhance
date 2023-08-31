import { runtime } from '../../runtime'
import { playModule } from './play'

runtime.register({
  domains: ['.ntdm9.'],
  opts: [{ test: '/play', run: playModule }],
  search: {
    name: 'NT动漫',
    search: (name) =>
      `http://www.ntdm9.com/search/-------------.html?wd=${name}&page=1`,
  },
})
