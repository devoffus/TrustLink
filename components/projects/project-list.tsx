"use client"

import { useFreelanceStore } from "@/stores/use-freelance-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { ProjectCard } from "./project-card"
import { EmptyProjectsState } from "./empty-projects-state"

export function ProjectList() {
  const { activeProjects, upProfile } = useFreelanceStore()

  // If no profile is connected, show a message
  if (!upProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>Connect your Universal Profile to view and manage your projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Skeleton className="h-[300px] w-full rounded-md" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // If no projects, show empty state
  if (activeProjects.length === 0) {
    return <EmptyProjectsState />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Projects</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        {activeProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </motion.div>
    </div>
  )
}
