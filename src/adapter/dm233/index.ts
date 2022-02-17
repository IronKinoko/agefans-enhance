import { runtime } from '../../runtime'
import { playModule } from './play'
import $ from 'jquery'

runtime.register({
  domains: ['.dm233.'],
  opts: [{ test: '/play', run: playModule }],
  search: {
    name: '233动漫网',
    search: (name) => `https://www.dm233.org/search?keyword=${name}&seaex=1`,
    getSearchName: () => $('.playtitle span a').text(),
  },
})
