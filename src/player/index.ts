import Hls from 'hls.js'
import $ from 'jquery'
import { debounce, throttle } from 'lodash-es'
import Plyr from 'plyr'
import { genIssueURL } from '../utils/genIssueURL'
import { keybind } from '../utils/keybind'
import { Message } from '../utils/message'
import { modal } from '../utils/modal'
import { parseTime } from '../utils/parseTime'
import { gm, local, session } from '../utils/storage'
import {
  errorHTML,
  issueBody,
  loadingHTML,
  pipHTML,
  progressHTML,
  scriptInfo,
  settingsHTML,
  speedHTML,
  speedList,
} from './html'
import './index.scss'
const MediaErrorMessage: Record<number, string> = {
  1: '你中止了媒体播放',
  2: '网络错误',
  3: '文件损坏',
  4: '资源有问题看不了',
  5: '资源被加密了',
}

type Opts = {
  video?: HTMLVideoElement
  eventToParentWindow?: boolean
} & Plyr.Options

type CustomEventMap =
  | 'prev'
  | 'next'
  | 'enterwidescreen'
  | 'exitwidescreen'
  | 'skiperror'
  | 'enterpictureinpicture'
  | 'leavepictureinpicture'

type LocalPlayTimeStore = Record<string, number>

class KPlayer {
  localConfigKey: string
  statusSessionKey: string
  localConfig: {
    speed: number
    continuePlay: boolean
    autoNext: boolean
    showProgress: boolean
    volume: number
  }
  plyr: Plyr
  $wrapper: JQuery<HTMLElement>
  $loading: JQuery<HTMLElement>
  $error: JQuery<HTMLElement>
  $video: JQuery<HTMLVideoElement>
  $progress: JQuery<HTMLElement>
  $header: JQuery<HTMLElement>
  $pip: JQuery<HTMLElement>
  $videoWrapper: JQuery<HTMLElement>
  message: Message
  eventMap: Record<string, ((player: KPlayer, params?: any) => void)[]>
  isWideScreen: boolean
  wideScreenBodyStyles: {}
  tsumaLength: number
  curentTsuma: number
  isHoverControls: boolean
  $settings!: JQuery<HTMLDivElement>
  $speed!: JQuery<HTMLDivElement>
  localPlayTimeKey: string

  /**
   * @typedef {Object} EnhanceOpts
   * @property {HTMLVideoElement} [video]
   * @property {boolean} [eventToParentWindow]
   *
   * Creates an instance of KPlayer.
   * @param {string|Element} selector
   * @param {Plyr.Options & EnhanceOpts} [opts]
   */
  constructor(selector: string | Element, opts: Opts = {}) {
    const $wrapper = $('<div id="k-player-wrapper"/>').replaceAll(selector)
    const $loading = $(loadingHTML)
    const $error = $(errorHTML)
    const $pip = $(pipHTML)
    const $video = (
      (opts.video ? $(opts.video) : $('<video />')) as JQuery<HTMLVideoElement>
    ).attr('id', 'k-player')
    const $progress = $(progressHTML)
    const $header = $('<div id="k-player-header"/>')
    $wrapper.append($video)

    this.localConfigKey = 'kplayer'
    this.statusSessionKey = 'k-player-status'
    this.localPlayTimeKey = 'k-player-play-time'

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
        gm.getItem(this.localConfigKey)
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
      storage: { enabled: false },
      seekTime: 5,
      volume: this.localConfig.volume,
      speed: { options: speedList, selected: 1 },
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
    this.injectSettings()
    this.injectSpeed()
    this.injectQuestion()
    this.injectNext()
    this.injectSnapshot()
    this.injectSreen()
    this.initEvent()

    /** @private */
    this.isHoverControls = false

    const status = session.getItem(this.statusSessionKey)
    if (status) {
      session.removeItem(this.statusSessionKey)
      this.toggleWidescreen(status)
    }

    if (opts.eventToParentWindow) {
      this.eventToParentWindow()
    }
  }

  setCurrentTimeLog(time?: number) {
    const store = local.getItem<LocalPlayTimeStore>(this.localPlayTimeKey, {})
    store[this.playTimeStoreKey] = Math.floor(time ?? this.plyr.currentTime)
    local.setItem(this.localPlayTimeKey, store)
  }
  setCurrentTimeLogThrottled = throttle(() => {
    this.setCurrentTimeLog()
  }, 3000)

  getCurrentTimeLog(): number | undefined {
    const store = local.getItem<LocalPlayTimeStore>(this.localPlayTimeKey, {})
    return store[this.playTimeStoreKey]
  }

  get playTimeStoreKey() {
    if (this.src.startsWith('blob')) {
      return location.origin + location.pathname + location.search
    } else {
      return this.src
    }
  }

  hideControlsDebounced = debounce(() => {
    const dom = document.querySelector('.plyr')
    if (!this.isHoverControls) dom?.classList.add('plyr--hide-controls')
  }, 1000)

  hideCursorDebounced = debounce(() => {
    const dom = document.querySelector('.plyr')
    dom?.classList.add('plyr--hide-cursor')
  }, 1000)

  private isJumped = false

  jumpToLogTime = throttle(() => {
    if (this.isJumped) return
    if (this.currentTime < 3) {
      this.isJumped = true
      const logTime = this.getCurrentTimeLog()
      if (logTime) {
        this.message.info(`已自动跳转至历史播放位置 ${parseTime(logTime)}`)
        this.currentTime = logTime
      }
    }
  }, 1000)

  private initEvent() {
    this.on('loadstart', () => {
      this.$loading.show()
      this.hideError()
    })
    this.on('canplay', () => {
      this.$loading.hide()
      this.plyr.play()
      if (this.localConfig.continuePlay) {
        this.jumpToLogTime()
      }
    })
    this.on('error', () => {
      this.setCurrentTimeLog(0)

      const code = this.$video[0].error!.code
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
          session.setItem('stop-use', true)
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
      this.setCurrentTimeLogThrottled()

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
            this.toggleWidescreen()
            break
          case 'Escape':
            if (this.plyr.fullscreen.active || !this.isWideScreen) break
            this.toggleWidescreen(false)
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
            this.snapshot()
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
      .querySelectorAll<HTMLDivElement>('.plyr__controls .plyr__control')
      .forEach((dom) => {
        dom.addEventListener('click', (e) =>
          (e.currentTarget as HTMLDivElement).blur()
        )
      })

    const playerEl = document.querySelector('.plyr')!
    playerEl.addEventListener('mousemove', () => {
      playerEl.classList.remove('plyr--hide-cursor')
      this.hideCursorDebounced()

      if (this.plyr.paused) {
        this.hideControlsDebounced()
      }
    })

    const controlsEl = document.querySelector('.plyr__controls')!
    controlsEl.addEventListener('mouseenter', () => {
      this.isHoverControls = true
    })
    controlsEl.addEventListener('mouseleave', () => {
      this.isHoverControls = false
    })

    let timeId: number
    $(".plyr--video input[type='range']").on('mousedown', function () {
      clearInterval(timeId)
      let i = 0
      timeId = window.setInterval(() => {
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

  on(
    event: CustomEventMap | keyof Plyr.PlyrEventMap,
    callback: (...args: any[]) => void
  ) {
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
      this.plyr.on(event as keyof Plyr.PlyrEventMap, callback)
    }
  }

  trigger(event: CustomEventMap, params?: any) {
    const fnList = this.eventMap[event] || []
    fnList.forEach((fn) => {
      fn(this, params)
    })
  }

  private injectSettings() {
    this.$settings = $(settingsHTML) as JQuery<HTMLDivElement>

    this.$settings
      .find('[name=autoNext]')
      .prop('checked', this.localConfig.autoNext)
      .on('change', (e) => {
        const checked = (e.target as HTMLInputElement).checked
        this.configSaveToLocal('autoNext', checked)
      })

    this.$settings
      .find('[name=showProgress]')
      .prop('checked', this.localConfig.showProgress)
      .on('change', (e) => {
        const checked = (e.target as HTMLInputElement).checked
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
        const checked = (e.target as HTMLInputElement).checked
        this.configSaveToLocal('continuePlay', checked)
      })
    this.$settings.insertAfter('.plyr__controls__item.plyr__volume')
  }

  configSaveToLocal<T extends keyof KPlayer['localConfig']>(
    key: T,
    value: KPlayer['localConfig'][T]
  ) {
    this.localConfig[key] = value
    gm.setItem(this.localConfigKey, this.localConfig)
  }

  private injectSpeed() {
    this.$speed = $(speedHTML) as JQuery<HTMLDivElement>
    const speedItems = this.$speed.find('.k-speed-item')
    const localSpeed = this.localConfig.speed
    speedItems.each((_, el) => {
      const speed = +el.dataset.speed!

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

  private injectQuestion() {
    $(`<svg class="k-player-question-icon"><use xlink:href="#question"/></svg>`)
      .appendTo(this.$header)
      .on('click', () => {
        showInfo()
      })
  }
  private injectNext() {
    $($('#plyr__next').html())
      .insertBefore('.plyr__controls__item.plyr__progress__container')
      .on('click', () => {
        this.trigger('next')
      })
  }
  private injectSnapshot() {
    if (!navigator.clipboard) return
    this.$video.attr('crossorigin', '')
    $($('#plyr__snapshot').html())
      .insertBefore('[data-plyr="fullscreen"]')
      .on('click', () => {
        this.snapshot()
      })
  }

  private injectSreen() {
    $($('#plyr__widescreen').html())
      .insertBefore('[data-plyr="fullscreen"]')
      .on('click', () => {
        this.toggleWidescreen()
      })
  }

  private snapshot() {
    // 非 https 模式下，这个值是空的
    if (!navigator.clipboard) return

    const video = this.$video[0]
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0)

    canvas.toBlob((blob) => {
      if (!blob) return
      navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
      this.message.info(`<img src="${canvas.toDataURL(blob.type)}" 
        style="width:200px;margin-bottom:4px;border:2px solid #fff;border-radius:4px;"/>
      <center>已复制到剪切板中</center>`)
    })
  }

  private toggleWidescreen(bool = !this.isWideScreen) {
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

  set src(src: string) {
    this.isJumped = false
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
    return this.$video.attr('src')!
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
      if (speed === +el.dataset.speed!) {
        el.classList.add('k-menu-active')
      } else {
        el.classList.remove('k-menu-active')
      }
    })
    this.$speed.find('#k-speed-text').text(speed === 1 ? '倍速' : speed + 'x')
    this.message.info(`视频速度：${speed}`)
    this.configSaveToLocal('speed', speed)
  }

  showError(text: string) {
    this.setRandomTsuma()
    this.$error.show().find('.k-player-error-info').text(text)
  }

  hideError() {
    this.$error.hide()
  }

  private setRandomTsuma() {
    this.curentTsuma = ++this.curentTsuma % this.tsumaLength
    this.$wrapper.find('.k-player-tsuma').attr('data-bg-idx', this.curentTsuma)
  }

  private eventToParentWindow() {
    const evnetKeys = [
      'prev',
      'next',
      'enterwidescreen',
      'exitwidescreen',
      'skiperror',
      'progress',
      'playing',
      'play',
      'pause',
      'timeupdate',
      'volumechange',
      'seeking',
      'seeked',
      'ratechange',
      'ended',
      'enterfullscreen',
      'exitfullscreen',
      'captionsenabled',
      'captionsdisabled',
      'languagechange',
      'controlshidden',
      'controlsshown',
      'ready',
      'loadstart',
      'loadeddata',
      'loadedmetadata',
      'canplay',
      'canplaythrough',
      'stalled',
      'waiting',
      'emptied',
      'cuechange',
      'error',
    ] as const

    evnetKeys.forEach((key) => {
      this.on(key, () => {
        /** @type {HTMLVideoElement} */
        const video: HTMLVideoElement = this.$video[0]
        const info = {
          width: video.videoWidth,
          height: video.videoHeight,
          currentTime: video.currentTime,
          src: video.src,
          duration: video.duration,
        }
        window.parent.postMessage({ key, video: info }, { targetOrigin: '*' })
      })
    })
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
  const video = $('#k-player')[0] as HTMLVideoElement
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
