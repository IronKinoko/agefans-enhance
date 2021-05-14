import './index.scss'
import { errorHTML, loadingHTML } from './html'
export default class KPlayer {
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
      keyboard: { focused: true },
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

    this.eventMap = {}
    this.ispip = false

    this._injectNext()
    this._injectSreen()
    this._initEvent()
  }

  /** @private */
  _initEvent() {
    this.on('loadstart', () => {
      this.$loading.show()
      this.hideError()
    })
    this.on('canplay', () => {
      this.$loading.hide()
    })
    this.on('error', () => {
      this.$loading.hide()
      this.showError(this.src)
    })
  }

  /** @typedef {'next'|'enterwidescreen'|'exitwidescreen'} CustomEventMap */
  /**
   * @param {CustomEventMap | keyof Plyr.PlyrEventMap} event
   * @param {function} callback
   * @private
   */
  on(event, callback) {
    if (['next', 'enterwidescreen', 'exitwidescreen'].includes(event)) {
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
  _toggleFullscreen(bool = !this.ispip) {
    if (this.ispip === bool) return
    this.ispip = bool

    this._setFullscreenIcon(this.ispip)

    this.trigger(this.ispip ? 'enterwidescreen' : 'exitwidescreen')
  }

  /** @private */
  _setFullscreenIcon(bool = this.ispip) {
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
