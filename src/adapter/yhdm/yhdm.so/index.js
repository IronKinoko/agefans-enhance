import { runtime } from '../../../runtime/index'

import { playModule, playInIframeModule } from './play'

runtime.register(
  ['yhdm.so', 'yinghuacd.com'],
  [
    { test: ['/v'], run: playModule },
    { test: ['vid'], runInIframe: true, run: playInIframeModule },
  ]
)
