import { runtime } from '../../runtime'
import { playModule } from './play'

runtime.register({
  domains: ['.olevod.'],
  opts: [{ test: '/play', run: playModule }],
})
