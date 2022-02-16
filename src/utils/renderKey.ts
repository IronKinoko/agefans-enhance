const isMac = /macintosh|mac os x/i.test(navigator.userAgent)
const macKeyMap = {
  ctrl: '⌘',
  alt: '⌥',
  shift: '⇧',
} as const
export function renderKey(key: string) {
  const lowerCaseKey = key.toLowerCase()
  if (isMac && Reflect.has(macKeyMap, lowerCaseKey)) {
    return macKeyMap[lowerCaseKey as keyof typeof macKeyMap]
  }
  return key
}
