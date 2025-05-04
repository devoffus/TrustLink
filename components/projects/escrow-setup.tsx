"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { EscrowSettings, Milestone } from "@/types/escrow"

interface EscrowSetupProps {
  settings: EscrowSettings
  onChange: (settings: Partial<EscrowSettings>) => void
  projectBudget: number
}

export function EscrowSetup({ settings, onChange, projectBudget }: EscrowSetupProps) {
  const [totalPercentage, setTotalPercentage] = useState(() =>
    settings.milestones.reduce((sum, milestone) => sum + milestone.percentage, 0),
  )

  const handleMilestoneChange = (index: number, field: keyof Milestone, value: string | number) => {
    const updatedMilestones = [...settings.milestones]
    updatedMilestones[index] = {
      ...updatedMilestones[index],
      [field]: value,
    }

    onChange({ milestones: updatedMilestones })

    // Recalculate total percentage
    if (field === "percentage") {
      setTotalPercentage(updatedMilestones.reduce((sum, m) => sum + m.percentage, 0))
    }
  }

  const addMilestone = () => {
    const remainingPercentage = 100 - totalPercentage
    const newPercentage = remainingPercentage > 0 ? remainingPercentage : 0

    const newMilestone: Milestone = {
      title: "",
      percentage: newPercentage,
      description: "",
    }

    onChange({ milestones: [...settings.milestones, newMilestone] })
    setTotalPercentage(totalPercentage + newPercentage)
  }

  const removeMilestone = (index: number) => {
    const removedPercentage = settings.milestones[index].percentage
    const updatedMilestones = settings.milestones.filter((_, i) => i !== index)

    onChange({ milestones: updatedMilestones })
    setTotalPercentage(totalPercentage - removedPercentage)
  }

  const redistributePercentages = () => {
    const count = settings.milestones.length
    if (count === 0) return

    const evenPercentage = Math.floor(100 / count)
    const remainder = 100 - evenPercentage * count

    const updatedMilestones = settings.milestones.map((milestone, index) => ({
      ...milestone,
      percentage: evenPercentage + (index === 0 ? remainder : 0),
    }))

    onChange({ milestones: updatedMilestones })
    setTotalPercentage(100)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Card>
        <CardHeader>
          <CardTitle>Escrow Setup</CardTitle>
          <CardDescription>Configure how funds will be held in escrow and released</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Payment Milestones</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={redistributePercentages}
                  disabled={settings.milestones.length === 0}
                >
                  Distribute Evenly
                </Button>
                <Button variant="outline" size="sm" onClick={addMilestone} disabled={totalPercentage >= 100}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Milestone
                </Button>
              </div>
            </div>

            {totalPercentage !== 100 && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  Total milestone percentages must equal 100%. Current total: {totalPercentage}%
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {settings.milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border rounded-md p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Milestone {index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMilestone(index)}
                        disabled={settings.milestones.length <= 1}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="grid gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`milestone-${index}-title`}>Title</Label>
                          <Input
                            id={`milestone-${index}-title`}
                            value={milestone.title}
                            onChange={(e) => handleMilestoneChange(index, "title", e.target.value)}
                            placeholder="e.g., Initial Design"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`milestone-${index}-percentage`}>Percentage</Label>
                            <span className="text-sm text-muted-foreground">
                              {milestone.percentage}% (≈ {((projectBudget * milestone.percentage) / 100).toFixed(2)}{" "}
                              LUKSO)
                            </span>
                          </div>
                          <Slider
                            id={`milestone-${index}-percentage`}
                            value={[milestone.percentage]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={(value) => handleMilestoneChange(index, "percentage", value[0])}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`milestone-${index}-description`}>Description</Label>
                        <Textarea
                          id={`milestone-${index}-description`}
                          value={milestone.description}
                          onChange={(e) => handleMilestoneChange(index, "description", e.target.value)}
                          placeholder="Describe what needs to be delivered for this milestone..."
                          rows={2}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Release Type</h3>
              <RadioGroup
                value={settings.releaseType}
                onValueChange={(value) => onChange({ releaseType: value })}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manual" id="release-manual" />
                  <Label htmlFor="release-manual">Manual Release</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="automatic" id="release-automatic" />
                  <Label htmlFor="release-automatic">Automatic Release (Time-based)</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Dispute Resolution</h3>
              <Select
                value={settings.disputeResolution}
                onValueChange={(value) => onChange({ disputeResolution: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select dispute resolution method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="arbitration">Arbitration (Third-party)</SelectItem>
                  <SelectItem value="multisig">Multi-signature (2-of-3)</SelectItem>
                  <SelectItem value="dao">DAO Voting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Timelock Period (Days)</h3>
              <div className="flex items-center space-x-4">
                <Slider
                  value={[settings.timelock]}
                  min={1}
                  max={30}
                  step={1}
                  onValueChange={(value) => onChange({ timelock: value[0] })}
                  className="flex-1"
                />
                <span className="w-12 text-center">{settings.timelock}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Period before funds can be withdrawn after a dispute is resolved
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
