"use client"

import { useCallback } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { AppHeader } from "@/components/layout/app-header"
import { Toaster } from "@/components/ui/sonner"
import { useUiStore } from "@/stores/ui-store"

export function AuthShell({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed)
  const setSidebarCollapsed = useUiStore((s) => s.setSidebarCollapsed)
  const handleOpenChange = useCallback(
    (open: boolean) => setSidebarCollapsed(!open),
    [setSidebarCollapsed]
  )

  return (
    <SidebarProvider
      defaultOpen={!sidebarCollapsed}
      open={!sidebarCollapsed}
      onOpenChange={handleOpenChange}
    >
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
      <Toaster />
    </SidebarProvider>
  )
}
