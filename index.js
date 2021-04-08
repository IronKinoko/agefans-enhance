let getNodes = (str) =>
  new DOMParser().parseFromString(str, 'text/html').body.firstChild

function init() {
  let dom = document.getElementById('player')
  dom.src = url
  let player = new Plyr(dom, {
    autoplay: true,
  })

  injectNext()

  player.once('ended', () => {
    notifyParentChangeToNextPart()
  })
}

function injectNext() {
  let dom = document.getElementById('controls')
  let plEl = document.querySelector(
    '.plyr__controls__item.plyr__progress__container'
  )
  let pNode = document.querySelector('.plyr__controls')

  let nextNode = getNodes(dom.innerHTML)
  nextNode.addEventListener('click', () => {
    notifyParentChangeToNextPart()
  })
  pNode.insertBefore(nextNode, plEl)
}

function notifyParentChangeToNextPart() {
  if (parent !== self) {
    parent.postMessage({ code: 233, message: 'next part' })
  }
}

let url = new URLSearchParams(location.search).get('url')

if (url) {
  let dom = document.querySelector('.empty')
  dom.remove()
  init()
}
