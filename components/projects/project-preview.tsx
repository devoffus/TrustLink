"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, Clock, DollarSign, LockIcon, Milestone } from "lucide-react"
import { format } from "date-fns"
import type { ProjectDraft } from "@/types/project"
import type { EscrowSettings } from "@/types/escrow"

interface ProjectPreviewProps {
  projectData: ProjectDraft
  escrowSettings: EscrowSettings
}

export function ProjectPreview({ projectData, escrowSettings }: ProjectPreviewProps) {
  const { title, description, client, budget, deadline } = projectData

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="sticky top-24">
      <Card className="overflow-hidden">
        <CardHeader className="bg-primary/5 pb-4">
          <CardTitle>Project Preview</CardTitle>
          <CardDescription>How your project will appear once created</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold">{title || "Project Title"}</h3>
              <p className="text-sm text-muted-foreground mt-1">Client: {client || "Client Name"}</p>
            </div>

            <div>
              <p className="text-sm line-clamp-3">{description || "Project description will appear here..."}</p>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="font-medium">{budget > 0 ? `${budget} LUKSO` : "Budget"}</span>
              </div>

              {deadline && (
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span>{deadline ? format(new Date(deadline), "MMM d, yyyy") : "No deadline"}</span>
                </div>
              )}

              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>Timelock: {escrowSettings.timelock} days</span>
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium flex items-center">
                  <LockIcon className="h-4 w-4 mr-1" />
                  Escrow Contract
                </h4>
                <Badge variant="outline">
                  {escrowSettings.releaseType === "manual" ? "Manual Release" : "Auto Release"}
                </Badge>
              </div>

              <div className="space-y-4 mt-4">
                <h4 className="text-sm font-medium flex items-center">
                  <Milestone className="h-4 w-4 mr-1" />
                  Payment Milestones
                </h4>

                {escrowSettings.milestones.map((milestone, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{milestone.title || `Milestone ${index + 1}`}</span>
                      <span className="font-medium">{milestone.percentage}%</span>
                    </div>
                    <Progress value={milestone.percentage} className="h-1.5" />
                    {milestone.description && (
                      <p className="text-xs text-muted-foreground mt-1">{milestone.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-secondary/10 -mx-6 -mb-6 mt-4 px-6 py-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Dispute Resolution</span>
                <Badge variant="secondary">
                  {escrowSettings.disputeResolution === "arbitration" && "Arbitration"}
                  {escrowSettings.disputeResolution === "multisig" && "Multi-signature"}
                  {escrowSettings.disputeResolution === "dao" && "DAO Voting"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
