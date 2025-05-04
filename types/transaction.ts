export type TransactionStatus = "pending" | "processing" | "completed" | "failed"

export interface Transaction {
  id: string
  txHash: string
  type: "escrow_creation" | "milestone_submission" | "milestone_approval" | "dispute_opening" | "fund_release"
  status: TransactionStatus
  timestamp: string
  from: string
  to: string
  data: { amount: number; currency: string } | Record<string, any>
  blockNumber?: number
  gasUsed?: number
  gasPrice?: string
}
