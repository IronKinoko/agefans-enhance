import { playModule } from './play'
import './index.scss'
import { runtime } from '../../runtime/index'
import { searchAction } from './search'

function www88dmwSetup() {
  try {
    Object.defineProperty(unsafeWindow, 'devtoolsDetector', {
      writable: false,
      value: null,
    })
    document.oncontextmenu = null
    // eslint-disable-next-line no-empty
  } catch (error) {}
}

runtime.register({
  domains: ['88dmw'],
  opts: [{ test: '/play', setup: www88dmwSetup, run: playModule }],
  search: {
    name: '动漫岛',
    search: searchAction,
    getSearchName: () => $('.play_menu a:last').text(),
    disabledInIframe: true,
  },
})
