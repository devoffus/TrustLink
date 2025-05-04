"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, DollarSign, FileText, Milestone, PlusCircle, ShieldAlert } from "lucide-react"
import type { ProjectActivity } from "@/types/activity"

interface ActivityTimelineProps {
  activities: ProjectActivity[]
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
        <CardDescription>History of project events and transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No activity recorded yet</div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="relative pl-8">
                <div className="absolute left-0 top-0 flex items-center justify-center">
                  <div className={`rounded-full p-1.5 ${getActivityTypeColor(activity.type)}`}>
                    {getActivityTypeIcon(activity.type)}
                  </div>
                  {/* Vertical line connecting events */}
                  {activities.indexOf(activity) !== activities.length - 1 && (
                    <div className="absolute top-8 left-1/2 w-0.5 h-8 -ml-px bg-border" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{getActivityTitle(activity)}</h4>
                    <Badge variant="outline" className="text-xs">
                      {formatActivityDate(activity.timestamp)}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mt-1">{getActivityDescription(activity)}</p>

                  {activity.type === "escrow_funded" && (
                    <div className="mt-2 bg-muted/30 rounded-md p-2 text-sm">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>
                          Amount: {activity.data.amount} {activity.data.currency}
                        </span>
                      </div>
                    </div>
                  )}

                  {activity.type === "milestone_started" && (
                    <div className="mt-2 bg-muted/30 rounded-md p-2 text-sm">
                      <div className="flex items-center">
                        <Milestone className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>
                          {activity.data.milestoneName} ({activity.data.percentage}%)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function getActivityTypeIcon(type: string) {
  switch (type) {
    case "project_created":
      return <PlusCircle className="h-4 w-4" />
    case "escrow_funded":
      return <DollarSign className="h-4 w-4" />
    case "milestone_started":
      return <Milestone className="h-4 w-4" />
    case "milestone_completed":
      return <CheckCircle2 className="h-4 w-4" />
    case "funds_released":
      return <DollarSign className="h-4 w-4" />
    case "dispute_opened":
      return <ShieldAlert className="h-4 w-4" />
    case "note_added":
      return <FileText className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

function getActivityTypeColor(type: string): string {
  switch (type) {
    case "project_created":
      return "bg-primary/10 text-primary"
    case "escrow_funded":
      return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
    case "milestone_started":
      return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
    case "milestone_completed":
      return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
    case "funds_released":
      return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
    case "dispute_opened":
      return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
    case "note_added":
      return "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function getActivityTitle(activity: ProjectActivity): string {
  switch (activity.type) {
    case "project_created":
      return "Project Created"
    case "escrow_funded":
      return "Escrow Funded"
    case "milestone_started":
      return "Milestone Started"
    case "milestone_completed":
      return "Milestone Completed"
    case "funds_released":
      return "Funds Released"
    case "dispute_opened":
      return "Dispute Opened"
    case "note_added":
      return "Note Added"
    default:
      return "Activity Recorded"
  }
}

function getActivityDescription(activity: ProjectActivity): string {
  switch (activity.type) {
    case "project_created":
      return "The project was created and the escrow contract was deployed."
    case "escrow_funded":
      return `The escrow contract was funded with ${activity.data.amount} ${activity.data.currency}.`
    case "milestone_started":
      return `Work began on milestone "${activity.data.milestoneName}".`
    case "milestone_completed":
      return `Milestone "${activity.data.milestoneName}" was marked as completed.`
    case "funds_released":
      return `Funds were released for milestone "${activity.data.milestoneName}".`
    case "dispute_opened":
      return `A dispute was opened regarding "${activity.data.reason}".`
    case "note_added":
      return `A note was added to the project: "${activity.data.notePreview}..."`
    default:
      return "An activity was recorded on the project."
  }
}

function formatActivityDate(timestamp: string): string {
  try {
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) {
      return "Unknown date"
    }

    // If it's today, show time
    const today = new Date()
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    }

    // If it's yesterday
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    }

    // Otherwise show date
    return date.toLocaleDateString([], { month: "short", day: "numeric" })
  } catch (error) {
    console.error("Error formatting activity date:", error)
    return "Unknown date"
  }
}
