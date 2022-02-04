export const session = {
  getItem(key, defaultValue) {
    try {
      const value = window.sessionStorage.getItem(key)
      if (value) return JSON.parse(value)
      return defaultValue
    } catch (error) {
      return defaultValue
    }
  },
  setItem(key, value) {
    window.sessionStorage.setItem(key, JSON.stringify(value))
  },
  removeItem(key) {
    window.sessionStorage.removeItem(key)
  },
}
