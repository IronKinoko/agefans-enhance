export const local = {
  getItem(key, defaultValue) {
    return GM_getValue(key, defaultValue)
  },
  setItem(key, value) {
    GM_setValue(key, value)
  },
}
