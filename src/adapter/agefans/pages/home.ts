import $ from 'jquery'
import { pagePreview } from '../utils/pagePreview'

export function homeModule() {
  $<HTMLAnchorElement>('#container li > a:nth-child(1)').each((_, anchor) =>
    pagePreview(anchor.parentElement!, anchor.href)
  )
  $<HTMLLinkElement>('#new_anime_btns li').on('click', () => {
    $<HTMLAnchorElement>('#new_anime_page > li > a.one_new_anime_name').each(
      (_, anchor) => pagePreview(anchor.parentElement!, anchor.href)
    )
  })
}
