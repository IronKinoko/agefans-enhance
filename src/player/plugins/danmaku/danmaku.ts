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
let state = State.unSearched

const $animeName = $danmaku.find('#animeName')
const $animes = $danmaku.find('#animes')
const $episodes = $danmaku.find('#episodes')
const $tips = $danmaku.find('#tips')

const $danmakuSwitcher = $danmakuSwitch.find('.k-switch-input')
const $showDanmaku = $danmaku.find<HTMLInputElement>("[name='showDanmaku']")
const $showPbp = $danmaku.find<HTMLInputElement>("[name='showPbp']")
const $opacity = $danmaku.find<HTMLInputElement>("[name='opacity']")
const $danmakuSpeed = $danmaku.find<HTMLInputElement>("[name='danmakuSpeed']")
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

function refreshDanmaku() {
  stop()
  autoStart()
}

const showTips = (message: string) => {
  $tips.text(message).fadeIn('fast').delay(1500).fadeOut('fast')
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
  // ????????????
  ret = ret.filter(
    (cmt) =>
      !player.localConfig.danmakuFilter.some((filter) => {
        if (/^\/.*\/$/.test(filter)) {
          const re = new RegExp(filter.slice(1, -1))
          return re.test(cmt.text)
        } else {
          return cmt.text.includes(filter)
        }
      })
  )

  // ??????????????????
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

  // 24 ?????? 3000 ????????????????????????
  const maxLength = Math.round(
    (3000 / (24 * 60)) *
      player.media.duration *
      player.localConfig.danmakuDensity
  )
  // ??????
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

  state = State.getComments
  start()

  player.message.info(`?????????${$animes.find(':selected').text()}`, 2000)
  player.message.info(`?????????${$episodes.find(':selected').text()}`, 2000)
  player.message.info(`????????? ${comments.length} ?????????`, 2000)
}

const searchAnime = async (name?: string) => {
  state = State.searched

  name ||= $animeName.val() as string
  if (!name || name.length < 2) return showTips('?????????????????????2??????')
  if (searchAnimeLock(name)) return

  const animes = await searchAnimeWithEpisode(name)
  if (animes.length === 0) return showTips('??????????????????')
  updateAnimes(animes)
  findEpisode(animes)
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
  player.message.info('???????????????????????????????????????????????????')
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

  // ?????? pbp ????????????
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

  addRangeListener({
    $dom: $opacity,
    name: 'opacity',
    onInput: (v) => {
      $danmakuContainer.css({ opacity: v })
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
  player.message.info(`??????${bool ? '??????' : '??????'}`)
  if (bool) {
    autoStart()
  } else {
    stop()
  }
}

Shortcuts.keyBindings.registerKeyBinding({
  command: Commands.switchDanmaku,
  description: '??????/????????????',
  key: 'D',
})
Shortcuts.registerCommand(Commands.switchDanmaku, function () {
  switchDanmaku()
})

// ?????? anime select
const updateAnimes = (animes: Anime[]) => {
  const html = animes.reduce(
    (html, anime) =>
      html + `<option value="${anime.animeId}">${anime.animeTitle}</option>`,
    ''
  )
  $animes.data('animes', animes)
  $animes.html(html)
  updateEpisodes(animes[0])
  showTips(`?????? ${animes.length} ?????????`)
}

// ?????? episode select
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
