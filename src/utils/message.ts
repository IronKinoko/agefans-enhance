import './message.scss'
export class Message {
  $message: JQuery<HTMLDivElement>
  constructor(selector: string | JQuery) {
    this.$message = $('<div id="k-player-message">')
    this.$message.appendTo($(selector as any))
  }

  info(message: JQuery | string, ms = 1500) {
    return new Promise<void>((resolve) => {
      $(`<div class="k-player-message-item"></div>`)
        .append(message)
        .hide()
        .appendTo(this.$message)
        .show(150)
        .delay(ms)
        .hide(150, function () {
          $(this).remove()
          resolve()
        })
    })
  }

  destroy() {
    this.$message.empty()
  }
}
