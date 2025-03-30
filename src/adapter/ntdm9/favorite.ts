import { local } from '../../utils/storage'

export type Favorite = {
  id: string
  title: string
  lastUpdate: string
  current: { name: string; url: string }
}

const favoriteKey = 'favorite.v2'

function getFavorite(id: string): Favorite | undefined
function getFavorite(): Favorite[]
function getFavorite(id?: string) {
  const favorites = local.getItem<Favorite[]>(favoriteKey, [])
  if (id) {
    return favorites.find((f) => f.id === id)
  }
  return favorites
}

function setFavorite(favorite: Favorite) {
  const favorites = getFavorite()
  const index = favorites.findIndex((f) => f.id === favorite.id)
  if (index === -1) {
    favorites.push(favorite)
  } else {
    favorites[index] = favorite
  }

  local.setItem(favoriteKey, favorites.slice(-100))
}

export function removeFavorite(id: string) {
  const favorites = getFavorite()
  const index = favorites.findIndex((f) => f.id === id)
  if (index !== -1) {
    favorites.splice(index, 1)
    local.setItem(favoriteKey, favorites)
  }
}

export function renderFavoriteList() {
  const favorites = getFavorite()
  const $root = $('.div_right.baseblock')
  const $content = $(`<div class="blockcontent">
    <ul id="anime_update"></ul>
  </div>`)

  $root.prepend(`<div class="blocktitle">订阅</div>`, $content)

  type AnimeUpdateInfo = { favorite: Favorite; update?: string }
  const list: AnimeUpdateInfo[] = favorites.map((favorite) => {
    const update = $(
      `.mod .one_new_anime a[href$='/${favorite.id}.html'].one_new_anime_ji`
    ).text()
    return { favorite, update }
  })

  const daysInChinese = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  let groups: { day: string; list: AnimeUpdateInfo[] }[] = Array.from(
    { length: 7 },
    (_, idx) => ({
      day: daysInChinese[idx],
      list: list.filter(
        (item) => new Date(item.favorite.lastUpdate).getDay() === idx
      ),
    })
  )

  const day = new Date().getDay()
  groups = [...groups.slice(day), ...groups.slice(0, day)]
  groups
    .filter((o) => o.list.length > 0)
    .forEach(({ day, list }, index) => {
      const $ul = $(`<ul id="new_anime_page"></ul>`)
      list.forEach(({ favorite, update }) => {
        $ul.append(
          `<li class="one_new_anime" style="display:flex; justify-content:space-between;">
            <a class="one_new_anime_name" href="${favorite.current.url}">${
            favorite.title
          }</a>
            <a class="one_new_anime_ji" style="flex-shrink:0;" href="${
              favorite.current.url
            }">${favorite.current.name}/${update || '-'}</a>
          </li>`
        )
      })

      $content
        .find('#anime_update')
        .append(
          `<div style="margin-top:${index !== 0 ? 8 : 0}px;">${day}</div>`,
          $ul
        )
    })
}

export function renderFavoriteBtn() {
  const $btn = $(`<a href="javascript:void(0)" style="float:right;">订阅</a>`)
  $btn.on('click', () => {
    if (getFavorite(id)) {
      removeFavorite(id)
      $btn.text('订阅')
    } else {
      updateFavorite()
      $btn.text('已订阅')
    }
  })

  const id = location.pathname.match(/\/(\d+)-/)![1]
  if (getFavorite().find((f) => f.id === id)) {
    $btn.text('已订阅')
  }

  $('#detailname').append($btn)
}

export function updateFavorite() {
  const id = location.pathname.match(/\/(\d+)-/)![1]

  const name = $('.active-play').text()
  const url = location.pathname
  const title = $('#detailname a:nth-child(1)').text()
  const lastUpdate = $('.play_imform_kv .play_imform_tag:contains("更新时间")')
    .next('.play_imform_val')
    .text()
  setFavorite({ id, title, lastUpdate, current: { name, url } })
}
