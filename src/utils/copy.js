import $ from 'jquery'
export function copyToClipboard(element) {
  var $temp = $('<textarea>')
  $('body').append($temp)
  $temp.val($(element).text()).trigger('select')
  document.execCommand('copy')
  $temp.remove()
}
