"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CalendarIcon,
  CheckCircle2,
  Clock,
  DollarSign,
  ExternalLink,
  MoreHorizontal,
  PauseCircle,
  Share2,
  Shield,
  User,
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { getAddressUrl } from "@/lib/lukso/lukso-sdk"
import type { Project } from "@/types/project"

interface ProjectHeaderProps {
  project: Project
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  // Calculate project progress based on milestones
  const calculateProgress = () => {
    if (!project.escrowSettings?.milestones?.length) return 0

    // For demo purposes, we'll just return a random progress
    // In a real app, this would be based on completed milestones
    return Math.floor(Math.random() * 100)
  }

  const progress = calculateProgress()

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{project.title}</h1>
              <Badge variant={getStatusVariant(project.status)}>{project.status}</Badge>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>Client: {project.client}</span>
              </div>

              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                <span>{project.budget} LUKSO</span>
              </div>

              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                <span>Deadline: {formatDate(project.deadline)}</span>
              </div>

              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                <span>
                  {project.escrowSettings?.disputeResolution === "arbitration" && "Arbitration"}
                  {project.escrowSettings?.disputeResolution === "multisig" && "Multi-signature"}
                  {project.escrowSettings?.disputeResolution === "dao" && "DAO Voting"}
                </span>
              </div>
            </div>

            <div className="flex items-center text-xs">
              <span className="font-mono text-muted-foreground">
                Contract: {project.txHash.substring(0, 10)}...{project.txHash.substring(project.txHash.length - 8)}
              </span>
              <a
                href={getAddressUrl(project.txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-primary hover:underline inline-flex items-center"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View on Explorer
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark as Complete
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <PauseCircle className="h-4 w-4 mr-2" />
                  Pause Project
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowCancelDialog(true)} className="text-destructive">
                  Cancel Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Project Progress</span>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />

          <div className="flex items-center justify-end mt-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            <span>{getRemainingTimeText(project.deadline)}</span>
          </div>
        </div>
      </CardContent>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this project? This action will initiate the dispute resolution process and
              may affect your reputation score.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep project</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground">
              Yes, cancel project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
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

function getRemainingTimeText(deadline: string): string {
  try {
    const deadlineDate = new Date(deadline)
    const now = new Date()

    if (isNaN(deadlineDate.getTime())) {
      return "No deadline set"
    }

    if (deadlineDate < now) {
      return "Deadline passed"
    }

    const diffTime = Math.abs(deadlineDate.getTime() - now.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      return "1 day remaining"
    }
    return `${diffDays} days remaining`
  } catch (error) {
    console.error("Error calculating remaining time:", error)
    return "Unknown deadline"
  }
}
