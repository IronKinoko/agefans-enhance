interface Config {
  iframeSelector: string
  /** 获取激活的节点 */
  getActive(): JQuery
  /** 根据href设置激活的节点 */
  setActive(href: string): void
  /** 切换剧集 */
  switchEpisode(next: boolean): string | undefined
  /** 监听player事件 */
  onIframeMessage?(key: string, data: any, e: MessageEvent): void
  /** 获取剧集列表 用于修改 anchor 的点击表现 */
  getEpisodeList(): JQuery<HTMLAnchorElement>
  search: {
    /** 弹幕搜索用到 获取番剧标题 */
    getSearchName(): string | Promise<string>
    /** 弹幕搜索用到 获取番剧章节 */
    getEpisode(): string | Promise<string>
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

  function runInTop() {
    window.addEventListener('keydown', (e) => {
      if (document.activeElement !== document.body) return
      $(iframeSelector)[0].focus()
      if (e.key === ' ') e.preventDefault()
    })

    $(iframeSelector).attr({ allow: 'autoplay; fullscreen' })

    window.addEventListener('popstate', () => {
      setActive(window.location.href)
    })

    config.getEpisodeList().each((_, el) => {
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
          const url = config.switchEpisode(e.data.key === 'next')
          if (url) setActive(url)
          break
        }
        case 'enterwidescreen': {
          $('body').css('overflow', 'hidden')
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
          $(iframeSelector).removeAttr('style')
          break
        }
      }
      config.onIframeMessage?.(e.data.key, e.data, e)
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

  return { runInTop, runInIframe }
}
