import { keybind } from '../../../../utils/keybind'
import { modal } from '../../../../utils/modal'
import { scriptInfo } from './showHelp'

export function help() {
  if ($('.script-info').length) return

  if (!document.fullscreenElement) {
    const video = $('#k-player')[0] as HTMLVideoElement

    modal({
      className: 'script-info',
      title: 'agefans Enhance',
      content: scriptInfo(video),
    })
  }
}

keybind(['?', '？'], help)
