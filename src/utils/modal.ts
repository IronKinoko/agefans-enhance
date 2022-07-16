import './modal.scss'

export interface ModalOpts {
  title?: string | JQuery
  content: string | JQuery
  onClose?: () => void
  onOk?: () => void
  okText?: string
  className?: string
  width?: number
}
export function modal(opts: ModalOpts) {
  const { title, content, onClose, onOk, okText = '确 定' } = opts
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
        <a class="k-modal-close">
          <svg viewBox="64 64 896 896" focusable="false" data-icon="close" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 00203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path></svg>
        </a>
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
  } else $(`#${ID} .k-modal-header-title`).remove()
  $(`#${ID} .k-modal-body`).append(content)
  $(`#${ID} .k-modal-close`).on('click', () => {
    handleClose()
  })
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
