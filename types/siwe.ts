import type { SiweMessage } from "siwe"

export interface SiweVerifyResult {
  success: boolean
  data?: {
    address: string
    chainId: number
    issuedAt: string
    expirationTime?: string
  }
  error?: string
}

export interface SiweSession {
  message: string | SiweMessage
  signature: string
  expirationTime?: string
}
