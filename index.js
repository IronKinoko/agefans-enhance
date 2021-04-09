let getNodes = (str) =>
  new DOMParser().parseFromString(str, 'text/html').body.firstChild

let isFull = false
function init() {
  const dom = document.getElementById('player')
  dom.src = url
  const player = new Plyr(dom, {
    autoplay: true,
    controls: [
      'play-large', // The large play button in the center
      'play', // Play/pause playback
      'progress', // The progress bar and scrubber for playback and buffering
      'current-time', // The current time of playback
      'duration', // The full duration of the media
      'mute', // Toggle mute
      'volume', // Volume control
      'settings', // Settings menu
      'pip', // Picture-in-picture (currently Safari only)
      'fullscreen', // Toggle fullscreen
    ],
  })

  if (parent !== self) {
    injectNext()
    injectSreen()
  }
  player.once('ended', () => {
    notifyParentChangeToNextPart()
  })

  player.once('canplay', () => {
    player.play()
  })

  player.on('enterfullscreen', () => {
    toggleFullscreen(false)
  })
}

function injectNext() {
  const dom = document.getElementById('plyr__next')
  const plEl = document.querySelector(
    '.plyr__controls__item.plyr__progress__container'
  )
  const pNode = document.querySelector('.plyr__controls')

  const nextNode = getNodes(dom.innerHTML)
  nextNode.addEventListener('click', () => {
    notifyParentChangeToNextPart()
  })
  pNode.insertBefore(nextNode, plEl)
}

function injectSreen() {
  const dom = document.getElementById('plyr__fullscreen')
  const plEl = document.querySelector('[data-plyr="fullscreen"]')
  const pNode = document.querySelector('.plyr__controls')

  const nextNode = getNodes(dom.innerHTML)
  nextNode.addEventListener('click', (e) => {
    toggleFullscreen()
  })
  pNode.insertBefore(nextNode, plEl)
}

function toggleFullscreen(bool = !isFull) {
  if (isFull === bool) return
  isFull = bool

  setFullscreenIcon(isFull)

  notifyParentChangeScreenSize()
}

function setFullscreenIcon(bool = isFull) {
  let use = document.querySelector('.plyr__fullscreen.plyr__custom use')
  if (bool) {
    use.setAttribute('xlink:href', '#fullscreen-quit')
  } else {
    use.setAttribute('xlink:href', '#fullscreen')
  }
}

function notifyParentChangeToNextPart() {
  parent.postMessage({ code: 233, message: 'next part' }, '*')
}

function notifyParentChangeScreenSize() {
  parent.postMessage({ code: 666, message: 'change size', isFull }, '*')
}

// Decode again to ensure the link is correct
const url = decodeURIComponent(new URLSearchParams(location.search).get('url'))

if (url) {
  let dom = document.querySelector('.empty')
  dom.remove()
  init()

  window.addEventListener('message', (e) => {
    if (e.data && e.data.code === 999) {
      setFullscreenIcon(e.data.isFull)
    }
  })
}
