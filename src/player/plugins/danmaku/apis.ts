import { request } from '../../../utils/request'
import { Anime, RawComments, Comment } from './types'
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
export async function searchAnimeWithEpisode(
  anime: string,
  episode?: string
): Promise<Anime[]> {
  const res = await request({
    url: 'https://api.dandanplay.net/api/v2/search/episodes',
    params: { anime, episode },
    headers,
  })

  return res.animes
}
