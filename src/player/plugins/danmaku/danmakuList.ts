import { KPlayer } from '../..'
import { modal } from '../../../utils/modal'
import { parseTime } from '../../../utils/parseTime'
import { parseToJSON } from '../../../utils/parseToJSON'
import { Comment } from './types'

export function createDanmakuList(
  player: KPlayer,
  getComments: () => Comment[] | undefined,
  refreshDanmaku: () => void
) {
  const $open = $('#k-player-danmaku-search-form .open-danmaku-list')

  $open.on('click', () => {
    const comments = getComments()
    if (!comments) return

    const $root = $(`
      <div class="k-player-danmaku-list-wrapper">
        <div class="k-player-danmaku-list-source-filter">
          
        </div>
      
        <div class="k-player-danmaku-list-table-wrapper">
          <div class="k-player-danmaku-list-table-content">
            <table class="k-player-danmaku-list-table">
              <thead>
                <tr>
                  <th>时间</th>
                  <th>内容</th>
                  <th>来源</th>
                </tr>
              </thead>
              <tbody>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `)

    let i = 0
    const render = () => {
      if (i >= comments.length) {
        $content.height('')
        return
      }
      $root.find('tbody').append(
        comments
          .slice(i, (i += 100))
          .map(
            (cmt) => `
        <tr data-source="${cmt.user.source}">
          <td>${parseTime(cmt.time)}</td>
          <td>${cmt.text}</td>
          <td>${cmt.user.source}</td>
        </tr>`
          )
          .join('')
      )
    }
    render()

    modal({
      title: '弹幕列表',
      content: $root,
      className: 'k-player-danmaku-list',
      onOk: () => {},
    })

    const $wrapper = $root.find('.k-player-danmaku-list-table-wrapper')
    const $content = $root.find('.k-player-danmaku-list-table-content')
    const $table = $root.find('.k-player-danmaku-list-table')

    $content.height($root.find('thead tr').height()! * (comments.length + 1))

    $wrapper.on('scroll', (e) => {
      const dom = e.currentTarget
      if ($table.height()! < dom.scrollTop + dom.clientHeight + 1000) render()
    })
  })
}
