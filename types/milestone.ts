export type MilestoneStatus = "active" | "pending" | "completed" | "rejected" | "locked"

export interface MilestoneEvidence {
  type: "link" | "file"
  value: string
  description?: string
  fileUrl?: string
  fileType?: string
  fileSize?: number
}

export interface MilestoneComment {
  author: string
  text: string
  timestamp: string
}

export interface MilestoneSubmission {
  id: string
  projectId: string
  milestoneId: number
  milestoneTitle: string
  description: string
  submittedBy: string
  submittedAt: string
  status: string
  verifiedAt?: string
  verifiedBy?: string
  rejectedAt?: string
  rejectedBy?: string
  rejectionReason?: string
  evidence: MilestoneEvidence[]
  comments: MilestoneComment[]
  transactionHash?: string
}
