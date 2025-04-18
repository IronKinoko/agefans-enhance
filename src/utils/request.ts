export interface Opts {
  url: string
  method?: 'GET' | 'POST'
  params?: any
  headers?: Record<string, string>
}

export function request<T = any>(opts: Opts) {
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

  return new Promise<T>((resolve, reject) => {
    console.log('[agefans-enhance]', url)
    GM_xmlhttpRequest({
      url,
      method: method || 'GET',
      responseType: 'json',
      headers: opts.headers,
      onload: (res: any) => {
        console.log('[agefans-enhance]', res, res.response)
        resolve(res.response)
      },
      onerror: reject,
    })
  })
}
