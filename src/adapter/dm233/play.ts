import { KPlayer } from '../../player'
import { queryDom } from '../../utils/queryDom'
import $ from 'jquery'

function switchPart(next: boolean) {
  $('.eplist-eppic li[style]')[next ? 'next' : 'prev']().find('a')[0]?.click()
}

export async function playModule() {
  const iframe = await queryDom<HTMLIFrameElement>('#id_main_playiframe')

  const fn = () => {
    if (!iframe.src) return
    const url = new URL(iframe.src)
    const vurl = url.searchParams.get('url')
    if (!vurl) return
    const player = new KPlayer('#player_back')
    player.src = vurl

    player.on('prev', () => switchPart(false))
    player.on('next', () => switchPart(true))
  }
  const ob = new MutationObserver(fn)
  ob.observe(iframe, { attributes: true, attributeFilter: ['src'] })
  fn()
}
