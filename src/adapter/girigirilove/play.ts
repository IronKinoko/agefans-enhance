import { KPlayer } from '../../player'
import { queryDom } from '../../utils/queryDom'
import { wait } from '../../utils/wait'
import { defineIframePlayer } from '../common/defineIframePlayer'
import T from './subscribe.template.html'
import mustache from 'mustache'

function getActive() {
  return $<HTMLAnchorElement>('.anthology-list-play li.on > a')
}
function switchPart(next: boolean) {
  return getActive().parent()[next ? 'next' : 'prev']().find('a')[0]?.href
}

function getEpisodeId() {
  return window.location.pathname.match(/\/playGV(\d+)-/)?.[1] || ''
}

async function getAnimeUpdateInfo(id: string) {
  const html = await fetch(`/GV${id}/`).then((res) => res.text())
  const $doc = $(html)

  const buildLabelSelector = (labels: string[]) =>
    labels.map((label) => `em.cor4:contains('${label}')`).join(',')

  const getLabelValue = ($context: JQuery, keywords: string[]) =>
    $context
      .find(buildLabelSelector(keywords))[0]
      ?.nextSibling?.textContent?.trim() ?? ''

  const updatedAtText = getLabelValue($doc, ['更新'])
  const statusText = getLabelValue($doc, ['状态', '狀态', '狀態'])

  const $last = $doc.find('.anthology-list-play li a').last()

  return {
    updatedAt: new Date(updatedAtText).getTime(),
    status: statusText,
    last: { title: $last.text(), url: $last.attr('href')! },
  }
}

export function runInTop() {
  $('.player-news,#buffer,#install').remove()
  iframePlayer.runInTop()
}

export const iframePlayer = defineIframePlayer({
  iframeSelector: '#playleft iframe',
  getActive,
  setActive: (href) => {
    $<HTMLAnchorElement>('.anthology-list-play li a').each((_, el) => {
      if (el.href === href) {
        el.parentElement!.classList.add('ecnav-dt', 'on')
        $('.play-on').insertAfter($(el).find('span'))
      } else {
        el.parentElement!.classList.remove('ecnav-dt', 'on')
      }
    })
  },
  search: {
    getSearchName: () => $('.player-title-link').text(),
    getEpisode: () => getActive().text(),
  },
  getEpisodeList: () => $('.anthology-list-play li a'),
  getSwitchEpisodeURL: (next) => switchPart(next),
  subscribe: {
    storageKey: 'girigirilove_subscriptions',
    getId: getEpisodeId,
    getAnimeUpdateInfo,
    renderSubscribedAnimes: ($root, sm) => {
      const grouped = sm.getSubscriptionsSortedByDay()

      $root.html(T.subList)
      $root.insertBefore('#week-module-box')

      grouped.forEach(({ list }, idx) => {
        const $list = $(T.subListContent)
        $list.removeAttr('id')
        $list.hide()
        if (list.length) {
          $list.empty()
          list.forEach((sub) => {
            const $item = $(mustache.render(T.subItem, sub))
            $item.removeAttr('id')
            $list.append($item)
          })
        }

        $list.addClass(`sub-list`)
        $root.find('#subList > .overflow').append($list)
      })

      const setActive = (idx: number) => {
        $root.attr('data-active-day', idx)
        $('.week-bj').attr('class', 'week-bj b-c')
        $('.week-bj').addClass(`week-${idx + 1}`)
        $('.week-select a').removeClass(`tim`)
        $(`.week-select [class^="week-key${idx + 1}"]`).addClass(`tim`)
        $('.sub-list').hide()
        $('.sub-list').eq(idx).show()
        $('#week-module-box [id^="week-module-"]').hide()
        $(`#week-module-box [id="week-module-${idx + 1}"]`).show()
      }

      if ($root.attr('data-active-day')) {
        setActive(Number($root.attr('data-active-day')))
      } else {
        const day = new Date().getDay()
        setActive(day === 0 ? 6 : day - 1)
      }

      $('.week-select a').on('click', (e) => {
        const idx = Number($(e.currentTarget).attr('data-index'))
        setActive(idx - 1)
      })
    },
    renderSubscribeBtn: ($btn, sm) => {
      const id = getEpisodeId()
      const sub = sm.getSubscription(id)
      $btn.on('click', async () => {
        $btn.text('处理中...')
        if (sub) {
          sm.deleteSubscription(id)
        } else {
          const updateInfo = await getAnimeUpdateInfo(id)
          const $current = getActive()
          sm.createSubscription({
            id,
            title: $('.player-title-link').text(),
            url: $('.player-title-link').attr('href')!,
            thumbnail: $('.play-details-top .this-pic img').attr('data-src')!,
            createdAt: Date.now(),
            checkedAt: Date.now(),
            current: { title: $current.text(), url: $current.attr('href')! },
            ...updateInfo,
          })
        }
      })

      $btn.addClass('cor5 r6')
      $btn.prependTo($('.anthology-header .function'))
    },
  },
})

export async function parser() {
  const video = await queryDom<HTMLVideoElement>('video')

  await wait(() => !!video.currentSrc)
  video.src = ''

  const player = new KPlayer('#APlayer', {
    eventToParentWindow: true,
  })
  player.src = new URLSearchParams(location.search).get('url')!
}
