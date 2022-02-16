import { runtime } from '../../../runtime/index'
import { playModule } from './play'

runtime.register(['yhdmp.cc'], [{ test: '/vp', run: playModule }])
