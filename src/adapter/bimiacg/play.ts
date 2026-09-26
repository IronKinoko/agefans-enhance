import { createKPlayer } from '../common/createKPlayer'
import { execInUnsafeWindow } from '../../utils/execInUnsafeWindow'
import { local } from '../../utils/storage'
import { sleep } from '../../utils/sleep'
import { defineIframePlayer } from '../common/defineIframePlayer'

function getActive() {
  const $newActive = $<HTMLAnchorElement>(
    '.watch-episode-grid a.is-current, .watch-episode-grid a.episode-active, .watch-episode-grid a[aria-current="page"]'
  )
  if ($newActive.length) return $newActive
  return $<HTMLAnchorElement>('.episode-active')
}

function switchPart(next: boolean) {
  const directLink = $<HTMLAnchorElement>(
    next
      ? '.watch-episode-nav a.watch-next, .watch-episode-nav a[rel="next"]'
      : '.watch-episode-nav a[rel="prev"]'
  )[0]?.href
  if (directLink) return directLink

  const $active = getActive()
  const sibling = $active[next ? 'next' : 'prev']('a')[0]?.href
  if (sibling) return sibling

  return $active.parent()[next ? 'next' : 'prev']().find('a')[0]?.href
}

export function runInTop() {
  $('#bkcl').remove()

  if (local.getItem('bangumi-history')) {
    local.setItem('k-history', local.getItem('bangumi-history'))
    local.removeItem('bangumi-history')
  }

  $<HTMLAnchorElement>('.player_list a, .watch-episode-grid a').each(
    (_, el) => {
      if (el.href === location.href) {
        el.classList.add('episode-active')
        el.classList.add('is-current')

        // 滚动到最高处
        const parent = el.offsetParent as HTMLElement | null
        if (parent) parent.scrollTop = el.offsetTop
      }
    }
  )

  $('.watch-screen, .tb.player')
    .get(0)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  iframePlayer.runInTop()
}

export const iframePlayer = defineIframePlayer({
  iframeSelector:
    '.watch-player-mount iframe, [data-watch-mount] iframe, iframe[data-artplayer], #playleft iframe',
  getActive,
  setActive: (href) => {
    $<HTMLAnchorElement>('.player_list a, .watch-episode-grid a').each(
      (_, el) => {
        if (el.href === href) {
          el.classList.add('episode-active')
          el.classList.add('is-current')
        } else {
          el.classList.remove('episode-active')
          el.classList.remove('is-current')
        }
      }
    )
  },
  search: {
    getSearchName: () =>
      $('.watch-crumb-name, #watch-title a, .v_path a.current')
        .first()
        .text()
        .trim(),
    getEpisode: () =>
      getActive().text().trim() || $('.watch-now span').first().text().trim(),
  },
  getEpisodeList: () => $('.player_list a, .watch-episode-grid a'),
  getSwitchEpisodeURL: (next) => switchPart(next),
  history: {
    creator: (renderHistory) => {
      const $btn = $('<li class="item"><a>历史</a></li>')
      $btn.on('click', renderHistory)

      $('.header-top__nav ul, .site-nav__list, nav.site-nav').append($btn)
    },
    getId: () => location.pathname.match(/\/(?<id>\d+)\/play/)!.groups!.id,
  },
  onPlayerMessage: (key, data) => {
    if (key === 'canplay') {
      const video = data.video
      const width = $('#video, .watch-screen').width()
      if (width && video?.width && video?.height) {
        $('#video').height((video.height / video.width) * width)
      }
    }
  },
})

export async function parser() {
  let url = ''
  let retryCount = 0

  while (!url && retryCount < 300) {
    url = await execInUnsafeWindow(() => {
      const win = window as any
      if (win.url) return win.url
      if (win.xingchaoArt?.option?.url) return win.xingchaoArt.option.url
      if (win.art?.option?.url) return win.art.option.url
      if (win.Artplayer?.instances?.[0]?.option?.url) {
        return win.Artplayer.instances[0].option.url
      }
      return ''
    })

    if (!url) {
      const video = document.querySelector<HTMLVideoElement>('video')
      if (video && video.currentSrc && !video.currentSrc.startsWith('blob:')) {
        url = video.currentSrc
      }
    }

    if (!url) {
      await sleep(100)
      retryCount++
    }
  }

  if (!url) {
    return
  }

  await execInUnsafeWindow(() => {
    const win = window as any
    try {
      win.xingchaoArt?.destroy(false)
    } catch {}
    try {
      win.art?.destroy(false)
    } catch {}
    try {
      win.Artplayer?.instances?.forEach((inst: any) => inst.destroy(false))
    } catch {}
  })

  const video = document.querySelector<HTMLVideoElement>('video')
  if (video) {
    video.src = ''
    try {
      video.load()
    } catch {}
  }

  $('#player-loading, .player-loading').remove()
  $('#player').empty()

  const player = createKPlayer('#player', { eventToParentWindow: true })
  player.src = url
}
