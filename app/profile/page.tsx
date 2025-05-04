"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { UPProfileCard } from "@/components/up-profile/up-profile-card"
import { UPAssetsList } from "@/components/up-profile/up-assets-list"
import { ConnectUPButton } from "@/components/up-profile/connect-up-button"
import { TransactionHistory } from "@/components/transactions/transaction-history"
import { SkillVerification } from "@/components/skills/skill-verification"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUPAuth } from "@/components/up-profile/up-auth-provider"
import { motion } from "framer-motion"

export default function ProfilePage() {
  const { upProfile, isAuthenticated } = useUPAuth()
  const [activeTab, setActiveTab] = useState("skills")

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Profile & Skills</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Profile Section - Left side on desktop */}
          <div className="lg:col-span-4 space-y-6">
            <ConnectUPButton />
            <UPProfileCard />
            {upProfile && isAuthenticated && <UPAssetsList />}
          </div>

          {/* Main Content - Right side on desktop */}
          <motion.div
            className="lg:col-span-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {upProfile && isAuthenticated ? (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="skills">Skills & Verification</TabsTrigger>
                  <TabsTrigger value="transactions">Transaction History</TabsTrigger>
                </TabsList>
                <TabsContent value="skills" className="mt-6">
                  <SkillVerification />
                </TabsContent>
                <TabsContent value="transactions" className="mt-6">
                  <TransactionHistory />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12 border rounded-md bg-muted/20">
                <h2 className="text-xl font-medium mb-2">Connect Your Universal Profile</h2>
                <p className="text-muted-foreground mb-6">
                  Connect your Universal Profile to view your skills and transaction history
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}
