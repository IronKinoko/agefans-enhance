import { template } from 'lodash-es'
import { createKPlayer } from '../common/createKPlayer'
import { queryDom } from '../../utils/queryDom'
import { wait } from '../../utils/wait'
import { defineIframePlayer } from '../common/defineIframePlayer'
import T from './subscribe.template.html'
import { execInUnsafeWindow } from '../../utils/execInUnsafeWindow'

function getActive() {
  return $<HTMLAnchorElement>('.anthology-list-play li.on > a')
}
function switchPart(next: boolean) {
  return getActive().parent()[next ? 'next' : 'prev']().find('a')[0]?.href
}

function getEpisodeId() {
  return window.location.pathname.match(/\/playGV(\d+)-/)?.[1] || ''
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
    async getAnimeInfo(id, sm) {
      const res = await fetch(`/GV${id}/`)
      if (res.status < 200 || res.status >= 300)
        throw new Error('Failed to fetch anime info')
      const html = await res.text()
      const $doc = $(html)

      const buildLabelSelector = (labels: string[]) =>
        labels.map((label) => `em.cor4:contains('${label}')`).join(',')

      const getLabelValue = ($context: JQuery, keywords: string[]) =>
        $context
          .find(buildLabelSelector(keywords))[0]
          ?.nextSibling?.textContent?.trim() ?? ''

      const updatedAtText = getLabelValue($doc, ['更新'])
      const statusText = getLabelValue($doc, ['状态', '狀态', '狀態'])

      const $lists = $doc.find('.anthology-list-play')
      const longest = $lists.get().reduce((max, el) => {
        return max.children.length >= el.children.length ? max : el
      }, $lists[0])
      const $last = $(longest).find('li a').last()

      const updateInfo = {
        updatedAt: new Date(updatedAtText).getTime(),
        status: statusText,
        last: { title: $last.text(), url: $last.attr('href')! },
      }

      let sub = sm.getSubscription(id)

      if (!sub) {
        const $current = getActive()

        sub = {
          id,
          title: $('.player-title-link').text(),
          url: $('.player-title-link').attr('href')!,
          thumbnail: $('.play-details-top .this-pic img').attr('data-src')!,
          createdAt: Date.now(),
          checkedAt: Date.now(),
          current: { title: $current.text(), url: $current.attr('href')! },
          ...updateInfo,
        }
      }

      return { ...sub, ...updateInfo }
    },
    renderSubscribedAnimes: (sm) => {
      const $root = $(T.subListContainer)
      $root.insertBefore('#week-module-box')

      sm.onChange(
        () => {
          const groups = sm.getSubscriptionsGroupByDay()
          $root.find('#subList').replaceWith(template(T.subList)({ groups }))

          execInUnsafeWindow(() => {
            if (typeof window.Swiper !== 'undefined') {
              new window.Swiper('.sub-list', {
                slidesPerView: 'auto',
                slidesPerGroup: 2,
                navigation: {
                  nextEl: '.swiper-button-next',
                  prevEl: '.swiper-button-prev',
                },
              })
            }
          })
        },
        { immediate: true }
      )
      return $root
    },
    renderSubscribeBtn($btn) {
      $btn.addClass('cor5 r6')
      $btn.prependTo($('.anthology-header .function'))
    },
  },
})

export async function parser() {
  const video = await queryDom<HTMLVideoElement>('video')

  await wait(() => !!video.currentSrc)
  video.src = ''

  const player = createKPlayer('#APlayer', {
    eventToParentWindow: true,
  })
  player.src = new URLSearchParams(location.search).get('url')!
}
