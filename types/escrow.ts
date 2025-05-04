export interface Milestone {
  title: string
  percentage: number
  description: string
}

export interface EscrowSettings {
  milestones: Milestone[]
  releaseType: string
  disputeResolution: string
  timelock: number
}
