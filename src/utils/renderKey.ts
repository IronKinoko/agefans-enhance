const isMac = /macintosh|mac os x/i.test(navigator.userAgent)

const KeyMap = {
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
  ctrl: 'Ctrl',
  alt: 'Alt',
  shift: 'Shift',
}

const MacKeyMap = {
  ctrl: '⌃',
  meta: '⌘',
  alt: '⌥',
  shift: '⇧',
}
if (isMac) {
  Object.assign(KeyMap, MacKeyMap)
}

export function renderKey(key: string) {
  Object.entries(KeyMap).forEach(([k, v]) => {
    key = key.replace(new RegExp(k, 'i'), v)
  })
  return key
}
