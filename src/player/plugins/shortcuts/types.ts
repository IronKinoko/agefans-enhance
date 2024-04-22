import { KPlayer } from '../../Kplayer'

export interface CommandEvent {
  (this: KPlayer, event: KeyboardEvent): void
}
export interface Command {
  command: string
  keydown: CommandEvent
  keyup?: CommandEvent
}
export interface KeyBinding {
  command: string
  description: string
  editable?: boolean
  key: string
  mac?: string
}
export interface CustomKeyBinding {
  command: string
  key: string
}

export enum Commands {
  forward5 = 'forward5',
  backward5 = 'backward5',
  forward30 = 'forward30',
  backward30 = 'backward30',
  forward60 = 'forward60',
  backward60 = 'backward60',
  forward90 = 'forward90',
  backward90 = 'backward90',
  togglePlay = 'togglePlay',
  next = 'next',
  prev = 'prev',
  toggleWidescreen = 'toggleWidescreen',
  Escape = 'Escape',
  restoreSpeed = 'restoreSpeed',
  increaseSpeed = 'increaseSpeed',
  decreaseSpeed = 'decreaseSpeed',
  temporaryIncreaseSpeed = 'temporaryIncreaseSpeed',
  togglePIP = 'togglePIP',
  internal = 'internal',
  help = 'help',
  prevFrame = 'prevFrame',
  nextFrame = 'nextFrame',
  toggleFullscreen = 'toggleFullscreen',
  decreaseVolume = 'decreaseVolume',
  increaseVolume = 'increaseVolume',
  toggleMute = 'toggleMute',
  forwardCustom = 'forwardCustom',
  backwardCustom = 'backwardCustom',
  recordCustomSeekTime = 'recordCustomSeekTime',
}
