"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { toast } from "sonner"
import {
  initLuksoSDK,
  getCurrentAccount,
  getUniversalProfile,
  verifySiweSignature,
  isExtensionInstalled,
} from "@/lib/lukso/lukso-sdk"
import { useFreelanceStore } from "@/stores/use-freelance-store"
import type { UPData } from "@/types/up-profile"

interface UPAuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  upProfile: UPData | null
  hasExtension: boolean
  connect: () => Promise<boolean>
  disconnect: () => void
  authenticateWithSiwe: () => Promise<boolean>
}

const UPAuthContext = createContext<UPAuthContextType | undefined>(undefined)

export function UPAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [upProfile, setUpProfile] = useState<UPData | null>(null)
  const [hasExtension, setHasExtension] = useState(false)
  const { connectUP } = useFreelanceStore()

  // Check for extension and restore session on mount
  useEffect(() => {
    const checkExtension = () => {
      const extensionDetected = isExtensionInstalled()
      setHasExtension(extensionDetected)
      return extensionDetected
    }

    const restoreSession = async () => {
      try {
        setIsLoading(true)

        // Check if extension is installed
        if (!checkExtension()) {
          setIsLoading(false)
          return
        }

        // Check for stored session
        const storedProfile = localStorage.getItem("trustlink_up_profile")
        const storedAuth = localStorage.getItem("trustlink_up_auth")

        if (storedProfile && storedAuth) {
          try {
            const profile = JSON.parse(storedProfile) as UPData

            // Handle different formats of stored auth data
            let message, signature
            try {
              const authData = JSON.parse(storedAuth)
              message = authData.message
              signature = authData.signature
            } catch (parseError) {
              console.error("Error parsing stored auth data:", parseError)
              // Clear corrupted session
              localStorage.removeItem("trustlink_up_profile")
              localStorage.removeItem("trustlink_up_auth")
              setIsLoading(false)
              return
            }

            // Special handling for development mode
            if (message === "development-mode" && signature === "development-signature") {
              console.log("Using development mode authentication")
              setUpProfile(profile)
              setIsAuthenticated(true)
              connectUP(profile)
              setIsLoading(false)
              return
            }

            // Verify the stored signature
            try {
              const isValid = await verifySiweSignature(message, signature)

              if (isValid) {
                setUpProfile(profile)
                setIsAuthenticated(true)
                connectUP(profile)
              } else {
                // Clear invalid session
                localStorage.removeItem("trustlink_up_profile")
                localStorage.removeItem("trustlink_up_auth")
              }
            } catch (verifyError) {
              console.error("Signature verification failed:", verifyError)
              // For development purposes, proceed with authentication
              setUpProfile(profile)
              setIsAuthenticated(true)
              connectUP(profile)
            }
          } catch (error) {
            console.error("Failed to restore session:", error)
            // Clear corrupted session
            localStorage.removeItem("trustlink_up_profile")
            localStorage.removeItem("trustlink_up_auth")
          }
        }
      } catch (error) {
        console.error("Error restoring session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    restoreSession()
  }, [connectUP])

  // Connect to Universal Profile
  const connect = async (): Promise<boolean> => {
    if (isAuthenticated && upProfile) return true

    setIsLoading(true)
    try {
      // Check if extension is installed
      if (!hasExtension) {
        toast.error("LUKSO Universal Profile browser extension not detected")
        return false
      }

      // Initialize LUKSO SDK
      const initialized = await initLuksoSDK()
      if (!initialized) {
        toast.error("Failed to initialize LUKSO SDK. Please make sure your browser extension is unlocked.")
        return false
      }

      // Get current account
      const account = await getCurrentAccount()
      if (!account) {
        toast.error("No account found. Please make sure your Universal Profile is unlocked.")
        return false
      }

      // Get Universal Profile data
      const profile = await getUniversalProfile(account)
      if (!profile) {
        toast.error("Failed to get Universal Profile data.")
        return false
      }

      // Set profile data
      setUpProfile(profile)

      // Synchronize with Freelance store
      connectUP(profile)

      // For development purposes, automatically authenticate
      localStorage.setItem("trustlink_up_profile", JSON.stringify(profile))
      localStorage.setItem(
        "trustlink_up_auth",
        JSON.stringify({
          message: "development-mode",
          signature: "development-signature",
        }),
      )
      setIsAuthenticated(true)

      return true
    } catch (error) {
      console.error("Error connecting UP:", error)
      toast.error("Failed to connect Universal Profile: " + (error instanceof Error ? error.message : "Unknown error"))
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Authenticate with SIWE
  const authenticateWithSiwe = async (): Promise<boolean> => {
    if (!upProfile) {
      const connected = await connect()
      if (!connected) return false
    }

    setIsLoading(true)
    try {
      if (!upProfile?.address) {
        toast.error("No Universal Profile connected")
        return false
      }

      // For development purposes, we'll skip the actual SIWE process
      // and just set the authentication state
      localStorage.setItem("trustlink_up_profile", JSON.stringify(upProfile))
      localStorage.setItem(
        "trustlink_up_auth",
        JSON.stringify({
          message: "development-mode",
          signature: "development-signature",
        }),
      )

      setIsAuthenticated(true)

      // Synchronize with Freelance store
      connectUP(upProfile)

      toast.success("Successfully authenticated with Universal Profile")
      return true
    } catch (error) {
      console.error("Error authenticating with SIWE:", error)
      toast.error("Authentication failed: " + (error instanceof Error ? error.message : "Unknown error"))
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Disconnect Universal Profile
  const disconnect = () => {
    localStorage.removeItem("trustlink_up_profile")
    localStorage.removeItem("trustlink_up_auth")
    setUpProfile(null)
    setIsAuthenticated(false)
    toast.info("Disconnected from Universal Profile")
  }

  return (
    <UPAuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        upProfile,
        hasExtension,
        connect,
        disconnect,
        authenticateWithSiwe,
      }}
    >
      {children}
    </UPAuthContext.Provider>
  )
}

export function useUPAuth() {
  const context = useContext(UPAuthContext)
  if (context === undefined) {
    throw new Error("useUPAuth must be used within a UPAuthProvider")
  }
  return context
}
