"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { motion } from "framer-motion"
import {
  CheckCircle2,
  Clock,
  Copy,
  Link2,
  Loader2,
  Mail,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Send,
  User,
  X,
  XCircle,
} from "lucide-react"
import { useUPAuth } from "@/components/up-profile/up-auth-provider"
import { useFreelanceStore } from "@/stores/use-freelance-store"
import { sendInvitation, resendInvitation, cancelInvitation } from "@/lib/lukso/invitation-service"
import type { Invitation } from "@/types/invitation"

const invitationFormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  upAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, {
      message: "Please enter a valid Universal Profile address.",
    })
    .optional()
    .or(z.literal("")),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
  projectId: z.string({
    required_error: "Please select a project.",
  }),
})

type InvitationFormValues = z.infer<typeof invitationFormSchema>

export function ClientInvitation() {
  const { upProfile, isAuthenticated } = useUPAuth()
  const { activeProjects } = useFreelanceStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [invitations, setInvitations] = useState<Invitation[]>([
    {
      id: "inv-1",
      projectId: "project-1234",
      projectTitle: "Website Redesign",
      email: "client@example.com",
      upAddress: "",
      message: "I'd like to invite you to collaborate on this project. Looking forward to working with you!",
      status: "pending",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "inv-2",
      projectId: "project-5678",
      projectTitle: "Mobile App Development",
      email: "developer@example.com",
      upAddress: "0x1234567890123456789012345678901234567890",
      message: "Please join this project as soon as possible. We need to start working on it right away.",
      status: "accepted",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      acceptedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "inv-3",
      projectId: "project-9012",
      projectTitle: "Smart Contract Audit",
      email: "auditor@example.com",
      upAddress: "0x0987654321098765432109876543210987654321",
      message: "We need your expertise for this audit. Please let me know if you're available.",
      status: "declined",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      declinedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ])
  const [activeTab, setActiveTab] = useState("all")

  const form = useForm<InvitationFormValues>({
    resolver: zodResolver(invitationFormSchema),
    defaultValues: {
      email: "",
      upAddress: "",
      message: "I'd like to invite you to collaborate on this project. Looking forward to working with you!",
      projectId: "",
    },
  })

  const onSubmit = async (values: InvitationFormValues) => {
    if (!upProfile?.address) {
      toast.error("Please connect your Universal Profile first")
      return
    }

    setIsSubmitting(true)
    try {
      // Find project title
      const project = activeProjects.find((p) => p.id === values.projectId)
      if (!project) {
        toast.error("Project not found")
        return
      }

      // Send invitation
      const invitationId = await sendInvitation(values)

      // Add to invitations
      const newInvitation: Invitation = {
        id: invitationId,
        projectId: values.projectId,
        projectTitle: project.title,
        email: values.email,
        upAddress: values.upAddress || "",
        message: values.message,
        status: "pending",
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }

      setInvitations([newInvitation, ...invitations])
      toast.success("Invitation sent successfully")
      form.reset()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error sending invitation:", error)
      toast.error("Failed to send invitation")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendInvitation = async (invitationId: string) => {
    try {
      await resendInvitation(invitationId)

      // Update invitation expiry
      setInvitations(
        invitations.map((inv) =>
          inv.id === invitationId
            ? {
                ...inv,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              }
            : inv,
        ),
      )

      toast.success("Invitation resent successfully")
    } catch (error) {
      console.error("Error resending invitation:", error)
      toast.error("Failed to resend invitation")
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await cancelInvitation(invitationId)

      // Update invitation status
      setInvitations(
        invitations.map((inv) =>
          inv.id === invitationId
            ? {
                ...inv,
                status: "cancelled",
                cancelledAt: new Date().toISOString(),
              }
            : inv,
        ),
      )

      toast.success("Invitation cancelled successfully")
    } catch (error) {
      console.error("Error cancelling invitation:", error)
      toast.error("Failed to cancel invitation")
    }
  }

  const copyInvitationLink = (invitationId: string) => {
    const link = `${window.location.origin}/invitation/${invitationId}`
    navigator.clipboard.writeText(link)
    toast.success("Invitation link copied to clipboard")
  }

  const filteredInvitations = invitations.filter((inv) => {
    if (activeTab === "all") return true
    return inv.status === activeTab
  })

  if (!upProfile || !isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Client Invitations</CardTitle>
          <CardDescription>Connect your Universal Profile to manage client invitations</CardDescription>
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Client Invitations</CardTitle>
            <CardDescription>Invite clients to collaborate on your projects</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Invitation
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Invite a Client</DialogTitle>
                <DialogDescription>
                  Send an invitation to a client to collaborate on your project. They'll receive an email with a link to
                  join.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="projectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          >
                            <option value="" disabled>
                              Select a project
                            </option>
                            {activeProjects.map((project) => (
                              <option key={project.id} value={project.id}>
                                {project.title}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="client@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="upAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Universal Profile Address (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="0x..." {...field} />
                        </FormControl>
                        <FormDescription>
                          If you know the client's Universal Profile address, you can include it here
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invitation Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Write a personal message to the client..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="declined">Declined</TabsTrigger>
          </TabsList>

          <div className="mt-6 space-y-4">
            {filteredInvitations.length === 0 ? (
              <div className="text-center py-8 border rounded-md bg-muted/20">
                <Mail className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No invitations found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInvitations.map((invitation) => (
                  <motion.div
                    key={invitation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-md overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{invitation.projectTitle}</h3>
                          <Badge variant={getStatusBadgeVariant(invitation.status)}>
                            {getStatusIcon(invitation.status)}
                            <span className="ml-1">{capitalizeFirstLetter(invitation.status)}</span>
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">Sent: {formatDate(invitation.createdAt)}</div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{invitation.email}</span>
                        </div>
                        {invitation.upAddress && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-mono">
                              {invitation.upAddress.substring(0, 6)}...
                              {invitation.upAddress.substring(invitation.upAddress.length - 4)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="bg-muted/20 p-3 rounded-md text-sm mb-3">
                        <p>{invitation.message}</p>
                      </div>

                      {invitation.status === "pending" && (
                        <div className="text-xs text-muted-foreground">Expires: {formatDate(invitation.expiresAt)}</div>
                      )}
                      {invitation.status === "accepted" && invitation.acceptedAt && (
                        <div className="text-xs text-green-600 dark:text-green-400">
                          Accepted: {formatDate(invitation.acceptedAt)}
                        </div>
                      )}
                      {invitation.status === "declined" && invitation.declinedAt && (
                        <div className="text-xs text-red-600 dark:text-red-400">
                          Declined: {formatDate(invitation.declinedAt)}
                        </div>
                      )}
                      {invitation.status === "cancelled" && invitation.cancelledAt && (
                        <div className="text-xs text-muted-foreground">
                          Cancelled: {formatDate(invitation.cancelledAt)}
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="p-3 bg-muted/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyInvitationLink(invitation.id)}
                          className="h-8"
                        >
                          <Copy className="h-3.5 w-3.5 mr-1" />
                          Copy Link
                        </Button>
                      </div>

                      {invitation.status === "pending" && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResendInvitation(invitation.id)}
                            className="h-8"
                          >
                            <RefreshCw className="h-3.5 w-3.5 mr-1" />
                            Resend
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleCancelInvitation(invitation.id)}>
                                <X className="h-4 w-4 mr-2" />
                                Cancel Invitation
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </Tabs>
      </CardContent>
      <CardFooter className="bg-muted/20 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>Invitations expire after 7 days if not accepted</p>
        <div className="flex items-center gap-1">
          <Link2 className="h-3 w-3" />
          <span>Invitation links can be shared directly with clients</span>
        </div>
      </CardFooter>
    </Card>
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
      return <Clock className="h-3 w-3" />
    case "accepted":
      return <CheckCircle2 className="h-3 w-3" />
    case "declined":
      return <XCircle className="h-3 w-3" />
    case "cancelled":
      return <X className="h-3 w-3" />
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
