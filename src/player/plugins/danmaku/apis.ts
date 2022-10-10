import { Comment } from '@ironkinoko/danmaku'
import { request } from '../../../utils/request'
import { Anime, RawComments } from './types'
import { convert32ToHex } from './utils'

// https://api.dandanplay.net/swagger/ui/index#/

export async function getComments(
  episodeId: number | string
): Promise<Comment[]> {
  const res: RawComments = await request({
    url: `https://api.dandanplay.net/api/v2/comment/${episodeId}?withRelated=true&chConvert=1`,
  })

  return res.comments
    .map((o) => {
      const [time, type, color] = o.p.split(',')

      return {
        mode: ({ 1: 'rtl', 5: 'top' } as const)[type] || 'rtl',
        text: o.m,
        time: parseFloat(time),
        style: { color: convert32ToHex(color) },
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
  })

  return res.animes
}
