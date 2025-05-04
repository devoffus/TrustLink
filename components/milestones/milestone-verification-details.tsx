"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Clock, ExternalLink, FileText, Link2, Milestone, XCircle } from "lucide-react"
import { getAddressUrl } from "@/lib/lukso/lukso-sdk"
import type { MilestoneSubmission } from "@/types/milestone"

interface MilestoneVerificationDetailsProps {
  submission: MilestoneSubmission
}

export function MilestoneVerificationDetails({ submission }: MilestoneVerificationDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Milestone Submission Details</CardTitle>
            <CardDescription>Review the details of this milestone submission</CardDescription>
          </div>
          <Badge variant={getStatusVariant(submission.status)}>
            {getStatusIcon(submission.status)}
            <span className="ml-1">{getStatusLabel(submission.status)}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium flex items-center">
            <Milestone className="h-5 w-5 mr-2" />
            {submission.milestoneTitle}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Submitted: {formatDate(submission.submittedAt)}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Description:</h4>
          <p className="text-sm">{submission.description}</p>
        </div>

        {submission.evidence && submission.evidence.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Evidence:</h4>
            <div className="space-y-2">
              {submission.evidence.map((evidence, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {evidence.type === "link" ? (
                    <>
                      <Link2 className="h-4 w-4 text-muted-foreground" />
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
                      <FileText className="h-4 w-4 text-muted-foreground" />
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

        {submission.status === "completed" && submission.verifiedAt && (
          <div>
            <h4 className="text-sm font-medium mb-2">Verification:</h4>
            <div className="text-sm text-green-600 dark:text-green-400">
              Verified on {formatDate(submission.verifiedAt)}
            </div>
          </div>
        )}

        {submission.status === "rejected" && submission.rejectedAt && (
          <div>
            <h4 className="text-sm font-medium mb-2">Rejection:</h4>
            <div className="text-sm text-red-600 dark:text-red-400">
              Rejected on {formatDate(submission.rejectedAt)}
            </div>
            {submission.rejectionReason && (
              <div className="mt-2 p-3 bg-red-50 dark:bg-red-950/30 rounded-md text-sm">
                <strong>Reason:</strong> {submission.rejectionReason}
              </div>
            )}
          </div>
        )}

        {submission.comments && submission.comments.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Comments:</h4>
            <div className="space-y-3">
              {submission.comments.map((comment, i) => (
                <div key={i} className="text-sm">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <span className="font-mono">
                      {comment.author.substring(0, 6)}...
                      {comment.author.substring(comment.author.length - 4)}
                    </span>
                    <span>•</span>
                    <span>{formatDate(comment.timestamp)}</span>
                  </div>
                  <p>{comment.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {submission.transactionHash && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-2">Blockchain Record:</h4>
              <div className="text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-mono">
                    {submission.transactionHash.substring(0, 10)}...
                    {submission.transactionHash.substring(submission.transactionHash.length - 8)}
                  </span>
                  <a
                    href={getAddressUrl(submission.transactionHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span className="sr-only">View on Explorer</span>
                  </a>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function getStatusVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "completed":
      return "secondary"
    case "pending":
      return "default"
    case "rejected":
      return "destructive"
    default:
      return "outline"
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-3.5 w-3.5" />
    case "pending":
      return <Clock className="h-3.5 w-3.5" />
    case "rejected":
      return <XCircle className="h-3.5 w-3.5" />
    default:
      return null
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "completed":
      return "Completed"
    case "pending":
      return "Pending Verification"
    case "rejected":
      return "Rejected"
    default:
      return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  } catch (error) {
    return "Invalid date"
  }
}
