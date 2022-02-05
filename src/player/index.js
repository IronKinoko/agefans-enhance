import './index.scss'
import $ from 'jquery'
import Plyr from 'plyr'
import Hls from 'hls.js'
import {
  errorHTML,
  issueBody,
  loadingHTML,
  scriptInfo,
  progressHTML,
  speedHTML,
  speedList,
  settingsHTML,
  pipHTML,
} from './html'
import { debounce } from '../utils/debounce'
import { modal } from '../utils/modal'
import { genIssueURL } from '../utils/genIssueURL'
import { Message } from '../utils/message'
import { keybind } from '../utils/keybind'
import { session } from '../utils/session'
import { local } from '../utils/local'
const MediaErrorMessage = {
  1: '你中止了媒体播放',
  2: '网络错误',
  3: '文件损坏',
  4: '资源有问题看不了',
  5: '资源被加密了',
}
class KPlayer {
  /**
   * Creates an instance of KPlayer.
   * @param {string|Element} selector
   * @param {Plyr.Options} opts
   */
  constructor(selector, opts) {
    const $wrapper = $('<div id="k-player-wrapper"/>').replaceAll(selector)
    const $loading = $(loadingHTML)
    const $error = $(errorHTML)
    const $pip = $(pipHTML)
    const $video = $('<video id="k-player" />')
    const $progress = $(progressHTML)
    const $header = $('<div id="k-player-header"/>')
    $wrapper.append($video)

    this.localConfigKey = 'kplayer'
    this.statusSessionKey = 'k-player-status'

    /**
     * @type {{speed:number,continuePlay:boolean,autoNext:boolean,showProgress:boolean,volume:number}}
     */
    this.localConfig = {
      speed: 1,
      continuePlay: true,
      autoNext: true,
      showProgress: true,
      volume: 1,
    }
    try {
      this.localConfig = Object.assign(
        this.localConfig,
        local.getItem(this.localConfigKey)
      )
    } catch (error) {
      /** empty */
    }

    this.plyr = new Plyr('#k-player', {
      autoplay: true,
      keyboard: { global: true },
      controls: [
        'play',
        'progress',
        'current-time',
        'duration',
        'mute',
        'volume',
        'pip',
        'fullscreen',
      ],
      storage: false,
      seekTime: 5,
      volume: this.localConfig.volume,
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
        pip: '画中画(I)',
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
    this.$header = $header
    this.$pip = $pip
    this.$videoWrapper = $wrapper.find('.plyr')

    this.$videoWrapper
      .append($loading)
      .append($error)
      .append($pip)
      .append($progress)
      .append($header)

    this.message = new Message(this.$videoWrapper)
    this.eventMap = {}
    this.isWideScreen = false
    this.wideScreenBodyStyles = {}
    this.tsumaLength = +getComputedStyle(this.$wrapper[0])
      .getPropertyValue('--k-player-tsuma-length')
      .trim()
    this.curentTsuma = -1
    this._injectSettings()
    this._injectSpeed()
    this._injectQuestion()
    this._injectNext()
    this._injectSnapshot()
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

    const status = session.getItem(this.statusSessionKey)
    if (status) {
      session.removeItem(this.statusSessionKey)
      this._toggleWidescreen(status)
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
        const countKey = 'skip-error-retry-count' + window.location.search
        let skipErrorRetryCount = parseInt(session.getItem(countKey) || '0')
        if (skipErrorRetryCount < 3) {
          skipErrorRetryCount++
          const duration = 2 * skipErrorRetryCount
          this.message
            .info(
              `视频源出现问题，第${skipErrorRetryCount}次尝试跳过${duration}s错误片段`,
              4000
            )
            .then(() => {
              this.trigger('skiperror', 2 * skipErrorRetryCount)
            })
          session.setItem(countKey, skipErrorRetryCount.toString())
        } else {
          this.message
            .info(`视频源出现问题，多次尝试失败，请手动跳过错误片段`, 4000)
            .then(() => {
              this.trigger('skiperror', 0)
            })
          session.removeItem(countKey)
        }
      } else {
        const $dom = $(
          '<div>视频播放失败，点击此处暂时关闭脚本功能，使用原生播放器观看</div>'
        ).css('cursor', 'pointer')
        $dom.on('click', () => {
          this.message.destroy()
          session.setItem('stop-use', '1')
          window.location.reload()
        })
        this.message.info($dom, 10000)
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
    this.on('volumechange', () => {
      this.configSaveToLocal('volume', this.plyr.volume)
    })
    this.on('timeupdate', () => {
      this.$progress
        .find('.k-player-progress-current')
        .css('width', (this.currentTime / this.plyr.duration) * 100 + '%')
      this.$progress
        .find('.k-player-progress-buffer')
        .css('width', this.plyr.buffered * 100 + '%')
    })
    this.on('ended', () => {
      if (this.localConfig.autoNext) {
        this.trigger('next')
      }
    })

    this.on('enterpictureinpicture', () => {
      this.setRandomTsuma()
      this.$pip.fadeIn()
    })
    this.on('leavepictureinpicture', () => {
      this.$pip.fadeOut()
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
        // 截图
        'ctrl+s',
        'meta+s',
        // 画中画,
        'i',
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
            this._toggleWidescreen()
            break
          case 'Escape':
            if (this.plyr.fullscreen.active || !this.isWideScreen) break
            this._toggleWidescreen(false)
            break
          case 'z':
            this.speed = 1
            break
          case 'x':
          case 'c': {
            let idx = speedList.indexOf(this.speed)

            const newIdx =
              key === 'x'
                ? Math.max(0, idx - 1)
                : Math.min(speedList.length - 1, idx + 1)
            if (newIdx === idx) break
            const speed = speedList[newIdx]
            this.speed = speed
            break
          }
          case 'ctrl+s':
          case 'meta+s':
            e.preventDefault()
            e.stopPropagation()
            this._snapshot()
            break
          case 'i':
            this.plyr.pip = !this.plyr.pip
            break
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

    let timeId = null
    $(".plyr--video input[type='range']").on('mousedown', function () {
      clearInterval(timeId)
      let i = 0
      setInterval(() => {
        $(this)
          .removeClass()
          .addClass(`shake-${i++ % 2}`)
      }, 100)
    })
    $(".plyr--video input[type='range']").on('mouseup', function () {
      clearInterval(timeId)
      $(this).removeClass()
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
  _injectSettings() {
    this.$settings = $(settingsHTML)

    this.$settings
      .find('[name=autoNext]')
      .prop('checked', this.localConfig.autoNext)
      .on('change', (e) => {
        const checked = e.target.checked
        this.configSaveToLocal('autoNext', checked)
      })

    this.$settings
      .find('[name=showProgress]')
      .prop('checked', this.localConfig.showProgress)
      .on('change', (e) => {
        const checked = e.target.checked
        this.configSaveToLocal('showProgress', checked)
        if (checked) {
          this.$progress.css('display', '')
        } else {
          this.$progress.css('display', 'none')
        }
      })
    if (!this.localConfig.showProgress) {
      this.$progress.css('display', 'none')
    }

    this.$settings
      .find('[name=continuePlay]')
      .prop('checked', this.localConfig.continuePlay)
      .on('change', (e) => {
        const checked = e.target.checked
        this.configSaveToLocal('continuePlay', checked)
      })
    this.$settings.insertAfter('.plyr__controls__item.plyr__volume')
  }

  configSaveToLocal(key, value) {
    this.localConfig[key] = value
    local.setItem(this.localConfigKey, this.localConfig)
  }

  /** @private */
  _injectSpeed() {
    this.$speed = $(speedHTML)
    const speedItems = this.$speed.find('.k-speed-item')
    const localSpeed = this.localConfig.speed
    speedItems.each((_, el) => {
      const speed = +el.dataset.speed

      if (speed === localSpeed) {
        el.classList.add('k-menu-active')
      }
      $(el).on('click', () => {
        this.speed = speed
      })
    })
    this.plyr.speed = localSpeed
    this.$speed
      .find('#k-speed-text')
      .text(localSpeed === 1 ? '倍速' : localSpeed + 'x')
    this.$speed.insertBefore('.plyr__controls__item.plyr__volume')
  }

  /** @private */
  _injectQuestion() {
    $(`<svg class="k-player-question-icon"><use xlink:href="#question"/></svg>`)
      .appendTo(this.$header)
      .on('click', () => {
        showInfo()
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
  _injectSnapshot() {
    if (!navigator.clipboard) return
    $($('#plyr__snapshot').html())
      .insertBefore('[data-plyr="fullscreen"]')
      .on('click', () => {
        this._snapshot()
      })
  }

  /** @private */
  _injectSreen() {
    $($('#plyr__widescreen').html())
      .insertBefore('[data-plyr="fullscreen"]')
      .on('click', () => {
        this._toggleWidescreen()
      })
  }

  /** @private */
  _snapshot() {
    const video = this.$video[0]
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)

    canvas.toBlob((blob) => {
      navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
      this.message.info(`<img src="${canvas.toDataURL(blob.type)}" 
          style="width:200px;margin-bottom:4px;border:2px solid #fff;border-radius:4px;"/>
        <center>已复制到剪切板中</center>`)
    })
  }

  /** @private */
  _toggleWidescreen(bool = !this.isWideScreen) {
    if (this.isWideScreen === bool) return
    this.isWideScreen = bool

    session.setItem(this.statusSessionKey, this.isWideScreen)

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
    if (src.includes('.m3u8')) {
      if (!Hls.isSupported()) throw new Error('不支持播放 hls 文件')
      const hls = new Hls()
      hls.loadSource(src)
      hls.attachMedia(this.$video[0])
    } else {
      this.$video.attr('src', src)
    }
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

  get speed() {
    return this.plyr.speed
  }
  set speed(speed) {
    this.plyr.speed = speed
    const speedItems = this.$speed.find('.k-speed-item')
    speedItems.each((_, el) => {
      if (speed === +el.dataset.speed) {
        el.classList.add('k-menu-active')
      } else {
        el.classList.remove('k-menu-active')
      }
    })
    this.$speed.find('#k-speed-text').text(speed === 1 ? '倍速' : speed + 'x')
    this.message.info(`视频速度：${speed}`)
    this.configSaveToLocal('speed', speed)
  }

  showError(text) {
    this.setRandomTsuma()
    this.$error.show().find('.k-player-error-info').text(text)
  }

  hideError() {
    this.$error.hide()
  }

  setRandomTsuma() {
    this.curentTsuma = ++this.curentTsuma % this.tsumaLength
    this.$wrapper.find('.k-player-tsuma').attr('data-bg-idx', this.curentTsuma)
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
