"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { Award, ExternalLink, LogOut, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useUPAuth } from "./up-auth-provider"
import { getAddressUrl } from "@/lib/lukso/lukso-sdk"
import { useFreelanceStore } from "@/stores/use-freelance-store"

export function UPProfileCard() {
  const { upProfile, isAuthenticated, disconnect } = useUPAuth()
  const { skillsNFTs, reputationScore } = useFreelanceStore()

  if (!upProfile) {
    return <UPProfileCardSkeleton />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.03 }}
      className="mb-6"
    >
      <Card className="overflow-hidden">
        <CardHeader className="bg-primary/10 pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-primary">
                <Image
                  src={upProfile.profileImage || "/placeholder.svg?height=64&width=64"}
                  alt={upProfile.name || "Profile"}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              </div>
              <div>
                <CardTitle>{upProfile.name || "Anonymous User"}</CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <span className="text-xs font-mono">{truncateAddress(upProfile.address)}</span>
                  <a
                    href={getAddressUrl(upProfile.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 text-primary hover:text-primary/80"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-secondary" />
                {reputationScore.toFixed(1)}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Bio</h3>
              <p className="text-sm text-muted-foreground">{upProfile.bio || "No bio provided"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skillsNFTs.length > 0 ? (
                  skillsNFTs.map((skill) => (
                    <Badge key={skill.id} variant="outline" className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      {skill.name}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No skills verified yet</p>
                )}
              </div>
            </div>

            {isAuthenticated && (
              <Button variant="outline" size="sm" className="w-full mt-4" onClick={disconnect}>
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function UPProfileCardSkeleton() {
  return (
    <Card className="overflow-hidden mb-6">
      <CardHeader className="bg-primary/5 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="space-y-4">
          <div>
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          <div>
            <Skeleton className="h-4 w-16 mb-2" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function truncateAddress(address: string): string {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
