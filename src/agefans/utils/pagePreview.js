import $ from 'jquery'
import './pagePreview.scss'
import { session } from '../../utils/session'
import { loadingIcon } from './getAllVideoURL'
import { getSetting } from '../pages/setting'

export function pagePreview(trigger, previewURL) {
  if (!getSetting('usePreview')) return

  const $popover = $(
    `<div class='page-preview' style="display:none">
       <div class="page-preview-center">${loadingIcon}加载中...</div>
     </div>`
  ).appendTo($(trigger))

  /**
   * @param {MouseEvent} e
   */
  function caclPosition(e) {
    const safeArea = 16
    const offset = 20
    const width = $popover.width()
    const height = $popover.height()
    const { innerWidth, innerHeight } = window
    const { clientX, clientY } = e

    const maxLeft = innerWidth - width - safeArea * 2
    const maxTop = innerHeight - height - safeArea

    const left = Math.min(clientX + offset, maxLeft)
    const top =
      // 当指针与 popover 重叠时，切换位置
      clientX + offset > maxLeft && clientY + offset > maxTop
        ? clientY - offset - height
        : Math.min(clientY + offset, maxTop)

    $popover.css({ left, top })
  }

  let isLoaded = false
  let timeId = null
  $(trigger)
    .addClass('page-preview-trigger')
    .on('mouseenter', (e) => {
      $popover.show()

      caclPosition(e)

      if (isLoaded) return
      clearTimeout(timeId)
      timeId = setTimeout(async () => {
        if (isLoaded) return
        isLoaded = true

        let { img, info } = session.getItem(previewURL, {})
        if (!info) {
          const $root = $(await fetch(previewURL).then((r) => r.text()))
          img = $root
            .find('#container > div.div_left > div:nth-child(1) > div > img')
            .css({
              display: 'block',
              width: 256,
              height: 356,
            })
            .prop('outerHTML')
          info = $root
            .find('#container > div.div_left > div:nth-child(2) > div > div')
            .width(256)

          info
            .find('.blocktitle.detail_title1')
            .text($root.find('.detail_imform_name').text())

          info = info.prop('outerHTML')
          session.setItem(previewURL, { img, info })
        }

        $popover.empty().append(img, info)

        caclPosition(e)
      }, 100)
    })
    .on('mousemove', (e) => {
      caclPosition(e)
    })
    .on('mouseleave', () => {
      clearTimeout(timeId)
      $popover.hide()
    })
}
