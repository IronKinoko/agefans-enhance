import { gm } from '../../../utils/storage'
import { Commands, KeyBinding, CustomKeyBinding } from './types'

const isMac = /macintosh|mac os x/i.test(navigator.userAgent)

const DefaultKeyBindings: KeyBinding[] = [
  { command: Commands.togglePlay, key: 'Space', description: '播放/暂停' },
  {
    command: Commands.backward5,
    key: 'ArrowLeft',
    description: '步退5s',
  },
  {
    command: Commands.forward5,
    key: 'ArrowRight',
    description: '步进5s',
  },
  {
    command: Commands.backward30,
    key: 'shift ArrowLeft',
    description: '步退30s',
  },
  {
    command: Commands.forward30,
    key: 'shift ArrowRight',
    description: '步进30s',
  },
  {
    command: Commands.backward60,
    key: 'alt ArrowLeft',
    description: '步退60s',
  },
  {
    command: Commands.forward60,
    key: 'alt ArrowRight',
    description: '步进60s',
  },
  {
    command: Commands.backward90,
    key: 'ctrl ArrowLeft',
    mac: 'meta ArrowLeft',
    description: '步退90s',
  },
  {
    command: Commands.forward90,
    key: 'ctrl ArrowRight',
    mac: 'meta ArrowRight',
    description: '步进90s',
  },
  { command: Commands.prevFrame, key: '', description: '上一帧' },
  { command: Commands.nextFrame, key: '', description: '下一帧' },
  { command: Commands.prev, key: 'P', description: '上一集' },
  { command: Commands.next, key: 'N', description: '下一集' },
  { command: Commands.toggleWidescreen, key: 'W', description: '宽屏' },
  {
    command: Commands.toggleFullscreen,
    key: 'F',
    description: '全屏',
  },
  {
    command: Commands.Escape,
    key: 'Escape',
    editable: false,
    description: '退出全屏/宽屏',
  },
  { command: Commands.restoreSpeed, key: 'Z', description: '原速播放' },
  { command: Commands.decreaseSpeed, key: 'X', description: '减速播放' },
  { command: Commands.increaseSpeed, key: 'C', description: '加速播放' },
  { command: Commands.togglePIP, key: 'I', description: '画中画' },
  {
    command: Commands.increaseVolume,
    key: 'ArrowUp',
    description: '增大音量',
  },
  {
    command: Commands.decreaseVolume,
    key: 'ArrowDown',
    description: '减小音量',
  },
  {
    command: Commands.toggleMute,
    key: 'M',
    description: '切换禁用',
  },
  {
    command: Commands.internal,
    key: '?',
    editable: false,
    description: '显示帮助',
  },
]

export class KeyBindings {
  storageKey = 'user-custom-keybindings'

  private listener: (() => void)[] = []
  private getCustomKeyBindings() {
    return gm.getItem<CustomKeyBinding[]>(this.storageKey, [])
  }
  private setCustomKeyBindings(keyBindings: CustomKeyBinding[]) {
    gm.setItem(this.storageKey, keyBindings)
  }

  registerKeyBinding(keyBinding: KeyBinding) {
    DefaultKeyBindings.push(keyBinding)
    this.notify()
  }

  setKeyBinding(command: string, key: string) {
    let customKeyBindings = this.getCustomKeyBindings()
    customKeyBindings = customKeyBindings.filter((o) => o.command !== command)

    if (key) {
      customKeyBindings.push({ command, key })
    }

    this.setCustomKeyBindings(customKeyBindings)
    this.notify()
  }

  getKeyBindings() {
    const customKeyBindings = this.getCustomKeyBindings()

    return DefaultKeyBindings.map((keyBinding) => {
      const customKeyBinding = customKeyBindings.find(
        (o) => o.command === keyBinding.command
      )

      const nextKeyBinding = { ...keyBinding, originKey: '', customKey: '' }

      if (isMac && nextKeyBinding.mac) {
        nextKeyBinding.key = nextKeyBinding.mac
      }
      nextKeyBinding.originKey = nextKeyBinding.key
      if (customKeyBinding) {
        nextKeyBinding.key = customKeyBinding.key
        nextKeyBinding.customKey = customKeyBinding.key
      }

      return nextKeyBinding
    })
  }
  getKeyBinding(command: string) {
    const keyBindings = this.getKeyBindings()
    return keyBindings.find((o) => o.command === command)
  }

  getCommand(key: string) {
    const keyBindings = this.getKeyBindings()
    return keyBindings.find((o) => o.key === key)?.command
  }

  subscribe(cb: () => void) {
    this.listener.push(cb)
    return () => {
      this.listener = this.listener.filter((fn) => fn !== cb)
    }
  }
  notify() {
    this.listener.forEach((fn) => fn())
  }
}
