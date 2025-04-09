import { popover } from '../../../utils/popover'
import { tabs } from '../../../utils/tabs'
import { Commands } from './types'

export class DanmakuElements {
  constructor() {
    this.$danmakuOverlay.attr('id', 'k-player-danmaku-overlay')
  }

  $danmakuOverlay = tabs([
    {
      name: '搜索',
      content: `<div id="k-player-danmaku-search-form">
      <label>
        <span>搜索番剧名称</span>
        <input type="text" id="animeName" class="k-input" />
      </label>
      <div style="min-height:24px; padding-top:4px">
        <span id="tips"></span>
      </div>
      <label>
        <span>番剧名称</span>
        <select id="animes" class="k-select"></select>
      </label>
      <label>
        <span>章节</span>
        <select id="episodes" class="k-select"></select>
      </label>
      <label>
        <span class="open-danmaku-list">
          <span>弹幕列表</span><small data-id="count"></small>
        </span>
      </label>
      
      <span class="specific-thanks">弹幕服务由 弹弹play 提供</span>
    </div>`,
    },
    {
      name: '设置',
      content: `
    <div id="k-player-danmaku-setting-form" class="k-settings-list">
      <label class="k-settings-item">
        <input type="checkbox" name="showDanmaku" />
        <span>显示弹幕(<k-shortcuts-tip command="${Commands.danmakuSwitch}"></k-shortcuts-tip>)</span>
        </label>
      <label class="k-settings-item">
        <input type="checkbox" name="showPbp" />
        <span>显示高能进度条</span>
      </label>
      <div class="k-settings-item">
        <label class="k-settings-item" title="启用后合并显示重复的弹幕">
          <input type="checkbox" name="danmakuMerge" />
          <span>合并弹幕</span>
        </label>
        <label class="k-settings-item" title="启用后当弹幕过多的时候可以重叠显示">
          <input type="checkbox" name="danmakuOverlap" />
          <span>重叠弹幕</span>
        </label>
      </div>
      <label class="k-settings-item">
        <span>透明度&#12288;</span>
        <input type="range" name="opacity" step="0.01" min="0" max="1" />
      </label>
      <label class="k-settings-item">
        <span>弹幕大小</span>
        <input type="range" name="danmakuFontSize" step="0.01" min="0.5" max="2" />
      </label>
      <label class="k-settings-item">
        <span>弹幕速度</span>
        <input type="range" name="danmakuSpeed" step="0.01" min="0.5" max="1.5" />
      </label>
      <label class="k-settings-item" title="基准为 24 分钟 3000 条弹幕">
        <span>弹幕密度</span>
        <input type="range" name="danmakuDensity" step="0.01" min="0.5" max="2" />
      </label>
      <label class="k-settings-item">
        <span>弹幕区域</span>
        <input type="range" name="danmakuScrollAreaPercent" step="0.01" min="0.25" max="1" />
      </label>
      <div class="k-settings-item" style="height:24px">
        <div>弹幕类型</div>
        <label class="k-settings-item" title="顶部弹幕">
          <input type="checkbox" name="danmakuMode" value="top"/>
          <span>顶</span>
        </label>
        <label class="k-settings-item" title="底部弹幕">
          <input type="checkbox" name="danmakuMode" value="bottom"/>
          <span>底</span>
        </label>
        <label class="k-settings-item" title="彩色弹幕">
          <input type="checkbox" name="danmakuMode" value="color" />
          <span>彩</span>
        </label>
      </div>
    </div>
    `,
    },
    {
      name: '过滤',
      content: `
    <div id="k-player-danmaku-filter-form">
      <div class="ft-input-wrapper">
        <div>
          <input name="filter-input" placeholder="可正则“/”开头“/”结尾" class="k-select"/>
        </div>
        <label id="k-player-danmaku-filter-import" title="导入B站弹幕过滤设置">
          导入
        </label>
      </div>

      <div id="k-player-danmaku-filter-table">
        <div class="ft-row" style="pointer-events:none;">
          <div class="ft-content">内容(<span id="filter-count"></span>)</div>
          <div class="ft-op">操作</div>
        </div>
        <div class="ft-body"></div>
      </div>
    </div>
    `,
    },
    {
      name: '日志',
      content: `
    <div id="k-player-danmaku-log"></div>
    `,
    },
  ])

  $danmakuSwitch = $(`
<button
  class="plyr__controls__item plyr__control plyr__switch-danmaku plyr__custom"
  type="button"
  data-plyr="switch-danmaku"
  aria-label="switch-danmaku"
  >
  <svg class="icon--not-pressed" focusable="false" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="bpx-svg-sprite-danmu-off"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.085 4.891l-.999-1.499a1.008 1.008 0 011.679-1.118l1.709 2.566c.54-.008 1.045-.012 1.515-.012h.13c.345 0 .707.003 1.088.007l1.862-2.59a1.008 1.008 0 011.637 1.177l-1.049 1.46c.788.02 1.631.046 2.53.078 1.958.069 3.468 1.6 3.74 3.507.088.613.13 2.158.16 3.276l.001.027c.01.333.017.63.025.856a.987.987 0 01-1.974.069c-.008-.23-.016-.539-.025-.881v-.002c-.028-1.103-.066-2.541-.142-3.065-.143-1.004-.895-1.78-1.854-1.813-2.444-.087-4.466-.13-6.064-.131-1.598 0-3.619.044-6.063.13a2.037 2.037 0 00-1.945 1.748c-.15 1.04-.225 2.341-.225 3.904 0 1.874.11 3.474.325 4.798.154.949.95 1.66 1.91 1.708a97.58 97.58 0 005.416.139.988.988 0 010 1.975c-2.196 0-3.61-.047-5.513-.141A4.012 4.012 0 012.197 17.7c-.236-1.446-.351-3.151-.351-5.116 0-1.64.08-3.035.245-4.184A4.013 4.013 0 015.92 4.96c.761-.027 1.483-.05 2.164-.069zm4.436 4.707h-1.32v4.63h2.222v.848h-2.618v1.078h2.431a5.01 5.01 0 013.575-3.115V9.598h-1.276a8.59 8.59 0 00.748-1.42l-1.089-.384a14.232 14.232 0 01-.814 1.804h-1.518l.693-.308a8.862 8.862 0 00-.814-1.408l-1.045.352c.297.396.572.847.825 1.364zm-4.18 3.564l.154-1.485h1.98V8.289h-3.2v.979h2.067v1.43H7.483l-.308 3.454h2.277c0 1.166-.044 1.925-.12 2.277-.078.352-.386.528-.936.528-.308 0-.616-.022-.902-.055l.297 1.067.062.004c.285.02.551.04.818.04 1.001-.066 1.562-.418 1.694-1.056.11-.638.176-1.903.176-3.795h-2.2zm7.458.11v-.858h-1.254v.858H15.8zm-2.376-.858v.858h-1.199v-.858h1.2zm-1.199-.946h1.2v-.902h-1.2v.902zm2.321 0v-.902H15.8v.902h-1.254zm3.517 10.594a4 4 0 100-8 4 4 0 000 8zm-.002-1.502a2.5 2.5 0 01-2.217-3.657l3.326 3.398a2.49 2.49 0 01-1.109.259zm2.5-2.5c0 .42-.103.815-.286 1.162l-3.328-3.401a2.5 2.5 0 013.614 2.239z"></path></svg>
  <svg class="icon--pressed" focusable="false" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="bpx-svg-sprite-danmu-on"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.989 4.828c-.47 0-.975.004-1.515.012l-1.71-2.566a1.008 1.008 0 00-1.678 1.118l.999 1.5c-.681.018-1.403.04-2.164.068a4.013 4.013 0 00-3.83 3.44c-.165 1.15-.245 2.545-.245 4.185 0 1.965.115 3.67.35 5.116a4.012 4.012 0 003.763 3.363l.906.046c1.205.063 1.808.095 3.607.095a.988.988 0 000-1.975c-1.758 0-2.339-.03-3.501-.092l-.915-.047a2.037 2.037 0 01-1.91-1.708c-.216-1.324-.325-2.924-.325-4.798 0-1.563.076-2.864.225-3.904.14-.977.96-1.713 1.945-1.747 2.444-.087 4.465-.13 6.063-.131 1.598 0 3.62.044 6.064.13.96.034 1.71.81 1.855 1.814.075.524.113 1.962.141 3.065v.002c.01.342.017.65.025.88a.987.987 0 101.974-.068c-.008-.226-.016-.523-.025-.856v-.027c-.03-1.118-.073-2.663-.16-3.276-.273-1.906-1.783-3.438-3.74-3.507-.9-.032-1.743-.058-2.531-.078l1.05-1.46a1.008 1.008 0 00-1.638-1.177l-1.862 2.59c-.38-.004-.744-.007-1.088-.007h-.13zm.521 4.775h-1.32v4.631h2.222v.847h-2.618v1.078h2.618l.003.678c.36.026.714.163 1.01.407h.11v-1.085h2.694v-1.078h-2.695v-.847H16.8v-4.63h-1.276a8.59 8.59 0 00.748-1.42L15.183 7.8a14.232 14.232 0 01-.814 1.804h-1.518l.693-.308a8.862 8.862 0 00-.814-1.408l-1.045.352c.297.396.572.847.825 1.364zm-4.18 3.564l.154-1.485h1.98V8.294h-3.2v.98H9.33v1.43H7.472l-.308 3.453h2.277c0 1.166-.044 1.925-.12 2.277-.078.352-.386.528-.936.528-.308 0-.616-.022-.902-.055l.297 1.067.062.005c.285.02.551.04.818.04 1.001-.067 1.562-.419 1.694-1.057.11-.638.176-1.903.176-3.795h-2.2zm7.458.11v-.858h-1.254v.858h1.254zm-2.376-.858v.858h-1.199v-.858h1.2zm-1.199-.946h1.2v-.902h-1.2v.902zm2.321 0v-.902h1.254v.902h-1.254z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M22.846 14.627a1 1 0 00-1.412.075l-5.091 5.703-2.216-2.275-.097-.086-.008-.005a1 1 0 00-1.322 1.493l2.963 3.041.093.083.007.005c.407.315 1 .27 1.354-.124l5.81-6.505.08-.102.005-.008a1 1 0 00-.166-1.295z" fill="var(--color)"></path></svg>
  <span class="label--not-pressed plyr__tooltip">开启弹幕(<k-shortcuts-tip command="${Commands.danmakuSwitch}"></k-shortcuts-tip>)</span>
  <span class="label--pressed plyr__tooltip">关闭弹幕(<k-shortcuts-tip command="${Commands.danmakuSwitch}"></k-shortcuts-tip>)</span>
</button>`)
  $danmakuSettingButton =
    $(`<button class="plyr__controls__item plyr__control" type="button" data-plyr="danmaku-setting">
<svg class="icon--not-pressed" focusable="false" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" id="bpx-svg-sprite-new-danmu-setting"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.645 4.881l1.06-1.473a.998.998 0 10-1.622-1.166L13.22 4.835a110.67 110.67 0 00-1.1-.007h-.131c-.47 0-.975.004-1.515.012L8.783 2.3A.998.998 0 007.12 3.408l.988 1.484c-.688.019-1.418.042-2.188.069a4.013 4.013 0 00-3.83 3.44c-.165 1.15-.245 2.545-.245 4.185 0 1.965.115 3.67.35 5.116a4.012 4.012 0 003.763 3.363c1.903.094 3.317.141 5.513.141a.988.988 0 000-1.975 97.58 97.58 0 01-5.416-.139 2.037 2.037 0 01-1.91-1.708c-.216-1.324-.325-2.924-.325-4.798 0-1.563.076-2.864.225-3.904.14-.977.96-1.713 1.945-1.747 2.444-.087 4.465-.13 6.063-.131 1.598 0 3.62.044 6.064.13.96.034 1.71.81 1.855 1.814.075.524.113 1.962.141 3.065v.002c.005.183.01.07.014-.038.004-.096.008-.189.011-.081a.987.987 0 101.974-.069c-.004-.105-.007-.009-.011.09-.002.056-.004.112-.007.135l-.002.01a.574.574 0 01-.005-.091v-.027c-.03-1.118-.073-2.663-.16-3.276-.273-1.906-1.783-3.438-3.74-3.507-.905-.032-1.752-.058-2.543-.079zm-3.113 4.703h-1.307v4.643h2.2v.04l.651-1.234c.113-.215.281-.389.482-.509v-.11h.235c.137-.049.283-.074.433-.074h1.553V9.584h-1.264a8.5 8.5 0 00.741-1.405l-1.078-.381c-.24.631-.501 1.23-.806 1.786h-1.503l.686-.305c-.228-.501-.5-.959-.806-1.394l-1.034.348c.294.392.566.839.817 1.35zm-1.7 5.502h2.16l-.564 1.068h-1.595v-1.068zm-2.498-1.863l.152-1.561h1.96V8.289H7.277v.969h2.048v1.435h-1.84l-.306 3.51h2.254c0 1.155-.043 1.906-.12 2.255-.076.348-.38.523-.925.523-.305 0-.61-.022-.893-.055l.294 1.056.061.005c.282.02.546.039.81.039.991-.065 1.547-.414 1.677-1.046.11-.631.175-1.883.175-3.757H8.334zm5.09-.8v.85h-1.188v-.85h1.187zm-1.188-.955h1.187v-.893h-1.187v.893zm2.322.007v-.893h1.241v.893h-1.241zm.528 2.757a1.26 1.26 0 011.087-.627l4.003-.009a1.26 1.26 0 011.094.63l1.721 2.982c.226.39.225.872-.001 1.263l-1.743 3a1.26 1.26 0 01-1.086.628l-4.003.009a1.26 1.26 0 01-1.094-.63l-1.722-2.982a1.26 1.26 0 01.002-1.263l1.742-3zm1.967.858a1.26 1.26 0 00-1.08.614l-.903 1.513a1.26 1.26 0 00-.002 1.289l.885 1.492c.227.384.64.62 1.086.618l2.192-.005a1.26 1.26 0 001.08-.615l.904-1.518a1.26 1.26 0 00.001-1.288l-.884-1.489a1.26 1.26 0 00-1.086-.616l-2.193.005zm2.517 2.76a1.4 1.4 0 11-2.8 0 1.4 1.4 0 012.8 0z"></path></svg>
<span class="label--not-pressed plyr__tooltip">弹幕设置</span>
</button>`)
  $danmaku = popover(this.$danmakuSettingButton, this.$danmakuOverlay, 'click')

  $danmakuContainer = $('<div id="k-player-danmaku"></div>')

  $pbp = $(`
<svg
  viewBox="0 0 1000 100"
  preserveAspectRatio="none"
  id="k-player-pbp"
>
  <defs>
    <clipPath id="k-player-pbp-curve-path" clipPathUnits="userSpaceOnUse">
      <path d=""></path>
    </clipPath>
  </defs>

  <g
    fill-opacity="0.2"
    clip-path="url(#k-player-pbp-curve-path)"
    hover-bind="1"
  >
    <rect x="0" y="0" width="100%" height="100%" fill="rgb(255,255,255)"></rect>
    <rect id="k-player-pbp-played-path" x="0" y="0" width="0" height="100%" fill="currentColor"></rect>
  </g>
</svg>
`)

  $animeName = this.$danmaku.find('#animeName')
  $animes = this.$danmaku.find('#animes')
  $episodes = this.$danmaku.find('#episodes')
  $openDanmakuList = this.$danmaku.find('.open-danmaku-list')
  $tips = this.$danmaku.find('#tips')
  $showDanmaku = this.$danmaku.find<HTMLInputElement>("[name='showDanmaku']")
  $showPbp = this.$danmaku.find<HTMLInputElement>("[name='showPbp']")
  $danmakuMerge = this.$danmaku.find<HTMLInputElement>("[name='danmakuMerge']")
  $danmakuOverlap = this.$danmaku.find<HTMLInputElement>(
    "[name='danmakuOverlap']"
  )
  $opacity = this.$danmaku.find<HTMLInputElement>("[name='opacity']")
  $danmakuSpeed = this.$danmaku.find<HTMLInputElement>("[name='danmakuSpeed']")
  $danmakuFontSize = this.$danmaku.find<HTMLInputElement>(
    "[name='danmakuFontSize']"
  )
  $danmakuDensity = this.$danmaku.find<HTMLInputElement>(
    "[name='danmakuDensity']"
  )
  $danmakuScrollAreaPercent = this.$danmaku.find<HTMLInputElement>(
    "[name='danmakuScrollAreaPercent']"
  )
  $danmakuMode = this.$danmaku.find<HTMLInputElement>("[name='danmakuMode']")
  $log = this.$danmakuOverlay.find('#k-player-danmaku-log')
}
