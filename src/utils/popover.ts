import './popover.scss'
export function popover(target: string | JQuery, overlay: string | JQuery) {
  const $target = $(target as JQuery)
  const $content = $(
    `<div class="k-popover-overlay"><div class="k-popover-content"></div></div>`
  )
  $content.on('click', (e) => e.stopPropagation())
  $content.find('.k-popover-content').append(overlay)
  let timeID: number | undefined
  $target.addClass('k-popover')
  $target.on('mouseenter', () => {
    clearTimeout(timeID)
    timeID = window.setTimeout(() => {
      $content.fadeIn('fast')
    }, 100)
  })
  $target.on('mouseleave', () => {
    clearTimeout(timeID)
    timeID = window.setTimeout(() => {
      $content.fadeOut('fast')
    }, 100)
  })
  $target.append($content)

  return $target
}
