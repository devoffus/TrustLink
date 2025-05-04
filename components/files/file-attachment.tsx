"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import {
  AlertCircle,
  ArrowUpDown,
  Clock,
  Download,
  Eye,
  File,
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  FileIcon as FilePdf,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Loader2,
  MoreHorizontal,
  Plus,
  Trash2,
  Upload,
} from "lucide-react"
import { useUPAuth } from "@/components/up-profile/up-auth-provider"
import { uploadFile, deleteFile } from "@/lib/lukso/file-service"
import type { ProjectFile } from "@/types/file"

interface FileAttachmentProps {
  projectId: string
}

export function FileAttachment({ projectId }: FileAttachmentProps) {
  const { upProfile, isAuthenticated } = useUPAuth()
  const [files, setFiles] = useState<ProjectFile[]>([
    {
      id: "file-1",
      projectId,
      name: "project-requirements.pdf",
      type: "application/pdf",
      size: 2457600,
      url: "#",
      uploadedBy: "0x1234567890123456789012345678901234567890",
      uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      ipfsHash: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    },
    {
      id: "file-2",
      projectId,
      name: "wireframes.png",
      type: "image/png",
      size: 1048576,
      url: "#",
      uploadedBy: "0x1234567890123456789012345678901234567890",
      uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      ipfsHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
    },
    {
      id: "file-3",
      projectId,
      name: "contract-draft.sol",
      type: "text/plain",
      size: 15360,
      url: "#",
      uploadedBy: "0x1234567890123456789012345678901234567890",
      uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      ipfsHash: "QmZTR5bcpQD7cFgTorqxZDYaew1Wqgfbd2ud9QqGPAkK2V",
    },
  ])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("all")
  const [sortOrder, setSortOrder] = useState<"name" | "date" | "size">("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Process each file
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]

        // Simulate upload progress
        const uploadProgressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            const newProgress = prev + Math.random() * 10
            return newProgress > 95 ? 95 : newProgress
          })
        }, 200)

        // Upload file
        const result = await uploadFile(projectId, file, (progress) => {
          setUploadProgress(progress)
        })

        clearInterval(uploadProgressInterval)
        setUploadProgress(100)

        // Add file to list
        if (result) {
          setFiles((prevFiles) => [
            {
              id: `file-${Date.now()}-${i}`,
              projectId,
              name: file.name,
              type: file.type,
              size: file.size,
              url: result.url,
              uploadedBy: upProfile?.address || "",
              uploadedAt: new Date().toISOString(),
              ipfsHash: result.ipfsHash,
            },
            ...prevFiles,
          ])
        }

        // Reset progress for next file
        setTimeout(() => {
          setUploadProgress(0)
        }, 500)
      }

      toast.success(`${selectedFiles.length} file(s) uploaded successfully`)
    } catch (error) {
      console.error("Error uploading file:", error)
      toast.error("Failed to upload file")
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteFile(fileId)
      setFiles(files.filter((file) => file.id !== fileId))
      toast.success("File deleted successfully")
    } catch (error) {
      console.error("Error deleting file:", error)
      toast.error("Failed to delete file")
    }
  }

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
  }

  const changeSort = (order: "name" | "date" | "size") => {
    if (sortOrder === order) {
      toggleSortDirection()
    } else {
      setSortOrder(order)
      setSortDirection("desc")
    }
  }

  // Filter files based on active tab
  const filteredFiles = files.filter((file) => {
    if (activeTab === "all") return true
    if (activeTab === "documents") {
      return (
        file.type.includes("pdf") ||
        file.type.includes("doc") ||
        file.type.includes("text") ||
        file.type.includes("rtf")
      )
    }
    if (activeTab === "images") {
      return file.type.includes("image")
    }
    if (activeTab === "code") {
      return (
        file.type.includes("javascript") ||
        file.type.includes("typescript") ||
        file.type.includes("json") ||
        file.type.includes("html") ||
        file.type.includes("css") ||
        file.name.endsWith(".js") ||
        file.name.endsWith(".ts") ||
        file.name.endsWith(".jsx") ||
        file.name.endsWith(".tsx") ||
        file.name.endsWith(".sol") ||
        file.name.endsWith(".json") ||
        file.name.endsWith(".html") ||
        file.name.endsWith(".css")
      )
    }
    return true
  })

  // Sort files
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sortOrder === "name") {
      return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    }
    if (sortOrder === "date") {
      return sortDirection === "asc"
        ? new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
        : new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    }
    if (sortOrder === "size") {
      return sortDirection === "asc" ? a.size - b.size : b.size - a.size
    }
    return 0
  })

  if (!upProfile || !isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Files</CardTitle>
          <CardDescription>Connect your Universal Profile to manage project files</CardDescription>
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
            <CardTitle>Project Files</CardTitle>
            <CardDescription>Upload and manage files for this project</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Files
                </>
              )}
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Upload Progress */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Uploading...</span>
                <span className="text-sm">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </motion.div>
          )}
        </AnimatePresence>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <TabsList>
              <TabsTrigger value="all">All Files</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeSort("name")}
                className={sortOrder === "name" ? "bg-muted" : ""}
              >
                Name
                {sortOrder === "name" && (
                  <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeSort("date")}
                className={sortOrder === "date" ? "bg-muted" : ""}
              >
                Date
                {sortOrder === "date" && (
                  <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeSort("size")}
                className={sortOrder === "size" ? "bg-muted" : ""}
              >
                Size
                {sortOrder === "size" && (
                  <ArrowUpDown className={`ml-1 h-3 w-3 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                )}
              </Button>
            </div>
          </div>

          <TabsContent value={activeTab} className="mt-0">
            {sortedFiles.length === 0 ? (
              <div className="text-center py-12 border rounded-md bg-muted/20">
                <File className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground mb-4">No files found</p>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedFiles.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-md overflow-hidden"
                  >
                    <div className="p-4 flex items-center gap-3">
                      <div className="shrink-0">{getFileIcon(file.type, file.name)}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-medium truncate" title={file.name}>
                              {file.name}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{formatFileSize(file.size)}</span>
                              <span>•</span>
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatDate(file.uploadedAt)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{getFileTypeLabel(file.type, file.name)}</Badge>
                            <div className="flex items-center">
                              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                <a href={file.url} target="_blank" rel="noopener noreferrer">
                                  <Eye className="h-4 w-4" />
                                </a>
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                <a href={file.url} download={file.name}>
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <a
                                      href={`https://ipfs.io/ipfs/${file.ipfsHash}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="cursor-pointer"
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      View on IPFS
                                    </a>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeleteFile(file.id)}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete File
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="bg-muted/20 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>Files are stored on IPFS for decentralized access</p>
        <div className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          <span>Maximum file size: 50MB</span>
        </div>
      </CardFooter>
    </Card>
  )
}

function getFileIcon(type: string, name: string) {
  const iconClass = "h-10 w-10 p-2 rounded-md"

  if (type.includes("pdf")) {
    return <FilePdf className={`${iconClass} text-red-500 bg-red-50 dark:bg-red-950/30`} />
  }
  if (type.includes("image")) {
    return <FileImage className={`${iconClass} text-blue-500 bg-blue-50 dark:bg-blue-950/30`} />
  }
  if (type.includes("video")) {
    return <FileVideo className={`${iconClass} text-purple-500 bg-purple-50 dark:bg-purple-950/30`} />
  }
  if (type.includes("audio")) {
    return <FileAudio className={`${iconClass} text-amber-500 bg-amber-50 dark:bg-amber-950/30`} />
  }
  if (
    type.includes("javascript") ||
    type.includes("typescript") ||
    type.includes("json") ||
    type.includes("html") ||
    type.includes("css") ||
    name.endsWith(".js") ||
    name.endsWith(".ts") ||
    name.endsWith(".jsx") ||
    name.endsWith(".tsx") ||
    name.endsWith(".sol") ||
    name.endsWith(".json") ||
    name.endsWith(".html") ||
    name.endsWith(".css")
  ) {
    return <FileCode className={`${iconClass} text-green-500 bg-green-50 dark:bg-green-950/30`} />
  }
  if (
    type.includes("word") ||
    type.includes("document") ||
    type.includes("text") ||
    name.endsWith(".doc") ||
    name.endsWith(".docx") ||
    name.endsWith(".txt") ||
    name.endsWith(".rtf")
  ) {
    return <FileText className={`${iconClass} text-blue-500 bg-blue-50 dark:bg-blue-950/30`} />
  }
  if (
    type.includes("excel") ||
    type.includes("spreadsheet") ||
    name.endsWith(".xls") ||
    name.endsWith(".xlsx") ||
    name.endsWith(".csv")
  ) {
    return <FileSpreadsheet className={`${iconClass} text-green-500 bg-green-50 dark:bg-green-950/30`} />
  }
  if (
    type.includes("zip") ||
    type.includes("rar") ||
    type.includes("tar") ||
    type.includes("gzip") ||
    type.includes("compressed") ||
    name.endsWith(".zip") ||
    name.endsWith(".rar") ||
    name.endsWith(".tar") ||
    name.endsWith(".gz")
  ) {
    return <FileArchive className={`${iconClass} text-amber-500 bg-amber-50 dark:bg-amber-950/30`} />
  }

  return <File className={`${iconClass} text-gray-500 bg-gray-50 dark:bg-gray-800/50`} />
}

function getFileTypeLabel(type: string, name: string): string {
  if (type.includes("pdf")) return "PDF"
  if (type.includes("image")) {
    if (type.includes("png")) return "PNG"
    if (type.includes("jpeg") || type.includes("jpg")) return "JPEG"
    if (type.includes("gif")) return "GIF"
    if (type.includes("svg")) return "SVG"
    return "Image"
  }
  if (type.includes("video")) return "Video"
  if (type.includes("audio")) return "Audio"

  // Check file extensions for code files
  if (name.endsWith(".js")) return "JavaScript"
  if (name.endsWith(".ts")) return "TypeScript"
  if (name.endsWith(".jsx")) return "React"
  if (name.endsWith(".tsx")) return "React TS"
  if (name.endsWith(".sol")) return "Solidity"
  if (name.endsWith(".json")) return "JSON"
  if (name.endsWith(".html")) return "HTML"
  if (name.endsWith(".css")) return "CSS"

  // Document types
  if (type.includes("word") || name.endsWith(".doc") || name.endsWith(".docx")) return "Word"
  if (type.includes("text") || name.endsWith(".txt")) return "Text"
  if (type.includes("rtf") || name.endsWith(".rtf")) return "RTF"

  // Spreadsheets
  if (type.includes("excel") || name.endsWith(".xls") || name.endsWith(".xlsx")) return "Excel"
  if (type.includes("csv") || name.endsWith(".csv")) return "CSV"

  // Archives
  if (type.includes("zip") || name.endsWith(".zip")) return "ZIP"
  if (type.includes("rar") || name.endsWith(".rar")) return "RAR"
  if (type.includes("tar") || name.endsWith(".tar")) return "TAR"
  if (type.includes("gzip") || name.endsWith(".gz")) return "GZIP"

  return "File"
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return "Today"
    } else if (diffDays === 1) {
      return "Yesterday"
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date)
    }
  } catch (error) {
    return "Invalid date"
  }
}
