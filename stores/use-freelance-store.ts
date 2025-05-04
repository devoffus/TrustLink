"use client"

import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import { persist } from "zustand/middleware"
import { createEscrowContract, getEscrowDetails } from "@/lib/lukso/lukso-sdk"
import type { UPData } from "@/types/up-profile"
import type { SkillBadge } from "@/types/skill-badge"
import type { Project, ProjectDraft } from "@/types/project"
import type { TransactionStatus } from "@/types/transaction"

interface FreelanceState {
  // Universal Profile Data
  upProfile: UPData | null
  skillsNFTs: SkillBadge[]
  reputationScore: number

  // Project Management
  activeProjects: Project[]
  escrowBalances: Record<string, number>

  // Transaction Tracking
  pendingTransactions: Record<
    string,
    {
      type: string
      status: TransactionStatus
      timestamp: number
      data?: any
    }
  >

  // Actions
  connectUP: (profile: UPData) => void
  setSkillsNFTs: (skills: SkillBadge[]) => void
  createProject: (project: ProjectDraft) => Promise<void>
  resolveDispute: (projectId: string) => void
  updateTransactionStatus: (txHash: string, status: TransactionStatus) => void
  fetchEscrowDetails: (escrowAddress: string) => Promise<any>
}

// Flag to use mock contracts (set to false for real blockchain integration)
const USE_MOCK_CONTRACTS = false

export const useFreelanceStore = create<FreelanceState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      upProfile: null,
      skillsNFTs: [],
      reputationScore: 4.8,
      activeProjects: [],
      escrowBalances: {},
      pendingTransactions: {},

      // Actions
      connectUP: (profile) => {
        set((state) => {
          state.upProfile = profile
        })
      },

      setSkillsNFTs: (skills) => {
        set((state) => {
          state.skillsNFTs = skills
        })
      },

      createProject: async (project) => {
        try {
          // Get current profile
          const { upProfile } = get()

          if (!upProfile) {
            throw new Error("Please connect your Universal Profile before creating a project")
          }

          // Generate a deadline if not provided or ensure it's a valid date
          let deadline: string
          try {
            if (project.deadline) {
              // Validate the provided deadline
              const date = new Date(project.deadline)
              if (isNaN(date.getTime())) {
                // If invalid, set a default deadline
                deadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
              } else {
                deadline = project.deadline
              }
            } else {
              // No deadline provided, set default
              deadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
            }
          } catch (error) {
            // Fallback in case of any error
            console.error("Error processing deadline:", error)
            deadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          }

          // Create escrow contract
          let contractAddress = ""
          let txHash = ""

          if (project.escrowSettings) {
            try {
              // In a real implementation, you would get the client address from the project
              const clientAddress = project.client || "0x1234567890123456789012345678901234567890"

              // Create real escrow contract
              const result = await createEscrowContract(
                clientAddress,
                upProfile.address,
                project.budget,
                project.escrowSettings,
              )

              if (result) {
                contractAddress = result.address
                txHash = result.txHash

                // Track the transaction
                set((state) => {
                  state.pendingTransactions[txHash] = {
                    type: "escrow_creation",
                    status: "pending",
                    timestamp: Date.now(),
                    data: {
                      clientAddress,
                      freelancerAddress: upProfile.address,
                      budget: project.budget,
                      escrowSettings: project.escrowSettings,
                    },
                  }
                })
              } else {
                throw new Error("Failed to create escrow contract")
              }
            } catch (error) {
              console.error("Error creating escrow contract:", error)
              throw new Error(
                "Failed to create escrow contract: " + (error instanceof Error ? error.message : "Unknown error"),
              )
            }
          }

          // Generate a unique project ID
          const projectId = `project-${Date.now()}`

          set((state) => {
            state.activeProjects.push({
              id: projectId,
              txHash,
              contractAddress,
              status: "Active",
              deadline,
              ...project,
            })

            // Initialize escrow balance for this project
            if (project.budget > 0) {
              state.escrowBalances[projectId] = project.budget
            }
          })
        } catch (error) {
          console.error("Error creating project:", error)
          throw error
        }
      },

      resolveDispute: (projectId) => {
        set((state) => {
          const projectIndex = state.activeProjects.findIndex((p) => p.id === projectId)
          if (projectIndex >= 0) {
            state.activeProjects[projectIndex].status = "Resolved"
          }
        })
      },

      updateTransactionStatus: (txHash, status) => {
        set((state) => {
          if (state.pendingTransactions[txHash]) {
            state.pendingTransactions[txHash].status = status

            // If completed, update related project status
            if (status === "completed") {
              const tx = state.pendingTransactions[txHash]
              if (tx.type === "escrow_creation") {
                const projectIndex = state.activeProjects.findIndex((p) => p.txHash === txHash)
                if (projectIndex >= 0) {
                  state.activeProjects[projectIndex].status = "Active"
                }
              } else if (tx.type === "milestone_submission") {
                // Update milestone status
              } else if (tx.type === "milestone_approval") {
                // Update milestone status and release funds
              }
            }
          }
        })
      },

      fetchEscrowDetails: async (escrowAddress) => {
        try {
          return await getEscrowDetails(escrowAddress)
        } catch (error) {
          console.error("Error fetching escrow details:", error)
          throw error
        }
      },
    })),
    {
      name: "trustlink-freelance-store",
      partialize: (state) => ({
        activeProjects: state.activeProjects,
        escrowBalances: state.escrowBalances,
        pendingTransactions: state.pendingTransactions,
      }),
    },
  ),
)
