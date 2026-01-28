import { renderHistory, logHis } from './history'
import { SubscribedAnime, SubscriptionManager } from './subscribe'

interface Config {
  iframeSelector: string
  /** 获取激活的节点 */
  getActive(): JQuery
  /** 根据href设置激活的节点 */
  setActive(href: string): void
  /** 获取上下集链接 */
  getSwitchEpisodeURL(next: boolean): string | undefined
  /** 监听player事件 */
  onPlayerMessage?(key: string, data: any, e: MessageEvent): void
  /** 获取剧集列表 用于修改 anchor 的点击表现 */
  getEpisodeList(): JQuery<HTMLAnchorElement>
  search: {
    /** 弹幕搜索用到 获取番剧标题 */
    getSearchName(): string | Promise<string>
    /** 弹幕搜索用到 获取番剧章节 */
    getEpisode(): string | Promise<string>
  }
  /** 内置的历史功能，可生成历史按钮，点击后展开观看历史记录 */
  history?: {
    creator: (renderHistory: () => void) => void
    getId: () => string
  }
  /** 内置的订阅功能 */
  subscribe?: {
    renderSubscribedAnimes: (
      $root: JQuery<HTMLDivElement>,
      sm: SubscriptionManager
    ) => void
    renderSubscribeBtn: (
      $btn: JQuery<HTMLButtonElement>,
      sm: SubscriptionManager
    ) => void
    getId: () => string
    storageKey: string
    getAnimeUpdateInfo: (
      id: string
    ) => Promise<Pick<SubscribedAnime, 'updatedAt' | 'status' | 'last'>>
  }
}
export function defineIframePlayer(config: Config) {
  const { iframeSelector, search } = config

  function createIframeReadyToChangeIframeSrc(url: string) {
    const iframe = document.createElement('iframe')
    iframe.className = 'ready-to-change-iframe-src'
    iframe.style.cssText =
      'position:fixed;left:0;top:0;z-index:9999;opacity:0;pointer-events:none;'
    iframe.src = url
    document.body.appendChild(iframe)
  }

  function setActive(url: string) {
    if (window.location.href !== url) {
      window.history.pushState(window.history.state, '', url)
    }
    config.setActive(url)
    createIframeReadyToChangeIframeSrc(url)
  }

  function createHistory() {
    if (config.history) {
      config.history.creator(renderHistory)
    }
  }

  function isFocusInputElement() {
    if (!document.activeElement) return false
    return ['input', 'textarea', 'select'].includes(
      document.activeElement.tagName.toLowerCase()
    )
  }

  function runInTop() {
    $(iframeSelector).replaceWith(
      $(iframeSelector).clone().attr({ allow: 'autoplay; fullscreen' })
    )

    window.addEventListener('keydown', (e) => {
      if (isFocusInputElement()) return
      if (window.getSelection()?.toString()) return
      if (e.key === ' ') e.preventDefault()
      const iframe = $<HTMLIFrameElement>(iframeSelector)[0]
      if (document.activeElement !== iframe) {
        iframe.contentWindow?.postMessage(
          {
            key: 'transportShortcut',
            data: <KeyboardEventInit>{
              key: e.key,
              code: e.code,
              altKey: e.altKey,
              ctrlKey: e.ctrlKey,
              shiftKey: e.shiftKey,
              metaKey: e.metaKey,
              repeat: e.repeat,
              bubbles: true,
              cancelable: true,
            },
          },
          '*'
        )
        iframe.blur()
        iframe.focus()
      }
    })

    window.addEventListener('popstate', () => {
      setActive(window.location.href)
    })

    config.getEpisodeList().each((_, el) => {
      el.classList.add('k-episode-anchor')
      el.addEventListener('click', (e) => {
        e.preventDefault()
        if ($('.ready-to-change-iframe-src').length) return

        if (!el.href) return
        setActive(el.href)
      })
    })

    window.addEventListener('message', async (e) => {
      if (!e.data.key) return
      switch (e.data.key) {
        case 'getSearchName': {
          e.source?.postMessage(
            {
              key: 'getSearchName',
              name: await search.getSearchName(),
            },
            { targetOrigin: '*' }
          )
          break
        }

        case 'getEpisode': {
          e.source?.postMessage(
            { key: 'getEpisode', name: await search.getEpisode() },
            { targetOrigin: '*' }
          )
          break
        }

        case 'openLink': {
          window.open(e.data.url)
          break
        }

        case 'changeIframeSrc': {
          const iframe = $<HTMLIFrameElement>(iframeSelector)[0]
          iframe.contentWindow?.location.replace(e.data.url)
          document.title = e.data.title
          $('.ready-to-change-iframe-src').remove()
          break
        }

        case 'prev':
        case 'next': {
          if ($('.ready-to-change-iframe-src').length) return
          const url = config.getSwitchEpisodeURL(e.data.key === 'next')
          if (url) setActive(url)
          break
        }
        case 'enterwidescreen': {
          $('body').css('overflow', 'hidden')
          $('body').addClass('widescreen')
          $(iframeSelector).css({
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
            zIndex: 2147483648,
          })
          break
        }
        case 'exitwidescreen': {
          $('body').css('overflow', '')
          $('body').removeClass('widescreen')
          $(iframeSelector).removeAttr('style')
          break
        }
        case 'timeupdate': {
          if (config.history) {
            logHis(
              {
                animeName: await search.getSearchName(),
                episodeName: await search.getEpisode(),
                id: await config.history.getId(),
                url: window.location.href,
              },
              e.data.video.currentTime
            )
          }
          break
        }

        case 'canplay': {
          if (!config.subscribe) break

          const sm = SubscriptionManager.getInstance(
            config.subscribe.storageKey
          )

          const id = config.subscribe.getId()
          if (id && sm.getSubscription(id)) {
            sm.updateSubscription(id, {
              current: {
                title: await search.getEpisode(),
                url: window.location.href,
              },
            })

            checkSubscriptionUpdates(id)
          }
        }
      }
      config.onPlayerMessage?.(e.data.key, e.data, e)
    })

    renderSubscribeBtn()
  }

  function runInIframe() {
    top?.postMessage(
      {
        key: 'changeIframeSrc',
        url: $(iframeSelector).attr('src'),
        title: document.title,
      },
      '*'
    )
  }

  function renderSubscribedAnimes() {
    if (!config.subscribe) return

    const $root = $<HTMLDivElement>('<div><div/>')
    const sm = SubscriptionManager.getInstance(config.subscribe.storageKey)
    sm.onChange(
      () => {
        $root.empty()
        $root.remove()
        config.subscribe!.renderSubscribedAnimes($root, sm)
      },
      { immediate: true }
    )
  }

  function renderSubscribeBtn() {
    if (!config.subscribe) return

    let $btn = $<HTMLButtonElement>('<button></button>')
    const sm = SubscriptionManager.getInstance(config.subscribe.storageKey)
    sm.onChange(
      () => {
        $btn.remove()
        const sub = sm.getSubscription(config.subscribe!.getId())
        $btn = $<HTMLButtonElement>(`<button>
          ${
            sub
              ? '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 -960 960 960"  fill="currentColor" style="display: inline-block; vertical-align: -0.125em;"><path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z"/></svg>'
              : '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 -960 960 960"  fill="currentColor" style="display: inline-block; vertical-align: -0.125em;"><path d="M480-500Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80Zm240-360v-120H600v-80h120v-120h80v120h120v80H800v120h-80ZM160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q14 4 27.5 8.5T593-772q-15 14-27 30.5T545-706q-15-7-31.5-10.5T480-720q-66 0-113 47t-47 113v280h320v-112q18 11 38 18t42 11v83h80v80H160Z"/></svg>'
          }
            <span>${sub ? '已订阅' : '订阅'}</span>
          </button>`)
        config.subscribe!.renderSubscribeBtn($btn, sm)
      },
      { immediate: true }
    )
  }

  async function checkSubscriptionUpdates(id: string) {
    if (!config.subscribe) return

    const sm = SubscriptionManager.getInstance(config.subscribe.storageKey)
    const sub = sm.getSubscription(id)
    if (!sub) return

    const now = Date.now()
    // 近一周内更新过了
    if (now - sub.updatedAt < 1000 * 60 * 60 * (24 * 7 - 5)) return
    // 一小时内检查过了
    if (now - sub.checkedAt < 1000 * 60 * 60) return

    try {
      const animeInfo = await config.subscribe.getAnimeUpdateInfo(
        config.subscribe.getId()
      )

      Object.assign(animeInfo, { checkedAt: now })
      sm.updateSubscription(id, animeInfo)
    } catch (error) {}
  }

  function checkSubscriptionsUpdates() {
    if (!config.subscribe) return

    const sm = SubscriptionManager.getInstance(config.subscribe.storageKey)
    const subscriptions = sm.getSubscriptions()
    subscriptions.forEach((sub) => {
      // 15天内没有更新过的跳过
      if (sub.checkedAt - sub.updatedAt > 1000 * 60 * 60 * 24 * 15) return
      checkSubscriptionUpdates(sub.id)
    })
  }

  return {
    runInTop,
    runInIframe,
    createHistory,
    subscribe: {
      renderSubscribedAnimes,
      renderSubscribeBtn,
      checkSubscriptionsUpdates,
    },
  }
}
