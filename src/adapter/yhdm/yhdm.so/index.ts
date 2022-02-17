import { runtime } from '../../../runtime/index'
import { playInIframeModule, playModule } from './play'

runtime.register(
  {
    domains: ['yhdm.so', 'yinghuacd.com'], opts: [
      { test: ['/v'], run: playModule },
      { test: ['vid'], runInIframe: true, run: playInIframeModule },
    ]
  })
