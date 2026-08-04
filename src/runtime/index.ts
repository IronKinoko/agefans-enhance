import { memoize } from 'lodash-es'
import { opencc } from '../utils/opencc'

type Dispose = () => void
type Run = () => void | Promise<void> | Dispose

interface RegisterOpts {
  runInIframe?: boolean
  /** 仅包含 pathname + search */
  test: string | RegExp | (string | RegExp)[] | (() => boolean)
  /** 只执行一次，就算是spa模式也不会再执行 */
  setup?: () => void
  /** spa模式下，可以返回 dispose 函数 */
  run?: Run
}

interface RegisteredItem {
  domains: (string | RegExp)[]
  opts: RegisterOpts[]
  /** 网站是 spa 模式 */
  spa?: boolean
  search?: {
    name?: string
    search?: (cn: string, tw: string) => string | void
    getSearchName?: () => Promise<string> | string
    getEpisode?: () => Promise<string> | string
    getAnimeScope?: () => Promise<string> | string
    disabledInIframe?: boolean
  }
}

function createTest(target: string) {
  return (test: string | RegExp | (() => boolean)) =>
    typeof test === 'function'
      ? test()
      : typeof test === 'string'
      ? target.includes(test) || test === '*'
      : test.test(target)
}

function installRouteChangeListener(onRouteChange: () => void) {
  const wrapHistoryMethod = (type: 'pushState' | 'replaceState') => {
    const original = history[type]
    history[type] = function (this: History, ...args) {
      const result = original.apply(this, args as any)
      window.dispatchEvent(new Event('routechange'))
      return result
    } as (typeof history)[typeof type]
  }

  wrapHistoryMethod('pushState')
  wrapHistoryMethod('replaceState')

  window.addEventListener('popstate', onRouteChange)
  window.addEventListener('hashchange', onRouteChange)
  window.addEventListener('routechange', onRouteChange)
}

class Runtime {
  constructor() {
    if (parent === self) {
      window.addEventListener('message', (e) => {
        if (e.data?.key === 'getLocationHref') {
          e.source?.postMessage(
            { key: 'getLocationHref', url: location.href },
            { targetOrigin: '*' }
          )
        }
      })

      window.addEventListener('message', (e) => {
        if (e.data?.key === 'getAnimeScope') {
          e.source?.postMessage(
            {
              key: 'getAnimeScope',
              animeScope:
                this.getActiveRegister().search?.getAnimeScope?.() || '',
            },
            { targetOrigin: '*' }
          )
        }
      })
    }
  }

  getTopLocationHref = memoize(
    async () => {
      if (parent === self) return window.location.href

      return new Promise<string>((resolve) => {
        window.addEventListener('message', function once(e) {
          if (e.data?.key === 'getLocationHref') {
            window.removeEventListener('message', once)
            resolve(e.data.url)
          }
        })
        parent.postMessage({ key: 'getLocationHref' }, '*')
      })
    },
    () => window.location.href
  )

  getAnimeScope = memoize(
    async () => {
      if (parent === self)
        return this.getActiveRegister().search?.getAnimeScope?.() || ''

      return new Promise<string>((resolve) => {
        window.addEventListener('message', function once(e) {
          if (e.data?.key === 'getAnimeScope') {
            window.removeEventListener('message', once)
            resolve(e.data.animeScope)
          }
        })
        parent.postMessage({ key: 'getAnimeScope' }, '*')
      })
    },
    () => window.location.href
  )

  private list: RegisteredItem[] = [
    {
      domains: [],
      opts: [],
      search: {
        name: '[BT]蜜柑计划',
        search: (cn) => `https://mikanani.me/Home/Search?searchstr=${cn}`,
      },
    },
  ]
  register(item: RegisteredItem) {
    this.list.push(item)
  }

  async getSearchActions() {
    const isInIframe = parent !== self
    const searchs = this.list
      .map((o) => o.search)
      .filter(Boolean)
      .filter((o) => !(isInIframe && o!.disabledInIframe)) as NonNullable<
      RegisteredItem['search']
    >[]

    const register = this.getActiveRegister()

    const info = await this.getCurrentVideoNameAndEpisode()
    if (!info?.name) return []
    let name = info.name

    return searchs
      .filter((search) => search !== register.search && search.search)
      .map((search) => ({
        name: search.name,
        search: () => {
          const { cn, tw } = opencc(name)
          const url = search.search!(
            encodeURIComponent(cn),
            encodeURIComponent(tw)
          )
          if (!url) return
          if (isInIframe) parent.postMessage({ key: 'openLink', url }, '*')
          else window.open(url)
        },
      }))
  }

  async getCurrentVideoNameAndEpisode() {
    const register = this.getActiveRegister()
    if (!register.search?.getSearchName) return
    let rawName = (await register.search.getSearchName()) || ''
    let episode = (await register.search.getEpisode?.()) || ''

    let name = rawName
      .replace(/第.季/, '')
      .replace(/[<>《》''‘’""“”\[\]]/g, '')
      .trim()

    episode =
      // 取出数字
      episode.match(/([0-9.]+)[集话]/)?.[1].replace(/^0+/, '') ||
      // 如果没有数字 过滤中文等常见符号
      episode.replace(/[第集话()（）]/g, '') ||
      // fallback 返回全名
      episode

    return { name, rawName, episode }
  }

  private getActiveRegister() {
    const registers = this.list.filter(({ domains }) =>
      domains.some(createTest(location.origin))
    )

    if (registers.length !== 1) {
      console.log('[agefans-enhance]', window.location, registers)
      throw new Error(`激活的域名应该就一个`)
    }

    console.log('[agefans-enhance]', '激活的Register', registers[0])
    return registers[0]
  }

  private getActiveOpts() {
    const register = this.getActiveRegister()
    return register.opts.filter(({ test }) => {
      const testArr = Array.isArray(test) ? test : [test]
      return testArr.some(createTest(location.pathname + location.search))
    })
  }

  private runActiveOpts(runSetup: boolean) {
    const opts = this.getActiveOpts()
    let setupList: Function[] = []
    let runList: Run[] = []

    opts.forEach((opt) => {
      const { run, setup, runInIframe } = opt
      let needRun = runInIframe ? parent !== self : parent === self
      if (needRun) {
        console.log('[agefans-enhance]', '激活的opt', opt)
        setup && setupList.push(setup)
        run && runList.push(run)
      }
    })

    if (runSetup) setupList.forEach((setup) => setup())
    return runList
      .map((run) => run())
      .filter((o) => typeof o === 'function') as Dispose[]
  }

  run() {
    const register = this.getActiveRegister()

    const init = () => {
      let disposeList = this.runActiveOpts(true)

      if (register.spa) {
        // 监听 SPA 路由变化
        installRouteChangeListener(() => {
          disposeList.forEach((dispose) => dispose())

          disposeList = this.runActiveOpts(false)
        })
      }
    }
    if (document.readyState !== 'loading') {
      init()
    } else {
      window.addEventListener('DOMContentLoaded', init)
    }
  }
}

export const runtime = new Runtime()
