import { keybind } from '../../../../utils/keybind'
import { modal } from '../../../../utils/modal'
import { scriptInfo } from './showHelp'

const GlobalKey = 'show-help-info'

export function help() {
  if (!document.fullscreenElement) {
    const video = $('#k-player')[0] as HTMLVideoElement

    if (parent !== self) {
      parent.postMessage(
        {
          key: GlobalKey,
          video: video
            ? {
                src: video.currentSrc,
                videoWidth: video.videoWidth,
                videoHeight: video.videoHeight,
              }
            : null,
        },
        '*'
      )
      return
    }

    showHelp(video)
  }
}

function showHelp(video: any) {
  if ($('.script-info').length) return

  modal({
    className: 'script-info',
    title: 'agefans Enhance',
    content: scriptInfo(video),
  })
}

keybind(['?', '？'], help)
window.addEventListener('message', (e) => {
  if (e.data?.key !== GlobalKey) return
  showHelp(e.data.video)
})
