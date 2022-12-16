export function execInUnsafeWindow(fn: () => any) {
  return new Promise<any>((resolve, reject) => {
    const contextId = Math.random().toFixed(16).slice(2)
    // content context
    window.addEventListener('message', function listener(e) {
      if (e.data && e.data.contextId === contextId) {
        const data = e.data.data
        resolve(data)
        window.removeEventListener('message', listener)
        script.remove()
      }
    })

    // page context
    const code = `
    ;(async function runInUnsafeWindow() {
      const data = await (${fn.toString()})()
      window.postMessage({ contextId: '${contextId}', data }, '*')
    })()
    `

    const script = document.createElement('script')
    script.textContent = code
    document.body.appendChild(script)
  })
}
