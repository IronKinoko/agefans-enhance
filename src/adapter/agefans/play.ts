import { local } from '../../utils/storage'

function calcSortDirection() {
  const $active = getActive()
  const $prev = $active.prev()
  const $next = $active.next()

  const prevText = $prev.text().match(/\d+/)?.[0]
  const nextText = $next.text().match(/\d+/)?.[0]
  const activeText = $active.text().match(/\d+/)?.[0]

  const prev = Number(prevText)
  const current = Number(activeText)
  const next = Number(nextText)

  if (prevText) {
    if (prev < current) {
      local.setItem('sortDirection', 'asc')
    } else {
      local.setItem('sortDirection', 'desc')
    }
  } else if (nextText) {
    if (next > current) {
      local.setItem('sortDirection', 'asc')
    } else {
      local.setItem('sortDirection', 'desc')
    }
  } else {
    local.setItem('sortDirection', 'asc')
  }
  return local.getItem('sortDirection') as 'asc' | 'desc'
}

function getSortButon() {
  return $('button:contains("更改排序")')
}

function rememberSortDirection() {
  const $btn = getSortButon()
  $btn.on('click', () => {
    setTimeout(() => {
      calcSortDirection()
      activeScrollIntoView()
    }, 100)
  })
}

function getSortDirection() {
  return local.getItem('sortDirection', 'asc') as 'asc' | 'desc'
}

function restoreSortDirection() {
  const sortDirection = getSortDirection()

  if (sortDirection === 'desc') {
    getSortButon().trigger('click')
  }
}

function activeScrollIntoView() {
  const $active = getActive()

  function getScrollParent() {
    let parent: HTMLElement | null = $active.parent()[0]
    while (parent && parent.tagName !== 'BODY') {
      const overflowY = getComputedStyle(parent).overflowY
      if (overflowY === 'auto' || overflowY === 'scroll') {
        return parent
      }
      parent = parent.parentElement
    }
    return document.body
  }

  const scrollEl = getScrollParent()
  const scrollRect = scrollEl.getBoundingClientRect()
  const activeRect = $active[0].getBoundingClientRect()

  // scrollEl scroll to $active position
  scrollEl.scrollTop += activeRect.top - scrollRect.top - 100
}
function insertFocusBtn() {
  const html = `
  <button type="button" class="btn btn-sm btn-outline-light btn-playlist-order">聚焦</button>
  `

  $(html)
    .on('click', activeScrollIntoView)
    .prependTo('.playlist-source-tab .float-end')
}

function getActive() {
  return $('.video_detail_episode .video_detail_spisode_playing').parent()
}
function switchPart(next: boolean) {
  const $active = getActive()
  const sortDirection = getSortDirection()

  if (sortDirection === 'asc')
    $active[next ? 'next' : 'prev']().find('a')[0]?.click()
  else $active[next ? 'prev' : 'next']().find('a')[0]?.click()
}

const iframeSelector = '.video_play_wrapper iframe'

function initPlayer() {
  window.addEventListener('message', (e) => {
    if (!e.data?.key) return
    const { key, video } = e.data
    if (key === 'prev') switchPart(false)
    if (key === 'next') switchPart(true)
    if (key === 'enterwidescreen') {
      $('body').css('overflow', 'hidden')
      $(iframeSelector).css({
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
        zIndex: 9999,
      })
    }
    if (key === 'exitwidescreen') {
      $('body').css('overflow', '')
      $(iframeSelector).removeAttr('style')
    }

    // 这里的事件由 vip.sp-flv.com 触发
    if (key === 'getSearchName') {
      const iframe = $<HTMLIFrameElement>(iframeSelector)[0]

      iframe.contentWindow?.postMessage(
        {
          key: 'getSearchName',
          name: $('.video_detail_wrapper .cata_video_item .card-title').text(),
        },
        '*'
      )
    }
    if (key === 'getEpisode') {
      const iframe = $<HTMLIFrameElement>(iframeSelector)[0]

      iframe.contentWindow?.postMessage(
        { key: 'getEpisode', name: getActive().text() },
        '*'
      )
    }
    if (key === 'openLink') {
      window.open(e.data.url)
    }
  })

  window.addEventListener('keydown', (e) => {
    if (document.activeElement !== document.body) return
    $(iframeSelector)[0].focus()
    if (e.key === ' ') e.preventDefault()
  })

  $(iframeSelector).attr({ gesture: 'media', allow: 'autoplay; fullscreen' })
}

export function playModule() {
  initPlayer()

  rememberSortDirection()
  restoreSortDirection()
  insertFocusBtn()
  activeScrollIntoView()
}
