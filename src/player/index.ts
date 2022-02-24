export * from './Kplayer'
import { KPlayer } from './Kplayer'
import { setup as setupDanmaku } from './plugins/danmaku'

KPlayer.register(setupDanmaku)
