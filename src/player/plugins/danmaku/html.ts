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
        <span>显示弹幕(D)</span>
        </label>
      <label class="k-settings-item">
        <input type="checkbox" name="showPbp" />
        <span>显示高能进度条</span>
      </label>
      <label class="k-settings-item">
        <span>透明度&#12288;</span>
        <input type="range" name="opacity" step="0.01" min="0" max="1" />
      </label>
      <label class="k-settings-item">
        <span>弹幕速度</span>
        <input type="range" name="danmakuSpeed" step="0.01" min="0.5" max="1.5" />
      </label>
      <label class="k-settings-item" title="基准为 24 分钟 3000 条弹幕">
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
    <div id="k-player-danmaku-filter-form" class="k-settings-list">
      <input name="filter-input" placeholder="回车添加屏蔽词"/>

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
])
$danmakuOverlay.attr('id', 'k-player-danmaku-overlay')
export const $danmakuSwitch = $(`<div class="k-switch k-danmaku-switch">
<input class="k-switch-input" type="checkbox" />
<div class="k-switch-label">
  <div class="k-switch-dot">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" width="1em" height="1em"><path fill="currentColor" d="M1.311 3.759l-.153 1.438h2.186c0 1.832-.066 3.056-.175 3.674-.131.618-.688.959-1.683 1.023-.284 0-.568-.021-.874-.043L.317 8.818c.284.032.59.053.896.053.546 0 .852-.17.929-.511.077-.341.12-1.076.12-2.204H0l.306-3.344h1.847V1.427H.098V.479h3.18v3.28H1.311zM4 1.747h1.311A8.095 8.095 0 004.492.426L5.53.085c.306.426.579.873.809 1.363l-.689.299h1.508c.306-.544.569-1.129.809-1.747l1.082.373c-.219.511-.47.969-.743 1.374h1.268V6.23H7.322v.82H10v1.044H7.322V10H6.208V8.094H3.607V7.05h2.601v-.82H4V1.747zm4.568 3.557v-.831H7.322v.831h1.246zm-2.36 0v-.831H5.016v.831h1.192zM5.016 3.557h1.191v-.873H5.016v.873zm2.306-.873v.873h1.246v-.873H7.322z"></path></svg>
  </div>
</div>
</div>`)
export const $danmaku = popover($danmakuSwitch, $danmakuOverlay)

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
