export function normalizeKeyEvent(e: KeyboardEvent) {
  const SPECIAL_KEY_EN = '`-=[]\\;\',./~!@#$%^&*()_+{}|:"<>?'.split('')
  const SPECIAL_KEY_ZH =
    '·-=【】、；‘，。/～！@#¥%…&*（）—+「」｜：“《》？'.split('')

  let key = e.key

  // trans a-z to A-Z
  if (/^[a-z]$/.test(key)) {
    key = key.toUpperCase()
  } else if (SPECIAL_KEY_ZH.includes(key)) {
    key = SPECIAL_KEY_EN[SPECIAL_KEY_ZH.indexOf(key)]
  }

  let keyArr = []

  e.ctrlKey && keyArr.push('ctrl')
  e.metaKey && keyArr.push('meta')
  e.shiftKey && !SPECIAL_KEY_EN.includes(key) && keyArr.push('shift')
  e.altKey && keyArr.push('alt')

  if (!/Control|Meta|Shift|Alt/i.test(key)) keyArr.push(key)

  keyArr = [...new Set(keyArr)]

  return keyArr.join(' ')
}
