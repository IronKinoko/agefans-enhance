import { agefans } from './agefans'
import { yhdm } from './yhdm'

if (self === parent) {
  const origin = window.location.origin
  if (origin.includes('agefans') || origin.includes('agemys')) {
    agefans()
  }

  yhdm()
}
