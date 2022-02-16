import $ from 'jquery'
import { pagePreview } from '../utils/pagePreview'
function renderHistroyStyle() {
  $('<style/>').html(`.movurl li a:visited { color: red; }`).appendTo('head')
}

export function detailModule() {
  renderHistroyStyle()

  $<HTMLAnchorElement>(
    '.div_left li > a:nth-child(1), .ul_li_a4 li > a:nth-child(1)'
  ).each((_, anchor) => pagePreview(anchor.parentElement!, anchor.href))
}
