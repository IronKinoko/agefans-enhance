import './index.scss'
import {
  errorHTML,
  issueBody,
  loadingHTML,
  scriptInfo,
  progressHTML,
} from './html'
import { debounce } from '../utils/debounce'
import { modal } from '../utils/modal'
import { genIssueURL } from '../utils/genIssueURL'
import { Message } from '../utils/message'
import keybind from '../utils/keybind'

const speedList = [0.5, 0.75, 1, 1.25, 1.5, 2, 4]
const MediaErrorMessage = {
  1: '你中止了媒体播放',
  2: '一个网络错误导致媒体下载中途失败',
  3: '由于损坏问题或由于媒体使用了你的浏览器不支持的功能，媒体播放被中止了',
  4: '媒体无法被加载，要么是因为服务器或网络故障，要么是因为格式不被支持',
  5: '该媒体是加密的，我们没有解密的钥匙',
}
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
    const $video = $('<video id="k-player" />')
    const $progress = $(progressHTML)

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
        play: '播放(空格键)',
        pause: '暂停(空格键)',
        fastForward: '快进 {seektime}s',
        seek: 'Seek',
        seekLabel: '{currentTime} / {duration}',
        played: '已播放',
        buffered: '已缓冲',
        currentTime: '当前时间',
        duration: '片长',
        volume: '音量',
        mute: '静音(M)',
        unmute: '取消静音(M)',
        enableCaptions: '显示字幕',
        disableCaptions: '隐藏字幕',
        download: '下载',
        enterFullscreen: '进入全屏(F)',
        exitFullscreen: '退出全屏(F)',
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
    this.$video = $video
    this.$progress = $progress
    this.$videoWrapper = $wrapper.find('.plyr')

    this.$videoWrapper.append($loading).append($error).append($progress)

    this.message = new Message(this.$videoWrapper)
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
      const code = this.plyr.media.error.code
      this.$loading.hide()
      this.showError(MediaErrorMessage[code] || this.src)
      if (code === 3) {
        this.message.info('视频源出现问题，尝试跳过错误片段', 3000).then(() => {
          this.trigger('skiperror')
        })
      }
    })
    this.on('pause', () => {
      this.hideControlsDebounced()
    })
    this.on('enterfullscreen', () => {
      this.$videoWrapper.addClass('k-player-fullscreen')
    })
    this.on('exitfullscreen', () => {
      this.$videoWrapper.removeClass('k-player-fullscreen')
    })
    this.on('timeupdate', () => {
      this.$progress
        .find('.k-player-progress-current')
        .css('width', (this.currentTime / this.plyr.duration) * 100 + '%')
      this.$progress
        .find('.k-player-progress-buffer')
        .css('width', this.plyr.buffered * 100 + '%')
    })

    keybind(
      [
        // 进退 30s
        'shift+ArrowLeft',
        'shift+ArrowRight',
        // 进退 60s
        'alt+ArrowLeft',
        'alt+ArrowRight',
        // 进退 90s
        'ctrl+ArrowLeft',
        'ctrl+ArrowRight',
        'meta+ArrowLeft',
        'meta+ArrowRight',
        // 下一集
        'n',
        ']',
        '】',
        'PageDown',
        // 上一集
        'p',
        '[',
        '【',
        'PageUp',
        // 切换网页全屏
        'w',
        // 关闭网页全屏
        'Escape',
        // 播放速度
        'z',
        'x',
        'c',
      ],
      (e, key) => {
        switch (key) {
          case 'ctrl+ArrowLeft':
          case 'meta+ArrowLeft':
          case 'shift+ArrowLeft':
          case 'alt+ArrowLeft':
          case 'ctrl+ArrowRight':
          case 'meta+ArrowRight':
          case 'shift+ArrowRight':
          case 'alt+ArrowRight': {
            e.stopPropagation()
            e.preventDefault()

            const time = {
              'ctrl+ArrowLeft': 90,
              'meta+ArrowLeft': 90,
              'shift+ArrowLeft': 30,
              'alt+ArrowLeft': 60,
              'ctrl+ArrowRight': 90,
              'meta+ArrowRight': 90,
              'shift+ArrowRight': 30,
              'alt+ArrowRight': 60,
            }[key]
            if (e.key === 'ArrowLeft') {
              this.currentTime = Math.max(0, this.currentTime - time)
              this.message.info(`步退${time}s`)
            } else {
              this.currentTime = Math.min(
                this.currentTime + time,
                this.plyr.duration
              )
              this.message.info(`步进${time}s`)
            }
            break
          }
          case 'n':
          case ']':
          case '】':
          case 'PageDown':
            e.preventDefault()
            this.trigger('next')
            break
          case 'p':
          case '[':
          case '【':
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
            let idx = speedList.indexOf(this.plyr.speed)

            const newIdx =
              key === 'x'
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
      }
    )

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

  /** @typedef {'prev'|'next'|'enterwidescreen'|'exitwidescreen'|'skiperror'} CustomEventMap */
  /**
   * @param {CustomEventMap | keyof Plyr.PlyrEventMap} event
   * @param {function} callback
   * @private
   */
  on(event, callback) {
    if (
      [
        'prev',
        'next',
        'enterwidescreen',
        'exitwidescreen',
        'skiperror',
      ].includes(event)
    ) {
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
}

export function addReferrerMeta() {
  if ($('meta[name=referrer]').length === 0) {
    $('head').append('<meta name="referrer" content="same-origin">')
  } else {
    const $meta = $('meta[name=referrer]')
    $meta.attr('content', 'same-origin')
  }
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

keybind(['?', '？'], (e) => {
  if (!document.fullscreenElement) {
    e.stopPropagation()
    e.preventDefault()
    showInfo()
  }
})

export { KPlayer }
