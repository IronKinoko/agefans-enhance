import './message.scss'
export class Message {
  constructor(selector) {
    this.$message = $('<div id="k-player-message">')
    this.$message.appendTo($(selector))
  }

  info(text, duration = 1500) {
    this.$message.empty()
    $(`<div class="k-player-message-item">${text}</div>`)
      .hide()
      .appendTo(this.$message)
      .fadeIn(150)
      .delay(duration)
      .fadeOut(150, function () {
        $(this).remove()
      })
  }

  destroy() {
    this.$message.empty()
  }
}
