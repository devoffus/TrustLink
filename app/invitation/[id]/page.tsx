"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle2, XCircle, Calendar, Mail, User } from "lucide-react"
import { toast } from "sonner"
import { useUPAuth } from "@/components/up-profile/up-auth-provider"
import { getInvitation, acceptInvitation, declineInvitation } from "@/lib/lukso/invitation-service"
import type { Invitation } from "@/types/invitation"

export default function InvitationPage() {
  const params = useParams()
  const router = useRouter()
  const { upProfile, isAuthenticated, connect } = useUPAuth()
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExpired, setIsExpired] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)
  const [isDeclining, setIsDeclining] = useState(false)
  const [declineReason, setDeclineReason] = useState("")
  const [showDeclineForm, setShowDeclineForm] = useState(false)

  const invitationId = params.id as string

  useEffect(() => {
    const fetchInvitation = async () => {
      setIsLoading(true)
      try {
        const invitationData = await getInvitation(invitationId)
        setInvitation(invitationData)

        // Check if invitation is expired
        if (invitationData?.expiresAt) {
          const expiryDate = new Date(invitationData.expiresAt)
          setIsExpired(expiryDate < new Date())
        }
      } catch (error) {
        console.error("Error fetching invitation:", error)
        toast.error("Failed to load invitation")
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvitation()
  }, [invitationId])

  const handleAccept = async () => {
    if (!upProfile?.address) {
      toast.error("Please connect your Universal Profile first")
      return
    }

    setIsAccepting(true)
    try {
      const success = await acceptInvitation(invitationId, upProfile.address)
      if (success) {
        toast.success("Invitation accepted successfully")
        // Update invitation status locally
        setInvitation(
          invitation
            ? {
                ...invitation,
                status: "accepted",
                acceptedAt: new Date().toISOString(),
              }
            : null,
        )

        // Redirect to project page after a short delay
        setTimeout(() => {
          router.push(`/project/${invitation?.projectId}`)
        }, 2000)
      } else {
        toast.error("Failed to accept invitation")
      }
    } catch (error) {
      console.error("Error accepting invitation:", error)
      toast.error("Failed to accept invitation")
    } finally {
      setIsAccepting(false)
    }
  }

  const handleDecline = async () => {
    setIsDeclining(true)
    try {
      const success = await declineInvitation(invitationId, declineReason)
      if (success) {
        toast.success("Invitation declined")
        // Update invitation status locally
        setInvitation(
          invitation
            ? {
                ...invitation,
                status: "declined",
                declinedAt: new Date().toISOString(),
              }
            : null,
        )
        setShowDeclineForm(false)
      } else {
        toast.error("Failed to decline invitation")
      }
    } catch (error) {
      console.error("Error declining invitation:", error)
      toast.error("Failed to decline invitation")
    } finally {
      setIsDeclining(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-medium mb-2">Loading Invitation</h2>
          <p className="text-muted-foreground">Please wait while we load the invitation details...</p>
        </div>
      </div>
    )
  }

  if (!invitation) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invitation Not Found</AlertTitle>
          <AlertDescription>
            The invitation you're looking for doesn't exist or has been removed. Please check the link and try again.
          </AlertDescription>
        </Alert>
        <div className="mt-6 text-center">
          <Button onClick={() => router.push("/")}>Return to Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Project Invitation</CardTitle>
              <CardDescription>You've been invited to collaborate on a project</CardDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(invitation.status)}>
              {getStatusIcon(invitation.status)}
              <span className="ml-1">{capitalizeFirstLetter(invitation.status)}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">{invitation.projectTitle}</h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Sent: {formatDate(invitation.createdAt)}</span>
              </div>
              {invitation.expiresAt && invitation.status === "pending" && (
                <div className="flex items-center">
                  <span className="hidden sm:inline mx-2">•</span>
                  <span>Expires: {formatDate(invitation.expiresAt)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{invitation.email}</span>
            </div>
            {invitation.upAddress && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-sm">
                  {invitation.upAddress.substring(0, 6)}...
                  {invitation.upAddress.substring(invitation.upAddress.length - 4)}
                </span>
              </div>
            )}
          </div>

          <div className="bg-muted/20 p-4 rounded-md">
            <h4 className="text-sm font-medium mb-2">Message from the sender:</h4>
            <p className="text-sm">{invitation.message}</p>
          </div>

          {isExpired && invitation.status === "pending" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Invitation Expired</AlertTitle>
              <AlertDescription>
                This invitation has expired. Please contact the sender if you still want to join the project.
              </AlertDescription>
            </Alert>
          )}

          {invitation.status === "accepted" && (
            <Alert variant="success">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Invitation Accepted</AlertTitle>
              <AlertDescription>
                You have successfully accepted this invitation. You can now access the project.
              </AlertDescription>
            </Alert>
          )}

          {invitation.status === "declined" && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Invitation Declined</AlertTitle>
              <AlertDescription>You have declined this invitation.</AlertDescription>
            </Alert>
          )}

          {invitation.status === "cancelled" && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Invitation Cancelled</AlertTitle>
              <AlertDescription>This invitation has been cancelled by the sender.</AlertDescription>
            </Alert>
          )}

          {showDeclineForm && invitation.status === "pending" && !isExpired && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Reason for declining (optional):</h4>
              <Textarea
                placeholder="Provide a reason for declining this invitation..."
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDeclineForm(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDecline} disabled={isDeclining}>
                  {isDeclining ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Declining...
                    </>
                  ) : (
                    "Confirm Decline"
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        {invitation.status === "pending" && !isExpired && (
          <>
            <Separator />
            <CardFooter className="flex flex-col sm:flex-row gap-3 p-6">
              {!upProfile ? (
                <Button className="w-full" onClick={() => connect()}>
                  Connect Universal Profile to Respond
                </Button>
              ) : (
                <>
                  <Button variant="default" className="w-full sm:w-auto" onClick={handleAccept} disabled={isAccepting}>
                    {isAccepting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Accepting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Accept Invitation
                      </>
                    )}
                  </Button>
                  {!showDeclineForm && (
                    <Button variant="outline" className="w-full sm:w-auto" onClick={() => setShowDeclineForm(true)}>
                      <XCircle className="mr-2 h-4 w-4" />
                      Decline Invitation
                    </Button>
                  )}
                </>
              )}
            </CardFooter>
          </>
        )}

        {(invitation.status !== "pending" || isExpired) && (
          <CardFooter className="p-6">
            <Button variant="outline" className="w-full" onClick={() => router.push("/")}>
              Return to Dashboard
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "pending":
      return "default"
    case "accepted":
      return "secondary"
    case "declined":
      return "destructive"
    case "cancelled":
      return "outline"
    default:
      return "outline"
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "pending":
      return <Loader2 className="h-3 w-3 animate-spin" />
    case "accepted":
      return <CheckCircle2 className="h-3 w-3" />
    case "declined":
      return <XCircle className="h-3 w-3" />
    case "cancelled":
      return <AlertCircle className="h-3 w-3" />
    default:
      return null
  }
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
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
