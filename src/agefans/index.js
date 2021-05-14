import './index.scss'
import { detailModule } from './detail'
import { historyModule } from './history'
import { playModule } from './play'

export function agefans() {
  if (process.env.NODE_ENV === 'development') {
    document.cookie = 'username=admin; path=/; max-age=99999999;'
  }

  historyModule()

  // log page to history
  if (location.pathname.startsWith('/play')) {
    playModule()
  }

  // in detail pages show view history
  if (location.pathname.startsWith('/detail')) {
    detailModule()
  }
}
