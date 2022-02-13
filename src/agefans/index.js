import $ from 'jquery'
import './index.scss'
import { detailModule } from './pages/detail'
import { historyModule } from './pages/history'
import { homeModule } from './pages/home'
import { playModule } from './pages/play'
import { rankModule } from './pages/rank'
import { recommendModule } from './pages/recommend'
import { settingModule } from './pages/setting'
import { updateModule } from './pages/update'

export function agefans() {
  if (self !== parent) return

  $('body').addClass('agefans-wrapper')
  if (process.env.NODE_ENV === 'development') {
    document.cookie = 'username=admin; path=/; max-age=99999999;'
  }

  settingModule()

  historyModule()

  // log page to history
  if (location.pathname.startsWith('/play')) {
    playModule()
  }

  // in detail pages show view history
  if (location.pathname.startsWith('/detail')) {
    detailModule()
  }

  if (location.pathname.startsWith('/recommend')) {
    recommendModule()
  }
  if (location.pathname.startsWith('/update')) {
    updateModule()
  }
  if (location.pathname.startsWith('/rank')) {
    rankModule()
  }
  if (location.pathname === '/') {
    homeModule()
  }
}
