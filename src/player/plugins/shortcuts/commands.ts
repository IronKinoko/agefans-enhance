import { clamp } from 'lodash-es'
import { Shortcuts } from './shortcuts'
import { CommandEvent, Commands } from './types'
import './help'
import { modal } from '../../../utils/modal'

function seekTime(duration: number): CommandEvent {
  return function () {
    const safeMaxTime = this.plyr.duration - 0.1
    this.currentTime = clamp(this.currentTime + duration, 0, safeMaxTime)

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

Shortcuts.registerCommand(Commands.forwardCustom, function (e) {
  seekTime(+this.localConfig.customSeekTime).call(this, e)
})
Shortcuts.registerCommand(Commands.backwardCustom, function (e) {
  seekTime(-this.localConfig.customSeekTime).call(this, e)
})
Shortcuts.registerCommand(
  Commands.recordCustomSeekTime,
  (() => {
    let open = false
    return function () {
      if (open) return
      open = true

      this.plyr.pause()
      modal({
        width: 250,
        title: '自定义跳转时间',
        content: `<label>
          <span>自定义跳转时间</span>
          <input id="k-customSeekTime" class="k-input-number" style="width:60px" type="number" value="${this.localConfig.customSeekTime}" />
          <span>秒</span>
        </label>
          `,
        afterClose: () => {
          open = false
          this.plyr.play()
        },
        handleOkOnEnter: true,
        onOk: () => {
          const $input = $('#k-customSeekTime')
          const value = $input.val()
          if (!value || isNaN(+value)) {
            this.message.info('请输入正确的数字')
            return
          }
          this.configSaveToLocal('customSeekTime', +value)
          this.message.info(
            `记录成功，自定义跳转时间为${this.localConfig.customSeekTime}s`
          )
        },
      })
    }
  })()
)

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

Shortcuts.registerCommand(
  Commands.restoreSpeed,
  (() => {
    let prevSpeed = 1
    return function () {
      if (this.speed !== 1) {
        prevSpeed = this.speed
        this.speed = 1
      } else {
        if (this.speed !== prevSpeed) {
          this.speed = prevSpeed
        }
      }
    }
  })()
)

function changeSpeed(diff: number): CommandEvent {
  return function () {
    let idx = this.speedList.indexOf(this.speed)

    const newIdx = clamp(idx + diff, 0, this.speedList.length - 1)
    if (newIdx === idx) return
    const speed = this.speedList[newIdx]
    this.speed = speed
  }
}
Shortcuts.registerCommand(Commands.increaseSpeed, changeSpeed(1))
Shortcuts.registerCommand(Commands.decreaseSpeed, changeSpeed(-1))

function createTemporaryIncreaseSpeed(): [CommandEvent, CommandEvent] {
  let prevSpeed = 1
  let isIncreasingSpeed = false
  return [
    function keydown(e) {
      if (!e.repeat || isIncreasingSpeed) return

      isIncreasingSpeed = true
      prevSpeed = this.speed
      this.plyr.speed = 3
      this.message.info('倍速播放中', 500)
    },
    function keyup(e) {
      if (!isIncreasingSpeed) return
      isIncreasingSpeed = false
      this.plyr.speed = prevSpeed
    },
  ]
}

Shortcuts.registerCommand(
  Commands.temporaryIncreaseSpeed,
  ...createTemporaryIncreaseSpeed()
)

Shortcuts.registerCommand(Commands.togglePIP, function () {
  this.plyr.pip = !this.plyr.pip
})

Shortcuts.registerCommand(Commands.internal, function () {})

function changeFrame(diff: number): CommandEvent {
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
          return () => {
            isSuspend = false
            this.plyr.play = play
          }
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
  this.plyr.increaseVolume(0.05)
  this.message.info(`音量${Math.round(this.plyr.volume * 100)}%`)
})
Shortcuts.registerCommand(Commands.decreaseVolume, function () {
  this.plyr.decreaseVolume(0.05)
  this.message.info(`音量${Math.round(this.plyr.volume * 100)}%`)
})

Shortcuts.registerCommand(Commands.toggleMute, function () {
  this.plyr.muted = !this.plyr.muted
  this.message.info(this.plyr.muted ? '静音' : '取消静音')
})

Shortcuts.registerCommand(Commands.skipSeconds, function () {
  const skipSeconds = this.localConfig.skipSeconds
  this.currentTime = Math.min(
    this.currentTime + skipSeconds,
    this.plyr.duration
  )
  this.message.info(`已跳过 ${skipSeconds}s`)
})
