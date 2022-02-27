import { popover } from '../../../utils/popover'
import { tabs } from '../../../utils/tabs'

const $danmakuOverlay = tabs([
  {
    name: '搜索',
    content: `<div id="k-player-danmaku-search-form">
      <label>
        <span>搜索番剧名称</span>
        <input type="text" id="animeName" />
      </label>
      <div style="min-height:24px; padding-top:4px">
        <span id="tips"></span>
      </div>
      <label>
        <span>番剧名称</span>
        <select id="animes"></select>
      </label>
      <label>
        <span>章节</span>
        <select id="episodes"></select>
      </label>
    </div>`,
  },
  {
    name: '设置',
    content: `
    <div id="k-player-danmaku-setting-form" class="k-settings-list">
      <label class="k-settings-item">
        <input type="checkbox" name="showDanmaku" />
        显示弹幕
      </label>
      <label class="k-settings-item">
        <input type="checkbox" name="showPbp" />
        显示高能进度条
      </label>
      <label class="k-settings-item">
        <span>透明度&#12288;</span>
        <input type="range" name="opacity" step="0.01" min="0" max="1" />
      </label>
      <label class="k-settings-item">
        <span>弹幕速度</span>
        <input type="range" name="danmakuSpeed" step="0.01" min="0.5" max="1.5" />
      </label>
      <label class="k-settings-item">
        <span>弹幕密度</span>
        <input type="range" name="danmakuDensity" step="0.01" min="0.5" max="2" />
      </label>
      <div class="k-settings-item">
        <div>弹幕类型</div>
        <label class="k-settings-item" title="顶部弹幕">
          <input type="checkbox" name="danmakuMode" value="top"/>
          <span>顶</span>
        </label>
        <label class="k-settings-item" title="底部弹幕">
          <input type="checkbox" name="danmakuMode" value="bottom"/>
          <span>底</span>
        </label>
        <label class="k-settings-item" title="滚动弹幕">
          <input type="checkbox" name="danmakuMode" value="rtl" />
          <span>滚</span>
        </label>
      </div>
    </div>
    `,
  },
  {
    name: '过滤',
    content: `
    <div id="k-player-danmaku-filter-form" class="k-settings-list">
     
    </div>
    `,
  },
])
$danmakuOverlay.attr('id', 'k-player-danmaku-overlay')
export const $danmakuBtn =
  $(`<div class="plyr__controls__item k-popover k-text-btn">
<span class="k-text-btn-text">弹幕</span>
</div>`)
export const $danmaku = popover($danmakuBtn, $danmakuOverlay)

export const $danmakuContainer = $('<div id="k-player-danmaku"></div>')

export const $pbp = $(`
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
