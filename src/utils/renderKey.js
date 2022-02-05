const isMac = /macintosh|mac os x/i.test(navigator.userAgent)
const macKeyMap = {
  ctrl: '⌘',
  alt: '⌥',
  shift: '⇧',
}
/**
 * @param {string} key
 */
export function renderKey(key) {
  if (isMac) return macKeyMap[key.toLowerCase()] || key
  return key
}
