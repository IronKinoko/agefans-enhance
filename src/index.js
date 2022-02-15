import 'plyr/dist/plyr.css'
import './adapter'
import { runtime } from './runtime/index'
import { local } from './utils/local'

/**
 * 存储地方换了，迁移一下数据。几个版本后删除
 */
function migrationStorage() {
  const mergeKey = 'agefans-local-merge'
  const isMerged = local.getItem(mergeKey)
  if (isMerged) return
  local.setItem(mergeKey, true)

  const waitToMergeKeys = ['v-his', 'play-url-key', 'kplayer']
  waitToMergeKeys.forEach((key) => {
    const value = window.localStorage.getItem(key)
    if (value) {
      local.setItem(key, JSON.parse(value))
    }
  })
}

function migrationHistory() {
  const mergeKey = 'agefans-his-href-modify'
  const isMerged = local.getItem(mergeKey)
  if (isMerged) return
  local.setItem(mergeKey, true)

  const his = local.getItem('v-his', [])
  his.forEach((item) => {
    try {
      const url = new URL(item.href, location.origin)
      item.href = url.pathname + url.search
      // eslint-disable-next-line no-empty
    } catch (e) {}
  })
  local.setItem('v-his', his)
}
migrationStorage()
migrationHistory()

runtime.run()
