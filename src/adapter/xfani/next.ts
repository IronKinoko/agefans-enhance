import { KPlayer } from '../../player'

/** 站点自带的播放器，是 media-chrome 的 web component */
const SITE_PLAYER_SELECTOR = 'media-controller'
/**
 * 站点播放器所在的路由容器。
 * 站点是 SPA，切换路由后旧页面不会销毁、只是被置为 display:none，
 * 所以要用「可见的那个容器」来区分当前页面。
 */
const ROUTE_ISOLATE_SELECTOR = 'div.relative.isolate'
/** 播放页路由 /anime/{animeId}/play/{episodeId} */
const PLAY_PATH_RE = /^\/anime\/(\d+)\/play\/(\d+)/
/** 我们自己的播放器容器，KPlayer 会把它替换成 #k-player-wrapper */
const HOST_ID = 'k-player-host'
/** 轮询间隔：站点切集不会派发任何事件，只能轮询它的视频地址 */
const TICK_INTERVAL = 500

let player: KPlayer | undefined
let tickTimer: number | undefined
/** 当前 KPlayer 正在播放的地址，用于发现站点已经切集 */
let playingSrc = ''

export function isNextXifan() {
  return location.hostname.endsWith('next.xifanacg.com')
}

function isPlayPage() {
  return PLAY_PATH_RE.test(location.pathname)
}

function getVisibleIsolate() {
  const list = Array.from(
    document.querySelectorAll<HTMLElement>(ROUTE_ISOLATE_SELECTOR)
  )
  return list.find((el) => getComputedStyle(el).display !== 'none')
}

function getSitePlayer() {
  return getVisibleIsolate()?.querySelector<HTMLElement>(SITE_PLAYER_SELECTOR)
}

function getSiteVideo() {
  return getSitePlayer()?.querySelector<HTMLVideoElement>('video')
}

/** 站点取到的真实视频地址，取到之后我们才接管播放 */
function getSiteVideoSrc() {
  return getSiteVideo()?.getAttribute('src') || ''
}

function getActiveEpisode() {
  return $<HTMLAnchorElement>("main a[aria-current='true']").first()
}

export function getAnimeName() {
  return $('main h1 a').first().text().trim()
}

export function getEpisodeName() {
  const $active = getActiveEpisode()
  return $active.attr('title') || $active.text().trim()
}

function getEpisodeList() {
  return getActiveEpisode().closest('ul').find<HTMLAnchorElement>('a')
}

/** 站点是 SPA，点击站点自己的选集按钮，让 React 完成路由切换 */
function switchEpisode(next: boolean) {
  const list = getEpisodeList().get()
  const idx = list.indexOf(getActiveEpisode()[0])
  const target = idx < 0 ? undefined : list[next ? idx + 1 : idx - 1]

  if (!target) {
    player?.message.info(next ? '没有下一集了' : '没有上一集了')
    return
  }

  target.click()
}

/** 站点播放器只用来取流地址，静音暂停，避免和 KPlayer 双重播放 */
function muteSiteVideo() {
  const video = getSiteVideo()
  if (!video) return

  video.pause()
  video.muted = true
  video.volume = 0
}

function destroyPlayer() {
  player?.destroy()
  player = undefined
  playingSrc = ''
  $(`#k-player-wrapper`).remove()
  document.body.classList.remove('k-widescreen')
}

function mountPlayer(src: string) {
  const sitePlayer = getSitePlayer()
  const parent = sitePlayer?.parentElement
  if (!sitePlayer || !parent) return

  destroyPlayer()

  const host = document.createElement('div')
  host.id = HOST_ID
  parent.insertBefore(host, sitePlayer)

  const instance = new KPlayer(`#${HOST_ID}`)
  player = instance
  playingSrc = src
  instance.src = src

  instance.on('prev', () => switchEpisode(false))
  instance.on('next', () => switchEpisode(true))
  instance.on('enterwidescreen', () =>
    document.body.classList.add('k-widescreen')
  )
  instance.on('exitwidescreen', () =>
    document.body.classList.remove('k-widescreen')
  )

  muteSiteVideo()
}

function tick() {
  if (!isPlayPage()) {
    destroyPlayer()
    return
  }

  const src = getSiteVideoSrc()
  const parent = getSitePlayer()?.parentElement
  if (!src || !parent) return

  // 切集后站点会重新取流（地址变化）；站点重渲染还会把我们的节点挪进隐藏的旧页面，
  // 所以除了地址，还要确认自己的节点仍在当前页面的容器里
  const needMount =
    !player ||
    !player.$wrapper[0] ||
    src !== playingSrc ||
    player.$wrapper[0].parentElement !== parent

  if (needMount) {
    mountPlayer(src)
    return
  }

  muteSiteVideo()
}

/**
 * 站点是 SPA，首页进入播放页不会重新执行脚本，
 * 所以这里注册一个匹配整个站点的 opt，用轮询统一处理路由与切集
 */
export function runInNextTop() {
  $('body').addClass('xfani-next')

  tick()
  window.clearInterval(tickTimer)
  tickTimer = window.setInterval(tick, TICK_INTERVAL)
}
