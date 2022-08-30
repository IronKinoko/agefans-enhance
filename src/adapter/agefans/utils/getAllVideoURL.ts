import parseToURL from '../../../utils/parseToURL'
import { session } from '../../../utils/storage'
import { ageBlock } from './ageBlock'
import { getPlayUrl, updateCookie } from './playURL'
const LOCAL_PLAY_URL_KEY = 'play-url-key'

type LocalItem = { url: string }
function insertBTSites() {
  const title = $('#detailname a').text()
  const encodedTitle = encodeURIComponent(title)
  const sites = [
    {
      title: '蜜柑计划',
      url: `https://mikanani.me/Home/Search?searchstr=${encodedTitle}`,
    },
  ]
  $(
    ageBlock({
      title: '种子资源：',
      content: sites
        .map(
          (site) =>
            `<a href="${site.url}" rel="noreferrer" target="_blank" class="res_links_a">${site.title}</a>`
        )
        .join(''),
    })
  ).insertAfter('.baseblock:contains(网盘资源)')
}

export const loadingIcon = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin-right:4px;" width="1em" height="1em" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
  <circle cx="50" cy="50" fill="none" stroke="#5699d2" stroke-width="10" r="40" stroke-dasharray="164.93361431346415 56.97787143782138">
    <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="0.6s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform>
  </circle>
</svg>`

function getLocal(): Record<string, LocalItem>
function getLocal(href: string): string | null
function getLocal(href?: string): Record<string, LocalItem> | string | null {
  const map = session.getItem<Record<string, LocalItem>>(LOCAL_PLAY_URL_KEY, {})
  if (href) {
    const item = map[href]
    if (!item) return null

    return item.url
  }
  return map
}
export function saveLocal(href: string, url: string) {
  const map = getLocal()
  map[href] = { url }
  session.setItem(LOCAL_PLAY_URL_KEY, map)
}

export function removeLocal(href: string) {
  const map = getLocal()
  delete map[href]
  session.setItem(LOCAL_PLAY_URL_KEY, map)
}

class AGEfansError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AGEfans Enhance Exception'
  }
}
async function getVurl(href: string) {
  const res = await fetch(getPlayUrl(href), {
    referrerPolicy: 'strict-origin-when-cross-origin',
  })
  const text = await res.text()

  if (text.includes('ipchk')) {
    throw new AGEfansError(`你被限流了，请5分钟后重试（${text}）`)
  }
  if (text.includes('timeout')) {
    throw new AGEfansError(`Cookie过期，请刷新页面重试（${text}）`)
  }

  function __qpic_chkvurl_converting(_in_vurl: string) {
    const vurl = decodeURIComponent(_in_vurl)
    const match_resl = vurl.match(
      /^http.+\.f20\.mp4\?ptype=http\?w5=0&h5=0&state=1$/
    )
    return !!match_resl
  }

  const _json_obj = JSON.parse(text)
  const _purl = _json_obj['purl']
  const _vurl = _json_obj['vurl']
  const _playid = _json_obj['playid']

  if (__qpic_chkvurl_converting(_vurl)) {
    throw new AGEfansError('视频转码中，请稍后再试')
  }

  if (_playid === '<play>QLIVE</play>') {
    throw new AGEfansError('脚本不支持QLIVE模式，请关闭脚本使用原生播放')
  }

  let _url = _purl + _vurl
  let url = new URL(_url, location.origin)
  const vurl = url.searchParams.get('url')!

  return parseToURL(vurl)
}
export async function getVurlWithLocal(href: string) {
  let vurl = getLocal(href)
  if (vurl) {
    return vurl
  }

  await updateCookie(href)
  vurl = await getVurl(href)
  saveLocal(href, vurl)
  return vurl
}

export function initGetAllVideoURL() {
  insertBTSites()
}
