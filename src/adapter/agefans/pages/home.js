import $ from 'jquery'
import { pagePreview } from '../utils/pagePreview'

export function homeModule() {
  $('#container li > a:nth-child(1)').each((_, anchor) =>
    pagePreview(anchor.parentNode, anchor.href)
  )
  $('#new_anime_btns li').on('click', () => {
    $('#new_anime_page > li > a.one_new_anime_name').each((_, anchor) =>
      pagePreview(anchor.parentNode, anchor.href)
    )
  })
}
