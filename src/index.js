import 'plyr/dist/plyr.css'
import { www88dmw, www88dmwSetup } from './88dmw'
import { agefans } from './agefans'
import { yhdm } from './yhdm'

function setup() {
  if (origin.includes('88dmw')) {
    www88dmwSetup()
  }
}

function run() {
  const origin = window.location.origin
  if (origin.includes('agefans') || origin.includes('agemys')) {
    agefans()
  }

  yhdm()

  if (origin.includes('88dmw')) {
    www88dmw()
  }
}

if (self === parent) {
  setup()
  window.addEventListener('DOMContentLoaded', run)
}
