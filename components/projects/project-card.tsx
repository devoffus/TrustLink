"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Clock, DollarSign, ExternalLink } from "lucide-react"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import type { Project } from "@/types/project"

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
    >
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{project.title}</CardTitle>
              <CardDescription>{project.client}</CardDescription>
            </div>
            <Badge variant={getStatusVariant(project.status)}>{project.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
          <div className="flex justify-between text-sm">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
              <span>{formatDate(project.deadline)}</span>
            </div>
            <div className="flex items-center font-medium">
              <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
              <span>{project.budget}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href={`/project/${project.id}`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

function getStatusVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  switch (status.toLowerCase()) {
    case "active":
      return "default"
    case "completed":
      return "secondary"
    case "disputed":
      return "destructive"
    default:
      return "outline"
  }
}
