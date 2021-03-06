import { renderKey } from '../../../utils/renderKey'
import { KPlayer } from '../../Kplayer'
import { KeyBindings } from './keybindings'
import { Command, Commands } from './types'
import { normalizeKeyEvent } from './utils'

export class Shortcuts {
  constructor(private player: KPlayer) {
    window.addEventListener('keydown', this.handleKeyEvent)
  }
  static Commands = Commands
  static keyBindings = new KeyBindings()
  private static commands: Command[] = []

  static registerCommand(
    command: Command['command'],
    callback: Command['callback']
  ) {
    this.commands.push({ command, callback })
  }

  handleKeyEvent = (e: KeyboardEvent) => {
    if (/input|textarea|select/i.test(document.activeElement?.tagName!)) return
    const key = normalizeKeyEvent(e)

    const command = Shortcuts.keyBindings.getCommand(key)
    if (command) {
      e.preventDefault()
      this.invoke(command)
    }
  }

  invoke(command: string) {
    const cmd = Shortcuts.commands.find((cmd) => cmd.command === command)
    if (cmd) {
      cmd.callback.call(this.player)
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
