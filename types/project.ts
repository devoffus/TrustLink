import type { EscrowSettings } from "./escrow"

export interface ProjectDraft {
  title: string
  description: string
  client: string
  budget: number
  deadline?: string
  escrowSettings?: EscrowSettings
}

export interface Project {
  id: string
  title: string
  description: string
  client: string
  budget: number
  status: string
  deadline: string
  txHash: string
  escrowSettings?: EscrowSettings
}
