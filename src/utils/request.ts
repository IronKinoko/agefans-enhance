export interface Opts {
  url: string
  method?: 'GET' | 'POST'
  params?: any
}

export function request(opts: Opts) {
  let { url, method, params } = opts

  if (params) {
    let u = new URL(url)
    Object.keys(params).forEach((key) => {
      const value = params[key]
      if (value !== undefined && value !== null) {
        u.searchParams.set(key, params[key])
      }
    })
    url = u.toString()
  }

  return new Promise<any>((resolve, reject) => {
    GM_xmlhttpRequest({
      url,
      method: method || 'GET',
      onload: (res: any) => {
        try {
          const data = JSON.parse(res.responseText)
          console.log(data)

          resolve(data)
        } catch (error) {
          console.log(res.responseText)

          resolve(res.responseText)
        }
      },
      onerror: reject,
    })
  })
}
