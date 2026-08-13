import { concurrency } from '../../utils/concurrency'
import { SubscribedAnime, SubscriptionManager } from './subscribe'

const ICON_SUBSCRIBE = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 -960 960 960"  fill="currentColor" style="display: inline-block; vertical-align: -0.125em;"><path d="M480-500Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80Zm240-360v-120H600v-80h120v-120h80v120h120v80H800v120h-80ZM160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q14 4 27.5 8.5T593-772q-15 14-27 30.5T545-706q-15-7-31.5-10.5T480-720q-66 0-113 47t-47 113v280h320v-112q18 11 38 18t42 11v83h80v80H160Z"/></svg>`
const ICON_SUBSCRIBED = `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 -960 960 960"  fill="currentColor" style="display: inline-block; vertical-align: -0.125em;"><path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z"/></svg>`

export interface SubscribeConfig {
  renderSubscribedAnimes: (sm: SubscriptionManager) => JQuery
  renderSubscribeBtn: (
    $btn: JQuery<HTMLButtonElement>,
    sm: SubscriptionManager
  ) => void
  getId: () => string
  storageKey: string
  getAnimeInfo: (
    id: string,
    sm: SubscriptionManager
  ) => Promise<SubscribedAnime>
}

interface Config {
  subscribe: SubscribeConfig
  getCurrent: () =>
    | { title: string; url: string }
    | Promise<{ title: string; url: string }>
}

export function defineSubscribe(config: Config) {
  let stopSyncSubscribeBtn: (() => void) | undefined

  async function checkSubscriptionUpdate(id: string, force = false) {
    const sm = SubscriptionManager.getInstance(config.subscribe.storageKey)
    const sub = sm.getSubscription(id)
    if (!sub) return

    const now = Date.now()
    if (!force) {
      // 15天内没有更新过的跳过
      if (sub.checkedAt - sub.updatedAt > 1000 * 60 * 60 * 24 * 15) return
      // 近一周内更新过了
      if (now - sub.updatedAt < 1000 * 60 * 60 * (24 * 7 - 5)) return
      // 一小时内检查过了
      if (now - sub.checkedAt < 1000 * 60 * 60) return
    }

    const animeInfo = await config.subscribe.getAnimeInfo(id, sm)
    Object.assign(animeInfo, { checkedAt: now })
    sm.updateSubscription(id, animeInfo)
  }

  async function onCanPlay() {
    const sm = SubscriptionManager.getInstance(config.subscribe.storageKey)
    const id = config.subscribe.getId()
    if (!id || !sm.getSubscription(id)) return

    sm.updateSubscription(id, { current: await config.getCurrent() })

    // 进入页面必须要检查更新，防止错过更新
    await checkSubscriptionUpdate(id, true)
  }

  function renderSubscribedAnimes() {
    const sm = SubscriptionManager.getInstance(config.subscribe.storageKey)
    const $root = config.subscribe.renderSubscribedAnimes(sm)
    const $updateInfo = $root.find('.update-info')

    let isCheckingUpdate = false
    async function checkSubscriptionsUpdate(force = false) {
      if (isCheckingUpdate) return
      isCheckingUpdate = true
      try {
        const subscriptions = sm.getSubscriptions()
        const tasks = subscriptions.map(
          (sub) => () => checkSubscriptionUpdate(sub.id, force)
        )
        await concurrency(tasks, 3, (done, total) => {
          $updateInfo.text(`更新中(${done}/${total})`)
        })
        $updateInfo.text(`于 ${new Date().toLocaleTimeString()} 完成更新检查`)
      } finally {
        isCheckingUpdate = false
      }
    }

    $updateInfo.off('click').on('click', () => {
      checkSubscriptionsUpdate(true)
    })

    checkSubscriptionsUpdate()
  }

  function renderSubscribeBtn() {
    const $btn = $<HTMLButtonElement>('<button></button>')
    const sm = SubscriptionManager.getInstance(config.subscribe.storageKey)
    const id = config.subscribe.getId()

    stopSyncSubscribeBtn?.()
    stopSyncSubscribeBtn = sm.onChange(
      () => {
        const sub = sm.getSubscription(id)
        $btn.html(`
          ${sub ? ICON_SUBSCRIBED : ICON_SUBSCRIBE}
            <span>${sub ? '已订阅' : '订阅'}</span>
         `)
      },
      { immediate: true }
    )

    $btn.on('click', async () => {
      $btn.text('处理中...')
      const sub = sm.getSubscription(id)

      if (sub) {
        sm.deleteSubscription(id)
      } else {
        const nextSub = await config.subscribe.getAnimeInfo(id, sm)
        sm.createSubscription(nextSub)
      }
    })

    config.subscribe.renderSubscribeBtn($btn, sm)
  }

  return {
    onCanPlay,
    renderSubscribedAnimes,
    renderSubscribeBtn,
    checkSubscriptionUpdate,
  }
}
