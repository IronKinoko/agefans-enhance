import { KPlayer } from '../..'
import { alert } from '../../../utils/alert'
import { modal } from '../../../utils/modal'
import { parseTime } from '../../../utils/parseTime'

export function createDanmakuList(player: KPlayer) {
  const $open = $('#k-player-danmaku-search-form .open-danmaku-list')

  $open.on('click', () => {
    const comments = player.danmaku!.state.comments
    if (!comments || !comments.length) return

    const $root = $(`
      <div class="k-player-danmaku-list-wrapper">
        <div class="k-player-danmaku-list-source-filter">
          ${alert('由于弹弹play开放平台相关接口下架，弹幕来源功能已不再可用')}
        </div>
      
        <div class="k-player-danmaku-list-table-wrapper">
          <div class="k-player-danmaku-list-table-content">
            <table class="k-table k-player-danmaku-list-table">
              <thead>
                <tr>
                  <th>时间</th>
                  <th>内容</th>
                </tr>
              </thead>
              <tbody>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `)

    const $wrapper = $root.find('.k-player-danmaku-list-table-wrapper')
    const $content = $root.find('.k-player-danmaku-list-table-content')
    const $table = $root.find('.k-player-danmaku-list-table')

    let i = 0
    let end = 100
    const render = () => {
      if (i >= comments.length) {
        $content.height('')
        return
      }

      $root.find('tbody').append(
        comments
          .slice(i, end)
          .map(
            (cmt) => `
              <tr>
                <td>${parseTime(cmt.time)}</td>
                <td>${cmt.text}</td>
              </tr>`
          )
          .join('')
      )
      i = end
    }
    render()

    modal({
      title: '弹幕列表',
      content: $root,
      className: 'k-player-danmaku-list',
      afterClose: () => {
        player.danmaku!.refreshDanmaku()
      },
    })

    const itemHeight = $root.find('thead tr').height()!
    $content.height(itemHeight * (comments.length + 1))

    $wrapper.on('scroll', (e) => {
      const dom = e.currentTarget
      const height = dom.scrollTop + dom.clientHeight + 1000

      if ($table.height()! < height) {
        end = Math.ceil(height / itemHeight)
        render()
      }
    })
  })
}
