"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
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
  AlertTriangle,
  ArrowRight,
  Clock,
  FileQuestion,
  Loader2,
  MessageSquare,
  Scale,
  Shield,
  ShieldAlert,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import { openDispute } from "@/lib/lukso/lukso-sdk"
import type { Project } from "@/types/project"

interface DisputeResolutionProps {
  project: Project
}

export function DisputeResolution({ project }: DisputeResolutionProps) {
  const [showDisputeDialog, setShowDisputeDialog] = useState(false)
  const [disputeReason, setDisputeReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // For demo purposes, we'll assume no active dispute
  const hasActiveDispute = false

  const handleOpenDispute = async () => {
    if (!disputeReason.trim()) {
      toast.error("Please provide a reason for the dispute")
      return
    }

    setIsSubmitting(true)
    try {
      // Open dispute on blockchain
      const success = await openDispute(project.txHash, disputeReason)

      if (success) {
        toast.success("Dispute opened successfully")
        setShowDisputeDialog(false)
        setDisputeReason("")
      } else {
        toast.error("Failed to open dispute. Please try again.")
      }
    } catch (error) {
      console.error("Error opening dispute:", error)
      toast.error("An error occurred while opening the dispute")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Dispute Resolution</CardTitle>
          <CardDescription>Manage conflicts and resolve issues with the project</CardDescription>
        </CardHeader>
        <CardContent>
          {hasActiveDispute ? (
            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-red-800 dark:text-red-300">Active Dispute</h3>
                    <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                      There is an active dispute for this project. The dispute resolution process has been initiated.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Dispute Status</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400">
                    In Progress
                  </Badge>
                  <span className="text-xs text-muted-foreground">Opened 2 days ago</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Resolution Method</h3>
                <div className="flex items-center gap-2">
                  {project.escrowSettings?.disputeResolution === "arbitration" && (
                    <>
                      <Scale className="h-4 w-4 text-muted-foreground" />
                      <span>Third-party Arbitration</span>
                    </>
                  )}
                  {project.escrowSettings?.disputeResolution === "multisig" && (
                    <>
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Multi-signature (2-of-3)</span>
                    </>
                  )}
                  {project.escrowSettings?.disputeResolution === "dao" && (
                    <>
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>DAO Voting</span>
                    </>
                  )}
                </div>
              </div>

              <Button className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                View Dispute Details
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-green-800 dark:text-green-300">No Active Disputes</h3>
                    <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                      This project is currently running smoothly with no active disputes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Resolution Method</h3>
                <div className="flex items-center gap-2">
                  {project.escrowSettings?.disputeResolution === "arbitration" && (
                    <>
                      <Scale className="h-4 w-4 text-muted-foreground" />
                      <span>Third-party Arbitration</span>
                    </>
                  )}
                  {project.escrowSettings?.disputeResolution === "multisig" && (
                    <>
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Multi-signature (2-of-3)</span>
                    </>
                  )}
                  {project.escrowSettings?.disputeResolution === "dao" && (
                    <>
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>DAO Voting</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {project.escrowSettings?.disputeResolution === "arbitration" &&
                    "Disputes will be resolved by a neutral third-party arbitrator from the LUKSO community."}
                  {project.escrowSettings?.disputeResolution === "multisig" &&
                    "Disputes will be resolved using a 2-of-3 multi-signature approach with you, the client, and a neutral third party."}
                  {project.escrowSettings?.disputeResolution === "dao" &&
                    "Disputes will be resolved through a vote by the LUKSO DAO members."}
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Timelock Period</h3>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{project.escrowSettings?.timelock || 7} days</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  After a dispute is resolved, funds will be locked for {project.escrowSettings?.timelock || 7} days
                  before being released.
                </p>
              </div>

              <Button variant="outline" className="w-full" onClick={() => setShowDisputeDialog(true)}>
                <ShieldAlert className="h-4 w-4 mr-2" />
                Open a Dispute
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-muted/20 border-t">
          <div className="w-full flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Need help?</span>
            <Button variant="link" size="sm" className="h-auto p-0">
              <span>View Dispute Guidelines</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Common Questions</CardTitle>
          <CardDescription>Frequently asked questions about disputes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileQuestion className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">What happens when I open a dispute?</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                When you open a dispute, the project is paused and the dispute resolution process begins. The method
                selected during project creation will be used to resolve the dispute.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileQuestion className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">How long does dispute resolution take?</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                The time to resolve a dispute varies depending on the resolution method. Arbitration typically takes 3-5
                days, multi-signature can be quicker, and DAO voting usually takes 7 days.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileQuestion className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Will opening a dispute affect my reputation?</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Opening a dispute does not automatically affect your reputation. However, the outcome of the dispute may
                impact your reputation score depending on the resolution.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Open Dispute Dialog */}
      <AlertDialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Open a Dispute</AlertDialogTitle>
            <AlertDialogDescription>
              Opening a dispute will pause the project and initiate the dispute resolution process. Please provide
              details about the issue.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <h5 className="text-sm font-medium text-amber-800 dark:text-amber-300">Important Notice</h5>
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Before opening a dispute, we recommend trying to resolve the issue through direct communication with
                    the other party.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Reason for Dispute</h4>
              <Textarea
                placeholder="Describe the issue in detail..."
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Resolution Method</h4>
              <p className="text-sm">
                {project.escrowSettings?.disputeResolution === "arbitration" && "Third-party Arbitration"}
                {project.escrowSettings?.disputeResolution === "multisig" && "Multi-signature (2-of-3)"}
                {project.escrowSettings?.disputeResolution === "dao" && "DAO Voting"}
              </p>
              <p className="text-xs text-muted-foreground">
                This is the method selected when the project was created and cannot be changed.
              </p>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleOpenDispute}
              className="bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Open Dispute"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
