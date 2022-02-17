import { runtime } from '../../runtime'
import { playModule } from './play'

runtime.register({
  domains: ['.dm233.'],
  opts: [{ test: '/play', run: playModule }],
})
