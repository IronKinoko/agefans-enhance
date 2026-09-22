import { runtime } from '../../runtime/index'
import './index.scss'
import { playModule, playModuleInIframe, iframePlayer } from './play'

runtime.register({
  domains: ['age.tv', 'agefans', 'agedm'],
  opts: [
    {
      test: '*',
      run: () => {
        $('body').addClass('agefans-wrapper')
      },
    },
    // 字符串 test 是子串匹配，'/' 会命中所有路径，首页必须用锚定正则
    { test: /^\/$/, run: iframePlayer.subscribe.renderSubscribedAnimes },
    { test: '/play', run: playModule },
    { test: '/play', run: playModuleInIframe, runInIframe: true },
  ],
  search: {
    name: 'agefans',
    search: (cn) => `https://www.age.tv/search?query=${cn}`,
    getAnimeScope: () => window.location.href.match(/\/play\/(\d+)/)![1],
  },
})
