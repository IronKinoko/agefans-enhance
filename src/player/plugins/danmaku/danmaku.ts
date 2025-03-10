import Danmaku from '@ironkinoko/danmaku'
import { runtime } from '../../../runtime'
import { defaultConfig, KPlayer } from '../../Kplayer'
import { Shortcuts } from '../shortcuts'
import { getComments, queryAnimes, queryEpisodes } from './apis'
import { createDanmakuList } from './danmakuList'
import { createFilter } from './filter'
import { $danmaku, $danmakuContainer, $danmakuSwitch, $pbp } from './html'
import './index.scss'
import { parsePakkuDanmakuXML } from './parser'
import { createProgressBarPower } from './progressBarPower'
import { Anime, Commands, Comment, Episode } from './types'
import {
  addRangeListener,
  getCheckboxGroupValue,
  setCheckboxGroupValue,
  storageAnimeName,
  storageEpisodeName,
} from './utils'

type DanmakuMode = ('top' | 'bottom' | 'color')[]
interface DanmakuConfig {
  showDanmaku: boolean
  opacity: number
  showPbp: boolean
  danmakuOverlap: boolean
  danmakuMerge: boolean
  danmakuFontSize: number
  danmakuSpeed: number
  danmakuDensity: number
  danmakuMode: DanmakuMode
  danmakuFilter: string[]
  danmakuScrollAreaPercent: number
  danmakuSourceDisabledList: string[]
}
declare module '../../KPlayer' {
  interface LocalConfig extends DanmakuConfig {}
}

Object.assign(defaultConfig, {
  showDanmaku: false,
  opacity: 0.6,
  showPbp: false,
  danmakuSpeed: 1,
  danmakuFontSize: 1,
  danmakuMode: ['top', 'color'],
  danmakuFilter: [],
  danmakuScrollAreaPercent: 1,
  danmakuMerge: false,
  danmakuDensity: 1,
  danmakuOverlap: false,
  danmakuSourceDisabledList: [],
} as DanmakuConfig)

enum State {
  unSearched,
  searchedAnimes,
  findEpisodes,
  getComments,
}

const baseDanmkuSpeed = 130
let state = State.unSearched

const $animeName = $danmaku.find('#animeName')
const $animes = $danmaku.find('#animes')
const $episodes = $danmaku.find('#episodes')
const $openDanmakuList = $danmaku.find('.open-danmaku-list')
const $tips = $danmaku.find('#tips')

const $showDanmaku = $danmaku.find<HTMLInputElement>("[name='showDanmaku']")
const $showPbp = $danmaku.find<HTMLInputElement>("[name='showPbp']")
const $danmakuMerge = $danmaku.find<HTMLInputElement>("[name='danmakuMerge']")
const $danmakuOverlap = $danmaku.find<HTMLInputElement>(
  "[name='danmakuOverlap']"
)
const $opacity = $danmaku.find<HTMLInputElement>("[name='opacity']")
const $danmakuSpeed = $danmaku.find<HTMLInputElement>("[name='danmakuSpeed']")
const $danmakuFontSize = $danmaku.find<HTMLInputElement>(
  "[name='danmakuFontSize']"
)
const $danmakuDensity = $danmaku.find<HTMLInputElement>(
  "[name='danmakuDensity']"
)
const $danmakuScrollAreaPercent = $danmaku.find<HTMLInputElement>(
  "[name='danmakuScrollAreaPercent']"
)

const $danmakuMode = $danmaku.find<HTMLInputElement>("[name='danmakuMode']")

let core: Danmaku | undefined
let animes: Anime[] = []
let episodes: Episode[] = []
let comments: Comment[] | undefined
let player: KPlayer
let videoInfo: NonNullable<
  Awaited<ReturnType<typeof runtime.getCurrentVideoNameAndEpisode>>
>
let syncDiff = 0

function refreshDanmaku() {
  stop()
  autoStart()
}

const showTips = (message: string, duration = 1500) => {
  $tips.text(message).fadeIn('fast').delay(duration).fadeOut('fast')
}

const stop = () => {
  core?.hide()
}

const start = () => {
  function run() {
    if (!player.media.duration) return requestAnimationFrame(run)
    if (!comments) return

    const nextComments = adjustCommentCount(comments)
    $openDanmakuList
      .find('[data-id="count"]')
      .text(`(${nextComments.length}/${comments.length})`)
    if (player.localConfig.showDanmaku) {
      if (!core) {
        core = new Danmaku({
          container: $danmakuContainer[0],
          media: player.media,
          comments: nextComments,
          merge: player.localConfig.danmakuMerge,
          scrollAreaPercent: player.localConfig.danmakuScrollAreaPercent,
          overlap: player.localConfig.danmakuOverlap,
        })
      } else {
        core.reload(nextComments)
        core.show()
      }
      core.speed = baseDanmkuSpeed * player.localConfig.danmakuSpeed
    }

    if (player.localConfig.showPbp) {
      createProgressBarPower(player.media.duration, nextComments)
    }
  }
  requestAnimationFrame(run)
}

const adjustCommentCount = (comments: Comment[]) => {
  let ret: Comment[] = comments
  // 过滤弹幕
  ret = ret.filter((cmt) => {
    const isFilterMatch = player.localConfig.danmakuFilter.some((filter) => {
      if (/^\/.*\/$/.test(filter)) {
        const re = new RegExp(filter.slice(1, -1))
        return re.test(cmt.text!)
      } else {
        return cmt.text!.includes(filter)
      }
    })
    return !isFilterMatch
  })

  ret = ret.filter((cmt) => {
    const isDisabledSource =
      player.localConfig.danmakuSourceDisabledList.includes(cmt.user.source)
    return !isDisabledSource
  })

  // 过滤弹幕类型
  const mode = player.localConfig.danmakuMode
  if (!mode.includes('color')) {
    ret = ret.filter(
      (cmt) => (cmt.style as CSSStyleDeclaration)!.color === '#ffffff'
    )
  }
  if (!mode.includes('bottom')) {
    ret = ret.filter((cmt) => cmt.mode !== 'bottom')
  }
  if (!mode.includes('top')) {
    ret = ret.filter((cmt) => cmt.mode !== 'top')
  }

  // 24 分钟 3000 弹幕，按比例缩放
  const maxLength = Math.round(
    (3000 / (24 * 60)) *
      player.media.duration *
      player.localConfig.danmakuDensity
  )
  // 均分
  if (ret.length > maxLength) {
    let ratio = ret.length / maxLength

    ret = [...new Array(maxLength)].map((_, i) => ret![Math.floor(i * ratio)])
  }

  return ret
}

const loadEpisode = async (episodeId: string) => {
  stop()
  comments = await getComments(episodeId)
  syncDiff = 0
  state = State.getComments
  start()

  player.message.info(`番剧：${$animes.find(':selected').text()}`, 2000)
  player.message.info(`章节：${$episodes.find(':selected').text()}`, 2000)
  player.message.info(`已加载 ${comments.length} 条弹幕`, 2000)
}

const searchAnime = async (name: string) => {
  if (!name || name.length < 2) return showTips('番剧名称不少于2个字')

  try {
    animes = []
    episodes = []
    renderSelectOptions($animes, animes)
    renderSelectOptions($episodes, episodes)
    showTips('正在搜索番剧中...')
    animes = await queryAnimes(name)
    if (animes.length === 0) return showTips('未搜索到番剧')
    renderSelectOptions($animes, animes)
    showTips(`找到 ${animes.length} 部番剧`)

    state = State.searchedAnimes
    autoMatchAnime()
  } catch (error: any) {
    showTips('弹幕服务异常，' + error.message, 3000)
  }
}

const searchEpisodes = async (animeId: string) => {
  try {
    episodes = []
    renderSelectOptions($episodes, episodes)
    showTips('正在搜索剧集中...')
    episodes = await queryEpisodes(animeId)
    if (episodes.length === 0) return showTips('未搜索到剧集')
    renderSelectOptions($episodes, episodes)
    showTips(`找到 ${episodes.length} 集`)

    state = State.findEpisodes
    autoMatchEpisode()
  } catch (error: any) {
    showTips('弹幕服务异常，' + error.message, 3000)
  }
}

function autoMatchAnime() {
  let anime = animes.find((anime) => {
    const storeAnime = storageAnimeName(videoInfo.rawName)
    if (storeAnime) {
      return anime.id === storeAnime.id
    }

    return anime.name === videoInfo.rawName
  })

  if (!anime) {
    player.message.info('弹幕未能自动匹配数据源，请手动搜索')
    anime = animes[0]
  }

  $animes.val(anime.id)
  $animes.trigger('change')
}

const autoMatchEpisode = async () => {
  let episodeName = videoInfo.episode
  let episode: Episode | undefined

  let storedEpisodeId = storageEpisodeName(
    `${videoInfo.rawName}.${videoInfo.episode}`
  )
  if (storedEpisodeId) {
    episode = episodes.find((episode) => String(episode.id) === storedEpisodeId)
  }
  if (!episode && !isNaN(+episodeName)) {
    episode = episodes.find((episode) =>
      new RegExp(`${episodeName}[话集]`).test(episode.name)
    )
    if (!episode) {
      episode = episodes.find((episode) => episode.name.includes(episodeName))
    }
  }
  if (episode) {
    $episodes.val(episode.id)
    $episodes.trigger('change')
  } else {
    player.message.info('弹幕未能自动匹配数据源，请手动搜索')
  }
}

const injectDanmakuDropEvent = () => {
  player.onDrop((e) => {
    e.preventDefault()
    const file = e.dataTransfer?.files[0]

    if (file?.type === 'text/xml') {
      const reader = new FileReader()
      reader.onload = async () => {
        stop()
        comments = parsePakkuDanmakuXML(reader.result as string)
        syncDiff = 0
        state = State.getComments
        start()

        player.message.info(`已加载 ${comments.length} 条弹幕`, 2000)
      }
      reader.readAsText(file)
    }
  })
}

const initEvents = (name: string) => {
  $animeName.val(name)
  $animeName.on('keypress', (e) => {
    if (e.key === 'Enter') searchAnime($animeName.val() as string)
  })
  $animeName.on('blur', (e) => {
    searchAnime($animeName.val() as string)
  })

  $animes.on('change', (e) => {
    const animeId = $animes.val() as string
    const anime = animes.find((anime) => anime.id === animeId)
    if (!anime) return
    storageAnimeName(videoInfo.rawName, {
      id: anime.id,
      name: anime.name,
      keyword: $animeName.val() as string,
    })
    searchEpisodes(anime.id)
  })
  $episodes.on('change', (e) => {
    const episodeId = $episodes.val() as string
    const animeId = $animes.val() as string
    const anime = animes.find((anime) => anime.id === animeId)
    if (!anime) return

    storageAnimeName(videoInfo.rawName, {
      id: anime.id,
      name: anime.name,
      keyword: $animeName.val() as string,
    })
    storageEpisodeName(`${videoInfo.rawName}.${videoInfo.episode}`, episodeId)
    loadEpisode(episodeId)
  })

  $danmakuSwitch
    .toggleClass('plyr__control--pressed', player.localConfig.showDanmaku)
    .on('click', () => {
      switchDanmaku()
    })

  const resizeOb = new ResizeObserver(() => {
    core?.resize()
  })
  resizeOb.observe($danmakuContainer[0])

  const mutationOb = new MutationObserver(async () => {
    Object.assign(videoInfo, await runtime.getCurrentVideoNameAndEpisode())
    state = State.searchedAnimes
    autoStart()
  })

  mutationOb.observe(player.media, { attributeFilter: ['src'] })

  player.initInputEvent()

  $showDanmaku
    .prop('checked', player.localConfig.showDanmaku)
    .on('change', (e) => {
      switchDanmaku(e.target.checked)
    })

  // 绑定 pbp 相关事件
  $showPbp.prop('checked', player.localConfig.showPbp).on('change', (e) => {
    const chekced = e.target.checked
    $pbp.toggle(chekced)
    player.configSaveToLocal('showPbp', chekced)
    if (chekced) autoStart()
  })
  $pbp.toggle(player.localConfig.showPbp || false)
  const $pbpPlayed = $pbp.find('#k-player-pbp-played-path')
  player.on('timeupdate', () => {
    $pbpPlayed.attr(
      'width',
      (player.currentTime / player.plyr.duration || 0) * 100 + '%'
    )
  })

  $danmakuMerge
    .prop('checked', player.localConfig.danmakuMerge)
    .on('change', (e) => {
      const chekced = e.target.checked
      player.configSaveToLocal('danmakuMerge', chekced)
      if (core) core.merge = chekced
    })

  $danmakuOverlap
    .prop('checked', player.localConfig.danmakuOverlap)
    .on('change', (e) => {
      const chekced = e.target.checked
      player.configSaveToLocal('danmakuOverlap', chekced)
      if (core) core.overlap = chekced
    })

  addRangeListener({
    $dom: $opacity,
    name: 'opacity',
    onInput: (v) => {
      $danmakuContainer.css({ opacity: v })
    },
    player,
  })

  addRangeListener({
    $dom: $danmakuFontSize,
    name: 'danmakuFontSize',
    onInput: (v) => {
      $danmakuContainer.css('--danmaku-font-size-scale', v)
    },
    player,
  })

  addRangeListener({
    $dom: $danmakuSpeed,
    name: 'danmakuSpeed',
    onChange: (v) => {
      if (core) core.speed = baseDanmkuSpeed * v
    },
    player,
  })

  addRangeListener({
    $dom: $danmakuDensity,
    name: 'danmakuDensity',
    onChange: refreshDanmaku,
    player,
  })
  addRangeListener({
    $dom: $danmakuScrollAreaPercent,
    name: 'danmakuScrollAreaPercent',
    onChange: (val) => {
      if (core) core.scrollAreaPercent = val
    },
    player,
  })

  setCheckboxGroupValue($danmakuMode, player.localConfig.danmakuMode)
  $danmakuMode.on('change', () => {
    const modes = getCheckboxGroupValue($danmakuMode)
    player.configSaveToLocal('danmakuMode', modes as DanmakuMode)
    if (core) {
      refreshDanmaku()
    }
  })

  createFilter(player, refreshDanmaku)

  createDanmakuList(player, () => comments, refreshDanmaku)

  injectDanmakuDropEvent()
}

function switchDanmaku(bool?: boolean) {
  bool ??= !player.localConfig.showDanmaku

  player.configSaveToLocal('showDanmaku', bool)
  $danmakuSwitch.toggleClass('plyr__control--pressed', bool)
  $showDanmaku.prop('checked', bool)
  player.message.info(`弹幕${bool ? '开启' : '关闭'}`)
  if (bool) {
    autoStart()
  } else {
    stop()
  }
}

Shortcuts.keyBindings.registerKeyBinding({
  command: Commands.danmakuSwitch,
  description: '显示/隐藏弹幕',
  key: 'D',
})
Shortcuts.registerCommand(Commands.danmakuSwitch, function () {
  switchDanmaku()
})
Shortcuts.keyBindings.registerKeyBinding({
  command: Commands.danmakuSyncBack,
  description: '弹幕滞后0.5s',
  key: ',',
})
Shortcuts.registerCommand(Commands.danmakuSyncBack, function () {
  if (!comments) return
  comments.forEach((comment) => {
    comment.time += 0.5
  })
  syncDiff += 0.5
  this.message.destroy()
  this.message.info(`弹幕同步：滞后了0.5s（${syncDiff}s）`)
  refreshDanmaku()
})
Shortcuts.keyBindings.registerKeyBinding({
  command: Commands.danmakuSyncForward,
  description: '弹幕超前0.5s',
  key: '.',
})
Shortcuts.registerCommand(Commands.danmakuSyncForward, function () {
  if (!comments) return
  comments.forEach((comment) => {
    comment.time += -0.5
  })
  syncDiff += -0.5
  this.message.destroy()
  this.message.info(`弹幕同步：超前了0.5s（${syncDiff}s）`)
  refreshDanmaku()
})
Shortcuts.keyBindings.registerKeyBinding({
  command: Commands.danmakuSyncRestore,
  description: '弹幕同步复位',
  key: '/',
})
Shortcuts.registerCommand(Commands.danmakuSyncRestore, function () {
  if (!comments) return
  comments.forEach((comment) => {
    comment.time += -syncDiff
  })
  syncDiff = 0
  this.message.destroy()
  this.message.info('弹幕同步：已复位')
  refreshDanmaku()
})

// 更新 anime select
const renderSelectOptions = (target: JQuery, options: (Anime | Episode)[]) => {
  const html = options.reduce(
    (html, option) =>
      html + `<option value="${option.id}">${option.name}</option>`,
    ''
  )
  target.html(html)
}

function autoStart() {
  if (!(player.localConfig.showDanmaku || player.localConfig.showPbp)) return

  switch (state) {
    case State.unSearched:
      searchAnime($animeName.val() as string)
      break

    case State.searchedAnimes:
      searchEpisodes($animes.val() as string)
      break

    case State.findEpisodes:
      autoMatchEpisode()
      break

    case State.getComments:
      start()
      break
  }
}

export async function setup(_player: KPlayer) {
  player = _player
  const info = await runtime.getCurrentVideoNameAndEpisode()
  if (!info) return
  videoInfo = info

  player.$videoWrapper.append($danmakuContainer)
  $danmaku.insertBefore(player.$searchActions)
  $danmaku.before($danmakuSwitch)

  let defaultSearchName = storageAnimeName(videoInfo.rawName) || videoInfo.name
  initEvents(
    typeof defaultSearchName === 'object'
      ? defaultSearchName.keyword
      : defaultSearchName
  )
  autoStart()
}
