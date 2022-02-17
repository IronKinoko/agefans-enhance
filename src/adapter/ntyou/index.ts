import { runtime } from '../../runtime'
import { playModule } from './play'

runtime.register({
  domains: ['.ntyou.'],
  opts: [{ test: '/play', run: playModule }],
})
