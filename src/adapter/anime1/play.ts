import { KPlayer } from '../../player'
import { logHis } from '../common/history'

async function fetchVideoLinks(params: any) {
  const { apireq, tserver, vid } = params

  const res = await $.ajax({
    xhrFields: {
      withCredentials: true,
    },
    type: 'POST',
    url: '//v.anime1.me/api',
    contentType: 'application/x-www-form-urlencoded',
    data: 'd=' + apireq,
  })
  const src = res.s[0].src

  const thumbnails = `https://${tserver}.anime1.me/${vid}/thumbnails.vtt`
  return { src, thumbnails }
}

function enhanceSinglePage() {
  $('body').addClass('single-page')
}

export async function runInSingle() {
  enhanceSinglePage()

  const $root = $('.video-js')
  const vlinks = await fetchVideoLinks($root.data())

  const player = new KPlayer('.video-js', {
    previewThumbnails: { enabled: true, src: vlinks.thumbnails },
  })

  player.src = vlinks.src

  player.on('prev', () => {
    player.message.destroy()
    player.message.info('该网站不支持跳转上一集')
  })
  player.on('next', () => {
    player.message.destroy()
    const target = $<HTMLAnchorElement>('a:contains("下一集")')[0]
    if (
      target &&
      target.hasAttribute('href') &&
      !target.hasAttribute('disabled')
    )
      target.click()
    else player.message.info('没有下一集了')
  })

  player.on('timeupdate', () => {
    try {
      const animeName = $('.entry-title')
        .text()
        .replace(/\[\d+\]/, '')
        .trim()

      const episodeName = $('.entry-title')
        .text()
        .match(/\[(\d+)\]/)![1]
        .replace(/^0+/, '')

      const target = $<HTMLAnchorElement>('a:contains("全集連結")')[0]
      const url = new URL(target.href)

      const id = url.searchParams.get('cat')!
      logHis(
        {
          animeName,
          episodeName,
          url: window.location.href,
          id,
        },
        player.currentTime
      )
    } catch (error) {}
  })
}

export function runInCategory() {
  $('body').addClass('category')

  $('.vjscontainer').on('click', function () {
    $(this).parent().prev().find('a')[0].click()
  })
}
