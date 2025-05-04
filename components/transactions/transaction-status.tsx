"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { useFreelanceStore } from "@/stores/use-freelance-store"
import type { TransactionStatus } from "@/types/transaction"

interface TransactionStatusProps {
  txHash: string
  onStatusChange?: (status: TransactionStatus) => void
}

export function TransactionStatusBadge({ txHash, onStatusChange }: TransactionStatusProps) {
  const { pendingTransactions, updateTransactionStatus } = useFreelanceStore()
  const [status, setStatus] = useState<TransactionStatus>(pendingTransactions[txHash]?.status || "pending")
  const [isPolling, setIsPolling] = useState(false)

  useEffect(() => {
    if (!txHash) return

    // Get initial status from store
    const initialStatus = pendingTransactions[txHash]?.status
    if (initialStatus) {
      setStatus(initialStatus)
    }

    // Only poll for pending or processing transactions
    if (initialStatus === "pending" || initialStatus === "processing") {
      setIsPolling(true)
    }
  }, [txHash, pendingTransactions])

  useEffect(() => {
    if (!isPolling || !txHash) return

    const checkTransactionStatus = async () => {
      try {
        // In a real implementation, you would check the transaction status on the blockchain
        // For now, we'll simulate status changes
        const currentStatus = pendingTransactions[txHash]?.status

        if (currentStatus === "pending") {
          // Simulate transaction being processed
          setTimeout(() => {
            updateTransactionStatus(txHash, "processing")
          }, 3000)
        } else if (currentStatus === "processing") {
          // Simulate transaction being completed
          setTimeout(() => {
            updateTransactionStatus(txHash, "completed")
            setIsPolling(false)
          }, 5000)
        } else {
          setIsPolling(false)
        }
      } catch (error) {
        console.error("Error checking transaction status:", error)
        updateTransactionStatus(txHash, "failed")
        setIsPolling(false)
      }
    }

    const interval = setInterval(checkTransactionStatus, 5000)
    return () => clearInterval(interval)
  }, [txHash, isPolling, pendingTransactions, updateTransactionStatus])

  useEffect(() => {
    // Notify parent component of status changes
    if (onStatusChange && pendingTransactions[txHash]?.status) {
      onStatusChange(pendingTransactions[txHash].status)
    }
  }, [txHash, pendingTransactions, onStatusChange])

  if (!txHash) return null

  const currentStatus = pendingTransactions[txHash]?.status || status

  return (
    <Badge
      variant={currentStatus === "completed" ? "success" : currentStatus === "failed" ? "destructive" : "outline"}
      className="flex items-center gap-1"
    >
      {currentStatus === "pending" && (
        <>
          <Clock className="h-3 w-3" />
          <span>Pending</span>
        </>
      )}
      {currentStatus === "processing" && (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Processing</span>
        </>
      )}
      {currentStatus === "completed" && (
        <>
          <CheckCircle className="h-3 w-3" />
          <span>Completed</span>
        </>
      )}
      {currentStatus === "failed" && (
        <>
          <AlertCircle className="h-3 w-3" />
          <span>Failed</span>
        </>
      )}
    </Badge>
  )
}
