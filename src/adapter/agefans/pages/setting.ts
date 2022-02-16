import $ from 'jquery'
import { gm } from '../../../utils/storage'
import { modal } from '../../../utils/modal'
import { session } from '../../../utils/storage'
import { alert } from '../utils/alert'
import './setting.scss'

const LOCAL_SETTING_KEY = 'agefans-setting'

const defaultSetting = {
  usePreview: true,
}
type Setting = typeof defaultSetting
function ensureDefaultSetting() {
  let setting = gm.getItem(LOCAL_SETTING_KEY, defaultSetting)

  setting = Object.assign({}, defaultSetting, setting)

  gm.setItem(LOCAL_SETTING_KEY, setting)
}

function setSetting<T extends keyof Setting>(key: T, value: Setting[T]) {
  const setting = gm.getItem<Setting>(LOCAL_SETTING_KEY)!
  setting[key] = value
  gm.setItem(LOCAL_SETTING_KEY, setting)
}

export function getSetting(): Setting
export function getSetting<T extends keyof Setting>(key: T): Setting[T]
export function getSetting(key?: keyof Setting) {
  const setting = gm.getItem<Setting>(LOCAL_SETTING_KEY)!
  if (key) return setting[key]
  return setting
}
function showSetting() {
  const setting = getSetting()

  const $usePreview = $(
    `<label class="agefans-setting-item"><input type="checkbox" />启用番剧信息预览（鼠标悬浮时预览番剧基础信息）</label>`
  )
  $usePreview
    .find('input')
    .prop('checked', setting.usePreview)
    .on('change', (e) => {
      setSetting('usePreview', e.target.checked)
    })

  const $stopUseKPlayer = $(
    `<label class="agefans-setting-item"><input type="checkbox" /><b>暂时</b>使用原生播放器</label>`
  )
  $stopUseKPlayer
    .find('input')
    .prop('checked', session.getItem('stop-use'))
    .on('change', (e) => {
      session.setItem('stop-use', e.target.checked)
    })

  modal({
    title: '脚本设置',
    okText: '刷新页面',
    onOk: () => location.reload(),
    content: $('<div></div>').append(
      alert('这些配置需要刷新页面才能生效'),
      $usePreview,
      $stopUseKPlayer
    ),
  })
}

export function settingModule() {
  ensureDefaultSetting()

  $('<a>设置</a>').on('click', showSetting).insertBefore('.loginout a')
}
