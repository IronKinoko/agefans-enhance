import Hls from 'hls.js'
import throttle from 'lodash-es/throttle'
import debounce from 'lodash-es/debounce'
import Plyr from 'plyr'
import { runtime } from '../runtime'
import { Message } from '../utils/message'
import { parseTime } from '../utils/parseTime'
import { gm, local, session } from '../utils/storage'
import {
  errorHTML,
  loadingHTML,
  pipHTML,
  progressHTML,
  searchActionsHTML,
  settingsHTML,
  speedHTML,
  speedList,
  i18n,
} from './html'
import './index.scss'
import { Shortcuts } from './plugins/shortcuts'

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
  logTimeId?: string | (() => string)
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
export interface LocalConfig {
  speed: number
  continuePlay: boolean
  autoNext: boolean
  showProgress: boolean
  volume: number
  showSearchActions: boolean
  autoplay: boolean
  showPlayLarge: boolean
}

export const defaultConfig = {
  speed: 1,
  continuePlay: true,
  autoNext: true,
  showProgress: true,
  volume: 1,
  showSearchActions: true,
  autoplay: true,
  showPlayLarge: false,
} as LocalConfig

export class KPlayer {
  localConfigKey: string
  statusSessionKey: string
  localConfig: LocalConfig
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
  private isHoverControls = false
  $settings!: JQuery<HTMLDivElement>
  $speed!: JQuery<HTMLDivElement>
  localPlayTimeKey: string
  $searchActions!: JQuery<HTMLElement>
  static plguinList: ((player: KPlayer) => void)[] = []
  opts: Opts
  speedList = speedList

  constructor(selector: string | Element, opts: Opts = {}) {
    this.opts = opts
    this.$wrapper = $('<div id="k-player-wrapper"/>').replaceAll(selector)
    this.$loading = $(loadingHTML)
    this.$error = $(errorHTML)
    this.$pip = $(pipHTML)
    this.$video = (
      (opts.video ? $(opts.video) : $('<video />')) as JQuery<HTMLVideoElement>
    ).attr({ id: 'k-player', playsinline: true })
    this.$progress = $(progressHTML)
    this.$header = $('<div id="k-player-header"/>')
    this.$wrapper.append(this.$video)

    this.localConfigKey = 'kplayer'
    this.statusSessionKey = 'k-player-status'
    this.localPlayTimeKey = 'k-player-play-time'

    this.localConfig = Object.assign(
      {},
      defaultConfig,
      gm.getItem(this.localConfigKey)
    )

    const isIOS = /ip(hone|od)/i.test(navigator.userAgent)

    this.plyr = new Plyr('#k-player', {
      autoplay: this.localConfig.autoplay,
      keyboard: { global: false, focused: false },
      controls: [
        'play-large',
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
      volume: this.localConfig.volume,
      fullscreen: {
        enabled: true,
        iosNative: isIOS,
      },
      i18n,
      tooltips: {
        controls: true,
        seek: true,
      },
      ...opts,
    })

    this.$videoWrapper = this.$wrapper.find('.plyr')
    this.$videoWrapper
      .find('.plyr__time--duration')
      .after('<div class="plyr__controls__item k-player-controls-spacer"/>')

    this.$videoWrapper
      .find('[data-plyr="pip"] .plyr__tooltip')
      .html(
        `画中画(<k-shortcuts-tip command=${Shortcuts.Commands.togglePIP}></k-shortcuts-tip>)`
      )

    this.$videoWrapper.append(
      this.$loading,
      this.$error,
      this.$pip,
      this.$progress,
      this.$header
    )

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
    this.injectNext()
    this.injectSreen()
    this.injectSearchActions()

    KPlayer.plguinList.forEach((setup) => setup(this))

    this.initEvent()

    if (opts.eventToParentWindow) {
      this.eventToParentWindow()
    }

    const status = session.getItem(this.statusSessionKey)
    if (status) {
      session.removeItem(this.statusSessionKey)
      this.toggleWidescreen(status)
    }
  }

  static register(setup: (player: KPlayer) => void) {
    this.plguinList.push(setup)
  }

  setCurrentTimeLog(time?: number) {
    time = Math.floor(time ?? this.currentTime)

    const store = local.getItem<LocalPlayTimeStore>(this.localPlayTimeKey, {})
    store[this.playTimeStoreKey] = time
    local.setItem(this.localPlayTimeKey, store)
  }
  setCurrentTimeLogThrottled = throttle(() => {
    // 该函数🈶由 timeupdate 触发，只记录 3s 后的时间
    if (this.currentTime > 3) this.setCurrentTimeLog()
  }, 1000)

  getCurrentTimeLog(): number | undefined {
    const store = local.getItem<LocalPlayTimeStore>(this.localPlayTimeKey, {})
    return store[this.playTimeStoreKey]
  }

  get playTimeStoreKey() {
    if (typeof this.opts.logTimeId === 'string') {
      return this.opts.logTimeId
    } else if (typeof this.opts.logTimeId === 'function') {
      return this.opts.logTimeId()
    } else if (this.src.startsWith('blob')) {
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

  jumpToLogTime = () => {
    if (this.isJumped) return
    // 只有视频前三秒才需要执行自动跳转
    if (this.currentTime < 3) {
      this.isJumped = true
      const logTime = this.getCurrentTimeLog()
      // 如果视频还未看完，剩余时间超过 10s，执行自动跳转
      if (logTime && this.plyr.duration - logTime > 10) {
        this.message.info(`已自动跳转至历史播放位置 ${parseTime(logTime)}`)
        this.currentTime = logTime
      }
    }
  }

  private initEvent() {
    this.$video
      .on('dragover', (e) => {
        e.preventDefault()
      })
      .on('drop', (_e) => {
        const e = _e.originalEvent!
        e.preventDefault()
        const file = e.dataTransfer?.files[0]
        if (file) {
          this.src = URL.createObjectURL(file)
        }
      })

    this.on('loadstart', () => {
      this.$loading.show()
      this.hideError()
    })
    this.on('loadedmetadata', () => {
      this.$loading.hide()
    })
    this.on('canplay', () => {
      this.$loading.hide()
      if (this.localConfig.autoplay) {
        this.plyr.play()
      }
      if (this.localConfig.continuePlay) {
        this.jumpToLogTime()
      }
    })
    this.on('error', () => {
      this.setCurrentTimeLog(0)
      this.$searchActions.show()

      const code = this.media.error!.code
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
    this.on('next', () => {
      this.message.info('正在切换下一集')
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
        .css('width', (this.currentTime / this.plyr.duration || 0) * 100 + '%')
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

    $('.plyr__controls button,.plyr__controls input').on('mouseleave', (e) => {
      e.target.blur()
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

    this.initInputEvent()
  }

  initInputEvent() {
    let timeId: number
    const $dom = $("#k-player-wrapper input[type='range']")

    $dom.trigger('mouseup').off('mousedown').off('mouseup')
    $dom.on('mousedown', function () {
      clearInterval(timeId)
      let i = 0
      timeId = window.setInterval(() => {
        $(this)
          .removeClass()
          .addClass(`shake-${i++ % 2}`)
      }, 100)
    })
    $dom.on('mouseup', function () {
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
      .find<HTMLInputElement>('[name=showPlayLarge]')
      .prop('checked', this.localConfig.showPlayLarge)
      .on('change', (e) => {
        const checked = e.target.checked
        this.configSaveToLocal('showPlayLarge', checked)
        this.$videoWrapper
          .find('.plyr__control.plyr__control--overlaid')
          .toggle(checked)
      })
    this.$videoWrapper
      .find('.plyr__control.plyr__control--overlaid')
      .toggle(this.localConfig.showPlayLarge)

    this.$settings
      .find<HTMLInputElement>('[name=showSearchActions]')
      .prop('checked', this.localConfig.showSearchActions)
      .on('change', (e) => {
        const checked = e.target.checked
        this.configSaveToLocal('showSearchActions', checked)
        this.$searchActions.toggle(checked)
      })

    this.$settings
      .find<HTMLInputElement>('[name=autoNext]')
      .prop('checked', this.localConfig.autoNext)
      .on('change', (e) => {
        const checked = e.target.checked
        this.configSaveToLocal('autoNext', checked)
      })

    this.$settings
      .find<HTMLInputElement>('[name=showProgress]')
      .prop('checked', this.localConfig.showProgress)
      .on('change', (e) => {
        const checked = e.target.checked
        this.configSaveToLocal('showProgress', checked)
        this.$progress.toggle(checked)
      })
    this.$progress.toggle(this.localConfig.showProgress)

    this.$settings
      .find<HTMLInputElement>('[name=autoplay]')
      .prop('checked', this.localConfig.autoplay)
      .on('change', (e) => {
        const checked = e.target.checked
        this.configSaveToLocal('autoplay', checked)
        this.plyr.autoplay = checked
      })

    this.$settings
      .find<HTMLInputElement>('[name=continuePlay]')
      .prop('checked', this.localConfig.continuePlay)
      .on('change', (e) => {
        const checked = e.target.checked
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

  private injectNext() {
    $($('#plyr__next').html())
      .insertBefore('.plyr__controls__item.plyr__progress__container')
      .on('click', () => {
        this.trigger('next')
      })
  }

  private injectSreen() {
    $($('#plyr__widescreen').html())
      .insertBefore('[data-plyr="fullscreen"]')
      .on('click', () => {
        this.toggleWidescreen()
      })
  }

  private async injectSearchActions() {
    this.$searchActions = $(searchActionsHTML).toggle(
      this.localConfig.showSearchActions
    )
    this.$searchActions.insertBefore(this.$speed)

    const actions = await runtime.getSearchActions()
    if (actions.length === 0) return

    this.$searchActions.find('.k-menu').append(
      actions.map(({ name, search }) => {
        return $<HTMLLIElement>(
          `<li class="k-menu-item k-speed-item">${name}</li>`
        ).on('click', search)
      })
    )
  }

  toggleWidescreen(bool = !this.isWideScreen) {
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

  get media() {
    return this.$video[0]
  }

  set src(src: string) {
    this.isJumped = false
    if (src.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls()
        hls.loadSource(src)
        hls.attachMedia(this.media)
      } else if (this.media.canPlayType('application/vnd.apple.mpegurl')) {
        this.$video.attr('src', src)
      } else {
        throw new Error('不支持播放 hls 文件')
      }
    } else {
      this.$video.attr('src', src)
    }
  }

  get src() {
    return this.media.currentSrc
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
    this.message.destroy()
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
        const video = this.media
        const info = {
          width: video.videoWidth,
          height: video.videoHeight,
          currentTime: video.currentTime,
          src: video.src,
          duration: video.duration,
        }
        window.parent.postMessage({ key, video: info }, '*')
      })
    })
  }
}

export function addReferrerMeta(content: 'same-origin' | 'no-referrer') {
  if ($('meta[name=referrer]').length === 0) {
    $('head').append(`<meta name="referrer" content="${content}">`)
  } else {
    const $meta = $('meta[name=referrer]')
    $meta.attr('content', content)
  }
}
