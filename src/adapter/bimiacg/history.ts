import throttle from 'lodash-es/throttle'
import { modal } from '../../utils/modal'
import { parseTime } from '../../utils/parseTime'
import { local } from '../../utils/storage'

export interface Info {
  id: string
  url: string
  animeName: string
  episodeName: string
  time?: number
}
const his = {
  key: 'bangumi-history',
  load() {
    return local.getItem<Info[]>(this.key, [])
  },
  save(data: Info[]) {
    local.setItem(this.key, data.slice(0, 100))
  },
  log(info: Info, time: number) {
    let data = local.getItem<Info[]>(this.key, [])
    data = data.filter((o) => o.id !== info.id)
    data.unshift({ ...info, time })
    this.save(data)
  },
}

export const logHis = throttle(his.log.bind(his), 1000)

function renderHistroy() {
  const data = his.load()

  const content = data
    .map(
      (info) =>
        `<tr>
    <td>
      <a href="${info.url}">${info.animeName}</a>
    </td>
    <td>
      <a href="${info.url}">${info.episodeName}</a>
    </td>
    <td>${parseTime(info.time)}</td>
    </tr>`
    )
    .join('')

  modal({
    title: '历史记录',
    content: `
    <table class="bimi-his-table">
      <thead>
        <tr>
          <th>标题</th>
          <th>章节</th>
          <th style="width:100px">时间</th>
        </tr>
      </thead>
      <tbody>
        ${content}
      </tbody>
    </table>
      `,
  })
}

function createButton() {
  const $btn = $('<li class="item"><a>历史</a></li>')
  $btn.on('click', renderHistroy)

  $('.header-top__nav ul').append($btn)
}

export function histroyModule() {
  createButton()
}
