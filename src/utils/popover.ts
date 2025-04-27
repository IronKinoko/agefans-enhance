import './popover.scss'
export function popover(opts: {
  target: string | JQuery
  overlay: string | JQuery
  trigger?: 'hover' | 'click'
  onVisibleChange?: (visible: boolean) => void
}) {
  const { target, overlay, trigger = 'hover', onVisibleChange } = opts
  const $target = $(target as JQuery)
  const $content = $(
    `<div class="k-popover-overlay"><div class="k-popover-content"></div></div>`
  )
  $content.on('click', (e) => e.stopPropagation())
  $content.find('.k-popover-content').append(overlay)
  $target.addClass('k-popover')
  $target.append($content)

  let isActive = false
  let timeId: number | undefined
  const toggle = (visible: boolean, delay?: number) => {
    clearTimeout(timeId)
    timeId = window.setTimeout(() => {
      if (visible) {
        isActive = true
        $content.fadeIn('fast')
        $target.addClass('k-popover-active')
        onVisibleChange?.(true)
      } else {
        isActive = false
        $content.fadeOut('fast')
        $target.removeClass('k-popover-active')
        onVisibleChange?.(false)
      }
    }, delay)
  }

  if (trigger === 'click') {
    $target.on('click', () => {
      toggle(!isActive)
    })
    window.addEventListener(
      'click',
      (e) => {
        if (!$target[0].contains(e.target as any)) {
          if (isActive) toggle(false)
        }
      },
      { capture: true }
    )
  } else {
    $target.on('mouseenter', () => {
      toggle(true, 100)
    })
    $target.on('mouseleave', () => {
      toggle(false, 100)
    })
  }

  return $target
}
