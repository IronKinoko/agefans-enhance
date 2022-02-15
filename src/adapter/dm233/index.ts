import { runtime } from '../../runtime'
import { playModule } from './play'

runtime.register(['.dm233.'], [{ test: '/play', run: playModule }])
