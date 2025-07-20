import { renderHistory } from '../common/history'

export function historyModule() {
  const $btn = $(
    `<li class="menu-item">
      <a href="javascript:void(0)" >歷史</a>
    </li>`
  ).on('click', renderHistory)

  $('.menu.nav-menu').append($btn)
}
