/**
 * 播放器需要的外部信息都由宿主应用注入，
 * 播放器自身不关心这些信息从哪来（站点适配器、iframe 父窗口……）。
 */
export interface VideoInfo {
  name: string
  rawName: string
  episode: string
}

export interface SearchAction {
  name?: string
  search: () => void
}

export interface PlayerContext {
  /** 最顶层窗口的地址，用于断点续播的存储 key */
  getTopLocationHref(): Promise<string>
  /** 当前番剧的作用域标识 */
  getAnimeScope(): Promise<string>
  /** 当前剧集信息，用于弹幕匹配 */
  getCurrentVideoNameAndEpisode(): Promise<VideoInfo | undefined>
  /** 可用的搜索来源 */
  getSearchActions(): Promise<SearchAction[]>
}

/** 没有宿主注入时的降级实现，播放器退化为一个纯播放器 */
export const defaultPlayerContext: PlayerContext = {
  getTopLocationHref: async () => window.location.href,
  getAnimeScope: async () => '',
  getCurrentVideoNameAndEpisode: async () => undefined,
  getSearchActions: async () => [],
}
