import { KPlayer } from '../..'
import { modal } from '../../../utils/modal'

export function createFilter(player: KPlayer, refreshDanmaku: () => void) {
  const $filter = $('#k-player-danmaku-filter-form')

  // import 相关事件
  const $importLabel = $('#k-player-danmaku-filter-import')
  $importLabel.on('click', () => {
    modal({
      title: '导入B站屏蔽设定',
      content: `
      <p>1. 随便点开一个视频，右侧弹幕列表打开屏蔽设定，对屏蔽列表右键，导出xml文件。</p>
      <p>2. 点击下面【开始导入】按钮，选择刚下载的xml文件</p>
      `,
      okText: '开始导入',
      onOk: importBXML,
    })
  })
  function importBXML() {
    const $import = $<HTMLInputElement>(
      '<input type="file" style="display:none" accept=".xml"/>'
    )

    $import.on('change', (e) => {
      const file = e.target.files?.[0]
      $import.remove()
      if (!file) return
      const fd = new FileReader()
      fd.onload = () => {
        const result = fd.result as string
        if (typeof result === 'string') {
          const $xml = $(result)
          const $activeItems = $xml.find('item[enabled="true"]')
          let rules = $activeItems
            .map((_, el) => el.textContent)
            .get()
            .filter((t) => t.startsWith('t'))
            .map((t) => t.replace(/^t=/, ''))

          const mergedRules = new Set([
            ...player.localConfig.danmakuFilter,
            ...rules,
          ])

          player.message.info(
            `导入 ${
              mergedRules.size - player.localConfig.danmakuFilter.length
            } 条规则`
          )

          player.configSaveToLocal('danmakuFilter', [...mergedRules])

          refreshDanmaku()
          refreshFilterDom()
        }
      }
      fd.readAsText(file)
    })
    $import.appendTo('body')
    $import.get(0)?.click()
  }

  // input 相关事件
  const $input = $filter.find('[name="filter-input"]')
  $input.on('keypress', (e) => {
    if (e.key === 'Enter') addFilter($input.val() as string)
  })

  function refreshFilterDom() {
    const filters = player.localConfig.danmakuFilter

    let html = ''
    filters.forEach((filter, idx) => {
      html += `<div class="ft-row">
    <div class="ft-content">${filter}</div>
    <div class="ft-op"><a key="delete" data-idx="${idx}">删除</a></div>
    </div>`
    })
    $filter.find('.ft-body').empty().append(html)
    $filter.find('[key=delete]').on('click', (e) => {
      const idx = parseInt($(e.target).attr('data-idx') as string)
      deleteFilter(idx)
    })
    $filter.find('#filter-count').text(filters.length)
  }

  function deleteFilter(idx: number) {
    player.localConfig.danmakuFilter.splice(idx, 1)
    player.configSaveToLocal('danmakuFilter', player.localConfig.danmakuFilter)
    refreshDanmaku()
    refreshFilterDom()
  }

  function addFilter(text: string) {
    const filters = player.localConfig.danmakuFilter
    $input.val('')
    if (!text || filters.includes(text)) return

    filters.push(text)
    player.configSaveToLocal('danmakuFilter', filters)
    refreshFilterDom()
    refreshDanmaku()
  }

  refreshFilterDom()
}
