function __setCookie(name, value, _in_days) {
  var Days = _in_days
  var exp = new Date()
  exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000)
  document.cookie =
    name + '=' + escape(value) + ';expires=' + exp.toGMTString() + ';path=/'
}
function __getCookie(name) {
  var arr,
    reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)')
  if ((arr = document.cookie.match(reg))) {
    return unescape(arr[2])
  } else {
    return null
  }
}
function getCookie2(name) {
  return __getCookie(name)
}

function FEI2(in_epi) {
  //
  var hf_epi = Number(in_epi)
  const time_curr = new Date().getTime()

  var fa_t = Number(getCookie2('fa_t'))
  if (!fa_t) {
    fa_t = time_curr
  }

  var fa_c = Number(getCookie2('fa_c'))
  if (!fa_c) {
    fa_c = 0
  }

  //
  if (time_curr - fa_t > 6000) {
    fa_t = 0
    fa_c = 0
  }

  //
  fa_c += 1
  fa_t = time_curr

  //
  if (fa_c > 10) {
    fa_t = 0
    fa_c = 0
    //
    if (hf_epi > 1) {
      hf_epi = time_curr % hf_epi
      if (!hf_epi) {
        hf_epi = 1
      }
    }
  }

  __setCookie('fa_t', fa_t, 1)
  __setCookie('fa_c', fa_c, 1)

  return hf_epi
}
export function getPlayUrl(_url) {
  const _rand = Math.random()
  var _getplay_url =
    _url.replace(
      /.*\/play\/(\d+?)\?playid=(\d+)_(\d+).*/,
      '/_getplay?aid=$1&playindex=$2&epindex=$3'
    ) +
    '&r=' +
    _rand
  var re_resl = _getplay_url.match(/[&?]+epindex=(\d+)/)
  const hf_epi = '' + FEI2(re_resl[1])
  const t_epindex_ = 'epindex='
  _getplay_url = _getplay_url.replace(
    t_epindex_ + re_resl[1],
    t_epindex_ + hf_epi
  )
  return _getplay_url
}
