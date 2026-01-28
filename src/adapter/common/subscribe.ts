import { local } from '../../utils/storage'

type AnimeInfo = {
  id: string
  title: string
  url: string
  thumbnail: string
  status: string
}
type AnimeMetadata = {
  createdAt: number
  updatedAt: number
  checkedAt: number
}
type AnimeEpisode = {
  current: { title: string; url: string }
  last: { title: string; url: string }
}
export type SubscribedAnime = AnimeInfo & AnimeMetadata & AnimeEpisode

export class SubscriptionManager {
  private static instances = new Map<string, SubscriptionManager>()

  constructor(private storageKey: string) {
    window.addEventListener('storage', (e) => {
      if (e.key === this.storageKey) this.notify()
    })
    window.addEventListener('popstate', () => {
      this.notify()
    })
  }

  static getInstance(storageKey: string) {
    if (!this.instances.has(storageKey)) {
      this.instances.set(storageKey, new SubscriptionManager(storageKey))
    }
    return this.instances.get(storageKey)!
  }

  // --- events ---
  private listeners: Set<(data: SubscribedAnime[]) => void> = new Set()
  onChange(
    callback: (data: SubscribedAnime[]) => void,
    options?: { immediate?: boolean }
  ) {
    this.listeners.add(callback)
    if (options?.immediate) {
      this.notify()
    }
    return () => this.listeners.delete(callback)
  }
  private notify() {
    this.listeners.forEach((cb) => cb(this.getSubscriptions()))
  }

  // --- store ---
  getSubscriptions() {
    return local.getItem<SubscribedAnime[]>(this.storageKey, [])
  }

  getSubscriptionsSortedByDay() {
    const subscriptions = this.getSubscriptions()

    // prettier-ignore
    const daysInChinese = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

    let groups = Array.from({ length: 7 }, (_, idx) => ({
      day: daysInChinese[idx],
      list: [] as SubscribedAnime[],
    }))

    subscriptions.forEach((sub) => {
      const date = new Date(sub.updatedAt)
      const day = date.getDay()

      groups[day].list.push(sub)
    })

    groups = groups.slice(1).concat(groups[0])

    return groups
  }

  getSubscription(id: string) {
    const subscriptions = this.getSubscriptions()
    return subscriptions.find((sub) => sub.id === id)
  }

  createSubscription(subscription: SubscribedAnime) {
    const subscriptions = this.getSubscriptions()
    const exists = subscriptions.some((sub) => sub.id === subscription.id)
    if (exists) {
      throw new Error('Subscription already exists')
    }
    subscriptions.push(subscription)
    local.setItem(this.storageKey, subscriptions)
    this.notify()
    return subscription
  }

  updateSubscription(id: string, updates: Partial<SubscribedAnime>) {
    const subscriptions = this.getSubscriptions()
    const index = subscriptions.findIndex((sub) => sub.id === id)
    if (index === -1) {
      throw new Error('Subscription not found')
    }
    subscriptions[index] = { ...subscriptions[index], ...updates }
    local.setItem(this.storageKey, subscriptions)
    this.notify()
    return subscriptions[index]
  }

  deleteSubscription(id: string) {
    const subscriptions = this.getSubscriptions()
    const filtered = subscriptions.filter((sub) => sub.id !== id)
    if (filtered.length === subscriptions.length) {
      throw new Error('Subscription not found')
    }
    local.setItem(this.storageKey, filtered)
    this.notify()
    return true
  }
}
