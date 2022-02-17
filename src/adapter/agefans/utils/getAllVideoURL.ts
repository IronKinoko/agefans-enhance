import $ from 'jquery'
import { copyToClipboard } from '../../../utils/copy'
import { modal } from '../../../utils/modal'
import parseToURL from '../../../utils/parseToURL'
import './getAllVideoURL.scss'
import { getPlayUrl, updateCookie } from './playURL'
import { session } from '../../../utils/storage'
import { alert } from './alert'
const LOCAL_PLAY_URL_KEY = 'play-url-key'

type ATag = { title: string; href: string }
type LocalItem = { url: string }
function insertBtn() {
  $(`
  <div class="baseblock">
    <div class="blockcontent">
      <div id="wangpan-div" class="baseblock2">
        <div class="blocktitle flex-align-center">
          获取全部视频链接：
          <span id="status-xr7" class="flex-align-center"></span>
        </div>
        <div class="blockcontent">
          <a id="open-modal" class="res_links_a" style="cursor:pointer">获取全部视频链接</a>
          <span>｜</span>
          <a id="clean-all" class="res_links_a" style="cursor:pointer">清空</a>
          <span>｜</span>
          <a id="copy-text" class="res_links_a" style="cursor:pointer">复制内容</a>
          <span>｜</span>
          <a id="thunder-link" rel="noreferrer" target="_blank" class="res_links_a" style="cursor:pointer">导出迅雷链接</a>
          <div id="url-list" style="width:100%; max-height:400px; overflow:auto;"></div>
        </div>
      </div>
    </div>
  </div>
`).insertAfter($('.baseblock:contains(网盘资源)'))
  $('#copy-text').on('click', function () {
    copyToClipboard($('#url-list'))
    $(this).text('已复制')
    setTimeout(() => {
      $(this).text('复制内容')
    }, 1000)
  })
  $('#clean-all').on('click', () => {
    getAllVideoUrlList().forEach((o) => {
      removeLocal(o.href)
    })
    showLocalURL()
  })
  $('#open-modal').on('click', function () {
    modal({
      title: '选择需要的链接',
      content: insertModalForm(),
      onOk: () => {
        let list: { title: string; href: string }[] = []
        $('#modal-form .col input:checked').each((_, el) => {
          list.push({
            title: $(el).data('title'),
            href: $(el).attr('name')!,
          })
        })
        insertResult(list)
      },
    })
  })
  $('#thunder-link').attr('href', () => {
    const map = getLocal()
    const list = getAllVideoUrlList()
    const tasks: { url: string; baseName: string }[] = []
    const taskGroupName = $('#detailname a').text()
    list.forEach((item) => {
      if (map[item.href]) {
        tasks.push({
          url: map[item.href].url,
          baseName: `${item.title}.mp4`,
        })
      }
    })

    const params = { taskGroupName, tasks }

    const baseURL =
      process.env.NODE_ENV === 'development'
        ? 'http://127.0.0.1:5500/website/thunder.html'
        : 'https://ironkinoko.github.io/agefans-enhance/thunder.html'
    const url = new URL(baseURL)
    url.searchParams.append('params', JSON.stringify(params))
    return url.toString()
  })
}

function getAllVideoUrlList() {
  const $aTagList = $('.movurl:visible li a')
  const aTags: ATag[] = []
  $aTagList.each(function (index, aTag) {
    aTags.push({
      title: aTag.textContent!,
      href: aTag.dataset.href!,
    })
  })

  return aTags
}

function insertModalForm() {
  const list = getAllVideoUrlList()

  let $dom = $(`
  <div id="modal-form">
    ${alert('如果在1-2分钟内调用超过70多次，会被限流影响正常观看视频')}
    <label class="k-checkbox">
      <input id="all-check" type="checkbox" checked/>全选
    </label>
    <ul class="row">
      ${list
        .map(
          (aTag) => `
        <li class="col">
          <label class="k-checkbox"><input type="checkbox" name="${aTag.href}" data-title="${aTag.title}" checked />${aTag.title}</label>
        </li>`
        )
        .join('')}
    </ul>
  </div>
  `)

  $dom.find('.row .col input').on('change', () => {
    const length = list.length
    const checkedLength = $dom.find('.row .col input:checked').length
    $dom
      .find('.k-checkbox #all-check')
      .prop('checked', length === checkedLength)
  })
  $dom.find('.k-checkbox #all-check').on('change', (e) => {
    $dom
      .find('.row .col input')
      .prop('checked', (e.currentTarget as HTMLInputElement).checked)
  })
  return $dom
}

function genUrlItem(title: string, content = '加载中...') {
  const download = [$('#detailname a').text(), title].join(' ')
  const contentHTML = content.startsWith('http')
    ? `<a href="${content}" download="${download}">${content}</a>`
    : content

  return `<div>
  <div style="white-space: nowrap;">[${title}]</div>
  <div class="url" data-status='0' style="word-break:break-all; word-wrap:break-word;">
    ${contentHTML}
  </div>
</div>`
}

export const loadingIcon = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin-right:4px;" width="1em" height="1em" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
  <circle cx="50" cy="50" fill="none" stroke="#5699d2" stroke-width="10" r="40" stroke-dasharray="164.93361431346415 56.97787143782138">
    <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="0.6s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform>
  </circle>
</svg>`

async function insertResult(list: ATag[]) {
  const $parent = $('#url-list')
  $parent.empty()

  $('#status-xr7')
    .hide()
    .fadeIn(300)
    .html(`${loadingIcon}<div>更新cookie中...</div>`)
  await updateCookie()
  $('#status-xr7').text('更新完成').delay(1500).fadeOut(300)

  list.forEach((item) => {
    let $dom = $(genUrlItem(item.title)).appendTo($parent)

    let $msg = $dom.find('.url')
    async function _getUrl() {
      try {
        const vurl = await getVurl(item.href)
        saveLocal(item.href, vurl)
        const download = [$('#detailname a').text(), item.title].join(' ')
        $msg.html(`<a href="${vurl}" download="${download}">${vurl}</a>`)
        $msg.data('status', '1')
      } catch (error) {
        console.error(error)
        $msg.empty()
        $msg.data('status', '2')
        if (error instanceof AGEfansError) {
          $(`<span>${error.message}</span>`).appendTo($msg)
        } else {
          $(`<a style="cursor:pointer">加载错误，请重试</a>`)
            .appendTo($msg)
            .on('click', async () => {
              // 失败需要重试获取cookie
              await updateCookie()
              _getUrl()
            })
        }
      }
    }
    _getUrl()
  })
}

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

export function showLocalURL() {
  const list = getAllVideoUrlList()
  const $parent = $('#url-list')
  $parent.empty()
  $(
    list
      .map((item) => {
        const vurl = getLocal(item.href)
        if (vurl) {
          return genUrlItem(item.title, vurl)
        } else {
          return ''
        }
      })
      .join('')
  ).appendTo($parent)
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
    throw new AGEfansError('脚本不支持QLIVE模式，请使用关闭脚本使用原生播放')
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
  insertBtn()
  showLocalURL()
}