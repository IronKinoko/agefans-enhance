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
    local.setItem(this.key, data.slice(0, 300))
  },
  log(info: Omit<Info, 'time'>, time: number) {
    let data = this.load()
    data = data.filter((o) => o.id !== info.id)
    data.unshift({ ...info, time })
    this.save(data)
  },
  remove(id: string) {
    let data = this.load()
    data = data.filter((o) => o.id !== id)
    this.save(data)
  },
}

export const logHis = throttle(his.log.bind(his), 1000)

export function renderHistory() {
  const data = his.load()

  const $root = $(`
    <table class="k-table k-his-table">
      <colgroup>
        <col>
        <col style="width:80px">
        <col style="width:60px">
        <col style="width:60px">
      </colgroup>
      <thead>
        <tr>
          <th>标题</th>
          <th>章节</th>
          <th>时间</th>
          <th></th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
      `)

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
    <td>
      <span class="k-btn delete-btn" data-id="${info.id}">删除</span>
    </td>
    </tr>`
    )
    .join('')

  const $content = $(content)
  $content.find('.delete-btn').on('click', function () {
    const id = $(this).attr('data-id')!
    his.remove(id)
    $(this).closest('tr').remove()
  })

  $root.find('tbody').append($content)

  modal({
    title: '历史记录',
    content: $root,
  })
}
