import { runtime } from '../../runtime'
import { playModule } from './play'

runtime.register(['new-ani.me'], [{ test: '/watch', run: playModule }])
