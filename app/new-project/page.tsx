"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { ProjectForm } from "@/components/projects/project-form"
import { ProjectPreview } from "@/components/projects/project-preview"
import { EscrowSetup } from "@/components/projects/escrow-setup"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Clipboard, FileCheck, Loader2, AlertCircle, Info } from "lucide-react"
import { useFreelanceStore } from "@/stores/use-freelance-store"
import { useUPAuth } from "@/components/up-profile/up-auth-provider"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { ProjectDraft } from "@/types/project"
import type { EscrowSettings } from "@/types/escrow"

export default function NewProjectPage() {
  const router = useRouter()
  const { createProject, connectUP } = useFreelanceStore()
  const { upProfile, isAuthenticated, connect } = useUPAuth()
  const [activeTab, setActiveTab] = useState("details")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [projectData, setProjectData] = useState<ProjectDraft>({
    title: "",
    description: "",
    client: "",
    budget: 0,
  })
  const [escrowSettings, setEscrowSettings] = useState<EscrowSettings>({
    milestones: [{ title: "Project Completion", percentage: 100, description: "" }],
    releaseType: "manual",
    disputeResolution: "arbitration",
    timelock: 7,
  })

  // Synchronize UP profile with Freelance store
  useEffect(() => {
    if (upProfile) {
      connectUP(upProfile)
    }
  }, [upProfile, connectUP])

  // Attempt to connect UP if not already connected
  useEffect(() => {
    if (!upProfile && !isAuthenticated) {
      connect().catch((error) => {
        console.error("Failed to connect UP:", error)
      })
    }
  }, [upProfile, isAuthenticated, connect])

  const handleProjectDataChange = (data: Partial<ProjectDraft>) => {
    setProjectData((prev) => ({ ...prev, ...data }))
  }

  const handleEscrowSettingsChange = (settings: Partial<EscrowSettings>) => {
    setEscrowSettings((prev) => ({ ...prev, ...settings }))
  }

  const isFormValid = () => {
    return (
      projectData.title.trim() !== "" &&
      projectData.description.trim() !== "" &&
      projectData.client.trim() !== "" &&
      projectData.budget > 0 &&
      escrowSettings.milestones.length > 0 &&
      escrowSettings.milestones.every((m) => m.title.trim() !== "")
    )
  }

  const handleSubmit = async () => {
    if (!upProfile) {
      toast.error("Please connect your Universal Profile before creating a project")
      return
    }

    if (!isFormValid()) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      // Ensure the profile is synchronized with the store
      connectUP(upProfile)

      // Create the project with escrow settings
      await createProject({
        ...projectData,
        escrowSettings,
      })

      toast.success("Project creation initiated! You'll be redirected once the transaction is confirmed.")

      // Show a toast with blockchain information
      toast.info(
        <div className="flex flex-col gap-1">
          <p className="font-medium">Transaction submitted to blockchain</p>
          <p className="text-xs">This will create a real escrow contract on the LUKSO blockchain.</p>
          <p className="text-xs">The process may take a few minutes to complete.</p>
        </div>,
        { duration: 10000 },
      )

      // Redirect to home page after a short delay
      setTimeout(() => {
        router.push("/")
      }, 3000)
    } catch (error) {
      console.error("Error creating project:", error)
      toast.error("Failed to create project: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConnectUP = async () => {
    try {
      const success = await connect()
      if (success && upProfile) {
        connectUP(upProfile)
        toast.success("Universal Profile connected successfully!")
      }
    } catch (error) {
      toast.error("Failed to connect Universal Profile")
    }
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Create New Project</h1>
        </div>

        <Alert variant="warning" className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Real Blockchain Integration</AlertTitle>
          <AlertDescription>
            This form will create a real escrow contract on the LUKSO blockchain. Make sure you have LUKSO tokens in
            your wallet to cover gas fees and the project budget.
          </AlertDescription>
        </Alert>

        {!upProfile && (
          <Alert variant="warning" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Universal Profile Required</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <p>You need to connect your Universal Profile before creating a project.</p>
              <Button onClick={handleConnectUP} variant="outline" className="w-fit">
                Connect Universal Profile
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <motion.div
            className="lg:col-span-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details" className="flex items-center gap-2">
                  <Clipboard className="h-4 w-4" />
                  Project Details
                </TabsTrigger>
                <TabsTrigger value="escrow" className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Escrow Setup
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-4">
                <ProjectForm
                  projectData={projectData}
                  onChange={handleProjectDataChange}
                  onNext={() => setActiveTab("escrow")}
                />
              </TabsContent>

              <TabsContent value="escrow" className="mt-4">
                <EscrowSetup
                  settings={escrowSettings}
                  onChange={handleEscrowSettingsChange}
                  projectBudget={projectData.budget}
                />

                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setActiveTab("details")}>
                    Back to Details
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting || !isFormValid() || !upProfile}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Contract...
                      </>
                    ) : (
                      "Create Project"
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>

          <motion.div
            className="lg:col-span-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <ProjectPreview projectData={projectData} escrowSettings={escrowSettings} />
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}
