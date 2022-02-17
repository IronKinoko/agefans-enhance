import { runtime } from '../../runtime'
import { playModule } from './play'

// 这是个解析器网站，里面只有一个播放器。将其替换成 KPlayer
runtime.register({
  domains: ['danmu.4dm.cc'],
  opts: [{ test: '/m3u8.php', runInIframe: true, run: playModule }],
})
