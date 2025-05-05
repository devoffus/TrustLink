/**
 * Utility functions for LUKSO integration
 */

/**
 * Check if the application is running in development mode
 * This checks both the environment variable and localStorage
 */
export function isDevelopmentMode(): boolean {
  // First check the environment variable
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_DEV_MODE === "true") {
    return true
  }

  // Then check localStorage as a fallback
  if (typeof window !== "undefined" && window.localStorage) {
    return localStorage.getItem("trustlink_dev_mode") === "true"
  }

  return false
}

/**
 * Set the development mode status
 * @param isDevMode boolean indicating if development mode should be enabled
 */
export function setDevelopmentMode(isDevMode: boolean): void {
  if (typeof window !== "undefined" && window.localStorage) {
    localStorage.setItem("trustlink_dev_mode", isDevMode ? "true" : "false")
  }
}

/**
 * Generates a cryptographically secure random nonce
 * @returns A random string to be used as a nonce
 */
export function generateNonce(): string {
  // Generate a random array of 32 bytes
  const randomBytes = new Uint8Array(32)
  crypto.getRandomValues(randomBytes)

  // Convert to hex string
  return Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

/**
 * Format an address for display
 * @param address The blockchain address to format
 * @param length The number of characters to show at start and end
 * @returns Formatted address string
 */
export function formatAddress(address: string, length = 4): string {
  if (!address || address.length < 10) return address || ""
  return `${address.substring(0, length + 2)}...${address.substring(address.length - length)}`
}

/**
 * Format a date for display
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | number | null | undefined): string {
  if (!date) return "N/A"

  const dateObj = typeof date === "object" ? date : new Date(date)

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj)
}

/**
 * Check if a URL is an IPFS URL
 * @param url URL to check
 * @returns boolean indicating if the URL is an IPFS URL
 */
export function isIpfsUrl(url: string): boolean {
  return url?.startsWith("ipfs://") || false
}

/**
 * Convert an IPFS URL to an HTTP URL
 * @param url IPFS URL to convert
 * @param gateway IPFS gateway to use
 * @returns HTTP URL
 */
export function ipfsToHttp(url: string, gateway = "https://api.universalprofile.cloud/ipfs"): string {
  if (!url || !isIpfsUrl(url)) return url || ""
  return url.replace("ipfs://", `${gateway}/`)
}

/**
 * Truncate a string to a specified length
 * @param str String to truncate
 * @param maxLength Maximum length
 * @returns Truncated string
 */
export function truncateString(str: string, maxLength = 100): string {
  if (!str || str.length <= maxLength) return str || ""
  return `${str.substring(0, maxLength)}...`
}

/**
 * Validates a LUKSO Universal Profile address
 * @param address The address to validate
 * @returns Boolean indicating if the address is valid
 */
export function isValidLuksoAddress(address: string): boolean {
  // Basic validation for Ethereum-style addresses
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}
