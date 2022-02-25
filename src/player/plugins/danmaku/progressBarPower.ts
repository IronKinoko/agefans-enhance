import { Comment } from '@ironkinoko/danmaku'

type Point = { x: string; y: string }

/**
 * 逻辑源自 bilibili 高能进度条 svg path 规则
 */
export function createProgressBarPower(duration: number, danmaku: Comment[]) {
  const $dom = $(`
<svg
  viewBox="0 0 1000 100"
  preserveAspectRatio="none"
  width="100%"
  height="100%"
>
  <defs>
    <clipPath id="k-player-pbp" clipPathUnits="userSpaceOnUse">
      <path d=""></path>
    </clipPath>
  </defs>

  <g
    fill-opacity="0.2"
    clip-path="url(#k-player-pbp)"
    hover-bind="1"
  >
    <rect x="0" y="0" width="100%" height="100%" fill="rgb(255,255,255)"></rect>
  </g>
</svg>
`)

  const data = danmaku.map((cmt) => cmt.time!)

  // svg总长度
  const svgMaxLength = 1000
  // 分成 size 份
  const size = 100
  // svg步长
  const stepLength = svgMaxLength / size

  // 每份时间多长
  const stepTime = duration / size
  const counts = []
  let i = 0,
    j = 0
  // 统计的每份基础时间里弹幕数量
  while (i++ <= size) {
    const base = stepTime * i
    let count = 0
    while (data[j++] < base) {
      count++
    }
    counts.push(count)
  }

  // 为了美观，100 高度的 svg，底部 20 预留显示出来，其他从 80 开始算
  let start = 'M 0 100, L '
  let end = ' 1000.0 80.0 L 1000 100 Z'

  // 巅峰弹幕数量
  const maxCount = Math.max.apply(null, counts)

  const points: Point[] = []
  counts.forEach((count, i) => {
    const x = i * stepLength
    const y = (1 - count / maxCount) * 80

    // 做一份相同的数据，让曲线在两侧顺滑变化
    if (i !== 0)
      points.push({ x: (x - stepLength / 2).toFixed(2), y: y.toFixed(2) })
    if (i !== counts.length - 1)
      points.push({ x: x.toFixed(2), y: y.toFixed(2) })
  })

  for (let i = 0; i < points.length; ) {
    const p1 = points[i++]
    const p2 = points[i++]
    start += `${p1.x} ${p1.y} C ${p2.x} ${p1.y}, ${p2.x} ${p2.y},`
  }

  $dom.find('path').attr('d', start + end)
}
