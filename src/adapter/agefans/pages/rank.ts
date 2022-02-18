import { pagePreview } from '../utils/pagePreview'
export function rankModule() {
  $<HTMLAnchorElement>('.div_right_r_3 ul > li > a').each((_, anchor) =>
    pagePreview(anchor, anchor.href)
  )
}
