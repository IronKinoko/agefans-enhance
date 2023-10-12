import './popover.scss'
export function popover(
  target: string | JQuery,
  overlay: string | JQuery,
  trigger: 'hover' | 'click' = 'hover'
) {
  const $target = $(target as JQuery)
  const $content = $(
    `<div class="k-popover-overlay"><div class="k-popover-content"></div></div>`
  )
  $content.on('click', (e) => e.stopPropagation())
  $content.find('.k-popover-content').append(overlay)
  $target.addClass('k-popover')
  $target.append($content)

  if (trigger === 'click') {
    $target.on('click', () => {
      $content.fadeIn('fast')
      $target.addClass('k-popover-active')
    })
    window.addEventListener('click', (e) => {
      if (!$target[0].contains(e.target as any)) {
        $content.fadeOut('fast')
        $target.removeClass('k-popover-active')
      }
    })
  } else {
    let timeID: number | undefined
    $target.on('mouseenter', () => {
      clearTimeout(timeID)
      timeID = window.setTimeout(() => {
        $content.fadeIn('fast')
        $target.addClass('k-popover-active')
      }, 100)
    })
    $target.on('mouseleave', () => {
      clearTimeout(timeID)
      timeID = window.setTimeout(() => {
        $content.fadeOut('fast')
        $target.removeClass('k-popover-active')
      }, 100)
    })
  }

  return $target
}
