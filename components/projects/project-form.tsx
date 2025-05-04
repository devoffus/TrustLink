"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ProjectDraft } from "@/types/project"
import { useEffect } from "react"

const projectFormSchema = z.object({
  title: z.string().min(3, {
    message: "Project title must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Project description must be at least 10 characters.",
  }),
  client: z.string().min(2, {
    message: "Client name must be at least 2 characters.",
  }),
  budget: z.coerce.number().positive({
    message: "Budget must be a positive number.",
  }),
  deadline: z.date().optional(),
})

type ProjectFormValues = z.infer<typeof projectFormSchema>

interface ProjectFormProps {
  projectData: ProjectDraft
  onChange: (data: Partial<ProjectDraft>) => void
  onNext: () => void
}

export function ProjectForm({ projectData, onChange, onNext }: ProjectFormProps) {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: projectData.title || "",
      description: projectData.description || "",
      client: projectData.client || "",
      budget: projectData.budget || 0,
      deadline: projectData.deadline ? new Date(projectData.deadline) : undefined,
    },
  })

  // Update form when projectData changes externally
  useEffect(() => {
    form.reset({
      title: projectData.title || "",
      description: projectData.description || "",
      client: projectData.client || "",
      budget: projectData.budget || 0,
      deadline: projectData.deadline ? new Date(projectData.deadline) : undefined,
    })
  }, [form, projectData])

  // Update parent component when form values change
  const onFormChange = (values: Partial<ProjectFormValues>) => {
    onChange({
      ...values,
      deadline: values.deadline instanceof Date ? values.deadline.toISOString() : values.deadline,
    })
  }

  const onSubmit = (values: ProjectFormValues) => {
    onFormChange(values)
    onNext()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Enter the basic information about your project</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Website Redesign"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          onFormChange({ title: e.target.value })
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the project scope, goals, and requirements..."
                        className="min-h-[120px]"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          onFormChange({ description: e.target.value })
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="client"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Acme Corp"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                            onFormChange({ client: e.target.value })
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget (LUKSO)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 1000"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                            onFormChange({ budget: Number.parseFloat(e.target.value) || 0 })
                          }}
                        />
                      </FormControl>
                      <FormDescription>Total project budget in LUKSO tokens</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Project Deadline</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date)
                            if (date) {
                              // Pass the Date object directly to onFormChange
                              onFormChange({ deadline: date })
                            }
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>The expected completion date for the project</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" className="flex items-center">
                  Next: Escrow Setup
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
