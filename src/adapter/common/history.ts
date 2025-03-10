import { throttle } from 'lodash-es'
import { modal } from '../../utils/modal'
import { parseTime } from '../../utils/parseTime'
import { local } from '../../utils/storage'
import './history.scss'

export interface Info {
  id: string
  url: string
  animeName: string
  episodeName: string
  time?: number
}
const his = {
  key: 'k-history',
  load() {
    return local.getItem<Info[]>(this.key, [])
  },
  save(data: Info[]) {
    local.setItem(this.key, data.slice(0, 100))
  },
  log(info: Omit<Info, 'time'>, time: number) {
    let data = local.getItem<Info[]>(this.key, [])
    data = data.filter((o) => o.id !== info.id)
    data.unshift({ ...info, time })
    this.save(data)
  },
}

export const logHis = throttle(his.log.bind(his), 1000)

export function renderHistroy() {
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
    <table class="k-his-table">
      <thead>
        <tr>
          <th>标题</th>
          <th style="width:80px">章节</th>
          <th style="width:80px">时间</th>
        </tr>
      </thead>
      <tbody>
        ${content}
      </tbody>
    </table>
      `,
  })
}
