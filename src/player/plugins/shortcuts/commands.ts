import { clamp } from 'lodash-es'
import { speedList } from '../../html'
import { Shortcuts } from './shortcuts'
import { Command, Commands } from './types'
import './help'

function seekTime(duration: number): Command['callback'] {
  return function () {
    this.currentTime = clamp(this.currentTime + duration, 0, this.plyr.duration)

    this.message.info(`步${duration < 0 ? '退' : '进'}${Math.abs(duration)}s`)
  }
}

Shortcuts.registerCommand(Commands.forward30, seekTime(30))
Shortcuts.registerCommand(Commands.backward30, seekTime(-30))

Shortcuts.registerCommand(Commands.forward60, seekTime(60))
Shortcuts.registerCommand(Commands.backward60, seekTime(-60))

Shortcuts.registerCommand(Commands.forward90, seekTime(90))
Shortcuts.registerCommand(Commands.backward90, seekTime(-90))

Shortcuts.registerCommand(Commands.prev, function () {
  this.trigger('prev')
})
Shortcuts.registerCommand(Commands.next, function () {
  this.trigger('next')
})

Shortcuts.registerCommand(Commands.toggleWidescreen, function () {
  if (this.plyr.fullscreen.active) return
  this.toggleWidescreen()
})

Shortcuts.registerCommand(Commands.Escape, function () {
  if (this.plyr.fullscreen.active || !this.isWideScreen) return
  this.toggleWidescreen(false)
})

Shortcuts.registerCommand(Commands.restoreSpeed, function () {
  if (this.speed !== 1) {
    this._.prevSpeed = this.speed
    this.speed = 1
  } else {
    if (this.speed !== this._.prevSpeed) {
      this.speed = this._.prevSpeed
    }
  }
})

function changeSpeed(increase: boolean): Command['callback'] {
  return function () {
    let idx = speedList.indexOf(this.speed)
    const newIdx = increase
      ? Math.min(speedList.length - 1, idx + 1)
      : Math.max(0, idx - 1)
    if (newIdx === idx) return
    const speed = speedList[newIdx]
    this.speed = speed
  }
}
Shortcuts.registerCommand(Commands.increaseSpeed, changeSpeed(true))
Shortcuts.registerCommand(Commands.decreaseSpeed, changeSpeed(false))

Shortcuts.registerCommand(Commands.togglePIP, function () {
  this.plyr.pip = !this.plyr.pip
})

Shortcuts.registerCommand(Commands.internal, function () {})
