import { runtime } from '../../../runtime'
import { playModule } from './play'
runtime.register({ domains: ['imomoe.live'], opts: [{ test: '/player', run: playModule }] })
