import { get, isNil, set, throttle } from 'lodash-es'
import { modal } from '../../../utils/modal'
import { KPlayer } from '../../Kplayer'
import { Shortcuts } from '../shortcuts'
import T from './html.template.html'
import { local } from '../../../utils/storage'

declare module '../../KPlayer' {
  interface KPlayer {
    autoSeek: AutoSeek
  }
}

// 所有时间都是秒
type AutoSeekConfigItem = {
  enabled: boolean
  start?: number // 开始时间
  diff?: number // 跳过的时间
}
type AutoSeekConfig = {
  start: AutoSeekConfigItem
  end: AutoSeekConfigItem
}

enum Commands {
  autoSeekConfig = 'autoSeekConfig',
}
function setFormData(formHTML: string, data: AutoSeekConfig) {
  const $form = $(formHTML)
  $form.find<HTMLInputElement>('input[name]').each((_, el) => {
    switch (el.getAttribute('type')) {
      case 'checkbox':
        el.checked = get(data, el.name, false)
        break
      case 'number': {
        el.value = get(data, el.name)
      }
      default:
        break
    }
  })
  return $form
}

function getFormData(form: JQuery) {
  const data: any = {}
  form.find<HTMLInputElement>('input[name]').each((_, el) => {
    switch (el.getAttribute('type')) {
      case 'checkbox':
        set(data, el.name, el.checked)
        break
      case 'number': {
        const value = isNaN(parseInt(el.value)) ? undefined : parseInt(el.value)
        set(data, el.name, value)
      }
      default:
        break
    }
  })
  return data as AutoSeekConfig
}

Shortcuts.keyBindings.registerKeyBinding({
  command: Commands.autoSeekConfig,
  description: '设置跳过片段',
  key: 'G',
})
Shortcuts.registerCommand(
  Commands.autoSeekConfig,
  (function () {
    let open = false
    return function () {
      if (!this.autoSeek.scope) {
        this.message.info('该网站暂未适配自动跳过片段功能，敬请期待')
        return
      }

      if (open) return
      open = true
      this.plyr.pause()
      modal({
        width: 350,
        title: '跳过片段设置',
        content: setFormData(T['k-autoseek-config'], this.autoSeek.getConfig()),
        afterClose: () => {
          open = false
          this.plyr.play()
        },
        onOk: () => {
          const config = getFormData($('#k-autoseek-config form'))
          if (
            config.start.enabled &&
            (isNil(config.start.start) || isNil(config.start.diff))
          ) {
            config.start.enabled = false
            delete config.start.start
            delete config.start.diff
          }

          if (
            config.end.enabled &&
            (isNil(config.end.start) || isNil(config.end.diff))
          ) {
            config.end.enabled = false
            delete config.end.start
            delete config.end.diff
          }

          if (config.start.diff) {
            config.start.diff = Math.abs(config.start.diff)
          }
          if (config.end.diff) {
            config.end.diff = Math.abs(config.end.diff)
          }

          this.autoSeek.setConfig(config)
        },
      })
    }
  })()
)

const DefaultConfig: AutoSeekConfig = {
  start: { enabled: false, start: 0, diff: 85 },
  end: { enabled: false },
}

class AutoSeek {
  config = DefaultConfig
  localStoreKey = 'k-autoSeek-config'
  scope?: string

  constructor(private player: KPlayer) {
    this.player.autoSeek = this

    this.player.getAnimeScope().then((scope) => {
      this.init(scope)
    })
  }

  getConfig() {
    if (!this.scope) throw new Error('AutoSeek scope is not set')

    const store = local.getItem<Record<string, AutoSeekConfig>>(
      this.localStoreKey,
      {}
    )

    return store[this.scope] || DefaultConfig
  }
  setConfig(config: AutoSeekConfig) {
    if (!this.scope) throw new Error('AutoSeek scope is not set')

    this.config = config

    local.setItem(this.localStoreKey, {
      ...local.getItem(this.localStoreKey, {}),
      [this.scope]: config,
    })

    this.refresh()
  }

  private init(scope: string) {
    this.scope = scope
    this.config = this.getConfig()

    this.player.on('loadedmetadata', () => {
      this.refresh()
    })

    let isSeeking = false
    // 监听用户交互
    const container = this.player.plyr.elements.controls
    if (container) {
      // 监听进度条相关的用户交互
      const progressContainer = container.querySelector('.plyr__progress')
      if (progressContainer) {
        progressContainer.addEventListener('mousedown', () => {
          isSeeking = true
        })
        progressContainer.addEventListener('mouseup', () => {
          isSeeking = false
        })
        progressContainer.addEventListener('touchstart', () => {
          isSeeking = true
        })
        progressContainer.addEventListener('touchend', () => {
          isSeeking = false
        })
      }
    }

    this.player.on(
      'timeupdate',
      throttle(() => {
        const media = this.player.media
        const currentTime = media.currentTime
        const duration = media.duration

        const enabled = this.config.start.enabled || this.config.end.enabled
        if (
          !enabled ||
          isSeeking ||
          // 避免在片尾时触发
          currentTime >= duration - 3
        )
          return

        if (this.config.start.enabled) {
          const start = this.config.start.start || 0
          const diff = this.config.start.diff || 0

          if (currentTime >= start && currentTime <= start + diff) {
            this.player.media.currentTime = start + diff
          }
        }

        if (this.config.end.enabled) {
          const start = this.config.end.start || 0
          const diff = this.config.end.diff || 0

          if (start <= 0) {
            if (
              currentTime >= start + duration - diff &&
              currentTime <= start + duration
            ) {
              this.player.media.currentTime = start + duration
            }
          } else {
            if (currentTime >= start && currentTime <= start + diff) {
              this.player.media.currentTime = start + diff
            }
          }
        }
      }, 300)
    )
  }

  private refresh() {
    const duration = this.player.media.duration
    if (!duration) return

    $('#k-autoseek-overlay').remove()

    const enabled = this.config.start.enabled || this.config.end.enabled
    if (!enabled) return
    const $overlay = $(T['k-autoseek-overlay'])

    if (this.config.start.enabled) {
      const start = this.config.start.start || 0
      const $segment = $('<div class="k-autoseek-segment" />')
      $segment.css({
        left: `${(start / duration) * 100}%`,
      })
      $overlay.append($segment)
    }
    if (this.config.end.enabled) {
      const start = this.config.end.start || 0
      const diff = this.config.end.diff || 0
      const $segment = $('<div class="k-autoseek-segment" />')

      if (start <= 0) {
        $segment.css({
          left: `${((start + duration - diff) / duration) * 100}%`,
        })
      } else {
        $segment.css({
          left: `${(start / duration) * 100}%`,
        })
      }

      $overlay.append($segment)
    }

    this.player.plyr.elements.container
      ?.querySelector('.plyr__progress')
      ?.append($overlay[0])
  }
}

export function setup(player: KPlayer) {
  new AutoSeek(player)
}
