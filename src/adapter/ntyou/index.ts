import { runtime } from '../../runtime'
import { playModule } from './play'

runtime.register(['.ntyou.'], [{ test: '/play', run: playModule }])
