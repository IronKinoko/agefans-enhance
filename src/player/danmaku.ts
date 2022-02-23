import Danmaku, { Comment } from '@ironkinoko/danmaku'
import { KPlayer } from '.'
import { runtime } from '../runtime'
import { request } from '../utils/request'
import { local } from '../utils/storage'

// https://api.acplay.net/swagger/ui/index#/

type RawComments = { count: number; comments: { m: string; p: string }[] }
interface Anime {
  animeId: number
  animeTitle: string
  type: string
  episodes: Episode[]
}
interface Episode {
  episodeId: number
  episodeTitle: string
}

function createStorage(storageKey: string) {
  function storage(key: string): string | undefined
  function storage(key: string, value: string): void
  function storage(key: string, value?: string): string | undefined | void {
    const store: Record<string, string> = local.getItem(storageKey, {})
    if (value) {
      store[key] = value
      local.setItem(storageKey, store)
    } else {
      return store[key]
    }
  }
  return storage
}

const storageAnimeName = createStorage('k-player-danmaku-anime-name')
const storageEpisodeName = createStorage('k-player-danmaku-episode-name')

function convert32ToHex(color: string) {
  return '#' + parseInt(color).toString(16)
}

async function getComments(episodeId: number | string): Promise<Comment[]> {
  const res: RawComments = await request({
    url: `https://api.acplay.net/api/v2/comment/${episodeId}?withRelated=true&chConvert=1`,
  })

  return res.comments.map((o) => {
    const [time, type, color] = o.p.split(',')

    return {
      mode: ({ 1: 'rtl', 4: 'bottom', 5: 'top' } as const)[type] || 'rtl',
      text: o.m,
      time: parseFloat(time),
      style: { color: convert32ToHex(color) },
    }
  })
}

async function searchAnimeWithEpisode(
  anime: string,
  episode?: string
): Promise<Anime[]> {
  const res = await request({
    url: 'https://api.acplay.net/api/v2/search/episodes',
    params: { anime, episode },
  })

  return res.animes
}

export async function injectDanmaku(this: KPlayer) {
  const videoInfo = await runtime.getCurrentVideoNameAndEpisode()
  if (!videoInfo) return null

  const $animeName = this.$danmaku.find('#animeName')
  const $animes = this.$danmaku.find('#animes')
  const $episodes = this.$danmaku.find('#episodes')
  let core: Danmaku

  let defaultSearchName = storageAnimeName(videoInfo.rawName) || videoInfo.name

  const start = async (episodeId: number | string) => {
    core?.destroy()
    const comments = await getComments(episodeId)
    core = new Danmaku({
      container: this.$danmakuContainer[0],
      media: this.$video[0],
      comments,
    })
  }

  const searchDanmaku = async (name: string) => {
    if (!name || name.length < 2)
      return this.message.info('请输入番剧名称，且不少于2个字')
    let animes = await searchAnimeWithEpisode(name)
    updateAnimes(animes)
    findEpisode(animes)
  }

  const findEpisode = async (animes: Anime[]) => {
    const anime = animes.find((anime) => anime.animeTitle === videoInfo.rawName)

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
        updateEpisodes(anime)
        $episodes.val(episode.episodeId)
        $episodes.trigger('change')
        return
      }
    }
    this.message.info('弹幕未能自动匹配数据源，请手动搜索')
  }

  const initEvents = (name: string) => {
    this.$danmaku.insertBefore(this.$speed)
    $animeName.val(name)
    $animeName.on('keypress', (e) => {
      if (e.key === 'Enter') searchDanmaku($animeName.val() as string)
    })
    $animes.on('change', (e) => {
      const animeId = $(e.target).val() as string
      const animes: Anime[] = $animes.data('animes')
      const anime = animes.find((anime) => String(anime.animeId) === animeId)
      if (!anime) return
      updateEpisodes(anime)
    })
    $episodes.on('change', (e) => {
      const episodeId = $(e.target).val() as string
      storageEpisodeName(`${videoInfo.rawName}.${videoInfo.episode}`, episodeId)
      start(episodeId)
    })

    const resizeOb = new ResizeObserver(() => {
      core?.resize()
    })
    resizeOb.observe(this.$videoWrapper[0])

    const mutationOb = new MutationObserver(async () => {
      Object.assign(videoInfo, await runtime.getCurrentVideoNameAndEpisode())
      const animes = $animes.data('animes')
      if (animes) findEpisode(animes)
    })

    mutationOb.observe(this.$video[0], { attributeFilter: ['src'] })
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

    storageAnimeName(videoInfo.rawName, anime.animeTitle)
    $episodes.data('anime', anime)
    $episodes.html(html)

    $episodes.val(episodes[0].episodeId)
    $episodes.trigger('change')
  }

  initEvents(defaultSearchName)
  searchDanmaku(defaultSearchName)
}
