import { memoize } from 'lodash-es'
import { request } from '../../../utils/request'
import { Comment, RawComments } from './types'
import { convert32ToHex, parseUid } from './utils'

// https://api.dandanplay.net/swagger/ui/index#/

const KEY =
  'eyJYLUFwcElkIjoiaHZmNnB6dnhjbSIsIlgtQXBwU2VjcmV0IjoiSVpoY1VJYWtveEZhSzl4QkJESjlCczFPVTJzNGtLNXQifQ=='
const headers = JSON.parse(atob(KEY))

export async function getComments(
  episodeId: number | string
): Promise<Comment[]> {
  const res: RawComments = await request({
    url: `https://api.dandanplay.net/api/v2/comment/${episodeId}?withRelated=true&chConvert=1`,
    headers,
  })

  return res.comments
    .map((o) => {
      const [time, type, color, uid] = o.p.split(',')

      const user = parseUid(uid)

      return {
        mode: ({ 1: 'rtl', 4: 'bottom', 5: 'top' } as const)[type] || 'rtl',
        text: o.m,
        time: parseFloat(time),
        style: { color: convert32ToHex(color) },
        user,
      }
    })
    .sort((a, b) => a.time - b.time)
}

type DDPResult<T> = {
  errorCode: number
  success: boolean
  errorMessage: string
} & T
type DDPSearchAnimeResponse = DDPResult<{
  animes: {
    animeId: number
    animeTitle: string
    bangumiId: string
    episodeCount: number
    imageUrl: string
    isFavorited: boolean
    rating: number
    startDate: string
    type: string
    typeDescription: string
  }[]
}>

export async function queryAnimes(anime: string) {
  const res = await request<DDPSearchAnimeResponse>({
    url: 'https://api.dandanplay.net/api/v2/search/anime',
    params: { keyword: anime },
    headers,
  })

  if (!res.success) throw new Error(res.errorMessage)

  const nameCountMap = new Map<string, number>()
  res.animes.forEach((o) => {
    nameCountMap.set(o.animeTitle, (nameCountMap.get(o.animeTitle) || 0) + 1)
  })

  return res.animes.map((o) => ({
    id: o.bangumiId,
    name:
      nameCountMap.get(o.animeTitle)! > 1
        ? `${o.animeTitle}(${o.typeDescription})`
        : o.animeTitle,
  }))
}

type DDPBangumiResponse = DDPResult<{
  bangumi: {
    episodes: {
      episodeId: number
      episodeTitle: string
    }[]
  }
}>

export const queryEpisodes = memoize(async function (animeId: string) {
  const res = await request<DDPBangumiResponse>({
    url: `https://api.dandanplay.net/api/v2/bangumi/${animeId}`,
    headers,
  })

  if (!res.success) {
    setTimeout(() => queryEpisodes.cache.clear?.(), 100)
    throw new Error(res.errorMessage)
  }
  return res.bangumi.episodes.map((o) => ({
    id: o.episodeId,
    name: o.episodeTitle,
  }))
})
