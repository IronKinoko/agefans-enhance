import { KPlayer } from '../..'
import { modal } from '../../../utils/modal'
import { parseTime } from '../../../utils/parseTime'
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
          <div>来源：</div>
          <div class="k-player-danmaku-list-source"></div>
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
        <tr data-source="${cmt.user.source}">
          <td>${parseTime(cmt.time)}</td>
          <td>${cmt.text}</td>
          <td>${cmt.user.source}</td>
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
        refreshDanmaku()
      },
    })

    const $source = $root.find('.k-player-danmaku-list-source')

    Array.from(new Set(comments.map((o) => o.user.source))).forEach(
      (source) => {
        const isDisabled =
          player.localConfig.danmakuSourceDisabledList.includes(source)

        $(`<label class="k-player-danmaku-list-source-item k-capsule">
            <input hidden type="checkbox" value="${source}"/>
            <div>${source}</div>
          </label>`)
          .appendTo($source)
          .find('input')
          .prop('checked', !isDisabled)
          .on('change', (e) => {
            let next = [...player.localConfig.danmakuSourceDisabledList]
            if (e.currentTarget.checked) {
              next = next.filter((src) => src !== source)
            } else {
              next.push(source)
            }
            player.configSaveToLocal('danmakuSourceDisabledList', next)
          })
      }
    )

    const $wrapper = $root.find('.k-player-danmaku-list-table-wrapper')
    const $content = $root.find('.k-player-danmaku-list-table-content')
    const $table = $root.find('.k-player-danmaku-list-table')

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
