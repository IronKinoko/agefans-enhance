import $ from 'jquery'
import './popover.scss'
export function popover(target, content) {
  const $target = $(target)
  const $content = $(
    `<div class="k-popover-overlay"><div class="k-popover-content">${content}</div></div>`
  )
  let timeID = null
  $target.addClass('k-popover')
  $target.on('mouseenter', () => {
    clearTimeout(timeID)
    $content.fadeIn('fast')
  })
  $target.on('mouseleave', () => {
    clearTimeout(timeID)
    timeID = setTimeout(() => {
      $content.fadeOut('fast')
    }, 100)
  })
  $target.append($content)

  return $target
}
