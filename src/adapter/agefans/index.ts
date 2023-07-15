import { runtime } from '../../runtime/index'
import './index.scss'
import { playModule } from './play'

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
  ],
  search: {
    name: 'agefans',
    search: (name) => `https://www.agefans.com/search?query=${name}`,
  },
})
