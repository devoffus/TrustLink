"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { ProjectHeader } from "@/components/projects/project-header"
import { ProjectOverview } from "@/components/projects/project-overview"
import { EscrowStatus } from "@/components/projects/escrow-status"
import { ActivityTimeline } from "@/components/projects/activity-timeline"
import { ProjectNotes } from "@/components/projects/project-notes"
import { DisputeResolution } from "@/components/projects/dispute-resolution"
import { ClientInvitation } from "@/components/invitations/client-invitation"
import { FileAttachment } from "@/components/files/file-attachment"
import { MilestoneVerification } from "@/components/milestones/milestone-verification"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useFreelanceStore } from "@/stores/use-freelance-store"
import { useUPAuth } from "@/components/up-profile/up-auth-provider"
import { toast } from "sonner"
import type { Project } from "@/types/project"
import type { ProjectActivity } from "@/types/activity"

export default function ProjectDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { upProfile } = useUPAuth()
  const projectId = params.id as string
  const { activeProjects } = useFreelanceStore()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<ProjectActivity[]>([])

  // For demo purposes, we'll assume the current user is the freelancer
  // In a real app, this would be determined by comparing the user's address with project roles
  const userRole = "freelancer"

  useEffect(() => {
    // Find the project in the store
    const foundProject = activeProjects.find((p) => p.id === projectId)
    if (foundProject) {
      setProject(foundProject)

      // Generate mock activities for the project
      const mockActivities: ProjectActivity[] = [
        {
          id: "act-1",
          type: "project_created",
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          data: { projectId: foundProject.id },
        },
        {
          id: "act-2",
          type: "escrow_funded",
          timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          data: { amount: foundProject.budget, currency: "LUKSO" },
        },
      ]

      // Add milestone activities if the project has escrow settings
      if (foundProject.escrowSettings?.milestones) {
        foundProject.escrowSettings.milestones.forEach((milestone, index) => {
          if (index === 0) {
            // First milestone started
            mockActivities.push({
              id: `act-${3 + index}`,
              type: "milestone_started",
              timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              data: {
                milestoneId: index.toString(),
                milestoneName: milestone.title,
                percentage: milestone.percentage,
              },
            })
          }
        })
      }

      // Sort activities by timestamp (newest first)
      setActivities(mockActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()))
    } else {
      toast.error("Project not found")
      router.push("/")
    }
    setLoading(false)
  }, [projectId, activeProjects, router])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => router.push("/")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
            <p className="text-muted-foreground">
              The project you're looking for doesn't exist or you don't have access to it.
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.push("/")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <ProjectHeader project={project} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 space-y-8">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid grid-cols-7 mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="escrow">Escrow</TabsTrigger>
                  <TabsTrigger value="milestones">Milestones</TabsTrigger>
                  <TabsTrigger value="files">Files</TabsTrigger>
                  <TabsTrigger value="invitations">Invitations</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <ProjectOverview project={project} />
                </TabsContent>

                <TabsContent value="escrow" className="space-y-4">
                  <EscrowStatus project={project} />
                </TabsContent>

                <TabsContent value="milestones" className="space-y-4">
                  <MilestoneVerification project={project} userRole={userRole} />
                </TabsContent>

                <TabsContent value="files" className="space-y-4">
                  <FileAttachment projectId={project.id} />
                </TabsContent>

                <TabsContent value="invitations" className="space-y-4">
                  <ClientInvitation />
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  <ActivityTimeline activities={activities} />
                </TabsContent>

                <TabsContent value="notes" className="space-y-4">
                  <ProjectNotes projectId={project.id} />
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-8">
              <DisputeResolution project={project} />
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
