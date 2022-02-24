import Danmaku, { Comment } from '@ironkinoko/danmaku'
import { KPlayer } from '../..'
import { runtime } from '../../../runtime'
import { keybind } from '../../../utils/keybind'
import { getComments, searchAnimeWithEpisode } from './apis'
import { $danmaku, $danmakuContainer } from './html'
import './index.scss'
import { Anime, Episode } from './types'
import {
  episodeIdLock,
  searchAnimeLock,
  storageAnimeName,
  storageEpisodeName,
} from './utils'

declare module '../..' {
  interface LocalConfig {
    showDanmaku?: boolean
  }
}

enum State {
  unSearched,
  searched,
  findEpisode,
  getComments,
}

let state = State.unSearched

const $animeName = $danmaku.find('#animeName')
const $animes = $danmaku.find('#animes')
const $episodes = $danmaku.find('#episodes')
const $tips = $danmaku.find('#tips')

const $showDanmaku = $danmaku.find<HTMLInputElement>("[name='showDanmaku']")
const $opacity = $danmaku.find("[name='opacity']")

let core: Danmaku | undefined
let comments: Comment[] | undefined
let player: KPlayer
let videoInfo: NonNullable<
  Awaited<ReturnType<typeof runtime.getCurrentVideoNameAndEpisode>>
>

const showTips = (message: string) => {
  $tips.text(message).fadeIn('fast').delay(1500).fadeOut('fast')
}

const stop = () => {
  core?.destroy()
  core = undefined
}

const start = () => {
  core = new Danmaku({
    container: $danmakuContainer[0],
    media: player.$video[0],
    comments: adjustCommentCount(comments),
  })
  core.speed = 130
}

const adjustCommentCount = (comments?: Comment[]) => {
  if (!comments) return
  let ret: Comment[] = comments

  // 24 分钟 3000 弹幕，按比例缩放
  const maxLength = Math.round((3000 / (24 * 60)) * player.$video[0].duration)
  // 均分
  if (comments.length > maxLength) {
    let ratio = comments.length / maxLength

    ret = [...new Array(maxLength)].map(
      (_, i) => comments![Math.floor(i * ratio)]
    )
  }
  return ret
}

const loadEpisode = async (episodeId: string) => {
  if (!player.localConfig.showDanmaku) return
  if (episodeIdLock(episodeId)) return

  stop()
  comments = await getComments(episodeId)

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

  const animes = await searchAnimeWithEpisode(name)
  if (animes.length === 0) return showTips('未搜索到番剧')
  updateAnimes(animes)
  findEpisode(animes)
}

const findEpisode = async (animes?: Anime[]) => {
  if (!animes) return
  const anime = animes.find(
    (anime) =>
      anime.animeTitle ===
      (storageAnimeName(videoInfo.rawName) || videoInfo.rawName)
  )

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
  $animes.on('change', (e) => {
    const animeId = $(e.target).val() as string
    const animes: Anime[] = $animes.data('animes')
    const anime = animes.find((anime) => String(anime.animeId) === animeId)
    if (!anime) return
    storageAnimeName(videoInfo.rawName, anime.animeTitle)
    updateEpisodes(anime)
  })
  $episodes.on('change', (e) => {
    const episodeId = $(e.target).val() as string
    storageEpisodeName(`${videoInfo.rawName}.${videoInfo.episode}`, episodeId)
    loadEpisode(episodeId)
  })

  const resizeOb = new ResizeObserver(() => {
    core?.resize()
  })
  resizeOb.observe(player.$videoWrapper[0])

  const mutationOb = new MutationObserver(async () => {
    searchAnimeLock(Math.random())
    Object.assign(videoInfo, await runtime.getCurrentVideoNameAndEpisode())
    const animes = $animes.data('animes')
    if (animes) findEpisode(animes)
  })

  mutationOb.observe(player.$video[0], { attributeFilter: ['src'] })

  // 绑定快捷键
  keybind(['d'], () => switchDanmaku())

  $showDanmaku
    .prop('checked', player.localConfig.showDanmaku)
    .on('change', (e) => {
      switchDanmaku(e.target.checked)
    })

  // 重新绑定 input 效果
  player.initInputEvent()

  // 绑定 Opacity 效果
  const setOpacityStyle = () => {
    const opacity = parseFloat($opacity.val() as string)
    $opacity.css('--value', parseFloat($opacity.val() as string) * 100 + '%')
    $danmakuContainer.css({ opacity })
  }
  setOpacityStyle()
  $opacity.on('input', setOpacityStyle)
}

function switchDanmaku(bool?: boolean) {
  bool ??= !player.localConfig.showDanmaku

  player.configSaveToLocal('showDanmaku', bool)
  $showDanmaku.prop('checked', bool)
  player.message.info(`弹幕${bool ? '开启' : '关闭'}`)
  if (bool) {
    autoStart()
  } else {
    stop()
  }
}

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
  $danmaku.insertBefore(player.$speed)

  let defaultSearchName = storageAnimeName(videoInfo.rawName) || videoInfo.name
  initEvents(defaultSearchName)

  if (player.localConfig.showDanmaku) searchAnime()
}
