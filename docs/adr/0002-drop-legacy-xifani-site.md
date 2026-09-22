# 删除稀饭动漫旧站（anime.xifanacg.com）适配

旧站 `anime.xifanacg.com` 使用 MacPlayer iframe + `postMessage` 架构，与新站
`next.xifanacg.com`（Next.js App Router SPA）是两套完全不同的实现，原先由同一个
`runtime.register` 通过 `domains: ['.xifanacg.', 'player.moedot']` 覆盖。现已删除
旧站适配，只保留新站。

注意：删除旧站适配**在技术上是主动放弃**，不是因为它已经失效。改动时旧站仍返回
200，`/watch/{id}/{part}/{ep}.html` 仍存在，`anthology-list-play`、
`player-title-link`、`player-news` 等选择器仍在，其 `player.js` 也仍在向
`#playleft` 注入 MacPlayer iframe。删除的产品理由是旧站已不再被使用。

## 必须成对删除 `@include`

`runtime.getActiveRegister()` 在匹配到的 register 数量不为 1 时直接
`throw new Error('激活的域名应该就一个')`，而 `runtime.run()` 在脚本启动时就会
执行。因此只删 adapter 代码而保留 `@include`，会让脚本在旧站与
`player.moedot.net` 上启动即抛错。本次同时删除了：

- `// @include https://anime.xifanacg.com/*`
- `// @include https://player.moedot.net/*`

## `player.moedot` 为何一并删除

它是旧站的解析器域名：旧站 `playerconfig.js` 里各线路的
`parse` 字段指向 `https://player.moedot.net/player/index.php?code=xfdm*&url=`。
全仓库仅 xfani 适配引用它，新站页面既无 iframe 也无 moedot 引用，故随旧站一并移除。

## 附带清理

删除旧站后，「新站」不再有对照物，因此 `next.ts` → `play.ts`、
`next.scss` → `index.scss`；`isNextXifan()` 这类 hostname 判定也一并删除——
register 现在只匹配 `next.xifanacg.com`，判定已冗余。
