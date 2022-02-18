export function queryDom<T extends Element>(selector: string) {
  return new Promise<T>((resolve) => {
    let dom: JQuery<T>
    function search() {
      dom = $<T>(selector)
      if (dom.length === 0) {
        requestAnimationFrame(search)
      } else {
        resolve(dom[0])
      }
    }
    search()
  })
}
