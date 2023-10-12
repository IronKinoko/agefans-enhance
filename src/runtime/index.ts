import { memoize } from 'lodash-es'

interface RegisterOpts {
  runInIframe?: boolean
  test: string | RegExp | (string | RegExp)[] | (() => boolean)
  setup?: Function
  run: Function
}

interface RegisteredItem {
  domains: (string | RegExp)[]
  opts: RegisterOpts[]
  search?: {
    name?: string
    search?: (name: string) => string | void
    getSearchName?: () => Promise<string> | string
    getEpisode?: () => Promise<string> | string
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

  private list: RegisteredItem[] = [
    {
      domains: [],
      opts: [],
      search: {
        name: '[BT]蜜柑计划',
        search: (name) => `https://mikanani.me/Home/Search?searchstr=${name}`,
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
          const url = search.search!(encodeURIComponent(name!))
          if (!url) return
          if (isInIframe) parent.postMessage({ key: 'openLink', url }, '*')
          else window.open(url)
        },
      }))
  }

  async getCurrentVideoNameAndEpisode() {
    const register = this.getActiveRegister()
    if (!register.search?.getSearchName) return
    let rawName = await register.search.getSearchName()
    let episode = (await register.search.getEpisode?.()) || ''
    if (!rawName) return

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
      console.log(window.location, registers)
      throw new Error(`激活的域名应该就一个`)
    }
    return registers[0]
  }

  private getActiveOpts() {
    const register = this.getActiveRegister()
    return register.opts.filter(({ test }) => {
      const testArr = Array.isArray(test) ? test : [test]
      return testArr.some(createTest(location.pathname + location.search))
    })
  }

  run() {
    let setupList: Function[] = []
    let runList: Function[] = []

    const opts = this.getActiveOpts()

    opts.forEach(({ run, runInIframe, setup }) => {
      let needRun = runInIframe ? parent !== self : parent === self
      if (needRun) {
        setup && setupList.push(setup)
        runList.push(run)
      }
    })

    const init = () => {
      setupList.forEach((setup) => setup())
      runList.forEach((run) => run())
    }
    if (document.readyState !== 'loading') {
      init()
    } else {
      window.addEventListener('DOMContentLoaded', init)
    }
  }
}

export const runtime = new Runtime()
