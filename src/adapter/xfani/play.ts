import { KPlayer } from '../../player'
import { createKPlayer } from '../common/createKPlayer'

/** 站点自带的播放器，是 media-chrome 的 web component */
const SITE_PLAYER_SELECTOR = 'media-controller'
/**
 * 站点播放器与选集列表所在的路由容器。
 * 站点是 SPA，切路由后旧页面不会销毁、只是被置为 display:none，
 * 所以要用「可见的那个容器」来区分当前页面；隐藏容器里留着过期的 DOM，
 * 所有查询都必须 scope 到可见容器。
 */
const ROUTE_ISOLATE_SELECTOR = 'div.relative.isolate'
/** 播放页路由 /anime/{animeId}/play/{episodeId} */
const PLAY_PATH_RE = /^\/anime\/(\d+)\/play\/(\d+)/
/** 我们自己的播放器容器，KPlayer 会把它替换成 #k-player-wrapper */
const HOST_ID = 'k-player-host'

let player: KPlayer | undefined
/** 当前 KPlayer 正在播放的地址，用于发现站点已经切集 */
let playingSrc = ''
/** 站点是 SPA，play 事件委托一次即可覆盖整站生命周期 */
let siteVideoGuardBound = false

function isPlayPage() {
  return PLAY_PATH_RE.test(location.pathname)
}

function getVisibleIsolate() {
  const list = Array.from(
    document.querySelectorAll<HTMLElement>(ROUTE_ISOLATE_SELECTOR)
  )
  return list.find((el) => getComputedStyle(el).display !== 'none')
}

/** 站点播放器所在的可见路由容器；隐藏容器里的播放器是过期的 */
function getScope() {
  return getVisibleIsolate()
}

function getSitePlayer() {
  return getScope()?.querySelector<HTMLElement>(SITE_PLAYER_SELECTOR)
}

function getSiteVideo() {
  return getSitePlayer()?.querySelector<HTMLVideoElement>('video')
}

/** 站点取到的真实视频地址，取到之后我们才接管播放 */
function getSiteVideoSrc() {
  return getSiteVideo()?.getAttribute('src') || ''
}

/**
 * 站点播放器在可见的路由容器内，但**选集列表与标题不在**：
 * 它们与播放器同级、位于 isolate 之外。这两类查询只能全文档查，
 * 再按「是否真的渲染」过滤：隐藏容器（display:none）里的过期节点没有布局盒。
 * 过滤不到时退回第一个匹配，保持与旧实现一致的兜底行为。
 */
function queryRendered<T extends Element>(selector: string) {
  const list = Array.from(document.querySelectorAll<T>(selector))
  return list.find((el) => el.getClientRects().length > 0) || list[0]
}

function getActiveEpisode() {
  return queryRendered<HTMLAnchorElement>("main a[aria-current='true']")
}

export function getAnimeName() {
  return (
    queryRendered<HTMLAnchorElement>('main h1 a')?.textContent?.trim() || ''
  )
}

export function getEpisodeName() {
  // 取 textContent（集数，如 "01"）。title 是这一集的副标题（如 "燃烧吧，狂犬"），
  // 没有数字，会让弹幕匹配的 +episode 变成 NaN。
  return getActiveEpisode()?.textContent?.trim() || ''
}

function getEpisodeList() {
  const active = getActiveEpisode()
  if (!active) return []
  return Array.from(active.closest('ul')?.querySelectorAll('a') || [])
}

/** 站点是 SPA，点击站点自己的选集按钮，让 React 完成路由切换 */
function switchEpisode(next: boolean) {
  const active = getActiveEpisode()
  const list = getEpisodeList()
  const idx = active ? list.indexOf(active) : -1
  const target = idx < 0 ? undefined : list[next ? idx + 1 : idx - 1]

  if (!target) {
    player?.message.info(next ? '没有下一集了' : '没有上一集了')
    return
  }

  target.click()
}

/**
 * 站点播放器只用来取流地址，静音暂停，避免和 KPlayer 双重播放。
 * 站点每次切集都会新建 video 节点并可能自行恢复播放，所以除了挂载时静音，
 * 还要监听它的 play 事件；用事件委托代替原来的定时器守护。
 */
function muteSiteVideo() {
  const video = getSiteVideo()
  if (!video) return

  video.pause()
  video.muted = true
  video.volume = 0
}

function onSiteVideoPlay(e: Event) {
  const video = e.target
  if (!(video instanceof HTMLVideoElement)) return
  // 我们自己的播放器不拦
  if (video.id === 'k-player') return

  video.pause()
  video.muted = true
  video.volume = 0
}

function bindSiteVideoGuard() {
  if (siteVideoGuardBound) return
  siteVideoGuardBound = true
  document.addEventListener('play', onSiteVideoPlay, true)
}

function unbindSiteVideoGuard() {
  if (!siteVideoGuardBound) return
  siteVideoGuardBound = false
  document.removeEventListener('play', onSiteVideoPlay, true)
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

  const instance = createKPlayer(`#${HOST_ID}`)
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

/**
 * 幂等的 reconciler。
 * 路由事件与 DOM 观察都会调用它，两条路径的先后顺序不确定，所以必须幂等：
 * 无论谁先到、被调用几次，最终状态都一致。
 */
function syncPlayer() {
  if (!isPlayPage()) {
    destroyPlayer()
    return
  }

  const src = getSiteVideoSrc()
  const parent = getSitePlayer()?.parentElement
  // 站点播放器是客户端渲染的，进入播放页后要等一会儿才出现
  if (!src || !parent) return

  // 切集后站点会重建 video 节点（地址变化）；站点重渲染还会把我们的节点挪进
  // 隐藏的旧页面，所以除了地址，还要确认自己的节点仍在当前页面的容器里
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

/** 观察整棵路由树：播放器是客户端渲染的，路由事件早于它出现 */
let observer: MutationObserver | undefined
let syncRafId: number | undefined

/**
 * mutation 是否来自我们自己的播放器内部。
 * 弹幕会持续增删节点，而 syncPlayer 里的 getComputedStyle 会强制同步布局，
 * 所以要把自己播放器内部的变动过滤掉，否则播放期间会每帧触发一次。
 */
function isOwnPlayerMutation(record: MutationRecord) {
  const target = record.target
  const el = target.nodeType === Node.ELEMENT_NODE ? target : target.parentNode
  return el instanceof Element && !!el.closest(`#k-player-wrapper`)
}

/**
 * 站点是 React，播放页的 mutation 非常频繁，而 syncPlayer 里的
 * getComputedStyle 会强制同步布局，所以把同一帧内的多次触发合并成一次。
 */
function scheduleSync() {
  if (syncRafId !== undefined) return
  syncRafId = requestAnimationFrame(() => {
    syncRafId = undefined
    syncPlayer()
  })
}

function startObserve() {
  if (observer) return
  observer = new MutationObserver((records) => {
    if (records.every(isOwnPlayerMutation)) return
    scheduleSync()
  })
  // 观察 body 而不是 main：main 有被 React 整体替换的可能，
  // 一旦观察目标被替换，观察器会静默失效且再也不会触发。
  observer.observe(document.body, { childList: true, subtree: true })
}

function stopObserve() {
  observer?.disconnect()
  observer = undefined
  if (syncRafId !== undefined) {
    cancelAnimationFrame(syncRafId)
    syncRafId = undefined
  }
}

/**
 * 站点是 SPA，脚本只在首次进入时执行一次。
 * routechange（runtime 的 spa 模式）负责路由切换，MutationObserver 负责
 * 等待客户端渲染的站点播放器出现，两者都汇入幂等的 syncPlayer。
 */
export function runInNextTop() {
  bindSiteVideoGuard()

  syncPlayer()
  startObserve()

  return () => {
    // runtime 的 spa 循环在路由变化时调用。
    // 注意 body class 归 setup 管（整站生命周期），这里不能移除，
    // 否则离开播放页一次之后样式就再也不生效了。
    stopObserve()
    destroyPlayer()
    unbindSiteVideoGuard()
  }
}
