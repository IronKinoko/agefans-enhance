import './tabs.scss'

interface Tab {
  name: string
  className?: string
  content: string | JQuery | (() => string | JQuery)
}
export function tabs(opts: Tab[]) {
  const tabsHTML: string[] = []
  const tabsContentHTML: JQuery[] = []
  opts.forEach((tab, idx) => {
    const tabHTML = `<div class="k-tab" data-idx="${idx}">${tab.name}</div>`
    const $contentHTML = $(
      `<div class="k-tab-pane ${tab.className || ''}"></div>`
    )

    $contentHTML.append(
      typeof tab.content === 'function' ? tab.content() : tab.content
    )

    tabsHTML.push(tabHTML)
    tabsContentHTML.push($contentHTML)
  })

  const $root = $(`<div class="k-tabs-wrapper">
    <div class="k-tabs">
      ${tabsHTML.join('')}
      <div class="k-tab-indicator"></div>
    </div>
    <div class="k-tabs-panes"></div>
  </div>`)

  $root.find('.k-tabs-panes').append(...tabsContentHTML)

  const $indicator = $root.find('.k-tab-indicator')

  $root.find('.k-tab').on('click', (e) => {
    $root.find('.k-tab').removeClass('active')
    const $tab = $(e.target).addClass('active')
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
