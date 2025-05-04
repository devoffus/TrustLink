"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { ArrowDownUp, ArrowUpDown, Check, Clock, ExternalLink, Filter, Search, X } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { getTransactionUrl } from "@/lib/lukso/lukso-sdk"
import { useUPAuth } from "@/components/up-profile/up-auth-provider"
import { getTransactionHistory } from "@/lib/lukso/transaction-service"
import type { Transaction } from "@/types/transaction"

export function TransactionHistory() {
  const { upProfile, isAuthenticated } = useUPAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!upProfile?.address || !isAuthenticated) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const history = await getTransactionHistory(upProfile.address)
        setTransactions(history)
        setFilteredTransactions(history)
      } catch (error) {
        console.error("Error fetching transaction history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [upProfile, isAuthenticated])

  useEffect(() => {
    // Apply filters and search
    let result = [...transactions]

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((tx) => tx.status.toLowerCase() === statusFilter.toLowerCase())
    }

    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter((tx) => tx.type.toLowerCase() === typeFilter.toLowerCase())
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (tx) =>
          tx.hash.toLowerCase().includes(query) ||
          tx.description.toLowerCase().includes(query) ||
          tx.projectTitle?.toLowerCase().includes(query),
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime()
      const dateB = new Date(b.timestamp).getTime()
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA
    })

    setFilteredTransactions(result)
    setCurrentPage(1) // Reset to first page when filters change
  }, [transactions, statusFilter, typeFilter, searchQuery, sortDirection])

  // Calculate pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
  }

  const resetFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setTypeFilter("all")
  }

  if (!upProfile || !isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Connect your Universal Profile to view your transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No Universal Profile connected</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>View your escrow payment transactions and their status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Status</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[130px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Type</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  <SelectItem value="milestone">Milestone</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" onClick={toggleSortDirection} title="Sort by date">
                {sortDirection === "asc" ? <ArrowUpDown className="h-4 w-4" /> : <ArrowDownUp className="h-4 w-4" />}
              </Button>

              {(searchQuery || statusFilter !== "all" || typeFilter !== "all") && (
                <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1">
                  <X className="h-4 w-4" />
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Transaction table */}
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-md">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transactions found</p>
              {(searchQuery || statusFilter !== "all" || typeFilter !== "all") && (
                <Button variant="link" onClick={resetFilters} className="mt-2">
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTransactions.map((tx) => (
                      <TableRow key={tx.hash}>
                        <TableCell className="font-medium">{formatDate(tx.timestamp)}</TableCell>
                        <TableCell>
                          <Badge variant={getTypeBadgeVariant(tx.type)}>{tx.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate" title={tx.description}>
                            {tx.description}
                          </div>
                          {tx.projectTitle && (
                            <div className="text-xs text-muted-foreground mt-1">Project: {tx.projectTitle}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {tx.type === "withdrawal" ? "-" : "+"}
                            {tx.amount} LUKSO
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(tx.status)}>
                            {getStatusIcon(tx.status)}
                            <span className="ml-1">{tx.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <a
                            href={getTransactionUrl(tx.hash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-primary hover:text-primary/80"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">View on Explorer</span>
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber: number

                      if (totalPages <= 5) {
                        pageNumber = i + 1
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1
                        if (i === 4)
                          return (
                            <PaginationItem key={i}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i
                        if (i === 0)
                          return (
                            <PaginationItem key={i}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )
                      } else {
                        if (i === 0)
                          return (
                            <PaginationItem key={i}>
                              <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
                            </PaginationItem>
                          )
                        if (i === 1)
                          return (
                            <PaginationItem key={i}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )
                        if (i === 3)
                          return (
                            <PaginationItem key={i}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )
                        if (i === 4)
                          return (
                            <PaginationItem key={i}>
                              <PaginationLink onClick={() => handlePageChange(totalPages)}>{totalPages}</PaginationLink>
                            </PaginationItem>
                          )
                        pageNumber = currentPage + i - 2
                      }

                      return (
                        <PaginationItem key={i}>
                          <PaginationLink
                            onClick={() => handlePageChange(pageNumber)}
                            isActive={currentPage === pageNumber}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  switch (status.toLowerCase()) {
    case "completed":
      return "secondary"
    case "pending":
      return "default"
    case "failed":
      return "destructive"
    default:
      return "outline"
  }
}

function getTypeBadgeVariant(type: string): "default" | "secondary" | "outline" | "destructive" {
  switch (type.toLowerCase()) {
    case "deposit":
      return "default"
    case "withdrawal":
      return "secondary"
    case "milestone":
      return "outline"
    case "refund":
      return "destructive"
    default:
      return "outline"
  }
}

function getStatusIcon(status: string) {
  switch (status.toLowerCase()) {
    case "completed":
      return <Check className="h-3 w-3" />
    case "pending":
      return <Clock className="h-3 w-3" />
    case "failed":
      return <X className="h-3 w-3" />
    default:
      return null
  }
}
