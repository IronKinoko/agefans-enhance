function checkCSS() {
  if ($('#k-modal-css').length === 0) {
    $(`
    <style id="k-modal-css">
      .k-modal {
        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .k-modal * {
        color: rgba(0, 0, 0, 0.85);
      }
      .k-modal .k-modal-mask {
        position: absolute;
        z-index: 100;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.45);
      }
      .k-modal .k-modal-container {
        position: absolute;
        z-index: 101;
        width: 520px;
        min-height: 100px;
        background: white;
        border-radius: 2px;
      }
      .k-modal .k-modal-header {
        font-size: 16px;
        padding: 16px;
        border-bottom: 1px solid #f1f1f1;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .k-modal .k-modal-close,
      .k-modal .k-modal-mask {
        cursor: pointer;
      }
      .k-modal .k-modal-body,
      .k-modal .k-modal-footer {
        padding: 16px;
        font-size: 14px;
      }
      .k-modal .k-modal-footer {
        border-top: 1px solid #f1f1f1;
        display: flex;
        justify-content: flex-end;
      }
      .k-modal .k-modal-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 32px;
        border-radius: 2px;
        border: 1px solid #2af;
        background: #2af;
        color: white;
        min-width: 64px;
        cursor: pointer;
      }
    </style>
    `).appendTo('head')
  }
}
export function modal({ title, content, onClose, onOk }) {
  checkCSS()

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
    $(`#${ID}`).remove()
    onClose && onClose()
  })
  $(`#${ID} .k-modal-mask`).on('click', () => {
    $(`#${ID}`).remove()
    onClose && onClose()
  })

  if (onOk) {
    $(`#${ID} .k-modal-container`).append(`
      <div class="k-modal-footer">
        <button class="k-modal-btn k-modal-ok">确 定</button>
      </div>
    `)
    $(`#${ID} .k-modal-ok`).on('click', () => {
      onOk()
      $(`#${ID}`).remove()
    })
  }
}
