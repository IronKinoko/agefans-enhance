import Danmaku, { Comment } from '@ironkinoko/danmaku'
import { KPlayer } from '../..'
import { runtime } from '../../../runtime'
import { keybind } from '../../../utils/keybind'
import { getComments, searchAnimeWithEpisode } from './apis'
import { $danmaku, $danmakuContainer } from './html'
import { Anime, Episode } from './types'
import {
  episodeIdLock,
  searchAnimeLock,
  storageAnimeName,
  storageEpisodeName,
} from './utils'

let videoInfo: {
  name: string
  rawName: string
  episode: string
}

let player: KPlayer

const $animeName = $danmaku.find('#animeName')
const $animes = $danmaku.find('#animes')
const $episodes = $danmaku.find('#episodes')
const $tips = $danmaku.find('#tips')

let core: Danmaku | undefined
let comments: Comment[] | undefined

const showTips = (message: string) => {
  $tips.text(message).fadeIn('fast').delay(1500).fadeOut('fast')
}

const stop = () => {
  core?.destroy()
  core = undefined
}

const start = () => {
  if (!comments) return
  core = new Danmaku({
    container: $danmakuContainer[0],
    media: player.$video[0],
    comments,
  })
}

const loadEpisode = async (episodeId: string) => {
  if (episodeIdLock(episodeId)) return

  stop()

  comments = await getComments(episodeId)

  // 24 分钟 3000 弹幕，按比例缩放
  const maxLength = Math.round((3000 / (24 * 60)) * player.$video[0].duration)
  // 均分
  if (comments.length > maxLength) {
    let ratio = comments.length / maxLength

    comments = [...new Array(maxLength)].map(
      (_, i) => comments![Math.floor(i * ratio)]
    )
  }

  start()

  player.message.info(`番剧：${$animes.find(':selected').text()}`, 2000)
  player.message.info(`章节：${$episodes.find(':selected').text()}`, 2000)
  player.message.info(`已加载 ${comments.length} 条弹幕`, 2000)
}

const searchDanmaku = async (name: string) => {
  if (!name || name.length < 2) return showTips('番剧名称不少于2个字')
  if (searchAnimeLock(name)) return

  let animes = await searchAnimeWithEpisode(name)
  if (animes.length === 0) return showTips('未搜索到番剧')
  updateAnimes(animes)
  findEpisode(animes)
}

const findEpisode = async (animes: Anime[]) => {
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
  $danmaku.insertBefore(player.$speed)
  $animeName.val(name)
  $animeName.on('keypress', (e) => {
    if (e.key === 'Enter') searchDanmaku($animeName.val() as string)
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
    Object.assign(videoInfo, await runtime.getCurrentVideoNameAndEpisode())
    const animes = $animes.data('animes')
    if (animes) findEpisode(animes)
  })

  mutationOb.observe(player.$video[0], { attributeFilter: ['src'] })

  keybind(['D'], () => {
    if (core) stop()
    else start()
  })
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

export async function setup(player: KPlayer) {
  const info = await runtime.getCurrentVideoNameAndEpisode()
  if (!info) return
  videoInfo = info

  player.$videoWrapper.append($danmakuContainer)
  $danmaku.insertBefore(player.$speed)

  let defaultSearchName = storageAnimeName(videoInfo.rawName) || videoInfo.name
  initEvents(defaultSearchName)
  searchDanmaku(defaultSearchName)
}
