function getItem<T = any>(key: string): T | undefined
function getItem<T = any>(key: string, defaultValue: T): T
function getItem<T = any>(key: string, defaultValue?: T): T | undefined {
  try {
    const value = window.sessionStorage.getItem(key)
    if (value) return JSON.parse(value)
    return defaultValue
  } catch (error) {
    return defaultValue
  }
}

export const session = {
  getItem,
  setItem(key: string, value: any) {
    window.sessionStorage.setItem(key, JSON.stringify(value))
  },
  removeItem(key: string) {
    window.sessionStorage.removeItem(key)
  },
}
