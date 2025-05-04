import type { ReactNode } from "react"
import { MobileNavigation } from "./mobile-navigation"
import { DesktopNavigation } from "./desktop-navigation"
import { ErrorBoundary } from "@/components/error-boundary"
import { UniversalFallback } from "@/components/universal-fallback"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ErrorBoundary fallback={<UniversalFallback />}>
      <div className="min-h-screen flex flex-col">
        {/* Desktop navigation - visible on larger screens */}
        <div className="hidden md:block">
          <DesktopNavigation />
        </div>

        {/* Main content */}
        <div className="flex-1">{children}</div>

        {/* Mobile navigation - visible on smaller screens */}
        <div className="block md:hidden fixed bottom-0 left-0 right-0 z-50">
          <MobileNavigation />
        </div>
      </div>
    </ErrorBoundary>
  )
}
