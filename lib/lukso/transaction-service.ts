import type { Transaction } from "@/types/transaction"

// This is a mock implementation for demo purposes
// In a real application, this would fetch data from the blockchain
export async function getTransactionHistory(address: string): Promise<Transaction[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Generate random transactions for demo
  const now = new Date()
  const transactions: Transaction[] = []

  // Project titles for demo
  const projectTitles = [
    "Website Redesign",
    "Mobile App Development",
    "Smart Contract Audit",
    "Brand Identity Design",
    "Marketing Campaign",
  ]

  // Milestone names for demo
  const milestoneNames = [
    "Initial Design",
    "Frontend Development",
    "Backend Integration",
    "Testing Phase",
    "Final Delivery",
  ]

  // Generate 15 random transactions
  for (let i = 0; i < 15; i++) {
    const daysAgo = Math.floor(Math.random() * 30)
    const date = new Date(now)
    date.setDate(date.getDate() - daysAgo)

    const types: Array<"deposit" | "withdrawal" | "milestone" | "refund"> = [
      "deposit",
      "withdrawal",
      "milestone",
      "refund",
    ]
    const type = types[Math.floor(Math.random() * types.length)]

    const statuses: Array<"completed" | "pending" | "failed"> = ["completed", "pending", "failed"]
    // Weight towards completed
    const status = Math.random() < 0.7 ? "completed" : statuses[Math.floor(Math.random() * statuses.length)]

    const amount = Math.floor(Math.random() * 1000) + 100

    const projectId = `project-${Math.floor(Math.random() * 10000)}`
    const projectTitle = projectTitles[Math.floor(Math.random() * projectTitles.length)]

    const milestoneId = `milestone-${Math.floor(Math.random() * 5)}`
    const milestoneName = milestoneNames[Math.floor(Math.random() * milestoneNames.length)]

    let description = ""
    switch (type) {
      case "deposit":
        description = `Deposit to escrow for project "${projectTitle}"`
        break
      case "withdrawal":
        description = `Withdrawal from escrow for project "${projectTitle}"`
        break
      case "milestone":
        description = `Milestone payment: "${milestoneName}" for project "${projectTitle}"`
        break
      case "refund":
        description = `Refund from project "${projectTitle}"`
        break
    }

    transactions.push({
      hash: `0x${Math.random().toString(16).substring(2, 66)}`,
      timestamp: date.toISOString(),
      type,
      amount,
      status,
      description,
      projectId,
      projectTitle,
      milestoneId: type === "milestone" ? milestoneId : undefined,
      milestoneName: type === "milestone" ? milestoneName : undefined,
    })
  }

  // Sort by date (newest first)
  return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// This would be implemented to fetch a specific transaction
export async function getTransactionDetails(hash: string): Promise<Transaction | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // In a real implementation, this would fetch the transaction from the blockchain
  // For demo purposes, we'll return a mock transaction
  return {
    hash,
    timestamp: new Date().toISOString(),
    type: "milestone",
    amount: 500,
    status: "completed",
    description: "Milestone payment: Frontend Development for Website Redesign",
    projectId: "project-1234",
    projectTitle: "Website Redesign",
    milestoneId: "milestone-2",
    milestoneName: "Frontend Development",
  }
}
