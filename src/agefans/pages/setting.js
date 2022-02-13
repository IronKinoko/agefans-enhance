import $ from 'jquery'
import { local } from '../../utils/local'
import { modal } from '../../utils/modal'
import { session } from '../../utils/session'
import { alert } from '../utils/alert'
import './setting.scss'

const LOCAL_SETTING_KEY = 'agefans-setting'

const defaultSetting = {
  usePreview: true,
}
function ensureDefaultSetting() {
  let setting = local.getItem(LOCAL_SETTING_KEY, defaultSetting)

  setting = Object.assign({}, defaultSetting, setting)

  local.setItem(LOCAL_SETTING_KEY, setting)
}

/**
 * @param {keyof defaultSetting} key
 * @param {*} value
 */
function setSetting(key, value) {
  const setting = local.getItem(LOCAL_SETTING_KEY)
  setting[key] = value
  local.setItem(LOCAL_SETTING_KEY, setting)
}

/**
 * @param {keyof defaultSetting} [key]
 */
export function getSetting(key) {
  const setting = local.getItem(LOCAL_SETTING_KEY)
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
