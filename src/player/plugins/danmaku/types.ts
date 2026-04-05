export { Comment } from '@ironkinoko/danmaku'

export type RawComments = {
  count: number
  comments: {
    m: string
    /** time,type,color,uid */
    p: string
  }[]
}

export interface Anime {
  id: string
  name: string
}
export interface Episode {
  id: number
  name: string
}

export enum Commands {
  danmakuSwitch = 'switchDanmaku',
  danmakuSyncBack = 'danmakuSyncBack',
  danmakuSyncForward = 'danmakuSyncForward',
  danmakuSyncRestore = 'danmakuSyncRestore',
}
