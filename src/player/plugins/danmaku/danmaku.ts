import Danmaku, { Comment } from '@ironkinoko/danmaku'
import { runtime } from '../../../runtime'
import { Shortcuts } from '../shortcuts'
import { defaultConfig, KPlayer } from '../../Kplayer'
import { getComments, searchAnimeWithEpisode } from './apis'
import { $danmaku, $danmakuContainer, $pbp, $danmakuSwitch } from './html'
import './index.scss'
import { createProgressBarPower } from './progressBarPower'
import { Anime, Commands, Episode } from './types'
import {
  addRangeListener,
  episodeIdLock,
  getCheckboxGroupValue,
  searchAnimeLock,
  setCheckboxGroupValue,
  storageAnimeName,
  storageEpisodeName,
} from './utils'
import { createFilter } from './filter'

type DanmakuMode = ('top' | 'bottom' | 'color')[]
interface DanmakuConfig {
  showDanmaku: boolean
  opacity: number
  showPbp: boolean
  merge: boolean
  danmakuFontSize: number
  danmakuSpeed: number
  danmakuDensity: number
  danmakuMode: DanmakuMode
  danmakuFilter: string[]
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
})

enum State {
  unSearched,
  searched,
  findEpisode,
  getComments,
}

const baseDanmkuSpeed = 130
const baseFontSize = 24
let state = State.unSearched

const $animeName = $danmaku.find('#animeName')
const $animes = $danmaku.find('#animes')
const $episodes = $danmaku.find('#episodes')
const $tips = $danmaku.find('#tips')

const $danmakuSwitcher = $danmakuSwitch.find('.k-switch-input')
const $showDanmaku = $danmaku.find<HTMLInputElement>("[name='showDanmaku']")
const $showPbp = $danmaku.find<HTMLInputElement>("[name='showPbp']")
const $merge = $danmaku.find<HTMLInputElement>("[name='merge']")
const $opacity = $danmaku.find<HTMLInputElement>("[name='opacity']")
const $danmakuSpeed = $danmaku.find<HTMLInputElement>("[name='danmakuSpeed']")
const $danmakuFontSize = $danmaku.find<HTMLInputElement>(
  "[name='danmakuFontSize']"
)
const $danmakuDensity = $danmaku.find<HTMLInputElement>(
  "[name='danmakuDensity']"
)

const $danmakuMode = $danmaku.find<HTMLInputElement>("[name='danmakuMode']")

let core: Danmaku | undefined
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
    if (player.localConfig.showDanmaku) {
      if (!core) {
        core = new Danmaku({
          container: $danmakuContainer[0],
          media: player.media,
          comments: adjustCommentCount(comments),
          merge: player.localConfig.merge,
        })
      } else {
        core.reload(adjustCommentCount(comments))
        core.show()
      }
      core.speed = baseDanmkuSpeed * player.localConfig.danmakuSpeed
    }

    if (player.localConfig.showPbp) {
      createProgressBarPower(
        player.media.duration,
        adjustCommentCount(comments)
      )
    }
  }
  requestAnimationFrame(run)
}

const adjustCommentCount = (comments: Comment[]) => {
  let ret: Comment[] = comments
  // 过滤弹幕
  ret = ret.filter(
    (cmt) =>
      !player.localConfig.danmakuFilter.some((filter) => {
        if (/^\/.*\/$/.test(filter)) {
          const re = new RegExp(filter.slice(1, -1))
          return re.test(cmt.text!)
        } else {
          return cmt.text!.includes(filter)
        }
      })
  )

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
  if (episodeIdLock(episodeId)) return

  stop()
  comments = await getComments(episodeId)
  syncDiff = 0
  state = State.getComments
  start()

  player.message.info(`番剧：${$animes.find(':selected').text()}`, 2000)
  player.message.info(`章节：${$episodes.find(':selected').text()}`, 2000)
  player.message.info(`已加载 ${comments.length} 条弹幕`, 2000)
}

const searchAnime = async (name?: string) => {
  state = State.searched

  name ||= $animeName.val() as string
  if (!name || name.length < 2) return showTips('番剧名称不少于2个字')
  if (searchAnimeLock(name)) return

  try {
    const animes = await searchAnimeWithEpisode(name)
    if (animes.length === 0) return showTips('未搜索到番剧')
    updateAnimes(animes)
    findEpisode(animes)
  } catch (error) {
    showTips('弹幕服务异常，稍后再试', 3000)
  }
}

const findEpisode = async (animes?: Anime[]) => {
  if (!animes) return
  const anime = animes.find((anime) => {
    const storeAnime = storageAnimeName(videoInfo.rawName)
    if (typeof storeAnime === 'object') {
      return anime.animeId === storeAnime.animeId
    }

    return anime.animeTitle === (storeAnime || videoInfo.rawName)
  })

  if (anime) {
    let episodeName = videoInfo.episode
    let episode: Episode | undefined

    let storedEpisodeId = storageEpisodeName(
      `${videoInfo.rawName}.${videoInfo.episode}`
    )
    if (storedEpisodeId) {
      episode = anime.episodes.find(
        (episode) => String(episode.episodeId) === storedEpisodeId
      )
    }
    if (!episode && !isNaN(+episodeName)) {
      episode = anime.episodes.find((episode) =>
        episode.episodeTitle.includes(episodeName)
      )
    }
    if (episode) {
      state = State.findEpisode
      $animeName.val(anime.animeTitle)
      $animes.val(anime.animeId)
      $animes.trigger('change')
      $episodes.val(episode.episodeId)
      $episodes.trigger('change')
      return
    }
  }
  player.message.info('弹幕未能自动匹配数据源，请手动搜索')
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
    const animeId = $(e.target).val() as string
    const animes: Anime[] = $animes.data('animes')
    const anime = animes.find((anime) => String(anime.animeId) === animeId)
    if (!anime) return
    storageAnimeName(videoInfo.rawName, {
      animeId: anime.animeId,
      animeTitle: anime.animeTitle,
    })
    updateEpisodes(anime)
  })
  $episodes.on('change', (e) => {
    const episodeId = $(e.target).val() as string
    const anime = $episodes.data('anime')
    storageAnimeName(videoInfo.rawName, {
      animeId: anime.animeId,
      animeTitle: anime.animeTitle,
    })
    storageEpisodeName(`${videoInfo.rawName}.${videoInfo.episode}`, episodeId)
    loadEpisode(episodeId)
  })

  $danmakuSwitcher
    .prop('checked', player.localConfig.showDanmaku)
    .on('click', () => {
      switchDanmaku()
    })

  const resizeOb = new ResizeObserver(() => {
    core?.resize()
  })
  resizeOb.observe(player.$videoWrapper[0])

  const mutationOb = new MutationObserver(async () => {
    searchAnimeLock(Math.random())
    Object.assign(videoInfo, await runtime.getCurrentVideoNameAndEpisode())
    state = State.searched
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

  $merge.prop('checked', player.localConfig.merge).on('change', (e) => {
    const chekced = e.target.checked
    $pbp.toggle(chekced)
    player.configSaveToLocal('merge', chekced)
    if (core) core.merge = chekced
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
      $danmakuContainer.css('--danmaku-font-size', baseFontSize * v + 'px')
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

  setCheckboxGroupValue($danmakuMode, player.localConfig.danmakuMode)
  $danmakuMode.on('change', () => {
    const modes = getCheckboxGroupValue($danmakuMode)
    player.configSaveToLocal('danmakuMode', modes as DanmakuMode)
    if (core) {
      refreshDanmaku()
    }
  })

  createFilter(player, refreshDanmaku)
}

function switchDanmaku(bool?: boolean) {
  bool ??= !player.localConfig.showDanmaku

  player.configSaveToLocal('showDanmaku', bool)
  $danmakuSwitcher.prop('checked', bool)
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
const updateAnimes = (animes: Anime[]) => {
  const html = animes.reduce(
    (html, anime) =>
      html + `<option value="${anime.animeId}">${anime.animeTitle}</option>`,
    ''
  )
  $animes.data('animes', animes)
  $animes.html(html)
  updateEpisodes(animes[0])
  showTips(`找到 ${animes.length} 部番剧`)
}

// 更新 episode select
const updateEpisodes = (anime: Anime) => {
  const { episodes } = anime
  const html = episodes.reduce(
    (html, episode) =>
      html +
      `<option value="${episode.episodeId}">${episode.episodeTitle}</option>`,
    ''
  )

  $episodes.data('anime', anime)
  $episodes.html(html)

  $episodes.val('')
}

function autoStart() {
  if (!(player.localConfig.showDanmaku || player.localConfig.showPbp)) return

  switch (state) {
    case State.unSearched:
      searchAnime()
      break

    case State.searched:
      findEpisode($animes.data('animes'))
      break

    case State.findEpisode:
      $episodes.trigger('change')
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

  let defaultSearchName = storageAnimeName(videoInfo.rawName) || videoInfo.name
  initEvents(
    typeof defaultSearchName === 'object'
      ? defaultSearchName.animeTitle
      : defaultSearchName
  )
  autoStart()
}
