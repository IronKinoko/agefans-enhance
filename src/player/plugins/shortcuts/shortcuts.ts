import { KPlayer } from '../../Kplayer'
import { KeyBindings } from './keybindings'
import { Command } from './types'
import { normalizeKeyEvent } from './utils'

export class Shortcuts {
  constructor(private player: KPlayer) {
    window.addEventListener('keydown', this.handleKeyEvent)
  }

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

export function setup(player: KPlayer) {
  new Shortcuts(player)
}
