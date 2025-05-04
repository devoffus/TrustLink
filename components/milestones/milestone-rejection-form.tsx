"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { AlertCircle, FileText, Link2, Loader2, Milestone, ThumbsDown } from "lucide-react"
import type { MilestoneSubmission } from "@/types/milestone"

interface MilestoneRejectionFormProps {
  submission: MilestoneSubmission
  onSubmit: (reason: string) => Promise<void>
  onCancel: () => void
  isRejecting: boolean
}

export function MilestoneRejectionForm({ submission, onSubmit, onCancel, isRejecting }: MilestoneRejectionFormProps) {
  const [reason, setReason] = useState("")

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for rejection")
      return
    }

    await onSubmit(reason)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Reject Milestone Submission</CardTitle>
              <CardDescription>Provide feedback on why this milestone is being rejected</CardDescription>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Milestone className="h-3.5 w-3.5 mr-1" />
              {submission.milestoneTitle}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Submission Details:</h3>
            <p className="text-sm">{submission.description}</p>

            {submission.evidence && submission.evidence.length > 0 && (
              <div className="mt-3">
                <h4 className="text-xs font-medium mb-1">Evidence:</h4>
                <div className="space-y-1">
                  {submission.evidence.map((evidence, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      {evidence.type === "link" ? (
                        <>
                          <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <a
                            href={evidence.value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {evidence.description || evidence.value}
                          </a>
                        </>
                      ) : (
                        <>
                          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                          <a
                            href={evidence.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {evidence.description || evidence.value}
                          </a>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="rejection-reason">Reason for Rejection</Label>
            <Textarea
              id="rejection-reason"
              placeholder="Explain why this milestone submission does not meet the requirements..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Provide clear feedback on what needs to be improved or fixed before resubmission.
            </p>
          </div>

          <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 p-3 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <h5 className="text-sm font-medium text-amber-800 dark:text-amber-300">Important</h5>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Rejecting a milestone will require the freelancer to make changes and resubmit. This will delay
                  payment release for this milestone.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <Separator />
        <CardFooter className="flex justify-between p-6">
          <Button variant="outline" onClick={onCancel} disabled={isRejecting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={isRejecting}>
            {isRejecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rejecting...
              </>
            ) : (
              <>
                <ThumbsDown className="mr-2 h-4 w-4" />
                Reject Submission
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
