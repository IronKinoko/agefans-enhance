import './popover.scss'
export function popover(target: string, content: string) {
  const $target = $(target)
  const $content = $(
    `<div class="k-popover-overlay"><div class="k-popover-content">${content}</div></div>`
  )
  let timeID: number | undefined
  $target.addClass('k-popover')
  $target.on('mouseenter', () => {
    clearTimeout(timeID)
    $content.fadeIn('fast')
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
