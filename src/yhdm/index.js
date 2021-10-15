import './index.scss'
import { playModule as yhdmSo } from './yhdm.so'
import { playModule as yhdmpCc } from './yhdmp.cc'
import { playModule as imomoeLive } from './imomoe.live'

export function yhdm() {
  const href = window.location.href
  if (href.includes('yhdm.so') || href.includes('yinghuacd.com')) {
    yhdmSo()
  }
  if (href.includes('yhdmp.cc')) {
    yhdmpCc()
  }
  if (href.includes('imomoe.live')) {
    imomoeLive()
  }
}
