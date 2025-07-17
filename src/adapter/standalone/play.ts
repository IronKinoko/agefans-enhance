import { KPlayer } from '../../player'
import { isUrl } from '../../utils/isUrl'
import { local } from '../../utils/storage'

export default function main() {
  replacePlayer()
}

function getUrlId(url: string) {
  const key = 'k-player-standalone-url-store'
  const store = local.getItem<Record<string, string>>(key, {})
  let id = store[url]
  if (!id) {
    id = Math.random().toString(36).slice(2)
    store[url] = id
    local.setItem(key, store)
  }

  return id
}

function replacePlayer() {
  const player = new KPlayer('#player', { autoSeekScope: 'standalone' })

  player.message.info(
    '请使用Ctrl+V粘贴视频地址，或者拖拽视频文件/链接到页面',
    60000
  )

  player.on('loadstart', (e) => {
    player.message.destroy()
    const id = getUrlId(player.src)
    history.replaceState(null, '', `#${id}`)
  })
  window.addEventListener('paste', (e) => {
    const text = e.clipboardData?.getData('text')

    if (text && isUrl(text)) {
      player.src = text
    }
  })

  if (process.env.NODE_ENV === 'development') {
    // a test video link
    player.src = 'https://media.w3.org/2010/05/video/movie_300.mp4'
    player.plyr.loop = true
  }
}
