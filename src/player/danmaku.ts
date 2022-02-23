import Danmaku, { Comment } from '@ironkinoko/danmaku'
import { KPlayer } from '.'
import { request } from '../utils/request'

type RawComments = { count: number; comments: { m: string; p: string }[] }

function convert32ToHex(color: string) {
  return '#' + parseInt(color).toString(16)
}

export async function injectDanmaku(this: KPlayer) {
  const start = (comments: Comment[]) => {
    let core = new Danmaku({
      container: this.$danmaku[0],
      media: this.$video[0],
      comments,
    })
    const ob = new ResizeObserver(() => {
      core.resize()
    })
    ob.observe(this.$videoWrapper[0])
  }

  async function getComments(episodeId: string): Promise<Comment[]> {
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

  const comments = await getComments('136240001')

  start(comments)
}
