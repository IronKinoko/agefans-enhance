import { get, isNil, set } from 'lodash-es'
import { modal } from '../../../utils/modal'
import { KPlayer } from '../../Kplayer'
import { Shortcuts } from '../shortcuts'
import T from './html.template.html'
import { local } from '../../../utils/storage'

declare module '../../KPlayer' {
  interface KPlayer {
    autoSeek: AutoSeek
  }
  interface KPlayerOpts {
    autoSeekScope?: string // 用于标识自动跳过片段的作用域
  }
}

// 所有时间都是秒
type AutoSeekConfigItem = {
  enabled: boolean
  start?: number // 开始时间
  diff?: number // 跳过的时间
}
type AutoSeekConfig = {
  enabled: boolean // 是否启用自动跳过
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
      modal({
        width: 350,
        title: '跳过片段设置',
        content: setFormData(T['k-autoseek-config'], this.autoSeek.getConfig()),
        afterClose: () => (open = false),
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
  enabled: false,
  start: { enabled: false },
  end: { enabled: false },
}

class AutoSeek {
  config = DefaultConfig
  localStoreKey = 'k-autoSeek-config'
  scope?: string

  constructor(private player: KPlayer) {
    this.player.autoSeek = this

    if (this.player.opts.autoSeekScope) {
      this.init(this.player.opts.autoSeekScope)
    }
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

  init(scope: string) {
    this.scope = scope
    this.config = this.getConfig()

    this.player.on('loadedmetadata', () => {
      this.refresh()
    })

    this.player.on('timeupdate', () => {
      const currentTime = this.player.media.currentTime
      const duration = this.player.media.duration

      if (!this.config.enabled) return
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
    })
  }

  refresh() {
    const duration = this.player.media.duration
    if (!duration) return

    $('#k-autoseek-overlay').remove()

    if (!this.config.enabled) return
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
