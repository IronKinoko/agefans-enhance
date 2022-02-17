import { runtime } from '../../runtime'
import { playModule } from './play'
import $ from 'jquery'

runtime.register({
  domains: ['.olevod.'],
  opts: [{ test: '/play', run: playModule }],
  search: {
    name: '欧乐影院',
    search: (name) =>
      `https://www.olevod.com/index.php/vod/search.html?wd=${name}&submit=`,
    getSearchName: () => $('.video_title > .title').text(),
  },
})
