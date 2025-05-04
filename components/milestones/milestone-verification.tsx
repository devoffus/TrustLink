"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { motion } from "framer-motion"
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck,
  FileText,
  Link2,
  Loader2,
  LockIcon,
  Milestone,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
  Upload,
  XCircle,
} from "lucide-react"
import { useUPAuth } from "@/components/up-profile/up-auth-provider"
import { MilestoneSubmissionForm } from "./milestone-submission-form"
import { MilestoneRejectionForm } from "./milestone-rejection-form"
import { getAddressUrl } from "@/lib/lukso/lukso-sdk"
import {
  submitMilestoneCompletion,
  verifyMilestoneCompletion,
  rejectMilestoneCompletion,
} from "@/lib/lukso/milestone-service"
import type { Project } from "@/types/project"
import type { MilestoneSubmission, MilestoneStatus } from "@/types/milestone"

interface MilestoneVerificationProps {
  project: Project
  userRole: "freelancer" | "client"
}

export function MilestoneVerification({ project, userRole }: MilestoneVerificationProps) {
  const { upProfile, isAuthenticated } = useUPAuth()
  const [activeTab, setActiveTab] = useState<"active" | "completed" | "pending" | "rejected">("active")
  const [selectedMilestone, setSelectedMilestone] = useState<number | null>(null)
  const [showSubmissionForm, setShowSubmissionForm] = useState(false)
  const [showRejectionForm, setShowRejectionForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)

  // Mock milestone submissions for demo
  const [milestoneSubmissions, setMilestoneSubmissions] = useState<MilestoneSubmission[]>([
    {
      id: "submission-1",
      projectId: project.id,
      milestoneId: 0,
      milestoneTitle: project.escrowSettings?.milestones[0]?.title || "Initial Milestone",
      description: "Completed the initial design phase with all requested components.",
      submittedBy: "0x1234567890123456789012345678901234567890",
      submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      verifiedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      verifiedBy: "0x0987654321098765432109876543210987654321",
      evidence: [
        {
          type: "link",
          value: "https://example.com/design-mockups",
          description: "Design mockups on Figma",
        },
        {
          type: "file",
          value: "design-specs.pdf",
          fileUrl: "#",
          fileType: "application/pdf",
          fileSize: 2457600,
          description: "Design specifications document",
        },
      ],
      comments: [
        {
          author: "0x0987654321098765432109876543210987654321",
          text: "Great work! All requirements have been met.",
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      transactionHash: "0x1234567890123456789012345678901234567890123456789012345678901234",
    },
    {
      id: "submission-2",
      projectId: project.id,
      milestoneId: 1,
      milestoneTitle: project.escrowSettings?.milestones[1]?.title || "Second Milestone",
      description: "Implemented all frontend components and integrated with the API.",
      submittedBy: "0x1234567890123456789012345678901234567890",
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: "pending",
      evidence: [
        {
          type: "link",
          value: "https://github.com/example/project-repo",
          description: "GitHub repository with all code",
        },
        {
          type: "link",
          value: "https://staging.example.com",
          description: "Staging environment for testing",
        },
      ],
      comments: [],
    },
  ])

  // Get milestone statuses based on submissions
  const getMilestoneStatus = (milestoneIndex: number): MilestoneStatus => {
    const submission = milestoneSubmissions.find((s) => s.milestoneId === milestoneIndex)
    if (!submission) {
      // If no previous milestone is completed, this one is locked
      const previousCompleted =
        milestoneIndex === 0 ||
        milestoneSubmissions.some((s) => s.milestoneId === milestoneIndex - 1 && s.status === "completed")

      return previousCompleted ? "active" : "locked"
    }
    return submission.status as MilestoneStatus
  }

  const handleSubmitMilestone = async (milestoneIndex: number, data: any) => {
    if (!upProfile?.address) {
      toast.error("Please connect your Universal Profile first")
      return
    }

    setIsSubmitting(true)
    try {
      // Submit milestone completion
      const submissionId = await submitMilestoneCompletion(project.id, milestoneIndex, data.description, data.evidence)

      // Create new submission
      const newSubmission: MilestoneSubmission = {
        id: submissionId,
        projectId: project.id,
        milestoneId: milestoneIndex,
        milestoneTitle: project.escrowSettings?.milestones[milestoneIndex]?.title || `Milestone ${milestoneIndex + 1}`,
        description: data.description,
        submittedBy: upProfile.address,
        submittedAt: new Date().toISOString(),
        status: "pending",
        evidence: data.evidence,
        comments: [],
      }

      // Add to submissions
      setMilestoneSubmissions([...milestoneSubmissions, newSubmission])

      toast.success("Milestone submission successful")
      setShowSubmissionForm(false)
      setSelectedMilestone(null)
    } catch (error) {
      console.error("Error submitting milestone:", error)
      toast.error("Failed to submit milestone")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyMilestone = async (submissionId: string) => {
    if (!upProfile?.address) {
      toast.error("Please connect your Universal Profile first")
      return
    }

    setIsVerifying(true)
    try {
      // Find the submission
      const submission = milestoneSubmissions.find((s) => s.id === submissionId)
      if (!submission) {
        toast.error("Submission not found")
        return
      }

      // Verify milestone completion
      const { transactionHash } = await verifyMilestoneCompletion(project.id, submission.milestoneId, submissionId)

      // Update submission status
      setMilestoneSubmissions(
        milestoneSubmissions.map((s) =>
          s.id === submissionId
            ? {
                ...s,
                status: "completed",
                verifiedAt: new Date().toISOString(),
                verifiedBy: upProfile.address,
                transactionHash,
                comments: [
                  ...s.comments,
                  {
                    author: upProfile.address,
                    text: "Milestone verified and approved.",
                    timestamp: new Date().toISOString(),
                  },
                ],
              }
            : s,
        ),
      )

      toast.success("Milestone verified successfully")
    } catch (error) {
      console.error("Error verifying milestone:", error)
      toast.error("Failed to verify milestone")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleRejectMilestone = async (submissionId: string, reason: string) => {
    if (!upProfile?.address) {
      toast.error("Please connect your Universal Profile first")
      return
    }

    setIsRejecting(true)
    try {
      // Find the submission
      const submission = milestoneSubmissions.find((s) => s.id === submissionId)
      if (!submission) {
        toast.error("Submission not found")
        return
      }

      // Reject milestone completion
      await rejectMilestoneCompletion(project.id, submission.milestoneId, submissionId, reason)

      // Update submission status
      setMilestoneSubmissions(
        milestoneSubmissions.map((s) =>
          s.id === submissionId
            ? {
                ...s,
                status: "rejected",
                rejectedAt: new Date().toISOString(),
                rejectedBy: upProfile.address,
                rejectionReason: reason,
                comments: [
                  ...s.comments,
                  {
                    author: upProfile.address,
                    text: `Milestone rejected: ${reason}`,
                    timestamp: new Date().toISOString(),
                  },
                ],
              }
            : s,
        ),
      )

      toast.success("Milestone rejection submitted")
      setShowRejectionForm(false)
    } catch (error) {
      console.error("Error rejecting milestone:", error)
      toast.error("Failed to reject milestone")
    } finally {
      setIsRejecting(false)
    }
  }

  // Filter submissions based on active tab
  const filteredSubmissions = milestoneSubmissions.filter((submission) => {
    if (activeTab === "active") return submission.status === "pending"
    if (activeTab === "completed") return submission.status === "completed"
    if (activeTab === "rejected") return submission.status === "rejected"
    return true
  })

  if (!upProfile || !isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Milestone Verification</CardTitle>
          <CardDescription>Connect your Universal Profile to manage milestone verification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No Universal Profile connected</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render submission form if active
  if (showSubmissionForm && selectedMilestone !== null) {
    return (
      <MilestoneSubmissionForm
        project={project}
        milestoneIndex={selectedMilestone}
        onSubmit={handleSubmitMilestone}
        onCancel={() => {
          setShowSubmissionForm(false)
          setSelectedMilestone(null)
        }}
        isSubmitting={isSubmitting}
      />
    )
  }

  // Render rejection form if active
  if (showRejectionForm && selectedMilestone !== null) {
    const submission = milestoneSubmissions.find((s) => s.milestoneId === selectedMilestone && s.status === "pending")
    if (!submission) {
      setShowRejectionForm(false)
      setSelectedMilestone(null)
      return null
    }

    return (
      <MilestoneRejectionForm
        submission={submission}
        onSubmit={(reason) => handleRejectMilestone(submission.id, reason)}
        onCancel={() => {
          setShowRejectionForm(false)
          setSelectedMilestone(null)
        }}
        isRejecting={isRejecting}
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Milestone Verification</CardTitle>
            <CardDescription>
              {userRole === "freelancer"
                ? "Submit and track milestone completion"
                : "Verify and approve milestone submissions"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {activeTab === "active" && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium flex items-center">
                  <Milestone className="h-5 w-5 mr-2" />
                  Project Milestones
                </h3>

                {project.escrowSettings?.milestones.map((milestone, index) => {
                  const status = getMilestoneStatus(index)
                  const amountPercentage = (project.budget * milestone.percentage) / 100

                  return (
                    <motion.div
                      key={index}
                      className={`relative border rounded-lg p-4 ${status === "active" ? "border-primary" : "border-border"}`}
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`rounded-full p-2 ${getStatusColor(status)}`}>{getStatusIcon(status)}</div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{milestone.title}</h4>
                              <Badge variant={getStatusVariant(status)}>{getStatusLabel(status)}</Badge>
                            </div>

                            <p className="text-sm text-muted-foreground mt-1">
                              {milestone.description || "No description provided"}
                            </p>

                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-sm font-medium">
                                {milestone.percentage}% ({amountPercentage.toFixed(2)} LUKSO)
                              </span>

                              {status === "active" && userRole === "freelancer" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedMilestone(index)
                                    setShowSubmissionForm(true)
                                  }}
                                >
                                  <Upload className="h-3.5 w-3.5 mr-1" />
                                  Submit for Verification
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <Progress
                          value={
                            status === "completed" ? 100 : status === "pending" ? 50 : status === "active" ? 25 : 0
                          }
                          className="h-1.5"
                        />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {(activeTab === "pending" || activeTab === "completed" || activeTab === "rejected") && (
              <>
                {filteredSubmissions.length === 0 ? (
                  <div className="text-center py-8 border rounded-md bg-muted/20">
                    <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No {activeTab} milestone submissions found</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredSubmissions.map((submission) => (
                      <motion.div
                        key={submission.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border rounded-lg overflow-hidden"
                      >
                        <div className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{submission.milestoneTitle}</h3>
                              <Badge variant={getStatusVariant(submission.status)}>
                                {getStatusLabel(submission.status)}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Submitted: {formatDate(submission.submittedAt)}
                            </div>
                          </div>

                          <p className="text-sm mb-4">{submission.description}</p>

                          {submission.evidence && submission.evidence.length > 0 && (
                            <div className="mb-4">
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
                            <div className="text-sm text-green-600 dark:text-green-400 mb-2">
                              Verified: {formatDate(submission.verifiedAt)}
                            </div>
                          )}

                          {submission.status === "rejected" && submission.rejectedAt && (
                            <div className="text-sm text-red-600 dark:text-red-400 mb-2">
                              Rejected: {formatDate(submission.rejectedAt)}
                              {submission.rejectionReason && (
                                <div className="mt-1 p-2 bg-red-50 dark:bg-red-950/30 rounded-md">
                                  Reason: {submission.rejectionReason}
                                </div>
                              )}
                            </div>
                          )}

                          {submission.transactionHash && (
                            <div className="text-xs text-muted-foreground mt-2">
                              Transaction:
                              <a
                                href={getAddressUrl(submission.transactionHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-1 text-primary hover:underline inline-flex items-center"
                              >
                                {submission.transactionHash.substring(0, 10)}...
                                {submission.transactionHash.substring(submission.transactionHash.length - 8)}
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </div>
                          )}
                        </div>

                        {submission.status === "pending" && userRole === "client" && (
                          <>
                            <Separator />
                            <div className="p-3 bg-muted/10 flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedMilestone(submission.milestoneId)
                                  setShowRejectionForm(true)
                                }}
                                className="h-8"
                              >
                                <ThumbsDown className="h-3.5 w-3.5 mr-1" />
                                Reject
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleVerifyMilestone(submission.id)}
                                disabled={isVerifying}
                                className="h-8"
                              >
                                {isVerifying ? (
                                  <>
                                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                                    Verifying...
                                  </>
                                ) : (
                                  <>
                                    <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                                    Verify & Approve
                                  </>
                                )}
                              </Button>
                            </div>
                          </>
                        )}

                        {submission.comments && submission.comments.length > 0 && (
                          <>
                            <Separator />
                            <div className="p-3 bg-muted/5">
                              <h4 className="text-sm font-medium mb-2">Comments:</h4>
                              <div className="space-y-2">
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
                          </>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="bg-muted/20 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>Milestone verification is recorded on the blockchain for transparency</p>
        <div className="flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" />
          <span>Verified milestones trigger automatic escrow payments</span>
        </div>
      </CardFooter>
    </Card>
  )
}

function getStatusColor(status: MilestoneStatus): string {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
    case "pending":
      return "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
    case "active":
      return "bg-primary/10 text-primary"
    case "rejected":
      return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
    case "locked":
      return "bg-muted text-muted-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function getStatusVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "completed":
      return "secondary"
    case "pending":
      return "default"
    case "active":
      return "default"
    case "rejected":
      return "destructive"
    case "locked":
      return "outline"
    default:
      return "outline"
  }
}

function getStatusIcon(status: MilestoneStatus) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-5 w-5" />
    case "pending":
      return <Clock className="h-5 w-5" />
    case "active":
      return <FileCheck className="h-5 w-5" />
    case "rejected":
      return <XCircle className="h-5 w-5" />
    case "locked":
      return <LockIcon className="h-5 w-5" />
    default:
      return <Milestone className="h-5 w-5" />
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "completed":
      return "Completed"
    case "pending":
      return "Pending Verification"
    case "active":
      return "Active"
    case "rejected":
      return "Rejected"
    case "locked":
      return "Locked"
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
