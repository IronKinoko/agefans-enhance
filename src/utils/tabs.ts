import './tabs.scss'

interface Tab {
  name: string
  content: string
}
export function tabs(opts: Tab[]) {
  const tabsHTML: string[] = []
  const tabsContentHTML: string[] = []
  opts.forEach((tab, idx) => {
    const tabHTML = `<div class="k-tab" data-idx="${idx}">${tab.name}</div>`
    const contentHTML = `<div class="k-tab-pane">${tab.content}</div>`
    tabsHTML.push(tabHTML)
    tabsContentHTML.push(contentHTML)
  })

  const $root = $(`<div class="k-tabs-wrapper">
    <div class="k-tabs">
      ${tabsHTML.join('')}
      <div class="k-tab-indicator"></div>
    </div>
    <div class="k-tabs-panes">${tabsContentHTML.join('')}</div>
  </div>`)

  const $indicator = $root.find('.k-tab-indicator')

  $root.find('.k-tab').on('click', (e) => {
    const $tab = $(e.target)
    const idx = parseInt($tab.attr('data-idx') as string)
    $root.find('.k-tabs-panes').css('transform', `translateX(-${idx * 100}%)`)

    function updateIndictor() {
      const width = $tab.outerWidth()
      if (width) $indicator.css({ width, left: idx * width })
      else requestAnimationFrame(updateIndictor)
    }
    updateIndictor()
  })

  $root.find('.k-tab:first').trigger('click')

  return $root
}
