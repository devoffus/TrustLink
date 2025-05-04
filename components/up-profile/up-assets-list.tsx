"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getProfileOwnedAssets } from "@/lib/lukso/lukso-sdk"
import { useUPAuth } from "./up-auth-provider"
import { Coins, FileImage, Loader2 } from "lucide-react"

export function UPAssetsList() {
  const { upProfile, isAuthenticated } = useUPAuth()
  const [assets, setAssets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchAssets = async () => {
      if (!upProfile?.address || !isAuthenticated) return

      setIsLoading(true)
      try {
        const profileAssets = await getProfileOwnedAssets(upProfile.address)
        setAssets(profileAssets)
      } catch (error) {
        console.error("Error fetching assets:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssets()
  }, [upProfile, isAuthenticated])

  if (!upProfile || !isAuthenticated) {
    return null
  }

  // Filter assets by type
  const tokens = assets.filter((asset) => asset.type.includes("LSP7"))
  const nfts = assets.filter((asset) => asset.type.includes("LSP8"))
  const unknown = assets.filter((asset) => asset.type === "Unknown")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Digital Assets</CardTitle>
        <CardDescription>Tokens and NFTs owned by your Universal Profile</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading assets...</p>
          </div>
        ) : (
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="tokens">Tokens</TabsTrigger>
              <TabsTrigger value="nfts">NFTs</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              {assets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No assets found for this Universal Profile</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assets.map((asset, index) => (
                    <AssetItem key={`${asset.address}-${index}`} asset={asset} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="tokens" className="mt-4">
              {tokens.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No tokens found for this Universal Profile</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tokens.map((asset, index) => (
                    <AssetItem key={`${asset.address}-${index}`} asset={asset} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="nfts" className="mt-4">
              {nfts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No NFTs found for this Universal Profile</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {nfts.map((asset, index) => (
                    <AssetItem key={`${asset.address}-${index}`} asset={asset} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}

function AssetItem({ asset }: { asset: any }) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-md">
      <div className="flex items-center gap-3">
        {asset.type.includes("LSP8") ? (
          <div className="bg-secondary/10 p-2 rounded-md">
            <FileImage className="h-5 w-5 text-secondary" />
          </div>
        ) : (
          <div className="bg-primary/10 p-2 rounded-md">
            <Coins className="h-5 w-5 text-primary" />
          </div>
        )}
        <div>
          <h4 className="font-medium text-sm">{asset.name}</h4>
          <p className="text-xs text-muted-foreground">{asset.symbol}</p>
        </div>
      </div>
      <Badge variant={asset.type.includes("LSP8") ? "secondary" : "default"}>
        {asset.type.includes("LSP8") ? "NFT" : "Token"}
      </Badge>
    </div>
  )
}

function AssetItemSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 border rounded-md">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-md" />
        <div>
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  )
}
