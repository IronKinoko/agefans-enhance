import { playModule } from './play'
import './index.scss'
import $ from 'jquery'
export function yhdm() {
  $('body').addClass('yhdm-wrapper')
  if (window.location.pathname.includes('/v/')) {
    playModule()
  }
}
