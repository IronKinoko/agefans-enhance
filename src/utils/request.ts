export interface Opts {
  url: string
  method?: 'GET' | 'POST'
}
export function request(opts: Opts) {
  const { url, method } = opts
  return new Promise<any>((resolve, reject) => {
    GM_xmlhttpRequest({
      url,
      method: method || 'GET',
      onload: (res: any) => {
        try {
          const data = JSON.parse(res.responseText)
          resolve(data)
        } catch (error) {
          resolve(res.responseText)
        }
      },
      onerror: reject,
    })
  })
}
