import $ from 'jquery'
const SHIFT_KEY = '~!@#$%^&*()_+{}|:"<>?' + '～！@#¥%…&*（）——+「」｜：“《》？'

/**
 * @param {string[]} keys
 * @param {(e:KeyboardEvent,key:string)=>void} cb
 */
export function keybind(keys, cb) {
  const isMac = /macintosh|mac os x/i.test(navigator.userAgent)
  keys = keys.filter((key) => !key.includes(isMac ? 'ctrl' : 'meta'))
  $(window).on('keydown', (e) => {
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
      cb(e, key)
    }
  })
}
