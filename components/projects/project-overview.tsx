"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, FileText, GitBranch, Link } from "lucide-react"
import { getAddressUrl } from "@/lib/lukso/lukso-sdk"
import type { Project } from "@/types/project"

interface ProjectOverviewProps {
  project: Project
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Description</CardTitle>
          <CardDescription>Detailed information about the project scope and requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p>{project.description}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contract Details</CardTitle>
          <CardDescription>Information about the smart contract and blockchain records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Transaction Hash</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs py-1 px-2">
                  {project.txHash}
                </Badge>
                <a
                  href={getAddressUrl(project.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-2">Contract Type</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Escrow</Badge>
                <Badge variant="outline">LSP8</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                This project uses a LUKSO LSP8 compatible escrow contract with milestone-based releases
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-2">Related Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm flex items-center gap-2 text-primary hover:underline">
                    <FileText className="h-4 w-4" />
                    Project Specification Document
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm flex items-center gap-2 text-primary hover:underline">
                    <GitBranch className="h-4 w-4" />
                    GitHub Repository
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm flex items-center gap-2 text-primary hover:underline">
                    <Link className="h-4 w-4" />
                    Client Website
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
