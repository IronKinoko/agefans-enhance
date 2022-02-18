export function ageBlock(params: { title: string; content: string }) {
  const { title, content } = params

  return `<div class="baseblock">
  <div class="blockcontent">
    <div class="baseblock2">
      <div class="blocktitle">${title}</div>
      <div class="blockcontent">${content}</div>
    </div>
  </div>
</div>`
}
