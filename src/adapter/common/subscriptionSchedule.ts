import { template } from 'lodash-es'
import { gm } from '../../utils/storage'
import { SubscribedAnime, SubscriptionManager } from './subscribe'
import T from './subscriptionSchedule.template.html'
import './subscriptionSchedule.scss'

type ScheduleItem = { sub: SubscribedAnime; time: string | null }
type ScheduleResolution = { dayNum?: number; time?: string | null }
type SubscriptionView = 'list' | 'schedule'
type SubscriptionViewOptions = {
  resolveSchedule?: (sub: SubscribedAnime) => ScheduleResolution | undefined
  onViewChange?: (view: SubscriptionView) => void
  labels?: { current: string; last: string }
}

function enableScheduleDragging(scroll: HTMLElement) {
  let start: { pointerId: number; x: number; scrollLeft: number } | undefined
  let dragged = false

  scroll.addEventListener('pointerdown', (event) => {
    if (
      !event.isPrimary ||
      event.pointerType === 'touch' ||
      event.button !== 0 ||
      scroll.scrollWidth <= scroll.clientWidth
    )
      return
    start = {
      pointerId: event.pointerId,
      x: event.clientX,
      scrollLeft: scroll.scrollLeft,
    }
    dragged = false
  })

  scroll.addEventListener('pointermove', (event) => {
    if (!start || event.pointerId !== start.pointerId) return
    if (!(event.buttons & 1)) {
      start = undefined
      dragged = false
      scroll.classList.remove('is-dragging')
      return
    }
    const distance = event.clientX - start.x
    if (!dragged && Math.abs(distance) < 6) return
    if (!dragged) {
      dragged = true
      scroll.classList.add('is-dragging')
      scroll.setPointerCapture(event.pointerId)
    }
    event.preventDefault()
    scroll.scrollLeft = start.scrollLeft - distance
  })

  const endDrag = (event: PointerEvent) => {
    if (!start || event.pointerId !== start.pointerId) return
    start = undefined
    scroll.classList.remove('is-dragging')
    if (dragged) window.setTimeout(() => (dragged = false), 0)
  }
  scroll.addEventListener('pointerup', endDrag)
  scroll.addEventListener('pointercancel', endDrag)
  scroll.addEventListener('lostpointercapture', endDrag)
  scroll.addEventListener('dragstart', (event) => event.preventDefault())
  scroll.addEventListener(
    'click',
    (event) => {
      if (!dragged) return
      event.preventDefault()
      event.stopPropagation()
    },
    true
  )
}

function observeScheduleIndicator(
  scroll: HTMLElement,
  indicator: HTMLElement,
  onResize: () => void
) {
  const thumb = indicator.querySelector<HTMLElement>(
    '.k-schedule-indicator-thumb'
  )
  if (!thumb) throw new Error('Schedule indicator thumb not found')

  const update = () => {
    const { clientWidth, scrollWidth } = scroll
    const maxScroll = Math.max(0, scrollWidth - clientWidth)
    indicator.hidden = clientWidth === 0 || maxScroll <= 1
    if (indicator.hidden) return

    const left = Math.max(0, Math.min(scroll.scrollLeft, maxScroll))
    thumb.style.width = `${(clientWidth / scrollWidth) * 100}%`
    thumb.style.left = `${(left / scrollWidth) * 100}%`
  }

  const observer = new ResizeObserver(() => {
    onResize()
    update()
  })
  observer.observe(scroll)
  if (scroll.firstElementChild) observer.observe(scroll.firstElementChild)
  scroll.addEventListener('scroll', update, { passive: true })
  update()

  return {
    update,
    dispose: () => {
      observer.disconnect()
      scroll.removeEventListener('scroll', update)
    },
  }
}

function getSubscriptionSchedule(
  subscriptions: SubscribedAnime[],
  resolveSchedule?: SubscriptionViewOptions['resolveSchedule']
) {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const today = new Date()
  const todayIndex = (today.getDay() + 6) % 7
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    )
    date.setDate(date.getDate() + index - todayIndex)
    return {
      date: `${String(date.getMonth() + 1).padStart(2, '0')}-${String(
        date.getDate()
      ).padStart(2, '0')}`,
      weekday: weekdays[date.getDay()],
      dayNum: date.getDay(),
      isToday: index === todayIndex,
      list: [] as ScheduleItem[],
    }
  })
  const unscheduled: ScheduleItem[] = []
  const completed: ScheduleItem[] = []

  subscriptions.forEach((sub) => {
    const status = sub.status?.trim() || ''
    if (/完结/.test(status)) {
      completed.push({ sub, time: null })
      return
    }

    const resolved = resolveSchedule?.(sub)
    let dayNum = resolved?.dayNum
    let time: string | null = resolved?.time ?? null

    if (dayNum === undefined) {
      const match = status.match(
        /周([日天一二三四五六])(?:\s*(\d{1,2})[:：](\d{2}))?/
      )
      if (!match) {
        unscheduled.push({ sub, time: null })
        return
      }
      dayNum = '日一二三四五六'.indexOf(match[1] === '天' ? '日' : match[1])
      if (match[2] !== undefined) {
        const hour = Number(match[2])
        const minute = Number(match[3])
        if (hour >= 48 || minute >= 60) {
          unscheduled.push({ sub, time: null })
          return
        }
        dayNum = (dayNum + Math.floor(hour / 24)) % 7
        time = `${String(hour % 24).padStart(2, '0')}:${match[3]}`
      }
    }

    if (!Number.isInteger(dayNum) || dayNum! < 0 || dayNum! > 6) {
      unscheduled.push({ sub, time: null })
      return
    }
    days.find((day) => day.dayNum === dayNum)!.list.push({ sub, time })
  })

  days.forEach((day) => {
    day.list.sort((a, b) =>
      (a.time || '99:99').localeCompare(b.time || '99:99')
    )
  })
  return { days, unscheduled, completed }
}

export function createSubscriptionView(
  $root: JQuery,
  sm: SubscriptionManager,
  storageKey: string,
  listTemplate: string,
  options: SubscriptionViewOptions = {}
) {
  $root.find('[data-subscription-view-switch]').replaceWith(T.viewSwitch)
  const itemTemplate = template(
    T.subScheduleItem.replace(' id="subScheduleItem"', '')
  )
  const labels = options.labels || { current: '看至', last: '最新' }
  const renderScheduleItem = (data: {
    item: ScheduleItem
    isUnscheduled: boolean
  }) => itemTemplate({ ...data, labels })
  let view: SubscriptionView =
    gm.getItem<SubscriptionView>(storageKey) === 'list' ? 'list' : 'schedule'
  let indicatorObserver: ReturnType<typeof observeScheduleIndicator> | undefined
  let pendingToday = false

  const positionToday = () => {
    if (!pendingToday) return
    const scroll = $root.find<HTMLElement>('.k-schedule-scroll')[0]
    const today = scroll?.querySelector<HTMLElement>('.is-today')
    if (!scroll?.isConnected || !scroll.clientWidth || !today) return
    const todayRect = today.getBoundingClientRect()
    if (!todayRect.width) return
    const left =
      todayRect.left - scroll.getBoundingClientRect().left + scroll.scrollLeft
    scroll.scrollTo({ left, behavior: 'instant' })
    pendingToday = false
  }

  const render = () => {
    $root.toggleClass('k-schedule-view', view === 'schedule')
    $root.find('[data-subscription-view]').each((_, button) => {
      const active = $(button).attr('data-subscription-view') === view
      $(button).attr('aria-pressed', String(active))
    })
    options.onViewChange?.(view)
    const previousScroll = $root.find<HTMLElement>('.k-schedule-scroll')[0]
    const scrollLeft = previousScroll?.scrollLeft || 0
    if (view === 'schedule' && !previousScroll) pendingToday = true
    if (view === 'list') pendingToday = false
    indicatorObserver?.dispose()
    indicatorObserver = undefined
    if (view === 'schedule') {
      const subscriptions = sm.getSubscriptions()
      const schedule = getSubscriptionSchedule(
        subscriptions,
        options.resolveSchedule
      )
      $root.find('#subList, #subSchedule').replaceWith(
        template(T.subSchedule)({
          ...schedule,
          isEmpty: subscriptions.length === 0,
          renderItem: renderScheduleItem,
        })
      )
      const scroll = $root.find<HTMLElement>('.k-schedule-scroll')[0]
      const indicator = $root.find<HTMLElement>('.k-schedule-indicator')[0]
      if (scroll && indicator) {
        enableScheduleDragging(scroll)
        scroll.scrollTo({ left: scrollLeft, behavior: 'instant' })
        positionToday()
        indicatorObserver = observeScheduleIndicator(
          scroll,
          indicator,
          positionToday
        )
      }
    } else {
      const groups = sm.getSubscriptionsGroupByDay()
      const list = groups.reduce((items, group) => {
        items.push(...group.list)
        return items
      }, [] as (typeof groups)[number]['list'])
      $root
        .find('#subList, #subSchedule')
        .replaceWith(template(listTemplate)({ list, groups }))
    }
  }

  const onSwitch = (event: JQuery.ClickEvent) => {
    const nextView = $(event.currentTarget).attr('data-subscription-view')
    if (nextView !== 'list' && nextView !== 'schedule') return
    if (view === nextView) return
    view = nextView
    gm.setItem(storageKey, view)
    render()
  }
  $root.on('click', '[data-subscription-view]', onSwitch)

  return {
    render,
    getView: () => view,
    onMount: () => {
      positionToday()
      indicatorObserver?.update()
    },
    dispose: () => {
      indicatorObserver?.dispose()
      $root.off('click', '[data-subscription-view]', onSwitch)
    },
  }
}
