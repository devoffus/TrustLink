"use client"

import { Home, User, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"

export function MobileNavigation() {
  return (
    <motion.nav
      className="bg-background border-t border-border p-2"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex justify-around items-center">
        <Button variant="ghost" size="icon" aria-label="Projects" asChild>
          <Link href="/">
            <Home className="h-5 w-5" />
          </Link>
        </Button>

        <Button
          variant="default"
          size="icon"
          className="rounded-full bg-primary text-primary-foreground"
          aria-label="New Project"
          asChild
        >
          <Link href="/new-project">
            <Plus className="h-5 w-5" />
          </Link>
        </Button>

        <Button variant="ghost" size="icon" aria-label="Profile" asChild>
          <Link href="/profile">
            <User className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </motion.nav>
  )
}
