import { Cookie } from '../../../utils/cookie'

/**
 * agefans 安全机制：
 * 1. 从服务端获取cookie `t1` `k1`
 * 2. 本地根据规则生成cookie `t2` `k2`
 * 3. 获取链接时候生成cookie `fa_t` `fa_c`
 *
 * t1 t2 fa_t 均为时间，相差太多就报错超时
 * k1 k2 类似密钥
 * fa_c 不重要
 */

/**
 * 获取视频链接的请求地址
 */
export function getPlayUrl(_url: string) {
  const _rand = Math.random()
  var _getplay_url =
    _url.replace(
      /.*\/play\/(\d+?)\?playid=(\d+)_(\d+).*/,
      '/_getplay?aid=$1&playindex=$2&epindex=$3'
    ) +
    '&r=' +
    _rand

  /**
   * fa_t 取当前时间
   * fa_c 1-9之间随便取 固定1就行
   */
  Cookie.set('fa_t', Date.now(), 1)
  Cookie.set('fa_c', 1, 1)
  return _getplay_url
}

/**
 * 因为agefans的安全策略，需要刷新下cookie才能正常访问
 *
 * 这个方法实现了 t1 k1 t2 k2 全部刷新
 */
export function updateCookie(href?: string) {
  href = href ? location.origin + href : location.href
  return new Promise<void>((resolve, reject) => {
    const doneFn = () => {
      resolve()
      dom.remove()
    }
    // DOMContentLoaded is faster than load
    const dom = document.createElement('iframe')
    dom.style.display = 'none'
    dom.src = href!
    document.body.append(dom)
    dom.contentWindow?.addEventListener('DOMContentLoaded', doneFn)
    dom.contentWindow?.addEventListener('load', doneFn)
    dom.contentWindow?.addEventListener('error', reject)
  })
}

/**
 * 单独刷新 t2 k2
 */
export function refreshK2T2() {
  /** @from __getplay_pck */
  const t1 = Math.round(Number(Cookie.get('t1')) / 1e3) >> 5
  const k2 = (t1 * (t1 % 4096) * 3 + 83215) * (t1 % 4096) + t1
  Cookie.set('k2', k2)

  /** @from __getplay_pck2 */
  const ksub = k2.toString().slice(-1)
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const t2 = new Date().getTime()
    if (t2.toString().slice(-3).indexOf(ksub) > -1) {
      Cookie.set('t2', t2)
      break
    }
  }
}
