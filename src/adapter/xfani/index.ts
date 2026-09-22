import { runtime } from '../../runtime'
import { getAnimeName, getEpisodeName, runInNextTop } from './play'
import './index.scss'

/**
 * 稀饭动漫 Next 是 Next.js App Router 站点：整站 SPA + media-chrome 播放器，
 * 切集走 history.pushState，所以用 runtime 的 spa 模式按路由驱动，
 * 不再自己轮询。
 */
runtime.register({
  domains: ['next.xifanacg.com'],
  opts: [
    // spa 模式下 setup 只执行一次，run 每次路由变化重新执行，
    // 所以 body class 与监听器在 setup 里注册，挂载进 run 里。
    { test: '*', setup: () => $('body').addClass('xfani-next') },
    { test: /^\/anime\/\d+\/play\/\d+/, run: runInNextTop },
  ],
  spa: true,
  search: {
    name: '稀饭动漫',
    search: (cn) => `https://next.xifanacg.com/search?q=${cn}`,
    getSearchName: () => getAnimeName(),
    getEpisode: () => getEpisodeName(),
    getAnimeScope: () =>
      window.location.href.match(/\/anime\/(\d+)\//)?.[1] || '',
  },
})
