import $ from 'jquery'
import './message.scss'
export class Message {
  $message: JQuery<HTMLDivElement>
  constructor(selector: string | JQuery) {
    this.$message = $('<div id="k-player-message">')
    this.$message.appendTo($(selector as any))
  }

  info(message: JQuery | string, duration = 1500) {
    this.$message.empty()
    return new Promise<void>((resolve) => {
      $(`<div class="k-player-message-item"></div>`)
        .append(message)
        .hide()
        .appendTo(this.$message)
        .fadeIn(150)
        .delay(duration)
        .fadeOut(150, function () {
          $(this).remove()
          resolve()
        })
    })
  }

  destroy() {
    this.$message.empty()
  }
}
