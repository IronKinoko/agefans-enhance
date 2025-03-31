function createStorage(storage: Storage) {
  function getItem<T = any>(key: string): T | undefined
  function getItem<T = any>(key: string, defaultValue: T): T
  function getItem<T = any>(key: string, defaultValue?: T): T | undefined {
    try {
      const value = storage.getItem(key)
      if (value) return JSON.parse(value)
      return defaultValue
    } catch (error) {
      return defaultValue
    }
  }

  return {
    getItem,
    setItem(key: string, value: any) {
      storage.setItem(key, JSON.stringify(value))
    },
    removeItem: storage.removeItem.bind(storage),
    clear: storage.clear.bind(storage),
  }
}

export const session = createStorage(window.sessionStorage)
export const local = createStorage(window.localStorage)

let gm: Pick<ReturnType<typeof createStorage>, 'getItem' | 'setItem'>
try {
  if (typeof GM_getValue === 'undefined')
    throw new Error('GM_getValue is not defined')
  if (typeof GM_setValue === 'undefined')
    throw new Error('GM_setValue is not defined')

  function getItem<T = any>(key: string): T | undefined
  function getItem<T = any>(key: string, defaultValue: T): T
  function getItem<T = any>(key: string, defaultValue?: T): T | undefined {
    try {
      return GM_getValue(key) ?? local.getItem(key) ?? defaultValue
    } catch (error) {
      return defaultValue
    }
  }

  gm = {
    getItem,
    setItem(key: string, value: any) {
      local.setItem(key, value)
      GM_setValue(key, value)
    },
  }
} catch (error) {
  gm = local
}
export { gm }
