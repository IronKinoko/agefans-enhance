interface RegisterOpts {
  runInIframe?: boolean
  test: string | RegExp | (string | RegExp)[]
  setup?: Function
  run: Function
}

interface RegisteredItem {
  domains: (string | RegExp)[]
  opts: RegisterOpts[]
  search?: {
    name: string
    search: (name: string) => string | void
    getSearchName?: () => Promise<string> | string
    disabledInIframe?: boolean
  }
}

function createTest(target: string) {
  return (test: string | RegExp) =>
    typeof test === 'string'
      ? target.includes(test) || test === '*'
      : test.test(target)
}
class Runtime {
  private list: RegisteredItem[] = []
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
      .filter((search) => search !== register.search)
      .map((search) => ({
        name: search.name,
        search: () => {
          const url = search.search(encodeURIComponent(name!))
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
    if (!rawName) return

    let name = rawName
      .replace(/第.季/, '')
      .replace(/[<>《》''‘’""“”\[\]]/g, '')
      .trim()

    return { name, rawName }
  }

  private getActiveRegister() {
    const registers = this.list.filter(({ domains }) =>
      domains.some(createTest(location.origin))
    )

    if (registers.length !== 1) throw new Error('激活的域名应该就一个')
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
      if (runInIframe || parent === self) {
        setup && setupList.push(setup)
        runList.push(run)
      }
    })

    setupList.forEach((setup) => setup())
    window.addEventListener('DOMContentLoaded', () => {
      runList.forEach((run) => run())
    })
  }
}

export const runtime = new Runtime()
