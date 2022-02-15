import { runtime } from '../../../runtime'
import { playModule } from './play'
runtime.register(['imomoe.live'], [{ test: '/player', run: playModule }])
