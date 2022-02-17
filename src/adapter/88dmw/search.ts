import $ from 'jquery'

export function searchAction(name: string) {
  const $form = $<HTMLFormElement>(`
  <form action="http://www.88dmw.com/index.php?m=vod-search" method="post">
    <input type="text" id="wd" name="wd">
  </form>
  `)
  $form.hide()
  $form.find('#wd').val(decodeURIComponent(name))

  $form.appendTo('body')
  $form.trigger('submit')
}
