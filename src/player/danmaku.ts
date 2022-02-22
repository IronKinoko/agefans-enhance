import Danmaku from 'danmaku'
import { KPlayer } from '.'
import { request } from '../utils/request'

type RawComments = { count: number; comments: { m: string; p: string }[] }

interface Comment {
  text?: string
  /**
   * @default rtl
   */
  mode?: 'ltr' | 'rtl' | 'top' | 'bottom'
  /**
   * Specified in seconds. Not required in live mode.
   * @default media?.currentTime
   */
  time?: number
  style?: Partial<CSSStyleDeclaration>
  /**
   * A custom render to draw comment.
   * When it exist, `text` and `style` will be ignored.
   */
  render?(): HTMLElement | HTMLCanvasElement
}

function convert32ToHex(color: string) {
  return '#' + parseInt(color).toString(16)
}

export async function injectDanmaku(this: KPlayer) {
  const start = (comments: any) => {
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

    console.log(res)

    return res.comments.map((o) => {
      const [time, type, color] = o.p.split(',')

      const hex = convert32ToHex(color)

      return {
        mode: type === '4' ? 'bottom' : type === '5' ? 'top' : 'rtl',
        text: o.m,
        time: parseFloat(time),
        style: { color: hex },
      }
    })
  }

  const comments = await getComments('136240001')

  start(comments)
}
