/**
 * SIWE (Sign-In With Ethereum) Message Utilities
 *
 * This module provides functions for creating, signing, and verifying SIWE messages
 * according to the EIP-4361 standard for LUKSO Universal Profiles.
 */

import { generateNonce } from "./utils"

/**
 * Interface for SIWE message parameters
 */
export interface SiweMessageParams {
  domain: string
  address: string
  statement?: string
  uri: string
  version: string
  chainId: number
  nonce?: string
  issuedAt?: string
  expirationTime?: string
  notBefore?: string
  requestId?: string
  resources?: string[]
}

/**
 * Creates a properly formatted SIWE message according to EIP-4361
 *
 * @param params - Parameters for the SIWE message
 * @returns Formatted SIWE message string
 */
export function createSiweMessage(params: SiweMessageParams): string {
  const {
    domain,
    address,
    statement,
    uri,
    version,
    chainId,
    nonce = generateNonce(),
    issuedAt = new Date().toISOString(),
    expirationTime,
    notBefore,
    requestId,
    resources,
  } = params

  let message = `${domain} wants you to sign in with your LUKSO account:\n${address}\n\n`

  if (statement) {
    message += `${statement}\n\n`
  }

  message += `URI: ${uri}\n`
  message += `Version: ${version}\n`
  message += `Chain ID: ${chainId}\n`
  message += `Nonce: ${nonce}\n`
  message += `Issued At: ${issuedAt}\n`

  if (expirationTime) {
    message += `Expiration Time: ${expirationTime}\n`
  }

  if (notBefore) {
    message += `Not Before: ${notBefore}\n`
  }

  if (requestId) {
    message += `Request ID: ${requestId}\n`
  }

  if (resources && resources.length > 0) {
    message += `Resources:\n${resources.map((r) => `- ${r}`).join("\n")}`
  }

  return message
}

/**
 * Creates a standard SIWE message for TrustLink authentication
 *
 * @param address - The user's Universal Profile address
 * @param chainId - The LUKSO chain ID (default: 42)
 * @returns Formatted SIWE message
 */
export function createTrustLinkSiweMessage(
  address: string,
  chainId = 42,
): { message: string; nonce: string; expirationTime: string } {
  const nonce = generateNonce()

  // Set expiration to 24 hours from now
  const expirationDate = new Date()
  expirationDate.setHours(expirationDate.getHours() + 24)
  const expirationTime = expirationDate.toISOString()

  const message = createSiweMessage({
    domain: window.location.host,
    address: address,
    statement: "Sign in to TrustLink to access your freelance projects and manage your Universal Profile.",
    uri: window.location.origin,
    version: "1",
    chainId: chainId,
    nonce: nonce,
    issuedAt: new Date().toISOString(),
    expirationTime: expirationTime,
    resources: [`${window.location.origin}/api/auth/verify`, `${window.location.origin}/api/projects`],
  })

  return { message, nonce, expirationTime }
}

/**
 * Utility function to generate a nonce for SIWE messages
 *
 * @returns A random nonce string
 */
export function generateSiweNonce(): string {
  return generateNonce()
}
