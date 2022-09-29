const SHIFT_KEY = '~!@#$%^&*()_+{}|:"<>?' + '～！@#¥%…&*（）——+「」｜：“《》？'

export function keybind(
  keys: string[],
  cb: (e: KeyboardEvent, key: string) => void
) {
  const isMac = /macintosh|mac os x/i.test(navigator.userAgent)
  keys = keys.filter((key) => !key.includes(isMac ? 'ctrl' : 'meta'))
  $(window).on('keydown', (e) => {
    if (document.activeElement?.tagName === 'INPUT') return

    let keyArr = []

    e.ctrlKey && keyArr.push('ctrl')
    e.metaKey && keyArr.push('meta')
    e.shiftKey && !SHIFT_KEY.includes(e.key) && keyArr.push('shift')
    e.altKey && keyArr.push('alt')

    if (!['Control', 'Meta', 'Shift', 'Alt'].includes(e.key)) {
      keyArr.push(e.key)
    }

    keyArr = [...new Set(keyArr)]

    const key = keyArr.join('+')

    if (keys.includes(key)) {
      cb(e.originalEvent!, key)
    }
  })
}
