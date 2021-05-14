function renderHistroyStyle() {
  // add a tag visited style
  let styleDom = document.createElement('style')
  styleDom.innerHTML = `.movurl li a:visited { color: red; }`
  document.head.appendChild(styleDom)
}

export function detailModule() {
  renderHistroyStyle()
}
