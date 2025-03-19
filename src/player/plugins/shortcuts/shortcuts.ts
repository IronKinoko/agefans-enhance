import { renderKey } from '../../../utils/renderKey'
import { KPlayer } from '../../Kplayer'
import { KeyBindings } from './keybindings'
import { Command, Commands } from './types'
import { normalizeKeyEvent } from './utils'

declare module '../../KPlayer' {
  interface KPlayer {
    shortcuts: Shortcuts
  }
}

export class Shortcuts {
  constructor(private player: KPlayer) {
    player.shortcuts = this
    window.addEventListener('keydown', this.handleKeyEvent)
    window.addEventListener('keyup', this.handleKeyEvent)
  }
  static Commands = Commands
  static keyBindings = new KeyBindings()
  private static commands: Command[] = []

  static registerCommand(
    command: Command['command'],
    keydown: Command['keydown'],
    keyup?: Command['keyup']
  ) {
    this.commands.push({ command, keydown, keyup })
  }

  handleKeyEvent = (e: KeyboardEvent) => {
    if (/input|textarea|select/i.test(document.activeElement?.tagName!)) return
    const key = normalizeKeyEvent(e)

    const command = Shortcuts.keyBindings.getCommand(key)
    if (command) {
      e.preventDefault()
      this.invoke(command, e)
    }
  }

  invoke(command: string, e: KeyboardEvent) {
    const cmd = Shortcuts.commands.find((cmd) => cmd.command === command)
    if (cmd) {
      const type = e.type === 'keydown' ? 'keydown' : 'keyup'
      cmd[type]?.call(this.player, e)
    }
  }
}

customElements.define(
  'k-shortcuts-tip',
  class extends HTMLElement {
    unsubscribe: () => void
    node: HTMLSpanElement
    constructor() {
      super()

      this.node = document.createElement('span')
      const shadowRoot = this.attachShadow({ mode: 'open' })
      shadowRoot.appendChild(this.node)

      this.unsubscribe = Shortcuts.keyBindings.subscribe(() => {
        this.renderKey()
      })
      this.renderKey()
    }

    renderKey() {
      const command = this.getAttribute('command')!
      const kb = Shortcuts.keyBindings.getKeyBinding(command)
      if (kb) {
        this.node.textContent = renderKey(kb.key)
      }
    }

    disconnectedCallback() {
      this.unsubscribe()
    }
  }
)

export function setup(player: KPlayer) {
  new Shortcuts(player)
}
