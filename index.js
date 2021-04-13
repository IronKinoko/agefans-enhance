let getNodes = (str) =>
  new DOMParser().parseFromString(str, 'text/html').body.firstChild

/** @type {Plyr} */
let player
let isFull = sessionStorage.getItem('isFull') === '1'
const isInFrame = parent !== self

function init() {
  const dom = document.getElementById('player')
  dom.src = url
  player = new Plyr(dom, {
    autoplay: true,
    keyboard: { global: true },
    controls: [
      // 'play-large', // The large play button in the center
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

  if (isInFrame) {
    injectNext()
    injectSreen()

    if (isFull) {
      toggleFullscreen()
    }
  }
  player.once('ended', () => {
    notifyParentChangeToNextPart()
  })

  player.once('canplay', () => {
    notifyParentReadyToPlay()
    player.play()
  })

  player.on('enterfullscreen', () => {
    toggleFullscreen(false)
  })

  player.on('timeupdate', (e) => {
    if (Math.floor(player.currentTime) % 3 === 0) {
      notifyParentUpdateTime()
    }
  })

  document.querySelectorAll('.plyr__controls .plyr__control').forEach((dom) => {
    dom.addEventListener('click', (e) => {
      e.currentTarget.blur()
    })
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

  sessionStorage.setItem('isFull', +bool)
}

function notifyParentChangeToNextPart() {
  parent.postMessage({ code: 233, message: 'next part' }, '*')
}

function notifyParentChangeScreenSize() {
  parent.postMessage({ code: 666, message: 'change size', isFull }, '*')
}

function notifyParentReadyToPlay() {
  parent.postMessage({ code: 200 }, '*')
}

function notifyParentUpdateTime() {
  parent.postMessage({ code: 999, time: player.currentTime }, '*')
}

// Decode again to ensure the link is correct
const url = decodeURIComponent(
  new URLSearchParams(location.search).get('url') || ''
)

if (url) {
  let dom = document.querySelector('.empty')
  dom.remove()
  init()

  if (isInFrame) {
    window.addEventListener('message', (e) => {
      if (e.data && e.data.code === 666) {
        setFullscreenIcon(e.data.isFull)
      }

      if (e.data && e.data.code === 999) {
        player.currentTime = e.data.time
      }
    })
  }
}
