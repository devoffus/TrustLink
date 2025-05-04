export interface Invitation {
  id: string
  projectId: string
  projectTitle: string
  email: string
  upAddress?: string
  message: string
  status: "pending" | "accepted" | "declined" | "cancelled"
  createdAt: string
  expiresAt?: string
  acceptedAt?: string
  declinedAt?: string
  cancelledAt?: string
}
