function set(name, value, _in_days = 1) {
  var Days = _in_days
  var exp = new Date()
  exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000)
  document.cookie =
    name + '=' + escape(value) + ';expires=' + exp.toGMTString() + ';path=/'
}

function get(name) {
  var arr,
    reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)')
  if ((arr = document.cookie.match(reg))) {
    return decodeURIComponent(arr[2])
  } else {
    return null
  }
}

export const Cookie = {
  get,
  set,
  remove: function (name) {
    set(name, '', 0)
  },
}
