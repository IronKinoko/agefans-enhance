import { memoize } from 'lodash-es'
import { request, RequestOptions } from '../../../utils/request'
import { Comment, RawComments } from './types'
import { convert32ToHex } from './utils'

// https://api.dandanplay.net/swagger/index.html

const KEY =
  'eyJYLUFwcElkIjoiaHZmNnB6dnhjbSIsIlgtQXBwU2VjcmV0IjoiSVpoY1VJYWtveEZhSzl4QkJESjlCczFPVTJzNGtLNXQifQ=='
const headers = JSON.parse(atob(KEY))

const baseURL = 'https://api.dandanplay.net'

const client = <T = unknown>(opts: RequestOptions) =>
  request<T>({ ...opts, headers, url: baseURL + opts.url })

type DDPResult<T> = {
  errorCode: number
  success: boolean
  errorMessage: string
} & T

type DDPRelatedResponse = DDPResult<{
  relateds: {
    url: string
    shift: number
  }[]
}>

function parseURLSource(url: string) {
  const tmp = new URL(url)
  const hostname = tmp.hostname

  if (hostname.match(/bilibili/i)) return '哔哩哔哩'
  if (hostname.match(/acfun/i)) return 'AcFun'
  if (hostname.match(/tucao/i)) return 'Tucao'
  if (hostname.match(/gamer/i)) return '巴哈姆特'

  return hostname.replace('www.', '').replace('.com', ' ')
}

export async function getComments(
  episodeId: number | string
): Promise<Comment[]> {
  const [ddplay, extra] = await Promise.all([
    // 仅获取弹弹play的弹幕
    client<RawComments>({
      url: `/api/v2/comment/${episodeId}`,
      params: { chConvert: 1 },
    }),

    // 获取第三方弹幕链接
    (async () => {
      const relatedRes = await client<DDPRelatedResponse>({
        url: `/api/v2/related/${episodeId}`,
      })

      if (!relatedRes.success) return []

      const extraComments = await Promise.all(
        relatedRes.relateds.map(async (o) => {
          const res = await client<RawComments>({
            url: `/api/v2/extcomment`,
            params: { url: o.url, chConvert: 1 },
          })
          return {
            source: parseURLSource(o.url),
            url: o.url,
            shift: o.shift,
            comments: res.comments,
          }
        })
      )

      return extraComments
    })(),
  ])

  const sourceList = [
    { source: '弹弹Play', comments: ddplay.comments, url: '', shift: 0 },
    ...extra,
  ]

  const cmts = sourceList.map(({ source, comments, url, shift }) => {
    return comments.map((o) => {
      const [time, type, color, uid] = o.p.split(',')

      return {
        mode: ({ 1: 'rtl', 4: 'bottom', 5: 'top' } as const)[type] || 'rtl',
        text: o.m,
        time: parseFloat(time) + shift,
        style: { color: convert32ToHex(color) },
        user: { source, id: uid, url },
      }
    })
  })

  return cmts.flat().sort((a, b) => a.time - b.time)
}

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
  const res = await client<DDPSearchAnimeResponse>({
    url: `/api/v2/search/anime`,
    params: { keyword: anime },
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
  const res = await client<DDPBangumiResponse>({
    url: `/api/v2/bangumi/${animeId}`,
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
