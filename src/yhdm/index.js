import { playModule } from './play'
import './index.scss'
export function yhdm() {
  $('body').addClass('yhdm-wrapper')
  if (window.location.pathname.includes('/v/')) {
    playModule()
  }
}
