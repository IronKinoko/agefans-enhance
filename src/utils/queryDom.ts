export function queryDom<T extends Element>(selector: string) {
  return new Promise<T>((resolve) => {
    let video: T | null
    function search() {
      video = document.querySelector<T>(selector)
      if (video === null) {
        requestAnimationFrame(search)
      } else {
        resolve(video)
      }
    }
    search()
  })
}
