import { KPlayer } from '../..'
import { modal } from '../../../utils/modal'
import { parseTime } from '../../../utils/parseTime'

type SourceInfo = {
  source: string
  count: number
  urls: string[]
}

const DomainColors: Record<string, string> = {
  哔哩哔哩: '#00B5E5',
  AcFun: '#FF5F6D',
  Tucao: '#45D8BA',
  巴哈姆特: '#FFB020',
  弹弹Play: '#A18CFF',
  Pakku: '#FFD84A',
}

const OtherPresetColors = [
  '#FF4D6D',
  '#F77F00',
  '#80B918',
  '#00BBF9',
  '#4361EE',
  '#B5179E',
]

export function createDanmakuList(player: KPlayer) {
  const $open = $('#k-player-danmaku-search-form .open-danmaku-list')

  $open.on('click', () => {
    const comments = player.danmaku!.state.comments
    if (!comments || !comments.length) return

    const $root = $(`
      <div class="k-player-danmaku-list-wrapper">
        <div class="k-player-danmaku-list-source-filter">
          <div class="ratio-title">来源<span id="commentCount" title="由弹幕密度与弹幕过滤计算出的数据，表示渲染数量与弹幕总数量"></span></div>
          <div class="ratio-track-wrap">
            <div class="ratio-track" id="ratioTrack" aria-label="storage ratio bar"></div>
            <div class="segment-tooltip" id="segmentTooltip"></div>
          </div>
          <div class="legends" id="legends"></div>
        </div>
      
        <div class="k-player-danmaku-list-table-wrapper">
          <div class="k-player-danmaku-list-table-content">
            <table class="k-table k-player-danmaku-list-table">
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

    const $filter = $root.find('.k-player-danmaku-list-source-filter')
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
        <tr data-source="${cmt.user.source}">
          <td>${parseTime(cmt.time)}</td>
          <td>${cmt.text}</td>
          <td>${
            cmt.user.url
              ? `<a href="${cmt.user.url}" target="_blank">${cmt.user.source}</a>`
              : cmt.user.source
          }</td>
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

    const data = comments.reduce<SourceInfo[]>((arr, cmt) => {
      const source = cmt.user.source

      const item = arr.find((i) => i.source === source)
      if (item) {
        item.count++
        if (cmt.user.url && !item.urls.includes(cmt.user.url))
          item.urls.push(cmt.user.url)
        return arr
      } else {
        arr.push({ source, count: 1, urls: cmt.user.url ? [cmt.user.url] : [] })
      }

      return arr
    }, [])

    data.sort((a, b) => a.source.localeCompare(b.source))

    const track = $filter.find('#ratioTrack')[0]
    const legends = $filter.find('#legends')[0]
    const total = comments.length
    const tooltip = $filter.find('#segmentTooltip')[0]

    const showTooltip = (event: MouseEvent, item: SourceInfo) => {
      const percent = ((item.count / comments.length) * 100).toFixed(2)
      tooltip.textContent = `${item.source}：${percent}% (${item.count}条)`
      tooltip.classList.add('is-visible')

      const rect = track.getBoundingClientRect()
      const x = event.clientX - rect.left
      tooltip.style.left = `${x}px`
    }

    const moveTooltip = (event: MouseEvent) => {
      const rect = track.getBoundingClientRect()
      const x = event.clientX - rect.left
      tooltip.style.left = `${x}px`
    }

    const hideTooltip = () => {
      tooltip.classList.remove('is-visible')
    }

    const updateCommentCount = () => {
      const renderComments = player.danmaku!.adjustCommentCount(comments)
      $filter.find('#commentCount').text(` (${renderComments.length}/${total})`)
    }

    updateCommentCount()
    track.addEventListener('mouseleave', hideTooltip)

    data.forEach((item, idx) => {
      const isDisabled = player.localConfig.danmakuSourceDisabledList.includes(
        item.source
      )

      const color =
        DomainColors[item.source] ||
        OtherPresetColors[idx % OtherPresetColors.length]

      // segment
      const segment = document.createElement('div')
      segment.className = 'ratio-segment'
      segment.style.width = `${(item.count / total) * 100}%`
      segment.style.background = color
      segment.addEventListener('mouseenter', (event) =>
        showTooltip(event, item)
      )
      segment.addEventListener('mousemove', moveTooltip)
      segment.addEventListener('mouseleave', hideTooltip)
      segment.addEventListener('click', () => {
        const bool = toggleStyle()
        setConfig(bool)
      })
      track.appendChild(segment)

      // legend
      const legend = document.createElement('div')
      legend.className = 'legend-item'
      legend.setAttribute('role', 'button')
      legend.setAttribute('tabindex', '0')
      legend.innerHTML = `
        <span class="legend-dot" style="background:${color}"></span>
        <span>${item.source}</span>
        ${item.urls.map(
          (url) =>
            `<a
            class="legend-source"
            href="${url}"
            target="_blank"
            rel="noopener noreferrer"
            title="查看数据来源"
            onclick="event.stopPropagation()"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 3h7v7"></path>
              <path d="M10 14 21 3"></path>
              <path d="M21 14v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6"></path>
            </svg>
          </a>`
        )}
     `

      const toggleStyle = () => {
        const isDisabled = legend.classList.toggle('is-disabled')
        segment.classList.toggle('is-disabled', isDisabled)
        return isDisabled
      }

      const setConfig = (bool: boolean) => {
        let next = [...player.localConfig.danmakuSourceDisabledList]
        if (bool) {
          next.push(item.source)
        } else {
          next = next.filter((src) => src !== item.source)
        }
        player.configSaveToLocal('danmakuSourceDisabledList', next)
        player.danmaku!.refreshDanmaku()
        updateCommentCount()
      }

      legend.addEventListener('click', () => {
        const bool = toggleStyle()
        setConfig(bool)
      })

      if (isDisabled) toggleStyle()

      legends.appendChild(legend)
    })
  })
}
