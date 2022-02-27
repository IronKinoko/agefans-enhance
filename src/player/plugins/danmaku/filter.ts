import { KPlayer } from '../..'

export function createFilter(player: KPlayer, refreshDanmaku: () => void) {
  const $filter = $('#k-player-danmaku-filter-form')

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
