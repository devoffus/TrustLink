"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { AlertCircle, FileText, Link2, Loader2, Milestone, Plus, Trash2, Upload, X } from "lucide-react"
import type { Project } from "@/types/project"
import type { MilestoneEvidence } from "@/types/milestone"

interface MilestoneSubmissionFormProps {
  project: Project
  milestoneIndex: number
  onSubmit: (milestoneIndex: number, data: any) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
}

export function MilestoneSubmissionForm({
  project,
  milestoneIndex,
  onSubmit,
  onCancel,
  isSubmitting,
}: MilestoneSubmissionFormProps) {
  const milestone = project.escrowSettings?.milestones[milestoneIndex]
  const [description, setDescription] = useState("")
  const [evidence, setEvidence] = useState<MilestoneEvidence[]>([])
  const [newLinkUrl, setNewLinkUrl] = useState("")
  const [newLinkDescription, setNewLinkDescription] = useState("")
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [fileUploading, setFileUploading] = useState(false)

  const handleAddLink = () => {
    if (!newLinkUrl) {
      toast.error("Please enter a URL")
      return
    }

    // Validate URL
    try {
      new URL(newLinkUrl)
    } catch (e) {
      toast.error("Please enter a valid URL")
      return
    }

    setEvidence([
      ...evidence,
      {
        type: "link",
        value: newLinkUrl,
        description: newLinkDescription || newLinkUrl,
      },
    ])

    setNewLinkUrl("")
    setNewLinkDescription("")
    setShowLinkForm(false)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setFileUploading(true)
    try {
      // In a real implementation, you would upload the file to IPFS or another storage
      // For demo purposes, we'll simulate file upload with a delay

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Simulate upload delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Create mock file URL
        const mockFileUrl = `#file-${Date.now()}`

        setEvidence([
          ...evidence,
          {
            type: "file",
            value: file.name,
            fileUrl: mockFileUrl,
            fileType: file.type,
            fileSize: file.size,
            description: file.name,
          },
        ])
      }

      // Reset file input
      e.target.value = ""
      toast.success("Files added successfully")
    } catch (error) {
      console.error("Error uploading file:", error)
      toast.error("Failed to upload file")
    } finally {
      setFileUploading(false)
    }
  }

  const handleRemoveEvidence = (index: number) => {
    setEvidence(evidence.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!description) {
      toast.error("Please provide a description of your work")
      return
    }

    if (evidence.length === 0) {
      toast.error("Please provide at least one piece of evidence")
      return
    }

    await onSubmit(milestoneIndex, {
      description,
      evidence,
    })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Submit Milestone for Verification</CardTitle>
              <CardDescription>Provide details about the completed milestone</CardDescription>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Milestone className="h-3.5 w-3.5 mr-1" />
              {milestone?.title || `Milestone ${milestoneIndex + 1}`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description">Description of Work Completed</Label>
            <Textarea
              id="description"
              placeholder="Describe the work you've completed for this milestone..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Provide a detailed description of the work you've completed for this milestone.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Evidence of Completion</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLinkForm(true)}
                  disabled={showLinkForm}
                >
                  <Link2 className="h-3.5 w-3.5 mr-1" />
                  Add Link
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("file-upload")?.click()}
                  disabled={fileUploading}
                >
                  {fileUploading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5 mr-1" />
                      Upload File
                    </>
                  )}
                </Button>
                <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} multiple />
              </div>
            </div>

            {showLinkForm && (
              <div className="border rounded-md p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Add Link</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setShowLinkForm(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="link-url" className="text-xs">
                      URL
                    </Label>
                    <Input
                      id="link-url"
                      placeholder="https://example.com"
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="link-description" className="text-xs">
                      Description (Optional)
                    </Label>
                    <Input
                      id="link-description"
                      placeholder="Description of the link"
                      value={newLinkDescription}
                      onChange={(e) => setNewLinkDescription(e.target.value)}
                    />
                  </div>
                  <Button type="button" size="sm" className="w-full" onClick={handleAddLink}>
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add Link
                  </Button>
                </div>
              </div>
            )}

            {evidence.length > 0 ? (
              <div className="border rounded-md p-3 space-y-2">
                <h4 className="text-sm font-medium">Added Evidence:</h4>
                {evidence.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted/20 rounded-md">
                    <div className="flex items-center gap-2 overflow-hidden">
                      {item.type === "link" ? (
                        <>
                          <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="overflow-hidden">
                            <div className="truncate">{item.description}</div>
                            <div className="text-xs text-muted-foreground truncate">{item.value}</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="overflow-hidden">
                            <div className="truncate">{item.description}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {formatFileSize(item.fileSize || 0)}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleRemoveEvidence(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed rounded-md p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="mt-3">
                  <p className="text-sm font-medium">No evidence added yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add links or upload files to provide evidence of your work
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 p-3 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <h5 className="text-sm font-medium text-amber-800 dark:text-amber-300">Important</h5>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  By submitting this milestone, you confirm that all work has been completed according to the project
                  requirements. The client will review your submission before approving payment.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <Separator />
        <CardFooter className="flex justify-between p-6">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit for Verification"
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
