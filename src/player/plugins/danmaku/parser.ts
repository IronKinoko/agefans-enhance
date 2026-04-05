import { Comment } from './types'
import { convert32ToHex } from './utils'

export function parsePakkuDanmakuXML(xml: string) {
  const $xml = $(xml)

  return $xml
    .find('d')
    .map((_, el) => {
      const p = el.getAttribute('p')!
      const [
        time,
        type,
        _fontSize,
        color,
        _sendTime,
        _pool,
        _senderHash,
        _id,
        _weight,
      ] = p.split(',')

      return {
        mode: ({ 1: 'rtl', 4: 'bottom', 5: 'top' } as const)[type] || 'rtl',
        text: el.textContent!,
        time: parseFloat(time),
        style: { color: convert32ToHex(color) },
      } as Comment
    })
    .toArray()
}
