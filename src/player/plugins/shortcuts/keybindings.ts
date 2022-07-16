import { gm } from '../../../utils/storage'
import { Commands, KeyBinding, CustomKeyBinding } from './types'

const isMac = /macintosh|mac os x/i.test(navigator.userAgent)

const DefaultKeyBindings: KeyBinding[] = [
  {
    command: Commands.internal,
    key: 'ArrowLeft',
    description: '步退5s',
  },
  {
    command: Commands.internal,
    key: 'ArrowRight',
    description: '步退5s',
  },
  {
    command: Commands.forward30,
    key: 'shift ArrowRight',
    description: '步进30s',
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
  { command: Commands.next, key: 'N', description: '下一集' },
  { command: Commands.prev, key: 'P', description: '上一集' },
  { command: Commands.toggleWidescreen, key: 'W', description: '宽屏' },
  {
    command: Commands.internal,
    key: 'F',
    editable: false,
    description: '全屏',
  },
  {
    command: Commands.Escape,
    key: 'Escape',
    editable: false,
    description: '退出全屏/宽屏',
  },
  { command: Commands.restoreSpeed, key: 'Z', description: '原速播放' },
  { command: Commands.increaseSpeed, key: 'X', description: '减速播放' },
  { command: Commands.decreaseSpeed, key: 'C', description: '加速播放' },
  { command: Commands.togglePIP, key: 'I', description: '画中画' },
  {
    command: Commands.internal,
    key: 'ArrowUp',
    editable: false,
    description: '增大音量',
  },
  {
    command: Commands.internal,
    key: 'ArrowDown',
    editable: false,
    description: '减小音量',
  },
  {
    command: Commands.internal,
    key: 'M',
    editable: false,
    description: '切换禁用',
  },
  {
    command: Commands.help,
    key: '?',
    editable: false,
    description: '显示帮助',
  },
]

export class KeyBindings {
  storageKey = 'user-custom-keybindings'

  private getCustomKeyBindings() {
    return gm.getItem<CustomKeyBinding[]>(this.storageKey, [])
  }
  private setCustomKeyBindings(keyBindings: CustomKeyBinding[]) {
    gm.setItem(this.storageKey, keyBindings)
  }

  registerKeyBinding(keyBinding: KeyBinding) {
    DefaultKeyBindings.push(keyBinding)
  }

  setKeyBinding(command: string, key: string) {
    let customKeyBindings = this.getCustomKeyBindings()
    if (!key) {
      customKeyBindings = customKeyBindings.filter((o) => o.command !== command)
    } else {
      customKeyBindings.push({ command, key })
    }
    this.setCustomKeyBindings(customKeyBindings)
  }

  getKeyBindings() {
    const customKeyBindings = this.getCustomKeyBindings()

    return DefaultKeyBindings.map((keyBinding) => {
      const customKeyBinding = customKeyBindings.find(
        (o) => o.command === keyBinding.command
      )

      const nextKeyBinding = { ...keyBinding }

      if (isMac && nextKeyBinding.mac) {
        nextKeyBinding.key = nextKeyBinding.mac
      }
      if (customKeyBinding) {
        nextKeyBinding.key = customKeyBinding.key
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
}
