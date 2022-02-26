import { KPlayer, LocalConfig } from '../../Kplayer'
import { local } from '../../../utils/storage'
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
export const storageAnimeName = createStorage('k-player-danmaku-anime-name')
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
  const $valueDom = $('<span></span>')
  $valueDom.insertAfter($dom)

  const min = parseFloat($dom.attr('min')!)
  const max = parseFloat($dom.attr('max')!)
  const setStyle = () => {
    const value = parseFloat($dom.val() as string)
    player.configSaveToLocal(name, value)
    onInput?.(value)
    $valueDom.text(value.toFixed(2))
    $dom.css('--value', rangePercent(min, value, max) + '%')
  }
  $dom.val(player.localConfig[name] as number)
  $dom.on('input', setStyle)
  $dom.on('change', () => {
    onChange?.(parseFloat($dom.val() as string))
  })
  setStyle()
}
