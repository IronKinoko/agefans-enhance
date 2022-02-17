import { runtime } from '../../../runtime/index'
import { playModule } from './play'

runtime.register({ domains: ['yhdmp.cc'], opts: [{ test: '/vp', run: playModule }] })
