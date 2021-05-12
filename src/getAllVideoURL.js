import { copyToClipboard } from './utils/copy'
import { modal } from './utils/modal'
/**
 * @typedef {{title:string,href:string}} ATag
 *
 */
function __setCookie(name, value, _in_days) {
  var Days = _in_days
  var exp = new Date()
  exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000)
  document.cookie =
    name + '=' + escape(value) + ';expires=' + exp.toGMTString() + ';path=/'
}
function __getCookie(name) {
  var arr,
    reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)')
  if ((arr = document.cookie.match(reg))) {
    return unescape(arr[2])
  } else {
    return null
  }
}
function getCookie2(name) {
  return __getCookie(name)
}

function FEI2(in_epi) {
  //
  var hf_epi = Number(in_epi)
  const time_curr = new Date().getTime()

  var fa_t = Number(getCookie2('fa_t'))
  if (!fa_t) {
    fa_t = time_curr
  }

  var fa_c = Number(getCookie2('fa_c'))
  if (!fa_c) {
    fa_c = 0
  }

  //
  if (time_curr - fa_t > 6000) {
    fa_t = 0
    fa_c = 0
  }

  //
  fa_c += 1
  fa_t = time_curr

  //
  if (fa_c > 10) {
    fa_t = 0
    fa_c = 0
    //
    if (hf_epi > 1) {
      hf_epi = time_curr % hf_epi
      if (!hf_epi) {
        hf_epi = 1
      }
    }
  }

  __setCookie('fa_t', fa_t, 1)
  __setCookie('fa_c', fa_c, 1)

  return hf_epi
}
function getPlayUrl(_url) {
  const _rand = Math.random()
  var _getplay_url =
    _url.replace(
      /.*\/play\/(\d+?)\?playid=(\d+)_(\d+).*/,
      '/_getplay?aid=$1&playindex=$2&epindex=$3'
    ) +
    '&r=' +
    _rand
  var re_resl = _getplay_url.match(/[&?]+epindex=(\d+)/)
  const hf_epi = '' + FEI2(re_resl[1])
  const t_epindex_ = 'epindex='
  _getplay_url = _getplay_url.replace(
    t_epindex_ + re_resl[1],
    t_epindex_ + hf_epi
  )
  return _getplay_url
}

function insertBtn() {
  $(`
  <div class="baseblock">
    <div class="blockcontent">
      <div id="wangpan-div" class="baseblock2">
        <div class="blocktitle">获取全部视频链接：</div>
        <div class="blockcontent">
          <a id="open-modal" class="res_links_a" style="cursor:pointer">获取全部视频链接</a>
          <span>｜</span>
          <a id="all-select" class="res_links_a" style="cursor:pointer">复制内容</a>
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
      href: aTag.getAttribute('href'),
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
      fetch(getPlayUrl(item.href))
        .then((res) => res.json())
        .then((res) => {
          const url = decodeURIComponent(res.vurl)
          saveLocal(item.href, item.title, url)
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
function saveLocal(href, title, url) {
  const map = JSON.parse(window.localStorage.getItem(PLAY_URL_KEY) || '{}')
  map[href] = { title, url }
  window.localStorage.setItem(PLAY_URL_KEY, JSON.stringify(map))
}
function getLocal() {
  return JSON.parse(window.localStorage.getItem(PLAY_URL_KEY) || '{}')
}
function insertLocal() {
  const map = getLocal()
  const list = getAllVideoUrlList()
  const $parent = $('#url-list')
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
export function initGetAllVideoURL() {
  insertBtn()
  insertLocal()
}
