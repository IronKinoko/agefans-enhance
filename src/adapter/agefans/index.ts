import { runtime } from '../../runtime/index'
import './index.scss'
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
  ],
  search: {
    name: 'agefans',
    search: (name) => `https://www.agefans.com/search?query=${name}`,
  },
})
