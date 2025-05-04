import { Home, User, Plus, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"

export function DesktopNavigation() {
  return (
    <div className="border-b border-border">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-1">
          <Link href="/" className="font-bold text-xl text-primary">
            TrustLink
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Projects
            </Link>
          </Button>

          <Button variant="ghost" size="sm" asChild>
            <Link href="/profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </Link>
          </Button>

          <Button variant="default" size="sm" asChild>
            <Link href="/new-project">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Link>
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <ThemeToggle />

        </div>
      </div>
    </div>
  )
}
