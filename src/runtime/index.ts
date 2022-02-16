interface RegisterOpts {
  runInIframe?: boolean
  test: string | RegExp | (string | RegExp)[]
  setup?: Function
  run: Function
}

interface RegisteredItem {
  domains: (string | RegExp)[]
  opts: RegisterOpts[]
}

function createTest(target: string) {
  return (test: string | RegExp) =>
    typeof test === 'string'
      ? target.includes(test) || test === '*'
      : test.test(target)
}
class Runtime {
  private list: RegisteredItem[] = []
  register(
    domains: string | RegExp | (string | RegExp)[],
    opts: RegisterOpts[]
  ) {
    domains = [domains].flat()
    this.list.push({ domains, opts })
  }

  run() {
    let setupList: Function[] = []
    let runList: Function[] = []

    const list = this.list.filter(({ domains }) =>
      domains.some(createTest(location.origin))
    )
    list.forEach(({ opts }) => {
      opts = opts.filter(({ test }) => {
        const testArr = [test].flat()
        return testArr.some(createTest(location.pathname + location.search))
      })

      opts.forEach(({ run, runInIframe, setup }) => {
        if (runInIframe || parent === self) {
          setup && setupList.push(setup)
          runList.push(run)
        }
      })
    })

    setupList.forEach((setup) => setup())
    window.addEventListener('DOMContentLoaded', () => {
      runList.forEach((run) => run())
    })
  }
}

export const runtime = new Runtime()
