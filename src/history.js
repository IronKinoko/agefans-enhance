class History {
  constructor() {
    this.cacheKey = 'v-his'
  }
  get his() {
    return JSON.parse(localStorage.getItem(this.cacheKey) || '[]')
  }
  set his(value) {
    if (Array.isArray(value)) {
      localStorage.setItem(this.cacheKey, JSON.stringify(value.slice(0, 100)))
    }
  }
  getAll() {
    return this.his
  }
  get(id) {
    return this.his.find((o) => o.id === id)
  }
  setTime(id, time = 0) {
    const his = this.his
    his.find((o) => o.id === id).time = time
    this.his = his
  }
  log(item) {
    const his = this.his
    his.unshift(item)
    this.his = his
  }
  refresh(id, data) {
    const his = this.his
    const index = his.findIndex((o) => o.id === id)
    const item = his.splice(index, 1)[0]
    his.unshift(data || item)
    this.his = his
  }
  
  has(id) {
    return Boolean(this.his.find((o) => o.id === id))
  }

  logHistory() {
    const id = location.pathname.match(/\/play\/(\d*)/)?.[1]
    if (!id) return

    const hisItem = {}
    hisItem.id = id
    hisItem.title = $('#detailname a').text()
    hisItem.href = location.href
    hisItem.section = $('li a[style*="color: rgb(238, 0, 0);"]').text()
    hisItem.time = 0
    hisItem.logo = $('#play_poster_img').attr('src')

    if (this.has(id)) {
      const oldItem = this.get(id)
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

function parseTime(time = 0) {
  return `${Math.floor(time / 60)
    .toString()
    .padStart(2, '0')}:${(time % 60).toString().padStart(2, '0')}`
}
export function renderHistoryList() {
  $('#history')
    .html('')
    .append(() => {
      /** @type {any[]} */
      const histories = his.getAll()
      let html = ''
      histories.forEach((o) => {
        html += `<a class="history-item" href="${o.href}">
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
        html || '<center>暂无数据</center>'
      }</div>`
    })
}

function renderHistoryPage() {
  const currentDom = $('.nav_button_current')
  $(
    '<style>.nav_button{cursor: pointer;}#history{background:#202020;border:4px solid #303030;}.history-list{padding:16px;display:flex;flex-wrap:wrap;}.history-item{width:115px;display:inline-block;margin:4px}.history-item img{width: 100%;border-radius:2px}.history-item .desc .title{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:14px;margin:4px 0}.history-item .desc .position{font-size:14px}</style>'
  ).appendTo('head')
  $('<div id="history"></div>').insertBefore('#footer').hide()

  $(`<a class="nav_button">历史</a>`)
    .appendTo('#nav')
    .on('click', (e) => {
      if ($('#history').is(':visible')) {
        $('#container').show()
        $('#history').hide()
        changeActive(currentDom)
      } else {
        renderHistoryList()
        $('#container').hide()
        $('#history').show()
        changeActive($(e.currentTarget))
      }
    })

  $('.nav_button_current')
    .on('click', (e) => {
      $('#container').show()
      $('#history').hide()
      changeActive(e.currentTarget)
    })
    .removeAttr('href')
}

function changeActive(dom) {
  $('.nav_button_current').removeClass('nav_button_current')
  $(dom).addClass('nav_button_current')
}

export function historyModule() {
  renderHistoryPage()
  renderHistoryList()
}
