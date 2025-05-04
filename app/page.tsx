"use client"

import { AnimatePresence, motion } from "framer-motion"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { UPProfileCard } from "@/components/up-profile/up-profile-card"
import { ProjectList } from "@/components/projects/project-list"
import { ConnectUPButton } from "@/components/up-profile/connect-up-button"
import { UPAssetsList } from "@/components/up-profile/up-assets-list"
import { useUPAuth } from "@/components/up-profile/up-auth-provider"

export default function Home() {
  const { upProfile, isAuthenticated } = useUPAuth()

  return (
    <AnimatePresence mode="wait">
      <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen">
        <DashboardLayout>
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8">TrustLink</h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* UP Profile Section - Left side on desktop */}
              <div className="lg:col-span-4 space-y-6">
                <ConnectUPButton />
                <UPProfileCard />
                {upProfile && isAuthenticated && <UPAssetsList />}
              </div>

              {/* Projects Section - Right side on desktop */}
              <div className="lg:col-span-8">
                <ProjectList />
              </div>
            </div>
          </div>
        </DashboardLayout>
      </motion.main>
    </AnimatePresence>
  )
}
