import { runtime } from '../../runtime'
import { playModule } from './play'

runtime.register({
  domains: ['new-ani.me'],
  opts: [{ test: '/watch', run: playModule }],
})
