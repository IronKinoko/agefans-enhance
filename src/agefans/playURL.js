function __setCookie(name, value, _in_days) {
  var Days = _in_days
  var exp = new Date()
  exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000)
  document.cookie =
    name + '=' + escape(value) + ';expires=' + exp.toGMTString() + ';path=/'
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

  __setCookie('fa_t', Date.now(), 1)
  __setCookie('fa_c', 1, 1)
  return _getplay_url
}

/** 因为agefans的安全策略，需要刷新下他的cookie才能正常访问 */
export function updateCookie(href) {
  href = href ? location.origin + href : location.href
  return new Promise((resolve, reject) => {
    $('<iframe/>')
      .hide()
      .on('load', (e) => {
        e.currentTarget.remove()
        resolve()
      })
      .on('error', () => {
        reject()
      })
      .attr('src', href)
      .appendTo('body')
  })
}
