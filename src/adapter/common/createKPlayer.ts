import { KPlayer, KPlayerOpts, PlayerContext } from '../../player'
import { runtime } from '../../runtime'

/** 站点适配器注入给播放器的外部信息，唯一读取 runtime 的地方 */
const playerContext: PlayerContext = {
  getTopLocationHref: () => runtime.getTopLocationHref(),
  getAnimeScope: () => runtime.getAnimeScope(),
  getCurrentVideoNameAndEpisode: () => runtime.getCurrentVideoNameAndEpisode(),
  getSearchActions: () => runtime.getSearchActions(),
}

/**
 * 创建播放器，并把站点上下文注入进去。
 * 适配器一律走这个入口，避免遗漏 context 导致搜索菜单/弹幕静默失效。
 */
export function createKPlayer(
  selector: string | Element,
  opts: KPlayerOpts = {}
) {
  return new KPlayer(selector, {
    ...opts,
    context: { ...playerContext, ...opts.context },
  })
}
