import $ from 'jquery'
import { pagePreview } from '../utils/pagePreview'
export function recommendModule() {
  $<HTMLAnchorElement>('ul.ul_li_a6 > li > a').each((_, anchor) =>
    pagePreview(anchor.parentElement!, anchor.href)
  )
}
