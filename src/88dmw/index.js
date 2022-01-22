import { playModule } from './play'
import './index.scss'
export function www88dmwSetup() {
  try {
    Object.defineProperty(window, 'devtoolsDetector', {
      writable: false,
      value: null,
    })
    document.oncontextmenu = undefined
    // eslint-disable-next-line no-empty
  } catch (error) {}
}
export function www88dmw() {
  playModule()
}
