import { memoize } from 'lodash-es'
import { KPlayer } from '../../player'
import { queryDom } from '../../utils/queryDom'
import { local } from '../../utils/storage'

type Dispose = () => void

const PLAYER_SELECTOR = '#k-player-wrapper'
const PLAY_PATH_RE = /\/anime\/\d+\/play\/\d+/

let currentParserSession = 0
let player: KPlayer | undefined
let startPlayHandler: ((diff: number) => void) | undefined

export function runInTop() {
  const disposeList: Dispose[] = [hideOriginPlayer(), mountParser()]

  return () => disposeList.forEach((dispose) => dispose())
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
    document.body.classList.remove('widescreen')
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
  randomUUID: () => {
    try {
      if (
        typeof crypto !== 'undefined' &&
        typeof crypto.randomUUID == 'function'
      )
        return crypto.randomUUID()
    } catch {}
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  },
  commonHeaders: <Record<string, string>>{
    'x-app-name': 'cyc_web',
    'x-app-version': 'cycweb',
    'x-time-zone': 'Asia/Hong_Kong',
  },
  ensureLogin: async () => {
    type Auth = {
      version: number
      scope: string
      token: string
      expiresAt: string
    }

    const auth = local.getItem<Auth>('cycweb:auth:v2')

    if (auth && auth.expiresAt && new Date(auth.expiresAt) > new Date()) {
      API.commonHeaders['authorization'] = auth.token
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
      body: JSON.stringify({
        username: 'ironuserscripts',
        password: 'U5PXEp.vc.LTj3',
      }),
      headers: { ...API.commonHeaders, 'content-type': 'application/json' },
    }).then((res) => res.json())

    if (res.code !== 0) {
      alert(
        `[agefans-enhance] 脚本自动登录失败，请联系开发者解决。错误信息：${res.msg}`
      )
      return
    }

    local.setItem('cycweb:auth:v2', <Auth>{
      version: 2,
      scope: API.randomUUID(),
      expiresAt: res.data.expires_at,
      token: res.data.token,
    })

    API.commonHeaders['authorization'] = res.data.token
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
