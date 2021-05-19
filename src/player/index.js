import './index.scss'
import { errorHTML, issueBody, loadingHTML, scriptInfo } from './html'
import { debounce } from '../utils/debounce'
import { modal } from '../utils/modal'
import { genIssueURL } from '../utils/genIssueURL'
class KPlayer {
  /**
   * Creates an instance of KPlayer.
   * @param {stromg} selector
   * @param {Plyr.Options} opts
   */
  constructor(selector, opts) {
    const $wrapper = $('<div id="k-player-wrapper"/>').replaceAll(selector)
    const $loading = $(loadingHTML)
    const $error = $(errorHTML)
    const $video = $('<video id="k-player-contianer" />')

    $wrapper.append($loading).append($error).append($video)

    this.plyr = new Plyr('#k-player-contianer', {
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
      ...opts,
    })

    this.$wrapper = $wrapper
    this.$loading = $loading
    this.$error = $error
    this.$video = $video
    this.$videoWrapper = $wrapper.find('.plyr')

    this.eventMap = {}
    this.isWideScreen = false
    this.wideScreenBodyStyles = {}

    this.statusSessionKey = 'k-player-status'

    this._injectNext()
    this._injectSreen()
    this._initEvent()

    /** @private */
    this.isHoverControls = false

    /** @private */
    this.hideCursorDebounced = debounce(() => {
      const dom = document.querySelector('.plyr')
      dom.classList.add('plyr--hide-cursor')
    }, 1000)

    /** @private */
    this.hideControlsDebounced = debounce(() => {
      const dom = document.querySelector('.plyr')
      if (!this.isHoverControls) dom.classList.add('plyr--hide-controls')
    }, 1000)

    const status = window.sessionStorage.getItem(this.statusSessionKey)
    if (status) {
      window.sessionStorage.removeItem(this.statusSessionKey)
      this._toggleFullscreen(true)
    }
  }

  /** @private */
  _initEvent() {
    this.on('loadstart', () => {
      this.$loading.show()
      this.hideError()
    })
    this.on('canplay', () => {
      this.$loading.hide()
      this.$videoWrapper.show()
      this.plyr.play()
    })
    this.on('error', () => {
      this.$loading.hide()
      this.$videoWrapper.hide()
      this.showError(this.src)
    })
    this.on('pause', () => {
      this.hideControlsDebounced()
    })

    $(window).on('keydown', (e) => {
      if ((e.key === '?' || e.key === '？') && !this.plyr.fullscreen.active) {
        this.showInfo()
      }
      if (e.key === 'n' || e.key === 'PageDown') {
        e.preventDefault()
        this.trigger('next')
      }
      if (e.key === 'p' || e.key === 'PageUp') {
        e.preventDefault()
        this.trigger('prev')
      }
      if (e.key === 'w' && !this.plyr.fullscreen.active) {
        this._toggleFullscreen()
      }
      if (
        e.key === 'Escape' &&
        !this.plyr.fullscreen.active &&
        this.isWideScreen
      ) {
        this._toggleFullscreen(false)
      }
    })

    document
      .querySelectorAll('.plyr__controls .plyr__control')
      .forEach((dom) => {
        dom.addEventListener('click', (e) => {
          e.currentTarget.blur()
        })
      })

    const playerEl = document.querySelector('.plyr')
    playerEl.addEventListener('mousemove', () => {
      playerEl.classList.remove('plyr--hide-cursor')
      this.hideCursorDebounced()

      if (this.plyr.paused) {
        this.hideControlsDebounced()
      }
    })

    const controlsEl = document.querySelector('.plyr__controls')
    controlsEl.addEventListener('mouseenter', () => {
      this.isHoverControls = true
    })
    controlsEl.addEventListener('mouseleave', () => {
      this.isHoverControls = false
    })
  }

  showInfo() {
    const video = this.$video[0]
    const githubIssueURL = genIssueURL({
      title: '🐛[Bug]',
      body: issueBody(video.src),
    })
    modal({
      title: '脚本信息',
      content: scriptInfo(video, githubIssueURL),
    })
  }

  /** @typedef {'prev'|'next'|'enterwidescreen'|'exitwidescreen'} CustomEventMap */
  /**
   * @param {CustomEventMap | keyof Plyr.PlyrEventMap} event
   * @param {function} callback
   * @private
   */
  on(event, callback) {
    if (['prev', 'next', 'enterwidescreen', 'exitwidescreen'].includes(event)) {
      if (!this.eventMap[event]) this.eventMap[event] = []
      this.eventMap[event].push(callback)
    } else {
      this.plyr.on(event, callback)
    }
  }

  /**
   * @param {CustomEventMap} event
   * @param {*} [params]
   */
  trigger(event, params) {
    const fnList = this.eventMap[event] || []
    fnList.forEach((fn) => {
      fn(this, params)
    })
  }

  /** @private */
  _injectNext() {
    $($('#plyr__next').html())
      .insertBefore('.plyr__controls__item.plyr__progress__container')
      .on('click', () => {
        this.trigger('next')
      })
  }

  /** @private */
  _injectSreen() {
    $($('#plyr__fullscreen').html())
      .insertBefore('[data-plyr="fullscreen"]')
      .on('click', () => {
        this._toggleFullscreen()
      })
  }

  /** @private */
  _toggleFullscreen(bool = !this.isWideScreen) {
    if (this.isWideScreen === bool) return
    this.isWideScreen = bool

    window.sessionStorage.setItem(this.statusSessionKey, this.isWideScreen)

    this._setFullscreenIcon(this.isWideScreen)

    if (this.isWideScreen) {
      this.wideScreenBodyStyles = $('body').css(['overflow'])
      $('body').css('overflow', 'hidden')
      this.$wrapper.addClass('k-player-widescreen')
    } else {
      $('body').css(this.wideScreenBodyStyles)
      this.$wrapper.removeClass('k-player-widescreen')
    }

    this.trigger(this.isWideScreen ? 'enterwidescreen' : 'exitwidescreen')
  }

  /** @private */
  _setFullscreenIcon(bool = this.isWideScreen) {
    const $use = $('.plyr__fullscreen.plyr__custom use')
    $use.attr('xlink:href', bool ? '#fullscreen-quit' : '#fullscreen')
  }

  /**
   * video src
   * @param {string} src
   */
  set src(src) {
    this.$video.attr('src', src)
  }
  get src() {
    return this.$video.attr('src')
  }

  set currentTime(value) {
    this.plyr.currentTime = value
  }
  get currentTime() {
    return this.plyr.currentTime
  }

  showError(text) {
    this.$error.show().find('.error-info').text(text)
  }

  hideError() {
    this.$error.hide()
  }
}

export { KPlayer }
