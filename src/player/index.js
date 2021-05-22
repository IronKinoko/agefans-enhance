import './index.scss'
import {
  errorHTML,
  issueBody,
  loadingHTML,
  messageHTML,
  scriptInfo,
} from './html'
import { debounce } from '../utils/debounce'
import { modal } from '../utils/modal'
import { genIssueURL } from '../utils/genIssueURL'

const speedList = [0.5, 0.75, 1, 1.25, 1.5, 2, 4]

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
    const $message = $(messageHTML)
    const $video = $('<video id="k-player" />')

    $wrapper.append($video)

    this.plyr = new Plyr('#k-player', {
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
      seekTime: 5,
      speed: { options: speedList },
      i18n: {
        restart: '重播',
        rewind: '快退 {seektime}s',
        play: '播放',
        pause: '暂停',
        fastForward: '快进 {seektime}s',
        seek: 'Seek',
        seekLabel: '{currentTime} / {duration}',
        played: '已播放',
        buffered: '已缓冲',
        currentTime: '当前时间',
        duration: '片长',
        volume: '音量',
        mute: '静音',
        unmute: '取消静音',
        enableCaptions: '显示字幕',
        disableCaptions: '隐藏字幕',
        download: '下载',
        enterFullscreen: '进入全屏',
        exitFullscreen: '退出全屏',
        frameTitle: '标题名称： {title}',
        captions: '字幕',
        settings: '设置',
        pip: '画中画',
        menuBack: '返回上级',
        speed: '倍速',
        normal: '1.0x',
        quality: '分辨率',
        loop: '循环',
        start: '开始',
        end: '结束',
        all: '全部',
        reset: '重置',
        disabled: '禁用',
        enabled: '启用',
        advertisement: '广告',
        qualityBadge: {
          2160: '4K',
          1440: 'HD',
          1080: 'HD',
          720: 'HD',
          576: 'SD',
          480: 'SD',
        },
      },
      tooltips: {
        controls: true,
        seek: true,
      },
      ...opts,
    })

    this.$wrapper = $wrapper
    this.$loading = $loading
    this.$error = $error
    this.$message = $message
    this.$video = $video
    this.$videoWrapper = $wrapper.find('.plyr')

    this.$videoWrapper.append($loading).append($error).append($message)

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
      this._toggleFullscreen(JSON.parse(status))
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
      this.plyr.play()
    })
    this.on('error', () => {
      this.$loading.hide()
      this.showError(this.src)
    })
    this.on('pause', () => {
      this.hideControlsDebounced()
    })

    $(window).on('keydown', (e) => {
      let idx = speedList.indexOf(this.plyr.speed)
      if (e.metaKey || e.shiftKey || e.altKey || e.ctrlKey) return
      switch (e.key) {
        case 'n':
        case 'PageDown':
          e.preventDefault()
          this.trigger('next')
          break
        case 'p':
        case 'PageUp':
          e.preventDefault()
          this.trigger('prev')
          break
        case 'w':
          if (this.plyr.fullscreen.active) break
          this._toggleFullscreen()
          break
        case 'Escape':
          if (this.plyr.fullscreen.active || !this.isWideScreen) break
          this._toggleFullscreen(false)
          break
        case 'z':
          this.plyr.speed = 1
          this.message.info(`视频速度：${1}`)
          break
        case 'x':
        case 'c': {
          const newIdx =
            e.key === 'x'
              ? Math.max(0, idx - 1)
              : Math.min(speedList.length - 1, idx + 1)
          if (newIdx === idx) break
          const speed = speedList[newIdx]
          this.message.info(`视频速度：${speed}`)
          this.plyr.speed = speed
          break
        }

        default:
          break
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
    $($('#plyr__widescreen').html())
      .insertBefore('[data-plyr="fullscreen"]')
      .on('click', () => {
        this._toggleFullscreen()
      })
  }

  /** @private */
  _toggleFullscreen(bool = !this.isWideScreen) {
    if (this.isWideScreen === bool) return
    this.isWideScreen = bool

    window.sessionStorage.setItem(
      this.statusSessionKey,
      JSON.stringify(this.isWideScreen)
    )

    if (this.isWideScreen) {
      this.wideScreenBodyStyles = $('body').css(['overflow'])
      $('body').css('overflow', 'hidden')
      this.$wrapper.addClass('k-player-widescreen')
      $('.plyr__widescreen').addClass('plyr__control--pressed')
    } else {
      $('body').css(this.wideScreenBodyStyles)
      this.$wrapper.removeClass('k-player-widescreen')
      $('.plyr__widescreen').removeClass('plyr__control--pressed')
    }

    this.trigger(this.isWideScreen ? 'enterwidescreen' : 'exitwidescreen')
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

  get message() {
    return {
      info: (text) => {
        this.$message.empty()
        $(`<div class="k-player-message-item">${text}</div>`)
          .hide()
          .appendTo(this.$message)
          .fadeIn(150)
          .delay(1500)
          .fadeOut(150, function () {
            $(this).remove()
          })
      },
      destroy: () => {
        this.$message.empty()
      },
    }
  }
}

if ($('meta[name=referrer]').length === 0) {
  $('head').append('<meta name="referrer" content="same-origin">')
} else {
  const $meta = $('meta[name=referrer]')
  $meta.attr('content', 'same-origin')
}

export function showInfo() {
  const video = $('#k-player')[0]
  const githubIssueURL = genIssueURL({
    title: '🐛[Bug]',
    body: issueBody(video?.src),
  })
  modal({
    title: '脚本信息',
    content: scriptInfo(video, githubIssueURL),
  })
}

$(window).on('keydown', (e) => {
  if ('?？'.includes(e.key) && !document.fullscreenElement) {
    e.stopPropagation()
    e.preventDefault()
    showInfo()
  }
})

export { KPlayer }
