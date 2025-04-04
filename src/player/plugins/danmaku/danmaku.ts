import Danmaku from '@ironkinoko/danmaku'
import { runtime } from '../../../runtime'
import { KPlayer } from '../../Kplayer'
import { Shortcuts } from '../shortcuts'
import { getComments, queryAnimes, queryEpisodes } from './apis'
import { createDanmakuList } from './danmakuList'
import { createFilter } from './filter'
import { DanmakuElements } from './html'
import './index.scss'
import { parsePakkuDanmakuXML } from './parser'
import { createProgressBarPower } from './progressBarPower'
import { Anime, Commands, Comment, Episode } from './types'
import {
  addRangeListener,
  getCheckboxGroupValue,
  lockWrap,
  setCheckboxGroupValue,
  storageAnimeName,
  storageEpisodeName,
} from './utils'

type DanmakuMode = ('top' | 'bottom' | 'color')[]
interface DanmakuConfig {
  showDanmaku: boolean
  opacity: number
  showPbp: boolean
  danmakuOverlap: boolean
  danmakuMerge: boolean
  danmakuFontSize: number
  danmakuSpeed: number
  danmakuDensity: number
  danmakuMode: DanmakuMode
  danmakuFilter: string[]
  danmakuScrollAreaPercent: number
  danmakuSourceDisabledList: string[]
}
declare module '../../KPlayer' {
  interface LocalConfig extends DanmakuConfig {}

  interface KPlayer {
    danmaku?: DanmakuPlugin
  }
}

const defaultConfig = {
  showDanmaku: false,
  opacity: 0.6,
  showPbp: false,
  danmakuSpeed: 1,
  danmakuFontSize: 1,
  danmakuMode: ['top', 'color'],
  danmakuFilter: [],
  danmakuScrollAreaPercent: 1,
  danmakuMerge: false,
  danmakuDensity: 1,
  danmakuOverlap: false,
  danmakuSourceDisabledList: [],
} as DanmakuConfig

enum RunState {
  unSearched,
  searchedAnimes,
  findEpisodes,
  getComments,
}

type VideoInfo = NonNullable<
  Awaited<ReturnType<typeof runtime.getCurrentVideoNameAndEpisode>>
>

class DanmakuPlugin {
  elements = new DanmakuElements()
  player: KPlayer
  core?: Danmaku
  state: {
    state: RunState
    animes: Anime[]
    episodes: Episode[]
    comments: Comment[]
    videoInfo: NonNullable<
      Awaited<ReturnType<typeof runtime.getCurrentVideoNameAndEpisode>>
    >
    syncDiff: number
  }
  baseDanmkuSpeed = 130

  constructor(player: KPlayer, videoInfo: VideoInfo) {
    this.player = player
    this.player.danmaku = this
    this.state = {
      state: RunState.unSearched,
      animes: [],
      episodes: [],
      comments: [],
      videoInfo: videoInfo,
      syncDiff: 0,
    }
    this.player.localConfig = Object.assign(
      {},
      defaultConfig,
      this.player.localConfig
    )

    this.player.$videoWrapper.append(this.elements.$danmakuContainer)
    this.elements.$danmaku.insertBefore(player.$searchActions)
    this.elements.$danmaku.before(this.elements.$danmakuSwitch)

    let defaultSearchName =
      storageAnimeName(videoInfo.rawName) || videoInfo.name
    this.initEvents(
      typeof defaultSearchName === 'object'
        ? defaultSearchName.keyword
        : defaultSearchName
    )
    this.autoStart()
  }

  refreshDanmaku = () => {
    this.stop()
    this.autoStart()
  }

  showTips = (message: string, duration = 1500) => {
    this.elements.$tips
      .finish()
      .text(message)
      .fadeIn('fast')
      .delay(duration)
      .fadeOut('fast')
  }

  stop = () => {
    this.core?.hide()
  }

  start = () => {
    const run = () => {
      if (!this.player.media.duration) return requestAnimationFrame(run)
      if (!this.state.comments) return

      const nextComments = this.adjustCommentCount(this.state.comments)
      this.elements.$openDanmakuList
        .find('[data-id="count"]')
        .text(`(${nextComments.length}/${this.state.comments.length})`)
      if (this.player.localConfig.showDanmaku) {
        if (!this.core) {
          this.core = new Danmaku({
            container: this.elements.$danmakuContainer[0],
            media: this.player.media,
            comments: nextComments,
            merge: this.player.localConfig.danmakuMerge,
            scrollAreaPercent: this.player.localConfig.danmakuScrollAreaPercent,
            overlap: this.player.localConfig.danmakuOverlap,
          })
        } else {
          this.core.reload(nextComments)
          this.core.show()
        }
        this.core.speed =
          this.baseDanmkuSpeed * this.player.localConfig.danmakuSpeed
      }

      if (this.player.localConfig.showPbp) {
        createProgressBarPower(
          this.elements.$pbp,
          this.player.media.duration,
          nextComments
        )
      }
    }
    requestAnimationFrame(run)
  }

  adjustCommentCount = (comments: Comment[]) => {
    let ret: Comment[] = comments
    // 过滤弹幕
    ret = ret.filter((cmt) => {
      const isFilterMatch = this.player.localConfig.danmakuFilter.some(
        (filter) => {
          if (/^\/.*\/$/.test(filter)) {
            const re = new RegExp(filter.slice(1, -1))
            return re.test(cmt.text!)
          } else {
            return cmt.text!.includes(filter)
          }
        }
      )
      return !isFilterMatch
    })

    ret = ret.filter((cmt) => {
      const isDisabledSource =
        this.player.localConfig.danmakuSourceDisabledList.includes(
          cmt.user.source
        )
      return !isDisabledSource
    })

    // 过滤弹幕类型
    const mode = this.player.localConfig.danmakuMode
    if (!mode.includes('color')) {
      ret = ret.filter(
        (cmt) => (cmt.style as CSSStyleDeclaration)!.color === '#ffffff'
      )
    }
    if (!mode.includes('bottom')) {
      ret = ret.filter((cmt) => cmt.mode !== 'bottom')
    }
    if (!mode.includes('top')) {
      ret = ret.filter((cmt) => cmt.mode !== 'top')
    }

    // 24 分钟 3000 弹幕，按比例缩放
    const maxLength = Math.round(
      (3000 / (24 * 60)) *
        this.player.media.duration *
        this.player.localConfig.danmakuDensity
    )
    // 均分
    if (ret.length > maxLength) {
      let ratio = ret.length / maxLength

      ret = [...new Array(maxLength)].map((_, i) => ret![Math.floor(i * ratio)])
    }

    return ret
  }

  loadEpisode = async (episodeId: string) => {
    this.stop()
    this.state.comments = await getComments(episodeId)
    this.state.syncDiff = 0
    this.state.state = RunState.getComments
    this.start()

    this.player.message.info(
      `番剧：${this.elements.$animes.find(':selected').text()}`,
      2000
    )
    this.player.message.info(
      `章节：${this.elements.$episodes.find(':selected').text()}`,
      2000
    )
    this.player.message.info(
      `已加载 ${this.state.comments.length} 条弹幕`,
      2000
    )
  }

  searchAnime = lockWrap(async (name: string) => {
    if (!name || name.length < 2) return this.showTips('番剧名称不少于2个字')

    try {
      this.state.animes = []
      this.state.episodes = []
      renderSelectOptions(this.elements.$animes, this.state.animes)
      renderSelectOptions(this.elements.$episodes, this.state.episodes)
      this.showTips('正在搜索番剧中...')
      this.state.animes = await queryAnimes(name)
      if (this.state.animes.length === 0) return this.showTips('未搜索到番剧')
      renderSelectOptions(this.elements.$animes, this.state.animes)
      this.showTips(`找到 ${this.state.animes.length} 部番剧`)

      this.state.state = RunState.searchedAnimes
      this.autoMatchAnime()
    } catch (error: any) {
      console.error(error)
      this.player.message.info('弹幕服务异常，' + error.message, 3000)
    }
  })

  searchEpisodes = async (animeId: string) => {
    try {
      this.state.episodes = []
      renderSelectOptions(this.elements.$episodes, this.state.episodes)
      this.showTips('正在搜索剧集中...')
      this.state.episodes = await queryEpisodes(animeId)
      if (this.state.episodes.length === 0) return this.showTips('未搜索到剧集')
      renderSelectOptions(this.elements.$episodes, this.state.episodes)
      this.showTips(`找到 ${this.state.episodes.length} 集`)

      this.state.state = RunState.findEpisodes
      this.autoMatchEpisode()
    } catch (error: any) {
      console.error(error)
      this.player.message.info('弹幕服务异常，' + error.message, 3000)
    }
  }

  autoMatchAnime = () => {
    let anime = this.state.animes.find((anime) => {
      const storeAnime = storageAnimeName(this.state.videoInfo.rawName)
      if (storeAnime) {
        return anime.id === storeAnime.id
      }

      return anime.name === this.state.videoInfo.rawName
    })

    if (!anime) {
      this.player.message.info('弹幕未能自动匹配数据源，请手动搜索')
      anime = this.state.animes[0]
    }

    this.elements.$animes.val(anime.id)
    this.elements.$animes.trigger('change')
  }

  autoMatchEpisode = async () => {
    let episodeName = this.state.videoInfo.episode
    let episode: Episode | undefined

    let storedEpisodeId = storageEpisodeName(
      `${this.state.videoInfo.rawName}.${this.state.videoInfo.episode}`
    )
    if (storedEpisodeId) {
      episode = this.state.episodes.find(
        (episode) => String(episode.id) === storedEpisodeId
      )
    }
    if (!episode && !isNaN(+episodeName)) {
      episode = this.state.episodes.find((episode) =>
        new RegExp(`${episodeName}[话集]`).test(episode.name)
      )
      if (!episode) {
        episode = this.state.episodes.find((episode) =>
          episode.name.includes(episodeName)
        )
      }
    }

    this.elements.$episodes.val('')
    if (episode) {
      this.elements.$episodes.val(episode.id)
      this.elements.$episodes.trigger('change')
    } else {
      this.player.message.info('弹幕未能自动匹配数据源，请手动搜索')
    }
  }

  injectDanmakuDropEvent = () => {
    this.player.onDrop((e) => {
      e.preventDefault()
      const file = e.dataTransfer?.files[0]

      if (file?.type === 'text/xml') {
        const reader = new FileReader()
        reader.onload = async () => {
          this.stop()
          this.state.comments = parsePakkuDanmakuXML(reader.result as string)
          this.state.syncDiff = 0
          this.state.state = RunState.getComments
          this.start()

          this.player.message.info(
            `已加载 ${this.state.comments.length} 条弹幕`,
            2000
          )
        }
        reader.readAsText(file)
      }
    })
  }

  initEvents = (name: string) => {
    this.elements.$animeName.val(name)
    this.elements.$animeName.on('keypress', (e) => {
      if (e.key === 'Enter')
        this.searchAnime(this.elements.$animeName.val() as string)
    })
    this.elements.$animeName.on('blur', (e) => {
      this.searchAnime(this.elements.$animeName.val() as string)
    })

    this.elements.$animes.on('change', (e) => {
      const animeId = this.elements.$animes.val() as string
      const anime = this.state.animes.find((anime) => anime.id === animeId)
      if (!anime) return
      storageAnimeName(this.state.videoInfo.rawName, {
        id: anime.id,
        name: anime.name,
        keyword: this.elements.$animeName.val() as string,
      })
      this.searchEpisodes(anime.id)
    })
    this.elements.$episodes.on('change', (e) => {
      const episodeId = this.elements.$episodes.val() as string
      const animeId = this.elements.$animes.val() as string
      const anime = this.state.animes.find((anime) => anime.id === animeId)
      if (!anime || !episodeId) return

      storageAnimeName(this.state.videoInfo.rawName, {
        id: anime.id,
        name: anime.name,
        keyword: this.elements.$animeName.val() as string,
      })
      storageEpisodeName(
        `${this.state.videoInfo.rawName}.${this.state.videoInfo.episode}`,
        episodeId
      )
      this.loadEpisode(episodeId)
    })

    this.elements.$danmakuSwitch
      .toggleClass(
        'plyr__control--pressed',
        this.player.localConfig.showDanmaku
      )
      .on('click', () => {
        this.switchDanmaku()
      })

    const resizeOb = new ResizeObserver(() => {
      this.core?.resize()
    })
    resizeOb.observe(this.elements.$danmakuContainer[0])

    const mutationOb = new MutationObserver(async () => {
      Object.assign(
        this.state.videoInfo,
        await runtime.getCurrentVideoNameAndEpisode()
      )
      this.state.state = RunState.searchedAnimes
      this.autoStart()
    })

    mutationOb.observe(this.player.media, { attributeFilter: ['src'] })

    this.player.initInputEvent()

    this.elements.$showDanmaku
      .prop('checked', this.player.localConfig.showDanmaku)
      .on('change', (e) => {
        this.switchDanmaku(e.target.checked)
      })

    // 绑定 pbp 相关事件
    this.elements.$showPbp
      .prop('checked', this.player.localConfig.showPbp)
      .on('change', (e) => {
        const chekced = e.target.checked
        this.elements.$pbp.toggle(chekced)
        this.player.configSaveToLocal('showPbp', chekced)
        if (chekced) this.autoStart()
      })
    this.elements.$pbp.toggle(this.player.localConfig.showPbp || false)
    const $pbpPlayed = this.elements.$pbp.find('#k-player-pbp-played-path')
    this.player.on('timeupdate', () => {
      $pbpPlayed.attr(
        'width',
        (this.player.currentTime / this.player.plyr.duration || 0) * 100 + '%'
      )
    })

    this.elements.$danmakuMerge
      .prop('checked', this.player.localConfig.danmakuMerge)
      .on('change', (e) => {
        const chekced = e.target.checked
        this.player.configSaveToLocal('danmakuMerge', chekced)
        if (this.core) this.core.merge = chekced
      })

    this.elements.$danmakuOverlap
      .prop('checked', this.player.localConfig.danmakuOverlap)
      .on('change', (e) => {
        const chekced = e.target.checked
        this.player.configSaveToLocal('danmakuOverlap', chekced)
        if (this.core) this.core.overlap = chekced
      })

    addRangeListener({
      $dom: this.elements.$opacity,
      name: 'opacity',
      onInput: (v) => {
        this.elements.$danmakuContainer.css({ opacity: v })
      },
      player: this.player,
    })

    addRangeListener({
      $dom: this.elements.$danmakuFontSize,
      name: 'danmakuFontSize',
      onInput: (v) => {
        this.elements.$danmakuContainer.css('--danmaku-font-size-scale', v)
      },
      player: this.player,
    })

    addRangeListener({
      $dom: this.elements.$danmakuSpeed,
      name: 'danmakuSpeed',
      onChange: (v) => {
        if (this.core) this.core.speed = this.baseDanmkuSpeed * v
      },
      player: this.player,
    })

    addRangeListener({
      $dom: this.elements.$danmakuDensity,
      name: 'danmakuDensity',
      onChange: this.refreshDanmaku,
      player: this.player,
    })
    addRangeListener({
      $dom: this.elements.$danmakuScrollAreaPercent,
      name: 'danmakuScrollAreaPercent',
      onChange: (val) => {
        if (this.core) this.core.scrollAreaPercent = val
      },
      player: this.player,
    })

    setCheckboxGroupValue(
      this.elements.$danmakuMode,
      this.player.localConfig.danmakuMode
    )
    this.elements.$danmakuMode.on('change', () => {
      const modes = getCheckboxGroupValue(this.elements.$danmakuMode)
      this.player.configSaveToLocal('danmakuMode', modes as DanmakuMode)
      if (this.core) {
        this.refreshDanmaku()
      }
    })

    createFilter(this.player, this.refreshDanmaku)

    createDanmakuList(
      this.player,
      () => this.state.comments,
      this.refreshDanmaku
    )

    this.injectDanmakuDropEvent()
  }

  switchDanmaku = (bool?: boolean) => {
    bool ??= !this.player.localConfig.showDanmaku

    this.player.configSaveToLocal('showDanmaku', bool)
    this.elements.$danmakuSwitch.toggleClass('plyr__control--pressed', bool)
    this.elements.$showDanmaku.prop('checked', bool)
    this.player.message.info(`弹幕${bool ? '开启' : '关闭'}`)
    if (bool) {
      this.autoStart()
    } else {
      this.stop()
    }
  }

  autoStart = () => {
    if (
      !(this.player.localConfig.showDanmaku || this.player.localConfig.showPbp)
    )
      return

    switch (this.state.state) {
      case RunState.unSearched:
        this.searchAnime(this.elements.$animeName.val() as string)
        break

      case RunState.searchedAnimes:
        this.searchEpisodes(this.elements.$animes.val() as string)
        break

      case RunState.findEpisodes:
        this.autoMatchEpisode()
        break

      case RunState.getComments:
        this.start()
        break
    }
  }
}

Shortcuts.keyBindings.registerKeyBinding({
  command: Commands.danmakuSwitch,
  description: '显示/隐藏弹幕',
  key: 'D',
})
Shortcuts.registerCommand(Commands.danmakuSwitch, function () {
  this.danmaku?.switchDanmaku()
})
Shortcuts.keyBindings.registerKeyBinding({
  command: Commands.danmakuSyncBack,
  description: '弹幕滞后0.5s',
  key: ',',
})
Shortcuts.registerCommand(Commands.danmakuSyncBack, function () {
  if (!this.danmaku?.state.comments) return
  this.danmaku.state.comments.forEach((comment) => {
    comment.time += 0.5
  })
  this.danmaku.state.syncDiff += 0.5
  this.message.destroy()
  this.message.info(`弹幕同步：滞后了0.5s（${this.danmaku.state.syncDiff}s）`)
  this.danmaku.refreshDanmaku()
})
Shortcuts.keyBindings.registerKeyBinding({
  command: Commands.danmakuSyncForward,
  description: '弹幕超前0.5s',
  key: '.',
})
Shortcuts.registerCommand(Commands.danmakuSyncForward, function () {
  if (!this.danmaku?.state.comments) return
  this.danmaku.state.comments.forEach((comment) => {
    comment.time += -0.5
  })
  this.danmaku.state.syncDiff += -0.5
  this.message.destroy()
  this.message.info(`弹幕同步：超前了0.5s（${this.danmaku.state.syncDiff}s）`)
  this.danmaku.refreshDanmaku()
})
Shortcuts.keyBindings.registerKeyBinding({
  command: Commands.danmakuSyncRestore,
  description: '弹幕同步复位',
  key: '/',
})
Shortcuts.registerCommand(Commands.danmakuSyncRestore, function () {
  if (!this.danmaku?.state.comments) return
  this.danmaku.state.comments.forEach((comment) => {
    comment.time += -this.danmaku!.state.syncDiff
  })
  this.danmaku.state.syncDiff = 0
  this.message.destroy()
  this.message.info('弹幕同步：已复位')
  this.danmaku.refreshDanmaku()
})

// 更新 anime select
const renderSelectOptions = (target: JQuery, options: (Anime | Episode)[]) => {
  const html = options.reduce(
    (html, option) =>
      html + `<option value="${option.id}">${option.name}</option>`,
    ''
  )
  target.html(html)
}

export async function setup(player: KPlayer) {
  const info = await runtime.getCurrentVideoNameAndEpisode()
  if (!info) return

  new DanmakuPlugin(player, info)
}
