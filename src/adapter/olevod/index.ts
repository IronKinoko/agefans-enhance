import { runtime } from '../../runtime'
import { playModule } from './play'

runtime.register(['.olevod.'], [{ test: '/play', run: playModule }])
