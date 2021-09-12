import $ from 'jquery'
import './message.scss'
export class Message {
  constructor(selector) {
    this.$message = $('<div id="k-player-message">')
    this.$message.appendTo($(selector))
  }

  info(text, duration = 1500) {
    this.$message.empty()
    return new Promise((resolve) => {
      $(`<div class="k-player-message-item"></div>`)
        .append(text)
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
