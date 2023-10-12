import { runtime } from '../../runtime'
import { playModule } from './play'

runtime.register({
  domains: ['anime1.'],
  opts: [
    { test: "/category", run: playModule },
    { test: /\/\d+/, run: playModule }
  ],
  search: {
    name: "anime1",
    search: (name) => `https://anime1.me/?s=${name}`,
    getSearchName: () => $("h2.entry-title").first().text().replace(/ \[\d+\]$/, "")
  }
})
