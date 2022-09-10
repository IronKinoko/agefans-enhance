import clamp from 'lodash-es/clamp'
import { Shortcuts } from './shortcuts'
import { Command, Commands } from './types'
import './help'

function seekTime(duration: number): Command['callback'] {
  return function () {
    this.currentTime = clamp(this.currentTime + duration, 0, this.plyr.duration)

    this.message.info(`步${duration < 0 ? '退' : '进'}${Math.abs(duration)}s`)
  }
}

Shortcuts.registerCommand(Commands.forward5, seekTime(5))
Shortcuts.registerCommand(Commands.backward5, seekTime(-5))

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

Shortcuts.registerCommand(Commands.togglePlay, function () {
  this.plyr.togglePlay()
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
      this.speed = this._.prevSpeed || 1
    }
  }
})

function changeSpeed(diff: number): Command['callback'] {
  return function () {
    let idx = this._.speedList.indexOf(this.speed)

    const newIdx = clamp(idx + diff, 0, this._.speedList.length - 1)
    if (newIdx === idx) return
    const speed = this._.speedList[newIdx]
    this.speed = speed
  }
}
Shortcuts.registerCommand(Commands.increaseSpeed, changeSpeed(1))
Shortcuts.registerCommand(Commands.decreaseSpeed, changeSpeed(-1))

Shortcuts.registerCommand(Commands.togglePIP, function () {
  this.plyr.pip = !this.plyr.pip
})

Shortcuts.registerCommand(Commands.internal, function () {})

function changeFrame(diff: number): Command['callback'] {
  let fps = 30
  let isSuspend = false

  return function () {
    this.plyr.pause()
    this.currentTime = clamp(
      this.currentTime + diff / fps,
      0,
      this.plyr.duration
    )
    // 自动播放的话，canplay 事件会执行play函数，暂时挂起
    if (this.localConfig.autoplay) {
      if (!isSuspend) {
        this.plyr.play = ((play) => {
          isSuspend = true
          const fn = () => {
            isSuspend = false
            this.plyr.play = play
          }
          return fn
        })(this.plyr.play)
      }
    }

    this.message.destroy()
    this.message.info(`${diff > 0 ? '下' : '上'}一帧`)
  }
}
Shortcuts.registerCommand(Commands.prevFrame, changeFrame(-1))
Shortcuts.registerCommand(Commands.nextFrame, changeFrame(1))

Shortcuts.registerCommand(Commands.toggleFullscreen, function () {
  this.plyr.fullscreen.toggle()
})

Shortcuts.registerCommand(Commands.increaseVolume, function () {
  this.plyr.increaseVolume(0.1)
})
Shortcuts.registerCommand(Commands.decreaseVolume, function () {
  this.plyr.decreaseVolume(0.1)
})

Shortcuts.registerCommand(Commands.toggleMute, function () {
  this.plyr.muted = !this.plyr.muted
})
