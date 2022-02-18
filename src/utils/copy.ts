export function copyToClipboard(element: JQuery | HTMLElement) {
  var $temp = $('<textarea>')
  $('body').append($temp)
  $temp.val($(element).text()).trigger('select')
  document.execCommand('copy')
  $temp.remove()
}
