import './modal.scss'

export interface ModalOpts {
  title?: string | JQuery
  content: string | JQuery
  afterClose?: () => void
  onClose?: () => void
  onOk?: () => void
  okText?: string
  className?: string
  width?: number
  handleOkOnEnter?: boolean
}
export function modal(opts: ModalOpts) {
  const {
    title,
    content,
    onClose,
    onOk,
    afterClose,
    okText = '确 定',
    handleOkOnEnter,
  } = opts
  const store = {
    width: document.body.style.width,
    overflow: document.body.style.overflow,
  }

  const ID = Math.random().toString(16).slice(2)
  $(`
<div class="k-modal ${opts.className || ''}" role="dialog" id="${ID}">
  <div class="k-modal-mask"></div>
  <div class="k-modal-wrap">
    <div class="k-modal-container" ${
      opts.width ? `style="width:${opts.width}px;"` : ''
    }>
      <div class="k-modal-header">
        <div class="k-modal-header-title"></div>
      </div>
      <div class="k-modal-body">
      </div>
    </div>
  </div>
</div>`).appendTo('body')

  // init css
  $('body').css({
    width: `calc(100% - ${window.innerWidth - document.body.clientWidth}px)`,
    overflow: 'hidden',
  })

  if (title) {
    $(`#${ID} .k-modal-header-title`).append(title)
  } else $(`#${ID} .k-modal-header`).remove()
  $(`#${ID} .k-modal-body`).append(content)
  // Closing is handled by the mask, the Escape key and the footer button.
  $(`#${ID} .k-modal-container`).on('click', (e) => {
    e.stopPropagation()
  })
  $(`#${ID} .k-modal-wrap`).on('click', () => {
    handleClose()
  })

  function reset() {
    $(`#${ID}`).remove()
    $('body').css(store)
    window.removeEventListener('keydown', fn, { capture: true })
    afterClose?.()
  }

  function handleClose() {
    onClose?.()
    reset()
  }
  function handleOk() {
    onOk?.()
    reset()
  }

  function fn(e: KeyboardEvent) {
    if (['Escape'].includes(e.key)) {
      e.stopPropagation()
      handleClose()
    }

    if (handleOkOnEnter && e.key === 'Enter') {
      e.stopPropagation()
      handleOk()
    }
  }
  window.addEventListener('keydown', fn, { capture: true })

  if (onOk) {
    $(`#${ID} .k-modal-container`).append(`
      <div class="k-modal-footer">
        <button class="k-modal-btn k-modal-ok">${okText}</button>
      </div>
    `)
    $(`#${ID} .k-modal-ok`).on('click', () => {
      handleOk()
    })
  }
}
