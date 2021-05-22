import { copyToClipboard } from '../utils/copy'
import { modal } from '../utils/modal'
import { getPlayUrl } from './playURL'

/**
 * @typedef {{title:string,href:string}} ATag
 */

function insertBtn() {
  $(`
  <div class="baseblock">
    <div class="blockcontent">
      <div id="wangpan-div" class="baseblock2">
        <div class="blocktitle">获取全部视频链接：</div>
        <div class="blockcontent">
          <a id="open-modal" class="res_links_a" style="cursor:pointer">获取全部视频链接</a>
          <span>｜</span>
          <a id="clean-all" class="res_links_a" style="cursor:pointer">清空</a>
          <span>｜</span>
          <a id="all-select" class="res_links_a" style="cursor:pointer">复制内容</a>
          <span>｜</span>
          <a id="thunder-link" target="_blank" class="res_links_a" style="cursor:pointer">导出迅雷链接</a>
          <div id="url-list" style="width:100%; max-height:400px; overflow:auto;"></div>
        </div>
      </div>
    </div>
  </div>
`).insertAfter($('.baseblock:contains(网盘资源)'))
  $('#all-select').on('click', function () {
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
        $('#modal-form input').each(function (_, el) {
          if (el.checked) {
            list.push({
              title: $(this).data('title'),
              href: $(this).attr('name'),
            })
          }
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
    <ul>
      ${list
        .map(
          (aTag) => `
        <li>
          <label><input type="checkbox" name="${aTag.href}" data-title="${aTag.title}" checked />${aTag.title}</label>
        </li>`
        )
        .join('')}
    </ul>
  </div>
  `)

  return $dom
}

function genUrlItem(title, content = '加载中...') {
  return `<div>
  <div style="white-space: nowrap;">[${title}]</div>
  <div class="url" data-status='0' style="word-break:break-all; word-wrap:break-word;">${content}</div>
</div>`
}
/**
 * @param {ATag[]} list
 */
function insertResult(list) {
  const $parent = $('#url-list')
  $parent.empty()
  list.forEach((item) => {
    let $dom = $(genUrlItem(item.title)).appendTo($parent)

    let $msg = $dom.find('.url')
    function _getUrl() {
      getVurl(item.href)
        .then((vurl) => {
          const url = decodeURIComponent(vurl)
          saveLocal(item.href, url)
          $msg.text(url)
          $msg.data('status', '1')
        })
        .catch((error) => {
          console.error(error)
          $msg.empty()
          $msg.data('status', '2')
          $(`<a style="cursor:pointer">加载出错，重试</a>`)
            .appendTo($msg)
            .on('click', () => {
              _getUrl()
            })
        })
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

async function getVurl(href) {
  const res = await fetch(getPlayUrl(href), {
    referrerPolicy: 'strict-origin-when-cross-origin',
  }).then((res) => res.json())
  return decodeURIComponent(res.vurl)
}
export async function getVurlWithLocal(href) {
  const map = getLocal()
  if (map[href]) {
    return map[href].url
  }

  const vurl = await getVurl(href)
  saveLocal(href, vurl)
  return vurl
}

export function initGetAllVideoURL() {
  insertBtn()
  insertLocal()
}
