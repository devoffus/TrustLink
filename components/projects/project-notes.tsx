"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, FileText, Plus } from "lucide-react"
import { toast } from "sonner"

interface ProjectNotesProps {
  projectId: string
}

interface Note {
  id: string
  content: string
  author: {
    name: string
    avatar?: string
  }
  timestamp: string
}

export function ProjectNotes({ projectId }: ProjectNotesProps) {
  const [newNote, setNewNote] = useState("")
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "note-1",
      content: "Initial project setup completed. Created the escrow contract and set up the milestones as discussed.",
      author: {
        name: "Demo User",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ])

  const handleAddNote = () => {
    if (!newNote.trim()) {
      toast.error("Please enter a note")
      return
    }

    const note: Note = {
      id: `note-${Date.now()}`,
      content: newNote,
      author: {
        name: "Demo User",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      timestamp: new Date().toISOString(),
    }

    setNotes([note, ...notes])
    setNewNote("")
    toast.success("Note added successfully")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Notes</CardTitle>
        <CardDescription>Add notes and updates about the project progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Add a note about the project..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
            />
            <Button onClick={handleAddNote} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </div>

          <Separator />

          <div className="space-y-6">
            {notes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notes yet. Add your first note above.</p>
              </div>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="space-y-2">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={note.author.avatar || "/placeholder.svg"} alt={note.author.name} />
                      <AvatarFallback>{note.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{note.author.name}</h4>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          <span>{formatNoteDate(note.timestamp)}</span>
                        </div>
                      </div>

                      <p className="text-sm mt-1">{note.content}</p>
                    </div>
                  </div>

                  {notes.indexOf(note) !== notes.length - 1 && <Separator />}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/20 border-t text-xs text-muted-foreground">
        Notes are stored on-chain and visible to all project participants
      </CardFooter>
    </Card>
  )
}

function formatNoteDate(timestamp: string): string {
  try {
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) {
      return "Unknown date"
    }

    // If it's today, show time
    const today = new Date()
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    }

    // If it's yesterday
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    }

    // Otherwise show date
    return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
  } catch (error) {
    console.error("Error formatting note date:", error)
    return "Unknown date"
  }
}
