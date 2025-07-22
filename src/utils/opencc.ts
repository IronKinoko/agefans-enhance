import OpenCC from 'opencc-js'

export function opencc(text: string) {
  const cn2tw = OpenCC.Converter({ from: 'cn', to: 'tw' })
  const tw2cn = OpenCC.Converter({ from: 'tw', to: 'cn' })
  const cn = tw2cn(text)
  const tw = cn2tw(text)
  return { cn, tw }
}
