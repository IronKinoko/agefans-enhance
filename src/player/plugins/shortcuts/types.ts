import { KPlayer } from '../../Kplayer'

export interface Command {
  command: string
  callback(this: KPlayer): void
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
  forward30 = 'forward30',
  backward30 = 'backward30',
  forward60 = 'forward60',
  backward60 = 'backward60',
  forward90 = 'forward90',
  backward90 = 'backward90',
  next = 'next',
  prev = 'prev',
  toggleWidescreen = 'toggleWidescreen',
  Escape = 'Escape',
  restoreSpeed = 'restoreSpeed',
  increaseSpeed = 'increaseSpeed',
  decreaseSpeed = 'decreaseSpeed',
  togglePIP = 'togglePIP',
  internal = 'internal',
  help = 'help',
  prevFrame = 'prevFrame',
  nextFrame = 'nextFrame',
}
