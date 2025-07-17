export * from './Kplayer'
import { KPlayer } from './Kplayer'
import { setup as setupDanmaku } from './plugins/danmaku'
import { setup as setupShortcuts } from './plugins/shortcuts'
import { setup as setupAutoSeek } from './plugins/autoseek'

KPlayer.register(setupShortcuts)
KPlayer.register(setupDanmaku)
KPlayer.register(setupAutoSeek)
