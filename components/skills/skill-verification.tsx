"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Award, Check, ExternalLink, Loader2, Plus, Upload } from "lucide-react"
import { toast } from "sonner"
import { useUPAuth } from "@/components/up-profile/up-auth-provider"
import { useFreelanceStore } from "@/stores/use-freelance-store"
import { requestSkillVerification } from "@/lib/lukso/skill-service"
import { Label } from "@/components/ui/label"

const skillCategories = [
  { value: "development", label: "Development" },
  { value: "design", label: "Design" },
  { value: "marketing", label: "Marketing" },
  { value: "writing", label: "Writing" },
  { value: "blockchain", label: "Blockchain" },
]

const skillFormSchema = z.object({
  name: z.string().min(3, {
    message: "Skill name must be at least 3 characters.",
  }),
  category: z.string({
    required_error: "Please select a skill category.",
  }),
  experience: z.string({
    required_error: "Please select your experience level.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  portfolioUrl: z
    .string()
    .url({
      message: "Please enter a valid URL.",
    })
    .optional()
    .or(z.literal("")),
})

type SkillFormValues = z.infer<typeof skillFormSchema>

export function SkillVerification() {
  const { upProfile, isAuthenticated } = useUPAuth()
  const { skillsNFTs } = useFreelanceStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [pendingSkills, setPendingSkills] = useState<any[]>([])

  const form = useForm<SkillFormValues>({
    resolver: zodResolver(skillFormSchema),
    defaultValues: {
      name: "",
      category: "",
      experience: "",
      description: "",
      portfolioUrl: "",
    },
  })

  const onSubmit = async (values: SkillFormValues) => {
    if (!upProfile?.address) {
      toast.error("Please connect your Universal Profile first")
      return
    }

    setIsSubmitting(true)
    try {
      // Request skill verification
      await requestSkillVerification(upProfile.address, values)

      // Add to pending skills
      setPendingSkills([
        ...pendingSkills,
        {
          id: `pending-${Date.now()}`,
          name: values.name,
          category: values.category,
          status: "pending",
          timestamp: new Date().toISOString(),
        },
      ])

      toast.success("Skill verification request submitted successfully")
      form.reset()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error requesting skill verification:", error)
      toast.error("Failed to submit skill verification request")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!upProfile || !isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Skill Verification</CardTitle>
          <CardDescription>Connect your Universal Profile to verify your skills</CardDescription>
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
            <CardTitle>Skill Verification</CardTitle>
            <CardDescription>Verify your skills to showcase your expertise</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Request Verification
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Request Skill Verification</DialogTitle>
                <DialogDescription>
                  Submit your skill for verification. Once approved, it will be minted as an NFT on your Universal
                  Profile.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skill Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., React Development" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {skillCategories.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                              <SelectItem value="expert">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your experience with this skill..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="portfolioUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Portfolio URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://your-portfolio.com" {...field} />
                        </FormControl>
                        <FormDescription>Link to a project or portfolio that demonstrates this skill</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="supporting-docs">Supporting Documents (Optional)</Label>
                    <div className="border-2 border-dashed rounded-md p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">Drag and drop files here, or click to browse</p>
                      <Button variant="outline" size="sm" type="button">
                        Browse Files
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Upload certificates, course completions, or other proof of skill
                    </p>
                  </div>
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
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Verified Skills */}
          <div>
            <h3 className="text-lg font-medium mb-3">Verified Skills</h3>
            {skillsNFTs.length === 0 ? (
              <div className="text-center py-6 border rounded-md bg-muted/20">
                <Award className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No verified skills yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {skillsNFTs.map((skill) => (
                  <div key={skill.id} className="border rounded-md p-4 flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{skill.name}</h4>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Verified
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Issued by: {skill.issuer}</p>
                      <div className="mt-2">
                        <a href="#" className="text-xs text-primary hover:underline inline-flex items-center">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View on Explorer
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Verification */}
          {pendingSkills.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-medium mb-3">Pending Verification</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pendingSkills.map((skill) => (
                    <div key={skill.id} className="border rounded-md p-4 flex items-start gap-3">
                      <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full">
                        <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{skill.name}</h4>
                          <Badge
                            variant="outline"
                            className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                          >
                            Pending
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Submitted: {new Date(skill.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-muted/20 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>Verified skills are minted as NFTs on your Universal Profile</p>
        <a href="#" className="text-primary hover:underline inline-flex items-center">
          Learn more about skill verification
          <ExternalLink className="h-3 w-3 ml-1" />
        </a>
      </CardFooter>
    </Card>
  )
}
