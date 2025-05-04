"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
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
  CheckCircle2,
  Clock,
  DollarSign,
  FileCheck,
  FileX,
  LockIcon,
  Milestone,
  ShieldCheck,
  Upload,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { submitMilestone, approveMilestone } from "@/lib/lukso/lukso-sdk"
import type { Project } from "@/types/project"

interface EscrowStatusProps {
  project: Project
}

export function EscrowStatus({ project }: EscrowStatusProps) {
  const [selectedMilestone, setSelectedMilestone] = useState<number | null>(null)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showReleaseDialog, setShowReleaseDialog] = useState(false)
  const [deliverableNote, setDeliverableNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isReleasing, setIsReleasing] = useState(false)

  // Mock milestone statuses - in a real app, these would come from the blockchain
  const milestoneStatuses =
    project.escrowSettings?.milestones.map((_, index) => {
      if (index === 0) return "completed" // First milestone completed
      if (index === 1) return "active" // Second milestone in progress
      return "pending" // Rest are pending
    }) || []

  const handleSubmitDeliverable = async () => {
    if (!deliverableNote.trim()) {
      toast.error("Please provide a description of your deliverable")
      return
    }

    if (selectedMilestone === null) {
      toast.error("No milestone selected")
      return
    }

    setIsSubmitting(true)
    try {
      // Submit milestone to blockchain
      const success = await submitMilestone(project.txHash, selectedMilestone)

      if (success) {
        toast.success("Deliverable submitted successfully")
        setShowSubmitDialog(false)
        setDeliverableNote("")
      } else {
        toast.error("Failed to submit deliverable. Please try again.")
      }
    } catch (error) {
      console.error("Error submitting deliverable:", error)
      toast.error("An error occurred while submitting the deliverable")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReleaseFunds = async () => {
    if (selectedMilestone === null) {
      toast.error("No milestone selected")
      return
    }

    setIsReleasing(true)
    try {
      // Approve milestone on blockchain
      const success = await approveMilestone(project.txHash, selectedMilestone)

      if (success) {
        toast.success("Funds released successfully")
        setShowReleaseDialog(false)
      } else {
        toast.error("Failed to release funds. Please try again.")
      }
    } catch (error) {
      console.error("Error releasing funds:", error)
      toast.error("An error occurred while releasing funds")
    } finally {
      setIsReleasing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Escrow Status</CardTitle>
          <CardDescription>Current status of project funds and milestone payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-primary/10 rounded-lg p-4 flex flex-col items-center justify-center">
              <DollarSign className="h-8 w-8 text-primary mb-2" />
              <span className="text-sm font-medium">Total Budget</span>
              <span className="text-xl font-bold">{project.budget} LUKSO</span>
            </div>

            <div className="bg-secondary/10 rounded-lg p-4 flex flex-col items-center justify-center">
              <LockIcon className="h-8 w-8 text-secondary mb-2" />
              <span className="text-sm font-medium">In Escrow</span>
              <span className="text-xl font-bold">{project.budget} LUKSO</span>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 flex flex-col items-center justify-center">
              <ShieldCheck className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm font-medium">Released</span>
              <span className="text-xl font-bold">0 LUKSO</span>
            </div>
          </div>

          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Milestone className="h-5 w-5 mr-2" />
            Payment Milestones
          </h3>

          <div className="space-y-6">
            {project.escrowSettings?.milestones.map((milestone, index) => {
              const status = milestoneStatuses[index] || "pending"
              const amountPercentage = (project.budget * milestone.percentage) / 100

              return (
                <div key={index} className="relative">
                  {index > 0 && <div className="absolute top-0 left-6 -mt-6 w-0.5 h-6 bg-border" />}
                  <motion.div
                    className={`border rounded-lg p-4 ${status === "active" ? "border-primary" : "border-border"}`}
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`rounded-full p-2 ${getStatusColor(status)}`}>
                          {status === "completed" && <CheckCircle2 className="h-5 w-5" />}
                          {status === "active" && <Clock className="h-5 w-5" />}
                          {status === "pending" && <Milestone className="h-5 w-5" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{milestone.title}</h4>
                            <Badge variant={getStatusVariant(status)}>{status}</Badge>
                          </div>

                          <p className="text-sm text-muted-foreground mt-1">
                            {milestone.description || "No description provided"}
                          </p>

                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm font-medium">
                              {milestone.percentage}% ({amountPercentage.toFixed(2)} LUKSO)
                            </span>

                            {status === "active" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedMilestone(index)
                                  setShowSubmitDialog(true)
                                }}
                              >
                                <Upload className="h-3.5 w-3.5 mr-1" />
                                Submit Deliverable
                              </Button>
                            )}

                            {status === "completed" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedMilestone(index)
                                  setShowReleaseDialog(true)
                                }}
                              >
                                <DollarSign className="h-3.5 w-3.5 mr-1" />
                                Release Funds
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        {status === "completed" && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <FileCheck className="h-3.5 w-3.5 mr-1 text-green-500" />
                            <span>Verified</span>
                          </div>
                        )}

                        {status === "active" && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            <span>In Progress</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      <Progress value={status === "completed" ? 100 : status === "active" ? 50 : 0} className="h-1.5" />
                    </div>
                  </motion.div>
                </div>
              )
            })}
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/20 flex justify-between">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Release Type:</span>{" "}
            {project.escrowSettings?.releaseType === "manual" ? "Manual Approval" : "Automatic (Time-based)"}
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Timelock:</span> {project.escrowSettings?.timelock || 7} days
          </div>
        </CardFooter>
      </Card>

      {/* Submit Deliverable Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Milestone Deliverable</AlertDialogTitle>
            <AlertDialogDescription>
              Provide details about what you're delivering for this milestone. The client will review your submission.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Milestone</h4>
              <p className="text-sm">
                {selectedMilestone !== null && project.escrowSettings?.milestones[selectedMilestone]?.title}
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Deliverable Description</h4>
              <Textarea
                placeholder="Describe what you're delivering for this milestone..."
                value={deliverableNote}
                onChange={(e) => setDeliverableNote(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Attachments (Optional)</h4>
              <Button variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitDeliverable} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Deliverable"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Release Funds Dialog */}
      <AlertDialog open={showReleaseDialog} onOpenChange={setShowReleaseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Release Milestone Payment</AlertDialogTitle>
            <AlertDialogDescription>
              You're about to release the funds for this milestone. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Milestone</h4>
              <p className="text-sm">
                {selectedMilestone !== null && project.escrowSettings?.milestones[selectedMilestone]?.title}
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Amount to Release</h4>
              <p className="text-lg font-bold">
                {selectedMilestone !== null &&
                  ((project.budget * project.escrowSettings?.milestones[selectedMilestone]?.percentage!) / 100).toFixed(
                    2,
                  )}{" "}
                LUKSO
              </p>
            </div>

            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-2">
                <FileX className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <h5 className="text-sm font-medium text-amber-800 dark:text-amber-300">Important Notice</h5>
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Once released, funds will be transferred to the freelancer's wallet after the timelock period of{" "}
                    {project.escrowSettings?.timelock || 7} days.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReleaseFunds} disabled={isReleasing}>
              {isReleasing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Release Funds"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function getStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
    case "active":
      return "bg-primary/10 text-primary"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function getStatusVariant(status: string): "default" | "secondary" | "outline" {
  switch (status) {
    case "completed":
      return "secondary"
    case "active":
      return "default"
    default:
      return "outline"
  }
}
