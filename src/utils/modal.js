import './modal.scss'
export function modal({ title, content, onClose, onOk }) {
  const ID = Math.random().toString(16).slice(2)
  $(`
<div class="k-modal" role="dialog" id="${ID}">
  <div class="k-modal-mask"></div>
  <div class="k-modal-container">
    <div class="k-modal-header">
      <div class="k-modal-title"></div>
      <a class="k-modal-close">X</a>
    </div>
    <div class="k-modal-body">
    </div>
  </div>
</div>`).appendTo('body')

  $(`#${ID} .k-modal-title`).append(title)
  $(`#${ID} .k-modal-body`).append(content)
  $(`#${ID} .k-modal-close`).on('click', () => {
    handleClose()
  })
  $(`#${ID} .k-modal-mask`).on('click', () => {
    handleClose()
  })

  function reset() {
    $(`#${ID}`).remove()
    $('body').css('overflow', '')
    window.removeEventListener('keydown', fn, { capture: true })
  }

  function handleClose() {
    onClose?.()
    reset()
  }
  function handleOk() {
    onOk()
    reset()
  }

  function fn(e) {
    if (['Escape', '?', '？'].includes(e.key)) {
      handleClose()
    }
    e.stopPropagation()
  }
  window.addEventListener('keydown', fn, { capture: true })
  $('body').css('overflow', 'hidden')
  if (onOk) {
    $(`#${ID} .k-modal-container`).append(`
      <div class="k-modal-footer">
        <button class="k-modal-btn k-modal-ok">确 定</button>
      </div>
    `)
    $(`#${ID} .k-modal-ok`).on('click', () => {
      handleOk()
    })
  }
}
