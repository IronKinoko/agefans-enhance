export function debounce(fn: (...args: any[]) => void, delay = 300) {
  if (typeof fn !== 'function') {
    throw new TypeError('fn is not a function')
  }

  let timeID: number | undefined
  return function (...rest: any[]) {
    if (timeID) {
      clearTimeout(timeID)
    }
    timeID = window.setTimeout(() => {
      timeID = undefined
      fn.apply(fn, rest)
    }, delay)
  }
}
