import { memoize, template } from 'lodash-es'
import { KPlayer } from '../../player'
import { queryDom } from '../../utils/queryDom'
import { local } from '../../utils/storage'
import { defineSubscribe } from '../common/defineSubscribe'
import T from './subscribe.template.html'
import dayjs from 'dayjs'

type Dispose = () => void

const PLAYER_SELECTOR = '#k-player-wrapper'
const PLAY_PATH_RE = /\/anime\/\d+\/play\/\d+/

let currentParserSession = 0
let player: KPlayer | undefined
let startPlayHandler: ((diff: number) => void) | undefined
let stopObserveSubscribedListMount: (() => void) | undefined
let stopObserveSubscribeBtnMount: (() => void) | undefined

const DEFAULT_ACCOUNT = {
  username: 'ironuserscripts',
  password: 'U5PXEp.vc.LTj3',
}

function decodeJWT(token: string) {
  const payload = token.split('.')[1]
  const decoded = atob(payload)
  return JSON.parse(decoded)
}

function observeDomMutations(onChange: () => void) {
  const observer = new MutationObserver(() => {
    onChange()
  })
  observer.observe(document.body, { childList: true, subtree: true })
  return () => observer.disconnect()
}

function parseAnimeId() {
  return window.location.pathname.match(/\/anime\/(\d+)/)?.[1] || ''
}

function remarksToStatus(remarks: string) {
  remarks = remarks?.trim() || '已完结'
  const regexp = /周(.)(\d{2}):(\d{2})/
  const match = remarks.match(regexp)
  if (match) {
    const [, weekDayZhCN, hourStr, minuteStr] = match
    const DayZh = '日一二三四五六'
    let idx = DayZh.indexOf(weekDayZhCN)
    let hour = +hourStr
    if (hour >= 24) {
      hour = hour - 24
      idx = (idx + 1) % 7
    }
    return `周${DayZh[idx]}${hour.toString().padStart(2, '0')}:${minuteStr}`
  }

  return remarks
}

function calcRecentUpdatedAt({
  status,
  publish_date,
  isUpdated,
}: {
  status: string
  publish_date: string
  isUpdated?: boolean
}) {
  publish_date ||= '2000-01-01'
  status = status?.trim() || '已完结'
  if (status === '已完结') {
    return new Date(publish_date).getTime()
  }
  if (status === '不定时') {
    // 不定时更新的番组，默认认为6天内没有更新过，约等于每天都会重新查询一次
    return dayjs().subtract(6, 'day').valueOf()
  }
  if (isUpdated) {
    const publishDay = new Date(publish_date).getDay()
    const now = dayjs()
    const nowDay = now.day()
    const diffDays = (nowDay - publishDay + 7) % 7
    return now.subtract(diffDays, 'day').valueOf()
  }

  const regexp = /周(.)(\d{2}):(\d{2})/
  const match = status.match(regexp)
  if (match) {
    const [, weekDayZhCN, hourStr, minuteStr] = match
    const updateDay = '日一二三四五六'.indexOf(weekDayZhCN)
    const now = dayjs()
    const nowDay = now.day()
    const diffDays = (nowDay - updateDay + 7) % 7
    const rencent = now
      .subtract(diffDays, 'day')
      .hour(+hourStr)
      .minute(+minuteStr)
      .second(0)
    return rencent.valueOf()
  }

  return new Date(publish_date).getTime()
}

async function getCurrentSubInfo() {
  const currentTitle = $('[aria-current="page"]').first().text().trim()
  if (currentTitle) {
    return { title: currentTitle, url: window.location.href }
  }

  const match = window.location.href.match(/\/anime\/(\d+)\/play\/(\d+)/)
  if (!match) return { title: '', url: window.location.href }

  const animeId = +match[1]
  const episodeIndex = +match[2] - 1
  const sections = await API.getSctions(animeId)

  return {
    title: sections[episodeIndex]?.title || '',
    url: window.location.href,
  }
}

export const subscribe = defineSubscribe({
  getCurrent: getCurrentSubInfo,
  subscribe: {
    storageKey: 'cycanime-subscribe',
    getId: parseAnimeId,
    async getAnimeInfo(id, sm) {
      const animeId = +id
      if (!animeId) {
        throw new Error('Failed to parse anime id')
      }

      const [animeInfo, sections] = await Promise.all([
        API.getVideoInfo(animeId),
        API.getSctions(animeId),
      ])
      if (!sections.length) {
        throw new Error('No sections found')
      }

      const lastIndex = sections.length
      const lastSection = sections[lastIndex - 1]
      const lastUrl = `/anime/${animeId}/play/${lastIndex}`
      let sub = sm.getSubscription(id)

      const status = remarksToStatus(animeInfo.remarks)
      const updateInfo = {
        updatedAt: calcRecentUpdatedAt({
          status,
          publish_date: animeInfo.publish_date,
          isUpdated: sub ? sub.last.title !== lastSection.title : true,
        }),
        status,
        last: {
          title: lastSection.title,
          url: lastUrl,
        },
      }

      if (!sub) {
        const firstSection = sections[0]
        const defaultCurrent = {
          title: firstSection.title,
          url: `/anime/${animeId}/play/1`,
        }
        const current =
          parseAnimeId() === id ? await getCurrentSubInfo() : defaultCurrent

        sub = {
          id,
          title: animeInfo.title,
          url: `/anime/${animeId}`,
          thumbnail: animeInfo.cover_url,
          createdAt: Date.now(),
          checkedAt: Date.now(),
          current,
          ...updateInfo,
        }
      }

      return { ...sub, ...updateInfo }
    },
    renderSubscribedAnimes: (sm) => {
      const $root = $(T.subListContainer)

      const mount = () => {
        if (document.body.contains($root[0])) return

        $('#subListContainer').not($root).remove()
        const $tvSection = $('h2')
          .filter((_, el) => $(el).text().trim() === 'TV番组')
          .first()
          .closest('section')

        if ($tvSection.length) {
          $root.insertBefore($tvSection)
        } else {
          $('main .container').first().prepend($root)
        }
      }
      mount()

      stopObserveSubscribedListMount?.()
      stopObserveSubscribedListMount = observeDomMutations(mount)

      sm.onChange(
        () => {
          const groups = sm.getSubscriptionsGroupByDay()
          const list = groups.reduce((acc, group) => {
            acc.push(...group.list)
            return acc
          }, [] as (typeof groups)[number]['list'])
          $root.find('#subList').replaceWith(template(T.subList)({ list }))
        },
        { immediate: true }
      )
      return $root
    },
    renderSubscribeBtn: ($btn) => {
      const $wrap = $(
        '<div class="relative shrink-0 k-subscribe-btn-wrap"></div>'
      )

      const mount = () => {
        if (document.body.contains($wrap[0])) return

        $('.k-subscribe-btn-wrap').not($wrap).remove()
        const $followWrap = $('button')
          .filter((_, el) => $(el).text().trim().includes('追番'))
          .first()
          .parent()

        if ($followWrap.length) {
          $wrap.insertAfter($followWrap)
        } else {
          $('h1').first().closest('section').append($wrap)
        }
      }

      $btn.addClass(
        [
          'k-subscribe-btn',
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md',
          'font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-ring focus-visible:ring-offset-2',
          'focus-visible:ring-offset-background',
          'disabled:pointer-events-none disabled:opacity-50',
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
          'py-2 h-9 px-3.5 text-xs',
        ].join(' ')
      )
      $wrap.append($btn)

      mount()
      stopObserveSubscribeBtnMount?.()
      stopObserveSubscribeBtnMount = observeDomMutations(mount)
    },
  },
})

export function runInTop() {
  const disposeList: Dispose[] = [hideOriginPlayer(), mountParser()]
  subscribe.renderSubscribeBtn()

  return () => {
    stopObserveSubscribeBtnMount?.()
    stopObserveSubscribeBtnMount = undefined
    $('.k-subscribe-btn-wrap').remove()

    disposeList.forEach((dispose) => dispose())
  }
}

export function runInHome() {
  subscribe.renderSubscribedAnimes()
  return () => {
    stopObserveSubscribedListMount?.()
    stopObserveSubscribedListMount = undefined
    $('#subListContainer').remove()
  }
}

function mountParser() {
  const sessionId = ++currentParserSession

  void parser(() => sessionId !== currentParserSession)

  return () => {
    if (currentParserSession === sessionId) {
      currentParserSession++
    }
    if (!isPlayPage()) {
      destroyPlayer()
    }
  }
}

function cleanupInjectedPlayer() {
  document.querySelector(PLAYER_SELECTOR)?.remove()
}

function destroyPlayer() {
  startPlayHandler = undefined
  player?.destroy()
  player = undefined
  cleanupInjectedPlayer()
  document.body.classList.remove('widescreen')
}

function isPlayPage() {
  return PLAY_PATH_RE.test(window.location.pathname)
}

function hideOriginPlayer() {
  const cleanly = async () => {
    const video = document.querySelector<HTMLVideoElement>(
      '.art-video-player video'
    )
    if (!video) return
    video.pause()
    video.volume = 0
  }

  const id = setInterval(cleanly, 16)

  return () => clearInterval(id)
}

const API = {
  commonHeaders: <Record<string, string>>{
    'x-app-name': 'cyc_web',
    'x-app-version': 'cycweb',
    'x-time-zone': 'Asia/Hong_Kong',
  },
  ensureLogin: async () => {
    type Auth = {
      token: string
      expiresAt: string
    }

    const checkAuth = (auth: Auth | undefined): auth is Auth => {
      if (!auth) return false
      if (!auth.expiresAt) return false
      if (new Date(auth.expiresAt) <= new Date()) return false
      return true
    }

    const userAuth = local.getItem<Auth>('cycweb:auth:v2')
    if (checkAuth(userAuth)) {
      try {
        // 如果当前登录的账号是 ironuserscripts，则清除本地存储的登录信息，避免影响用户正常使用
        const payload = decodeJWT(userAuth.token)
        if (payload.username === DEFAULT_ACCOUNT.username) {
          delete API.commonHeaders.authorization
          local.removeItem('cycweb:auth:v2')
        } else {
          API.commonHeaders.authorization = userAuth.token
          // 直接返回，使用用户的登录信息
          return
        }
      } catch (error) {}
    }

    const userscriptsAuth = local.getItem<Auth>('agefans-enhance:auth:v2')
    if (checkAuth(userscriptsAuth)) {
      API.commonHeaders.authorization = userscriptsAuth.token
      return
    }

    type LoginResponse = {
      code: number
      msg: string
      data: {
        token: string
        expires_at: string
        user: {
          id: number
          username: string
          nickname: string
          email: string
          avatar_url: string
        }
      }
    }

    const res: LoginResponse = await fetch(`/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify(DEFAULT_ACCOUNT),
      headers: { ...API.commonHeaders, 'content-type': 'application/json' },
    }).then((res) => res.json())

    if (res.code !== 0) {
      alert(
        `[agefans-enhance] 脚本自动登录失败，请联系开发者解决。错误信息：${res.msg}`
      )
      return
    }

    // 将登录信息保存到本地存储中，供后续请求使用，并且不修改用户的登录状态
    local.setItem('agefans-enhance:auth:v2', {
      expiresAt: res.data.expires_at,
      token: res.data.token,
    } satisfies Auth)

    API.commonHeaders.authorization = res.data.token
  },
  getSctions: memoize(async (animeId: number) => {
    type Section = {
      id: number
      title: string
    }
    type SectionResponse = {
      code: number
      data: {
        list: Section[]
        pager: { page: number; page_size: number; total: number }
      }
      msg: string
    }

    const pageSize = 100
    const getSectionByPage = async (page: number) => {
      const res: SectionResponse = await fetch(
        `/api/videos/${animeId}/sections?player_code=cychub&page=${
          page + 1
        }&page_size=${pageSize}`,
        { headers: API.commonHeaders }
      ).then((res) => res.json())
      return res.data
    }

    const sections: { id: number; title: string }[] = []
    const firstPageData = await getSectionByPage(0)

    const pageCount = Math.ceil(
      firstPageData.pager.total / firstPageData.pager.page_size
    )
    sections.push(...firstPageData.list)

    if (pageCount > 1) {
      const promises = []
      for (let i = 1; i < pageCount; i++) {
        promises.push(getSectionByPage(i))
      }
      const results = await Promise.all(promises)
      results.forEach((data) => {
        sections.push(...data.list)
      })
    }

    return sections
  }),
  getVideoInfo: memoize(async (animeId: number) => {
    type VideoInfoResponse = {
      code: number
      msg: string
      data: {
        title: string
        cover_url: string
        remarks: string
        publish_date: string
      } | null
    }

    const res: VideoInfoResponse = await fetch(`/api/videos/${animeId}`, {
      headers: API.commonHeaders,
    }).then((res) => res.json())

    if (res.code !== 0 || !res.data) {
      throw new Error(`Failed to fetch anime info: ${res.msg}`)
    }
    return res.data
  }),

  getEpisodePlayUrl: async (episodeId: number) => {
    await API.ensureLogin()

    type PlayUrlResponse = {
      code: number
      data: { url: string; name: string }
      msg: string
    }
    const res: PlayUrlResponse = await fetch(
      `/api/v2/sections/${episodeId}/play-url`,
      { headers: API.commonHeaders }
    ).then((res) => res.json())
    return res.data
  },
}

function parsePageId() {
  const match = window.location.href.match(/\/anime\/(\d+)\/play\/(\d+)/)
  if (!match) throw new Error('Failed to parse animeId from URL')

  return {
    animeId: +match[1],
    episodeIndex: +match[2] - 1,
  }
}

async function initPlayer(
  isDisposed: () => boolean,
  onSwitchEpisode: (diff: number) => void
) {
  startPlayHandler = onSwitchEpisode

  if (player) return player

  const container = await queryDom('.relative.aspect-video')
  if (isDisposed()) return

  cleanupInjectedPlayer()

  const playerRoot = document.createElement('div')
  container.append(playerRoot)

  player = new KPlayer(playerRoot)
  player.on('prev', () => startPlayHandler?.(-1))
  player.on('next', () => startPlayHandler?.(1))
  player.on('canplay', () => {
    void subscribe.onCanPlay()
  })

  player.on('enterwidescreen', () => document.body.classList.add('widescreen'))
  player.on('exitwidescreen', () =>
    document.body.classList.remove('widescreen')
  )

  return player
}

async function parser(isDisposed: () => boolean) {
  try {
    const startPlay = async (diff: number) => {
      if (isDisposed()) return

      const { episodeIndex } = parsePageId()

      const nextIdx = episodeIndex + diff
      if (nextIdx >= 0 && nextIdx < sections.length) {
        const episode = sections[nextIdx]

        if (diff !== 0) {
          // 如果是切换集数，直接点击对应的集数按钮，后续由路由变化产生改变
          const target = $<HTMLElement>(`[title="${episode.title}"]`)[0]
          if (target) target.click()
          return
        }

        const episodeId = episode.id
        const playUrlData = await API.getEpisodePlayUrl(episodeId)
        if (isDisposed()) return
        if (!player) return
        player.src = playUrlData.url
      }
    }

    const nextPlayer = await initPlayer(isDisposed, startPlay)
    if (isDisposed()) return
    player = nextPlayer
    if (!player) return

    const { animeId } = parsePageId()
    const sections = await API.getSctions(animeId)
    if (isDisposed()) return

    startPlay(0)
  } catch (error) {
    if (isDisposed()) return
    player?.message.info('页面初始化失败了，请刷新页面重新尝试')
  }
}
