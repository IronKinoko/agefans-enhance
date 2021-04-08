let url = new URLSearchParams(location.search).get('url')

if (url) {
  let dom = document.querySelector('.empty')
  dom.style.display = 'none'
  init()
}

function init() {
  let dom = document.getElementById('player')
  dom.style.display = 'block'
  dom.src = url
  let player = new Plyr(dom, {
    autoplay: true,
  })
}
