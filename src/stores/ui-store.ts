import { create } from "zustand"
import { persist } from "zustand/middleware"

type UiState = {
  readonly sidebarCollapsed: boolean
}

type UiActions = {
  readonly toggleSidebar: () => void
  readonly setSidebarCollapsed: (value: boolean) => void
}

type UiStore = UiState & UiActions

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (value: boolean) =>
        set({ sidebarCollapsed: value }),
    }),
    {
      name: "hitschies-ui",
    }
  )
)
