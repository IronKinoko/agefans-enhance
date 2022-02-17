import $ from 'jquery'
import { runtime } from '../../runtime/index'
import './index.scss'
import { detailModule } from './pages/detail'
import { historyModule } from './pages/history'
import { homeModule } from './pages/home'
import { playModule } from './pages/play'
import { rankModule } from './pages/rank'
import { recommendModule } from './pages/recommend'
import { settingModule } from './pages/setting'
import { updateModule } from './pages/update'

runtime.register({
  domains: ['age.tv', 'agemys', 'agefans'],
  opts: [
    {
      test: '*',
      run: () => {
        $('body').addClass('agefans-wrapper')
        if (process.env.NODE_ENV === 'development') {
          document.cookie = 'username=admin; path=/; max-age=99999999;'
        }

        settingModule()
        historyModule()
      },
    },
    { test: '/play', run: playModule },
    { test: '/detail', run: detailModule },
    { test: '/recommend', run: recommendModule },
    { test: '/update', run: updateModule },
    { test: '/rank', run: rankModule },
    { test: /^\/$/, run: homeModule },
  ],
})
