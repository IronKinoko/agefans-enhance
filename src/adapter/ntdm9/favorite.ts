import { local } from '../../utils/storage'

export type Favorite = {
  id: string
  current: { name: string; url: string }
}

const favoriteKey = 'favorite'

function getFavorite(id: string): Favorite | undefined
function getFavorite(): Favorite[]
function getFavorite(id?: string) {
  const favorites = local.getItem<Favorite[]>(favoriteKey, [])
  if (id) {
    return favorites.find((f) => f.id === id)
  }
  return favorites
}

export function setFavorite(favorite: Favorite) {
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

  let groups = $('.mod')
    .map((idx, el) => {
      let list: { favorite: Favorite; title: string; update: string }[] = []
      $(el)
        .find('.one_new_anime')
        .each((_, el) => {
          const $el = $(el)
          const id = $el
            .find('a')
            .attr('href')!
            .match(/\/(\d+).html/)![1]
          const title = $el.find('.one_new_anime_name').text()
          const update = $el.find('.one_new_anime_ji').text()
          const favorite = favorites.find((f) => f.id === id)

          if (favorite) {
            list.push({ favorite, title, update })
          }
        })

      return { idx, list }
    })
    .get()

  const day = new Date().getDay() - 1
  groups = [...groups.slice(day), ...groups.slice(0, day)]
  groups
    .filter((o) => o.list.length > 0)
    .forEach(({ idx, list }, index) => {
      const $ul = $(`<ul id="new_anime_page"></ul>`)
      list.forEach(({ favorite, title, update }) => {
        $ul.append(
          `<li class="one_new_anime" style="display:flex; justify-content:space-between;">
            <a class="one_new_anime_name" href="${favorite.current.url}">${title}</a>
            <a class="one_new_anime_ji" style="flex-shrink:0;" href="${favorite.current.url}">${favorite.current.name}/${update}</a>
          </li>`
        )
      })

      const title = $('#new_anime_btns .new_anime_btn').eq(idx).text()

      $content
        .find('#anime_update')
        .append(
          `<div style="margin-top:${index !== 0 ? 8 : 0}px;">${title}</div>`,
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
      return
    } else {
      updateFavoriteCurrent(true)
      $btn.text('已订阅')
    }
  })

  const id = location.pathname.match(/\/(\d+)-/)![1]
  if (getFavorite().find((f) => f.id === id)) {
    $btn.text('已订阅')
  }

  $('#detailname').append($btn)
}

export function updateFavoriteCurrent(push: boolean) {
  const id = location.pathname.match(/\/(\d+)-/)![1]

  if (!push && !getFavorite(id)) return

  const name = $('.active-play').text()
  const url = location.pathname

  setFavorite({ id, current: { name, url } })
}
