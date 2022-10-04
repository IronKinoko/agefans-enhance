import { runtime } from '../../../runtime/index'
import { playModule } from './play'

runtime.register({
  domains: ['odcoc.com'],
  opts: [
    {
      test: '/play',
      setup: () => {
        $('body').addClass('yhdm-wrapper')
      },
      run: playModule,
    },
  ],
})
