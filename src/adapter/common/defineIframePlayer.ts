import { renderHistory, logHis } from './history'

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
    getId: () => string | Promise<string>
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
      }
      config.onPlayerMessage?.(e.data.key, e.data, e)
    })
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

  return { runInTop, runInIframe, createHistory }
}
