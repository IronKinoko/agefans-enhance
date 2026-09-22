# 稀饭动漫 Next 采用 SPA 模式驱动播放器

稀饭动漫 Next（`next.xifanacg.com`）是 Next.js App Router 站点，切集通过
`history.pushState` 完成，不触发页面加载。adapter 原先用「一个覆盖全站的
opt + 500ms `setInterval` 轮询」来处理路由与切集，现改为
`runtime.register({ spa: true })` + 路由声明的 opt，并删除该 interval。

## 为什么不能只靠路由事件

实测该站点的时序：

- 点击选集后约 1.0s 才调用 `pushState`（React 的过渡与取流之前）。
- `media-controller` 与 `<video>` 在导航后约 1.3–2.3s 才被客户端渲染插入，
  且插入时 `src` 已就绪（不存在「先空后填」的 `src` 属性变化）。
- `video.src` 从不被程序化修改，只在**新建节点**时出现。

也就是说路由事件**必然早于**站点播放器出现，单靠 `run` 挂不到播放器。

## 决策

用两条触发路径汇入同一个**幂等** `syncPlayer()`：

1. 播放页 opt 的 `run`：路由确定后立即尝试一次。
2. `MutationObserver`（观察 `main`，`childList + subtree`）：捕获稍后插入的
   站点播放器，以及切集导致的节点重建。

`syncPlayer()` 复用「`!player` / `src !== playingSrc` / 自己节点的父容器变了」
三个判断，因此被调用几次、谁先到都不影响最终状态。

## 被否决的方案

- **只用 `MutationObserver`**：该站会缓存已访问过的路由容器（`div.relative.isolate`
  复用，仅在 `display` 间切换）。回到缓存集数时，播放器可能在其仍 `display:none`
  时就插入，之后仅靠 `class`/`style` 变化变可见，`childList` 观察不到，导致漏挂。
- **`wait()` 自旋等 DOM**：只能等「条件成立」，无法感知「节点被挪进隐藏容器」。
- **保留一个更慢的 interval**：仍然是空转轮询。

## 顺带的行为变化

- **站点播放器守护**：原本靠 interval 每 500ms 调 `muteSiteVideo()`。站点每次
  切集都会**新建** video 节点且可能自行恢复播放，所以改为在 `document` 上以捕获
  阶段委托 `play` 事件（排除 KPlayer 自己的 `#k-player`），随 dispose 解绑。
- **DOM 查询 scope 到可见容器**：隐藏容器里保留着过期的 `aria-current="true"`
  与 `h1`。原实现依赖「React 把新树插在旧树之前，所以 `querySelector` 取到的是
  可见节点」这一未文档化的顺序；现改为统一从可见 isolate 内查询，不再依赖顺序。

## 观测到的反直觉之处（避免后人误判）

服务端渲染的 HTML 里 `div.relative.isolate` 只包住播放器区域，选集 `ul` 与
`h1` 在它外面——但那段 HTML 位于 React 流式输出的 staging 容器
（`<div hidden id="S:2">`）内，**不是**水合后的可见 isolate。水合后的可见
isolate 确实同时包含 `media-controller`、`video`、`ul.grid` 与 `h1 a`。
直接解析 SSR 字节会得出错误结论。
