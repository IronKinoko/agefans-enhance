// https://api.acplay.net/swagger/ui/index#/
export type RawComments = {
  count: number
  comments: { m: string; p: string }[]
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
