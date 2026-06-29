import { runtime } from '../../runtime'
import { main as play } from './play'
import './index.scss'

runtime.register({
  domains: ['tucao.my'],
  opts: [
    { test: '*', run: () => $('body').addClass('tucao') },
    { test: '/play', run: play },
  ],
  search: {
    name: '吐槽弹幕网',
    search: (cn) =>
      `https://www.tucao.my/index.php?m=content&c=search&a=init&catid=24&dosubmit=1&orderby=a.id+DESC&info%5Btitle%5D=${cn}`,
    getSearchName: () => {
      return $('.show_title')
        .contents()
        .filter((_, node) => node.nodeType === Node.TEXT_NODE)
        .first()
        .text()
        .trim()
        .replace(/【.*?】/g, '')
    },
    getEpisode: () => $('#part_lists .now em').text(),
    getAnimeScope: () =>
      window.location.href.match(/\/play\/(.*?)\//)?.[1] || '',
  },
})
