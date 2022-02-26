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
