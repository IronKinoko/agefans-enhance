export function debounce(fn, delay = 300) {
  if (typeof fn !== 'function') {
    throw new TypeError('fn is not a function')
  }

  let timeID = null
  return function (...rest) {
    if (timeID) {
      clearTimeout(timeID)
    }
    timeID = setTimeout(() => {
      timeID = null
      fn.apply(this, rest)
    }, delay)
  }
}
