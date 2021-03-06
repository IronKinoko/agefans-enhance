import './history.scss'
import { gm } from '../../../utils/storage'
import { pagePreview } from '../utils/pagePreview'
import { parseTime } from '../../../utils/parseTime'

const LOCAL_HISTORY_KEY = 'v-his'
const MAX_HISTORY_LENGTH = 100

export interface HistoryItem {
  id: string
  title: string
  href: string
  section: string
  time: number
  logo: string
}

class History {
  get his() {
    return gm.getItem<HistoryItem[]>(LOCAL_HISTORY_KEY, [])
  }
  set his(value) {
    if (Array.isArray(value)) {
      gm.setItem(LOCAL_HISTORY_KEY, value.slice(0, MAX_HISTORY_LENGTH))
    }
  }
  getAll(): HistoryItem[] {
    return this.his
  }
  get(id: string): HistoryItem | undefined {
    return this.his.find((o) => o.id === id)
  }
  setTime(id: string, time = 0) {
    const his = this.his
    his.find((o) => o.id === id)!.time = time
    this.his = his
  }
  log(item: HistoryItem) {
    const his = this.his
    his.unshift(item)
    this.his = his
  }
  refresh(id: string, data?: HistoryItem) {
    const his = this.his
    const index = his.findIndex((o) => o.id === id)
    const item = his.splice(index, 1)[0]
    his.unshift(data || item)
    this.his = his
  }

  has(id: string) {
    return Boolean(this.his.find((o) => o.id === id))
  }

  logHistory() {
    const id = location.pathname.match(/\/play\/(\d*)/)?.[1]
    if (!id) return

    const hisItem = {} as HistoryItem
    hisItem.id = id
    hisItem.title = $('#detailname a').text()
    hisItem.href = location.pathname + location.search
    hisItem.section = $('li a[style*="color: rgb(238, 0, 0);"]').text()
    hisItem.time = 0
    hisItem.logo = $('#play_poster_img').attr('src')!

    if (this.has(id)) {
      const oldItem = this.get(id)!
      if (oldItem.href !== hisItem.href) {
        this.refresh(id, hisItem)
      } else {
        this.refresh(id)
      }
    } else {
      this.log(hisItem)
    }
  }
}
export const his = new History()

export function renderHistoryList() {
  $('#history')
    .html('')
    .append(() => {
      /** @type {any[]} */
      const histories = his.getAll()
      let html = ''
      histories.forEach((o) => {
        html += `<a class="history-item" href="${o.href}" data-id="${
          o.id
        }" data-detail-href="/detail/${o.id}">
          <img
            referrerpolicy="no-referrer"
            src="${o.logo}"
            alt="${o.title}"
            title="${o.title}"
          />
          <div class="desc">
            <div class="title">${o.title}</div>
            <div class="position">${o.section} ${parseTime(o.time)}</div>
          </div>
        </a>
      `
      })
      return `<div class="history-list">${
        html || '<center>????????????</center>'
      }</div>`
    })
    .find('a')
    .each((_, anchor) => pagePreview(anchor, anchor.dataset.detailHref!))
}

function changeHash(hash?: string) {
  if (hash) {
    history.replaceState(null, '', `#${hash}`)
  } else {
    const url = new URL(location.href)
    url.hash = ''
    history.replaceState(null, '', url)
  }
}

function refreshHistoryList() {
  const list = his.getAll()
  const $doms = $('#history .history-item')
  if (list.length !== $doms.length) return renderHistoryList()

  list.forEach((item) => {
    const $dom = $(`#history a[data-id='${item.id}']`)
    $dom.attr('href', item.href)
    $dom.find('.title').text(item.title)
    $dom.find('.position').text(`${item.section} ${parseTime(item.time)}`)
  })
}

const { startRefresh, stopRefresh } = (function () {
  let time: number | undefined

  return {
    startRefresh: () => {
      clearInterval(time)
      time = window.setInterval(refreshHistoryList, 1000)
    },
    stopRefresh: () => {
      clearInterval(time)
    },
  }
})()
function renderHistoryPage() {
  const currentDom = $('.nav_button_current')

  $('<div id="history"></div>').insertAfter('#container').hide()

  const $hisNavBtn = $(`<a class="nav_button">??????</a>`)
    .insertBefore('#nav form')
    .on('click', (e) => {
      if ($('#history').is(':visible')) {
        $('#container').show()
        $('#history').hide()
        stopRefresh()
        changeHash()
        changeActive(currentDom)
      } else {
        refreshHistoryList()
        $('#container').hide()
        $('#history').show()
        startRefresh()
        changeHash('/history')
        changeActive($(e.currentTarget))
      }
    })

  // ????????????????????? nav ?????? href ?????????????????????
  $('.nav_button_current')
    .on('click', (e) => {
      $('#container').show()
      $('#history').hide()
      stopRefresh()
      changeActive(e.currentTarget)
      changeHash()
    })
    .removeAttr('href')

  if (window.location.hash === '#/history') {
    $('#container').hide()
    $('#history').show()
    startRefresh()
    changeActive($hisNavBtn)
  }
}

function changeActive(dom: HTMLElement | JQuery<HTMLElement>) {
  $('.nav_button_current').removeClass('nav_button_current')
  $(dom).addClass('nav_button_current')
}

export function historyModule() {
  renderHistoryPage()
  renderHistoryList()
}
