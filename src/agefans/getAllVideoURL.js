import $ from 'jquery'
import { copyToClipboard } from '../utils/copy'
import { modal } from '../utils/modal'
import parseToURL from '../utils/parseToURL'
import './getAllVideoURL.scss'
import { getPlayUrl, updateCookie } from './playURL'
/**
 * @typedef {{title:string,href:string}} ATag
 */

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
    insertLocal()
  })
  $('#open-modal').on('click', function () {
    modal({
      title: '选择需要的链接',
      content: insertModalForm(),
      onOk: () => {
        let list = []
        $('#modal-form .col input:checked').each((_, el) => {
          list.push({
            title: $(el).data('title'),
            href: $(el).attr('name'),
          })
        })
        insertResult(list)
      },
    })
  })
  $('#thunder-link').attr('href', () => {
    const map = getLocal()
    const list = getAllVideoUrlList()
    const tasks = []
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

/**
 * @return {ATag[]}
 */
function getAllVideoUrlList() {
  const $aTagList = $('.movurl:visible li a')
  const aTags = []
  $aTagList.each(function (index, aTag) {
    aTags.push({
      title: aTag.textContent,
      href: aTag.dataset.href,
    })
  })

  return aTags
}

function insertModalForm() {
  const list = getAllVideoUrlList()

  let $dom = $(`
  <div id="modal-form">
    <div class="k-alert k-alert-info">
      <span class="k-alert-icon">
        <svg viewBox="64 64 896 896" focusable="false" data-icon="info-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true">
          <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm32 664c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V456c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272zm-32-344a48.01 48.01 0 010-96 48.01 48.01 0 010 96z"></path>
        </svg>
      </span>
      <div class="k-alert-content">
        <div class="k-alert-message">如果在1-2分钟内调用超过70多次，会被限流影响正常观看视频</div>
      </div>
    </div>
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
    $dom.find('.row .col input').prop('checked', e.currentTarget.checked)
  })
  return $dom
}

function genUrlItem(title, content = '加载中...') {
  const contentHTML = content.startsWith('http')
    ? `<a href="${content}" download>${content}</a>`
    : content

  return `<div>
  <div style="white-space: nowrap;">[${title}]</div>
  <div class="url" data-status='0' style="word-break:break-all; word-wrap:break-word;">
    ${contentHTML}
  </div>
</div>`
}

const loadingIcon = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin-right:4px;" width="1em" height="1em" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
  <circle cx="50" cy="50" fill="none" stroke="#5699d2" stroke-width="10" r="40" stroke-dasharray="164.93361431346415 56.97787143782138">
    <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="0.6s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform>
  </circle>
</svg>`

/**
 * @param {ATag[]} list
 */
async function insertResult(list) {
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
        $msg.html(`<a href="${vurl}" download>${vurl}</a>`)
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

const PLAY_URL_KEY = 'play-url-key'
/**
 * @return {Record<string,{url:string}>}
 */
function getLocal() {
  return JSON.parse(window.localStorage.getItem(PLAY_URL_KEY) || '{}')
}
export function saveLocal(href, url) {
  const map = getLocal()
  map[href] = { url }
  window.localStorage.setItem(PLAY_URL_KEY, JSON.stringify(map))
}

export function removeLocal(href) {
  const map = getLocal()
  delete map[href]
  window.localStorage.setItem(PLAY_URL_KEY, JSON.stringify(map))
}

function insertLocal() {
  const map = getLocal()
  const list = getAllVideoUrlList()
  const $parent = $('#url-list')
  $parent.empty()
  $(
    list
      .map((item) => {
        if (map[item.href]) {
          return genUrlItem(item.title, map[item.href].url)
        } else {
          return ''
        }
      })
      .join('')
  ).appendTo($parent)
}

class AGEfansError extends Error {
  constructor(message) {
    super(message)
    this.name = 'AGEfans Enhance Exception'
  }
}
async function getVurl(href) {
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

  const json = JSON.parse(text)
  return parseToURL(json.vurl)
}
export async function getVurlWithLocal(href) {
  const map = getLocal()
  if (map[href]) {
    return map[href].url
  }

  await updateCookie(href)
  const vurl = await getVurl(href)
  saveLocal(href, vurl)
  return vurl
}

export function initGetAllVideoURL() {
  insertBtn()
  insertLocal()
}
