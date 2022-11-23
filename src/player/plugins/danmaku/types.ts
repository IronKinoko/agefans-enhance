import { Comment as BaseComment } from '@ironkinoko/danmaku'

export type RawComments = {
  count: number
  comments: {
    m: string
    /** time,type,color,uid */
    p: string
  }[]
}

export interface Comment extends BaseComment {
  user: { source: string; id: string }
}

export interface Anime {
  animeId: number
  animeTitle: string
  type: string
  episodes: Episode[]
}
export interface Episode {
  episodeId: number
  episodeTitle: string
}

export enum Commands {
  danmakuSwitch = 'switchDanmaku',
  danmakuSyncBack = 'danmakuSyncBack',
  danmakuSyncForward = 'danmakuSyncForward',
  danmakuSyncRestore = 'danmakuSyncRestore',
}
