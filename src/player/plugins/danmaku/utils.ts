import { local } from '../../../utils/storage'
import { KPlayer, LocalConfig } from '../../Kplayer'
import { Anime } from './types'

function createStorage<T = string>(storageKey: string) {
  function storage(key: string): T | undefined
  function storage(key: string, value: T): void
  function storage(key: string, value?: T): T | undefined {
    const store = local.getItem<Record<string, T>>(storageKey, {})
    if (value) {
      store[key] = value
      local.setItem(storageKey, store)
    } else {
      return store[key]
    }
  }
  return storage
}
export const storageAnimeName = createStorage<
  string | Pick<Anime, 'animeId' | 'animeTitle'>
>('k-player-danmaku-anime-name')
export const storageEpisodeName = createStorage('k-player-danmaku-episode-name')
function createLock() {
  let prev: any
  return function check(deps: any) {
    if (prev === deps) return true
    prev = deps
    return false
  }
}
export const episodeIdLock = createLock()
export const searchAnimeLock = createLock()
export function convert32ToHex(color: string) {
  return '#' + parseInt(color).toString(16)
}
export function parseUid(uid: string) {
  let source = '弹弹play',
    id = uid

  const matcher = uid.match(/^\[(.*?)\](.*)/)
  if (matcher) {
    source = matcher[1]
    id = matcher[2]
  }

  return { source, id }
}

export function rangePercent(min: number, input: number, max: number) {
  input = Math.min(max, Math.max(min, input))

  return ((input - min) / (max - min)) * 100
}

export function addRangeListener(opts: {
  $dom: JQuery
  name: keyof LocalConfig
  /** 返回一个百分比，用于设置 --value 样式 */
  onInput?: (val: number) => void
  onChange?: (val: number) => void
  player: KPlayer
}) {
  const { $dom, name, onInput, player, onChange } = opts
  const $valueDom = $(
    '<div style="width:45px;flex-shrink:0;text-align:right;white-space:nowrap;"></div>'
  )
  $valueDom.insertAfter($dom)

  const min = parseFloat($dom.attr('min')!)
  const max = parseFloat($dom.attr('max')!)
  const setStyle = () => {
    const value = parseFloat($dom.val() as string)
    player.configSaveToLocal(name, value)
    onInput?.(value)
    $valueDom.text((value * 100).toFixed(0) + '%')
    $dom.css('--value', rangePercent(min, value, max) + '%')
  }
  $dom.val(player.localConfig[name] as number)
  $dom.on('input', setStyle)
  $dom.on('change', () => {
    onChange?.(parseFloat($dom.val() as string))
  })
  setStyle()
}

export function getCheckboxGroupValue($dom: JQuery<HTMLInputElement>) {
  const ret: string[] = []
  $dom.each((_, el) => {
    if (el.checked) ret.push(el.value)
  })
  return ret
}
export function setCheckboxGroupValue(
  $dom: JQuery<HTMLInputElement>,
  value: any[]
) {
  $dom.each((_, el) => {
    if (value.includes(el.value)) {
      el.checked = true
    }
  })
}
