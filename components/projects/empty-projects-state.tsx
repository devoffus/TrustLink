"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Briefcase, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export function EmptyProjectsState() {
  const router = useRouter()

  const onCreateNewProject = () => {
    router.push("/new-project")
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects</CardTitle>
        <CardDescription>Create or join projects to start collaborating</CardDescription>
      </CardHeader>
      <CardContent>
        <motion.div
          className="flex flex-col items-center justify-center py-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Briefcase className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-medium mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Start by creating a new project or wait for invitations from clients
          </p>
          <Button onClick={onCreateNewProject}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Project
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  )
}
