import { create } from "zustand"
import {
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
} from "date-fns"

type CalendarView = "month" | "week" | "day"

type CalendarState = {
  readonly currentDate: Date
  readonly view: CalendarView
  readonly filterChannelId: string | null
  readonly filterStatus: string | null
  readonly filterCampaignId: string | null
}

type CalendarActions = {
  readonly setCurrentDate: (date: Date) => void
  readonly setView: (view: CalendarView) => void
  readonly goToToday: () => void
  readonly navigateForward: () => void
  readonly navigateBack: () => void
  readonly setFilterChannelId: (id: string | null) => void
  readonly setFilterStatus: (status: string | null) => void
  readonly setFilterCampaignId: (id: string | null) => void
  readonly clearFilters: () => void
}

type CalendarStore = CalendarState & CalendarActions

function navigateDate(date: Date, view: CalendarView, direction: 1 | -1): Date {
  switch (view) {
    case "month":
      return direction === 1 ? addMonths(date, 1) : subMonths(date, 1)
    case "week":
      return direction === 1 ? addWeeks(date, 1) : subWeeks(date, 1)
    case "day":
      return direction === 1 ? addDays(date, 1) : subDays(date, 1)
  }
}

export const useCalendarStore = create<CalendarStore>()((set, get) => ({
  currentDate: new Date(),
  view: "month",
  filterChannelId: null,
  filterStatus: null,
  filterCampaignId: null,

  setCurrentDate: (date: Date) => set({ currentDate: date }),

  setView: (view: CalendarView) => set({ view }),

  goToToday: () => set({ currentDate: new Date() }),

  navigateForward: () => {
    const { currentDate, view } = get()
    set({ currentDate: navigateDate(currentDate, view, 1) })
  },

  navigateBack: () => {
    const { currentDate, view } = get()
    set({ currentDate: navigateDate(currentDate, view, -1) })
  },

  setFilterChannelId: (id: string | null) => set({ filterChannelId: id }),

  setFilterStatus: (status: string | null) => set({ filterStatus: status }),

  setFilterCampaignId: (id: string | null) => set({ filterCampaignId: id }),

  clearFilters: () =>
    set({
      filterChannelId: null,
      filterStatus: null,
      filterCampaignId: null,
    }),
}))
