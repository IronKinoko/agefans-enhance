export function sleep(ms?: number) {
  if (!ms) {
    return new Promise((resolve) => {
      requestAnimationFrame(resolve)
    })
  }

  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
