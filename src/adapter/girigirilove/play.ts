import { template } from 'lodash-es'
import { concurrency } from '../../utils/concurrency'
import { gm } from '../../utils/storage'
import { createKPlayer } from '../common/createKPlayer'
import { defineIframePlayer } from '../common/defineIframePlayer'
import { SubscriptionManager } from '../common/subscribe'
import T from './subscribe.template.html'

const LEGACY_STORAGE_KEY = 'girigirilove_subscriptions'
const STORAGE_KEY = 'girigirilove_subscriptions_v2'
const MIGRATION_DONE_KEY = 'girigirilove_subscriptions_v1_migrated'

function getModernAnimeId() {
  return window.location.pathname.match(
    /^\/(?:detail|play)\/(\d+)(?:\/|$)/
  )?.[1]
}

function getActive() {
  return $<HTMLAnchorElement>('.anthology-list-play li.on > a')
}
function switchPart(next: boolean) {
  return getActive().parent()[next ? 'next' : 'prev']().find('a')[0]?.href
}

function getEpisodeId() {
  return getModernAnimeId() || ''
}

let stopRenderSubscribedAnimes: (() => void) | undefined

function findHomeCalendarSection() {
  return $('.site-container .page-stack h2')
    .filter((_, el) => /^(追番日曆|追番日历)$/.test($(el).text().trim()))
    .first()
    .closest('section')[0] as HTMLElement | undefined
}

export function runInHome() {
  iframePlayer.subscribe.renderSubscribedAnimes()
  const stop = stopRenderSubscribedAnimes
  return () => stop?.()
}

let replacedDetailShareButton: HTMLButtonElement | undefined

export function runInDetail() {
  let stopSubscribeButton: (() => void) | undefined

  const mount = () => {
    if (!/^\/detail\/\d+\/?$/.test(window.location.pathname)) return
    const actions = document.querySelector('.detail-actions')
    if (!actions || actions.querySelector('.k-girigirilove-subscribe-btn'))
      return

    const hasShareButton = Array.from(actions.querySelectorAll('button')).some(
      (button) => button.textContent?.trim() === '分享'
    )
    if (!hasShareButton) return

    stopSubscribeButton?.()
    stopSubscribeButton = iframePlayer.subscribe.renderSubscribeBtn()
  }

  const observer = new MutationObserver(mount)
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })
  mount()

  return () => {
    observer.disconnect()
    stopSubscribeButton?.()
    stopSubscribeButton = undefined

    const button = document.querySelector(
      '.detail-actions .k-girigirilove-subscribe-btn'
    )
    if (button && replacedDetailShareButton?.isConnected === false) {
      button.replaceWith(replacedDetailShareButton)
    } else {
      button?.remove()
    }
    replacedDetailShareButton = undefined
  }
}

export function getModernCurrentEpisodeTitle() {
  const currentText = Array.from(document.querySelectorAll('#main-content *'))
    .filter((element) => element.children.length === 0)
    .map((element) => element.textContent?.trim() ?? '')
    .find((text) => /^(當前播放|当前播放)\s*[:：]/.test(text))

  if (currentText) {
    return currentText
      .replace(/^(當前播放|当前播放)\s*[:：]/, '')
      .split(/[·•]/)
      .pop()
      ?.trim()
  }

  const episodeIndexParam = new URLSearchParams(window.location.search).get(
    'episodeIndex'
  )
  if (episodeIndexParam === null) return

  const episodeIndex = Number(episodeIndexParam)
  if (Number.isInteger(episodeIndex) && episodeIndex >= 0) {
    return String(episodeIndex + 1).padStart(2, '0')
  }
}

export function runInModernPlay() {
  const id = window.location.pathname.match(/^\/play\/(\d+)\/?$/)?.[1]
  if (!id) return

  const sm = SubscriptionManager.getInstance(STORAGE_KEY)
  let player: ReturnType<typeof createKPlayer> | undefined
  let playerContainer: HTMLElement | undefined
  let playerSource = ''

  const syncCurrentEpisode = () => {
    if (window.location.pathname.match(/^\/play\/(\d+)\/?$/)?.[1] !== id) return
    if (!sm.getSubscription(id)) return

    const title = getModernCurrentEpisodeTitle()
    if (!title) return

    const url = `${window.location.pathname}${window.location.search}`
    const sub = sm.getSubscription(id)
    if (!sub || (sub.current.title === title && sub.current.url === url)) return

    sm.updateSubscription(id, { current: { title, url } })
  }

  const switchEpisode = (offset: number) => {
    const episodeIndexParam = new URLSearchParams(window.location.search).get(
      'episodeIndex'
    )
    if (episodeIndexParam === null) return

    const currentIndex = Number(episodeIndexParam)
    if (!Number.isInteger(currentIndex)) return

    const targetIndex = currentIndex + offset
    if (targetIndex < 0) return

    const target = Array.from(
      document.querySelectorAll<HTMLButtonElement>('#main-content button')
    ).find((button) => {
      const episodeNumber = Number(button.textContent?.trim())
      return (
        Number.isInteger(episodeNumber) && episodeNumber - 1 === targetIndex
      )
    })
    target?.click()
  }

  const mountPlayer = () => {
    if (window.location.pathname.match(/^\/play\/(\d+)\/?$/)?.[1] !== id) return

    const container = document.querySelector<HTMLElement>('.video-player')
    const nativeVideo = container?.querySelector<HTMLVideoElement>('video')
    const source =
      nativeVideo?.querySelector<HTMLSourceElement>('source[src]')?.src ||
      (nativeVideo?.src.startsWith('blob:') ? '' : nativeVideo?.src)
    if (!container || !nativeVideo || !source) return

    if (playerContainer !== container) {
      player?.destroy()
      player = undefined
      playerSource = ''
      playerContainer?.classList.remove('k-girigirilove-player-mounted')
      playerContainer = container
    }

    if (!player) {
      const playerRoot = document.createElement('div')
      container.append(playerRoot)
      container.classList.add('k-girigirilove-player-mounted')

      player = createKPlayer(playerRoot)
      player.on('prev', () => switchEpisode(-1))
      player.on('next', () => switchEpisode(1))
      player.on('canplay', syncCurrentEpisode)
      player.on('enterwidescreen', () => {
        document.body.classList.add('widescreen')
        document.documentElement.style.overflow = 'hidden'
        document.documentElement.style.scrollbarGutter = 'auto'
      })
      player.on('exitwidescreen', () => {
        document.body.classList.remove('widescreen')
        document.documentElement.style.overflow = ''
        document.documentElement.style.scrollbarGutter = ''
      })

      const poster = container.querySelector<HTMLImageElement>(':scope > img')
      if (poster?.src) player.media.poster = poster.src
      player.media.crossOrigin = nativeVideo.crossOrigin || 'anonymous'
    }

    nativeVideo.pause()
    nativeVideo.muted = true
    if (playerSource !== source) {
      playerSource = source
      player.src = source
    }
  }

  const observer = new MutationObserver(() => {
    mountPlayer()
    syncCurrentEpisode()
  })
  observer.observe(document.body, {
    childList: true,
    characterData: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src'],
  })
  mountPlayer()
  syncCurrentEpisode()

  return () => {
    observer.disconnect()
    player?.destroy()
    player = undefined
    playerContainer?.classList.remove('k-girigirilove-player-mounted')
    playerContainer = undefined
    playerSource = ''
    document.body.classList.remove('widescreen')
    document.documentElement.style.overflow = ''
    document.documentElement.style.scrollbarGutter = ''
  }
}

function getModernDetailInfo(
  root: ParentNode,
  id: string,
  sm: import('../common/subscribe').SubscriptionManager,
  apiInfo?: GirigiriDetailApiInfo
) {
  const main = root.querySelector('#main-content') || root
  const sub = sm.getSubscription(id)
  const title =
    apiInfo?.vod_name?.trim() ||
    sub?.title ||
    main.querySelector('h1')?.textContent?.trim()
  if (!title) return

  const episodeGroups = new Map<
    string,
    { index: number; title: string; url: string }[]
  >()
  const skipLabels = /^(開始觀看|开始观看|立即播放|繼續觀看|继续观看|播放)$/i

  main.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((link) => {
    const href = link.getAttribute('href')
    if (!href) return

    let url: URL
    try {
      url = new URL(href, window.location.origin)
    } catch {
      return
    }

    if (url.pathname !== `/play/${id}`) return
    const episodeIndex = Number(url.searchParams.get('episodeIndex'))
    if (!Number.isInteger(episodeIndex) || episodeIndex < 0) return

    const label = link.querySelector(':scope > span')?.textContent?.trim() ?? ''
    if (skipLabels.test(label)) return

    const sourceIndex = url.searchParams.get('sourceIndex') ?? '0'
    const episodes = episodeGroups.get(sourceIndex) ?? []
    const episode = {
      index: episodeIndex,
      title: label || String(episodeIndex + 1).padStart(2, '0'),
      url: `${url.pathname}${url.search}`,
    }
    const duplicateIndex = episodes.findIndex(
      (item) => item.index === episodeIndex
    )
    if (duplicateIndex === -1) episodes.push(episode)
    else if (!episodes[duplicateIndex].title) episodes[duplicateIndex] = episode
    episodeGroups.set(sourceIndex, episodes)
  })

  const domEpisodes = Array.from(episodeGroups.entries()).sort(
    (left, right) => right[1].length - left[1].length
  )[0]
  const apiEpisodes = apiInfo && getApiEpisodes(apiInfo, id)
  const episodes = (
    apiEpisodes?.episodes.length ? apiEpisodes.episodes : domEpisodes?.[1]
  )?.sort((left, right) => left.index - right.index)
  const first = episodes?.[0]
  const last = episodes?.[episodes.length - 1]
  if (!first || !last) return

  const now = Date.now()
  const lastChanged =
    sub && (sub.last.title !== last.title || sub.last.url !== last.url)
  const apiThumbnail = apiInfo?.vod_pic?.trim()
    ? new URL(apiInfo.vod_pic.trim(), 'https://jpg.girigirilove.net/').href
    : ''
  const thumbnail =
    apiThumbnail ||
    Array.from(main.querySelectorAll<HTMLImageElement>('img')).find(
      (image) => image.alt.trim() === title
    )?.currentSrc ||
    Array.from(main.querySelectorAll<HTMLImageElement>('img'))
      .find((image) => image.alt.trim() === title)
      ?.getAttribute('src') ||
    sub?.thumbnail ||
    ''

  return {
    id,
    createdAt: sub?.createdAt ?? now,
    checkedAt: now,
    current: sub?.current ?? { title: first.title, url: first.url },
    title,
    url: `/detail/${id}`,
    thumbnail,
    updatedAt: sub ? (lastChanged ? now : sub.updatedAt) : now,
    status: apiInfo ? getStatus(apiInfo) : sub?.status ?? '',
    last: { title: last.title, url: last.url },
  }
}

type GirigiriDetailApiInfo = {
  vod_isend?: number | string | boolean
  vod_name?: string
  vod_pic?: string
  vod_play_url?: string
  vod_remarks?: string
  vod_weekday?: string
}

function getApiEpisodes(info: GirigiriDetailApiInfo, id: string) {
  return (info.vod_play_url ?? '')
    .split('$$$')
    .map((source, sourceIndex) => ({
      sourceIndex,
      episodes: source
        .split('#')
        .map((item, episodeIndex) => {
          const separator = item.indexOf('$')
          if (separator < 0) return

          const title = item.slice(0, separator).trim()
          if (!title) return

          const params = new URLSearchParams({
            sourceIndex: String(sourceIndex),
            episodeIndex: String(episodeIndex),
          })
          return {
            index: episodeIndex,
            title,
            url: `/play/${id}?${params.toString()}`,
          }
        })
        .filter((episode): episode is NonNullable<typeof episode> =>
          Boolean(episode)
        ),
    }))
    .sort((left, right) => right.episodes.length - left.episodes.length)[0]
}

function getStatus(info: GirigiriDetailApiInfo) {
  const remarks = info.vod_remarks ?? ''
  if (Number(info.vod_isend) === 1 || /已完结|已完結|完结|完結/.test(remarks)) {
    return '已完结'
  }

  const weekdayMatch = (info.vod_weekday ?? '').match(
    /(?:星期|週|周)?([一二三四五六日天])/
  )
  const weekday = weekdayMatch?.[1] === '天' ? '日' : weekdayMatch?.[1]
  const timeMatch = remarks.match(/(\d{1,2})\s*[点點时時:：]\s*(\d{1,2})\s*分?/)
  const hour = timeMatch ? Number(timeMatch[1]) : undefined
  const minute = timeMatch ? Number(timeMatch[2]) : undefined
  const time =
    hour !== undefined &&
    minute !== undefined &&
    hour >= 0 &&
    hour < 24 &&
    minute >= 0 &&
    minute < 60
      ? `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      : ''

  return (
    [weekday ? `周${weekday}` : '', time].filter(Boolean).join(' ') ||
    '播出时间待定'
  )
}

async function getGirigiriAnimeInfo(id: string, sm: SubscriptionManager) {
  const isModernDetail = new RegExp(`^/detail/${id}/?$`).test(
    window.location.pathname
  )
  let detailDocument: ParentNode = document
  const apiInfoPromise = fetch(
    `https://m3u8.girigirilove.com/api.php/Vod/get_detail?vod_id=${encodeURIComponent(
      id
    )}&user_id=`,
    { cache: 'no-store', headers: { accept: 'application/json' } }
  )
    .then(async (response) => {
      if (!response.ok) return
      const result = (await response.json()) as {
        code?: number
        info?: GirigiriDetailApiInfo
      }
      return result.code === 1 ? result.info : undefined
    })
    .catch(() => undefined)

  const apiInfo = await apiInfoPromise
  const hasApiEpisodes = Boolean(
    apiInfo && getApiEpisodes(apiInfo, id)?.episodes.length
  )
  if (!isModernDetail && !hasApiEpisodes) {
    const response = await fetch(`/detail/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch anime detail')
    }
    detailDocument = new DOMParser().parseFromString(
      await response.text(),
      'text/html'
    )
  }

  const modernInfo = getModernDetailInfo(detailDocument, id, sm, apiInfo)
  if (!modernInfo) {
    throw new Error('Failed to parse anime detail')
  }
  return modernInfo
}

let migrationPromise: Promise<void> | undefined

function getLegacySubscriptionIds(raw: unknown) {
  if (!Array.isArray(raw)) return []

  return Array.from(
    new Set(
      raw
        .map((item) => {
          if (!item || typeof item !== 'object') return
          const id = (item as { id?: unknown }).id
          return typeof id === 'string' || typeof id === 'number'
            ? String(id).trim()
            : ''
        })
        .filter((id): id is string => Boolean(id && /^\d+$/.test(id)))
    )
  )
}

export function migrateLegacySubscriptions() {
  if (migrationPromise) return migrationPromise

  migrationPromise = (async () => {
    const sm = SubscriptionManager.getInstance(STORAGE_KEY)
    if (!gm.getItem(MIGRATION_DONE_KEY, false)) {
      const ids = getLegacySubscriptionIds(
        gm.getItem<unknown>(LEGACY_STORAGE_KEY, [])
      )
      const pendingIds = ids.filter((id) => !sm.getSubscription(id))

      const animeInfoList = await concurrency(
        pendingIds.map((id) => async () => {
          try {
            return await getGirigiriAnimeInfo(id, sm)
          } catch {
            return
          }
        }),
        3
      )

      animeInfoList.forEach((animeInfo) => {
        if (!animeInfo || sm.getSubscription(animeInfo.id)) return
        sm.createSubscription(animeInfo)
      })

      if (!ids.every((id) => sm.getSubscription(id))) return
      gm.setItem(MIGRATION_DONE_KEY, true)
    }

    gm.removeItem(LEGACY_STORAGE_KEY)
  })().finally(() => {
    migrationPromise = undefined
  })

  return migrationPromise
}

export const iframePlayer = defineIframePlayer({
  iframeSelector: '#playleft iframe',
  getActive,
  setActive: (href) => {
    $<HTMLAnchorElement>('.anthology-list-play li a').each((_, el) => {
      if (el.href === href) {
        el.parentElement!.classList.add('ecnav-dt', 'on')
        $('.play-on').insertAfter($(el).find('span'))
      } else {
        el.parentElement!.classList.remove('ecnav-dt', 'on')
      }
    })
  },
  search: {
    getSearchName: () => $('.player-title-link').text(),
    getEpisode: () => getActive().text(),
  },
  getEpisodeList: () => $('.anthology-list-play li a'),
  getSwitchEpisodeURL: (next) => switchPart(next),
  subscribe: {
    storageKey: STORAGE_KEY,
    getId: getEpisodeId,
    getAnimeInfo: getGirigiriAnimeInfo,
    renderSubscribedAnimes: (sm) => {
      stopRenderSubscribedAnimes?.()
      const $root = $(T.subListContainer)
      const root = $root[0]

      const mount = () => {
        if (!/^\/(?:home)?\/?$/.test(window.location.pathname)) return
        const calendar = findHomeCalendarSection()
        if (!calendar?.parentElement) return
        if (
          root.parentElement === calendar.parentElement &&
          root.nextElementSibling === calendar
        ) {
          return
        }
        calendar.parentElement.insertBefore(root, calendar)
      }

      const observer = new MutationObserver(mount)
      const observeTarget =
        document.querySelector('#main-content') || $('#app')[0]
      if (observeTarget) {
        observer.observe(observeTarget, { childList: true, subtree: true })
      }
      mount()

      $root
        .off('click', '[data-subscription-id]')
        .on('click', '[data-subscription-id]', (event) => {
          event.preventDefault()
          event.stopPropagation()
          const id = $(event.currentTarget).attr('data-subscription-id')
          if (id) sm.deleteSubscription(id)
        })

      const stopListening = sm.onChange(
        () => {
          const groups = sm.getSubscriptionsGroupByDay()
          const list = groups.reduce((items, group) => {
            items.push(...group.list)
            return items
          }, [] as (typeof groups)[number]['list'])
          $root.find('#subList').replaceWith(template(T.subList)({ list }))
        },
        { immediate: true }
      )

      const cleanup = () => {
        observer.disconnect()
        stopListening()
        $root.off()
        root.remove()
        if (stopRenderSubscribedAnimes === cleanup) {
          stopRenderSubscribedAnimes = undefined
        }
      }
      stopRenderSubscribedAnimes = cleanup
      return $root
    },
    renderSubscribeBtn($btn) {
      if (/^\/detail\/\d+\/?$/.test(window.location.pathname)) {
        const $actions = $('.detail-actions').first()
        const $share = $actions
          .children('button')
          .filter((_, button) => $(button).text().trim() === '分享')
          .first()
        if (!$share.length) return

        replacedDetailShareButton = $share[0] as HTMLButtonElement
        $btn
          .attr('class', $share.attr('class') ?? '')
          .attr('type', 'button')
          .addClass('k-girigirilove-subscribe-btn')
        $share.replaceWith($btn)
        return
      }

      $btn.addClass('cor5 r6')
      $btn.prependTo($('.anthology-header .function'))
    },
  },
})
