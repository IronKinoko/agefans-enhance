import { agefans } from './agefans'
import { yhdm } from './yhdm'

if (self === parent) {
  if (window.location.href.includes('agefans')) {
    agefans()
  }

  yhdm()
}
