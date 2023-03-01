import { runtime } from '../../../runtime/index'
import { playModule } from './play'

runtime.register({
  domains: ['yhdmp.net'],
  opts: [{ test: '/vp', run: playModule }],
  search: {
    name: '樱花动漫2',
    search: (name) => `https://www.yhdmp.net/s_all?ex=1&kw=${name}`,
    getSearchName: () => $('.gohome > a:last').text(),
    getEpisode: () => $('.movurl li a[style*="color"]').text(),
  },
})
