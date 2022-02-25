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
      <label class="k-settings-item" style="flex-direction:column;align-items:flex-start;">
        <div>透明度</div>
        <input type="range" name="opacity" step="0.01" min="0" max="1" />
      </label>
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