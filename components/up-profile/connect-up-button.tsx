"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useUPAuth } from "./up-auth-provider"
import { Loader2, LogIn, LogOut, UserRound } from "lucide-react"

export function ConnectUPButton() {
  const { upProfile, isAuthenticated, isLoading, connect, disconnect, authenticateWithSiwe } = useUPAuth()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    if (isAuthenticated) {
      disconnect()
      return
    }

    setIsConnecting(true)
    try {
      // First connect the UP
      const connected = await connect()
      if (!connected) return

      // Then authenticate with SIWE
      await authenticateWithSiwe()
    } finally {
      setIsConnecting(false)
    }
  }

  if (isLoading) {
    return (
      <Button disabled className="w-full">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    )
  }

  if (isAuthenticated && upProfile) {
    return (
      <Button onClick={handleConnect} variant="outline" className="w-full">
        <UserRound className="mr-2 h-4 w-4" />
        <span className="truncate max-w-[200px]">{upProfile.name}</span>
        <LogOut className="ml-2 h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button onClick={handleConnect} disabled={isConnecting} className="w-full">
      {isConnecting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <LogIn className="mr-2 h-4 w-4" />
          Connect Universal Profile
        </>
      )}
    </Button>
  )
}
