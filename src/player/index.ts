export * from './Kplayer'
import { KPlayer } from './Kplayer'
import { setup as setupDanmaku } from './plugins/danmaku'
import { setup as setupShortcuts } from './plugins/shortcuts'

KPlayer.register(setupDanmaku)
KPlayer.register(setupShortcuts)
