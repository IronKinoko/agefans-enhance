import { runtime } from '../../runtime/index'
import './index.scss'
import { mobilePlayModule } from './mobilePlay'
import { playModule, playModuleInIframe } from './play'

runtime.register({
  domains: ['age.tv', 'agemys', 'agefans', 'agedm'],
  opts: [
    {
      test: '*',
      run: () => {
        $('body').addClass('agefans-wrapper')
      },
    },
    { test: '/play', run: playModule },
    { test: '/play', run: playModuleInIframe, runInIframe: true },
    { test: () => location.hash.includes('/play/'), run: mobilePlayModule },
  ],
  search: {
    name: 'agefans',
    search: (name) => `https://www.agefans.com/search?query=${name}`,
  },
})
