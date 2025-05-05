import { ERC725 } from "@erc725/erc725.js"
import Web3 from "web3"
import {
  LUKSO_NETWORKS,
  DEFAULT_NETWORK,
  CONTRACT_ADDRESSES,
  ABI_FRAGMENTS,
  ERC725_SCHEMA_KEYS,
  IPFS_GATEWAY,
  APP_CONFIG,
} from "./lukso-config"
import { isDevelopmentMode } from "./utils"
import type { UPData } from "@/types/up-profile"
import type { SkillBadge } from "@/types/skill-badge"
import type { SiweVerifyResult } from "@/types/siwe"

// Add SIWE (Sign-In With Ethereum) authentication support
import { SiweMessage, generateNonce } from "siwe"

// Initialize Web3 with the default network
let web3: Web3 | null = null
let isInitialized = false
let currentNetwork = DEFAULT_NETWORK

// Define the EscrowSettings type
interface EscrowSettings {
  milestones: { title: string; percentage: number; description?: string }[]
  releaseType: "manual" | "automatic"
  disputeResolution: "arbitration" | "multisig" | "none"
  timelock: number
}

// Initialize the SDK
export async function initLuksoSDK(networkName = DEFAULT_NETWORK): Promise<boolean> {
  try {
    currentNetwork = networkName

    // If already initialized with the same network, return true
    if (isInitialized && web3) {
      const chainId = await web3.eth.getChainId()
      const network = LUKSO_NETWORKS[networkName as keyof typeof LUKSO_NETWORKS]

      if (chainId === network.chainId) {
        return true
      }
      // Otherwise continue to reinitialize with the new network
    }

    const network = LUKSO_NETWORKS[networkName as keyof typeof LUKSO_NETWORKS]

    // Check if browser has ethereum provider
    if (typeof window !== "undefined" && window.ethereum) {
      web3 = new Web3(window.ethereum)

      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" })

        // Check if connected to the correct network
        const chainId = await web3.eth.getChainId()
        if (chainId !== network.chainId) {
          // Request network switch
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: `0x${network.chainId.toString(16)}` }],
            })
          } catch (switchError: any) {
            // Network not added yet, add it
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: `0x${network.chainId.toString(16)}`,
                    chainName: network.name,
                    rpcUrls: [network.rpcUrl],
                    blockExplorerUrls: [network.blockExplorerUrl],
                  },
                ],
              })
            } else {
              throw switchError
            }
          }
        }

        isInitialized = true
        return true
      } catch (error) {
        console.error("Failed to initialize provider:", error)

        // Fallback to read-only provider
        web3 = new Web3(new Web3.providers.HttpProvider(network.rpcUrl))
        console.warn("Failed to connect to browser provider. Using read-only mode.")
        isInitialized = true
        return false
      }
    } else {
      // Fallback to read-only provider
      web3 = new Web3(new Web3.providers.HttpProvider(network.rpcUrl))
      console.warn("No browser provider detected. Using read-only mode.")
      isInitialized = true
      return false
    }
  } catch (error) {
    console.error("Failed to initialize LUKSO SDK:", error)
    return false
  }
}

// Check if LUKSO browser extension is installed
export function isExtensionInstalled(): boolean {
  return typeof window !== "undefined" && !!window.ethereum
}

// Check if the connected extension is UP-compatible
export async function isUPCompatible(): Promise<boolean> {
  try {
    if (!web3) {
      await initLuksoSDK()
    }

    if (!web3) return false

    // Check if the provider has the necessary methods
    const hasEthAccounts = typeof window.ethereum.request === "function"

    // Check if we can get accounts
    if (hasEthAccounts) {
      const accounts = await web3.eth.getAccounts()
      if (accounts && accounts.length > 0) {
        // Try to detect if this is a UP by checking for ERC725 data
        try {
          const erc725 = new ERC725(
            [
              {
                name: "SupportedStandards:LSP3UniversalProfile",
                key: "0xeafec4d89fa9619884b6b89135626455000000000000000000000000abe425d6",
                keyType: "Mapping",
                valueType: "bytes",
                valueContent: "0xabe425d6",
              },
            ],
            accounts[0],
            web3.currentProvider,
          )

          const supportedStandards = await erc725.getData("SupportedStandards:LSP3UniversalProfile")
          return !!supportedStandards && !!supportedStandards.value
        } catch (error) {
          console.error("Error checking for UP compatibility:", error)
          return false
        }
      }
    }

    return false
  } catch (error) {
    console.error("Error checking UP compatibility:", error)
    return false
  }
}

// Get the current account
export async function getCurrentAccount(): Promise<string | null> {
  try {
    if (!web3) {
      await initLuksoSDK()
    }

    if (!web3) return null

    const accounts = await web3.eth.getAccounts()
    return accounts[0] || null
  } catch (error) {
    console.error("Failed to get current account:", error)
    return null
  }
}

// Get Universal Profile data
export async function getUniversalProfile(address: string): Promise<UPData | null> {
  try {
    if (!web3) {
      await initLuksoSDK()
    }

    if (!web3 || !address) return null

    // In development mode, we can return mock data
    if (isDevelopmentMode()) {
      console.log("Development mode: Using mock Universal Profile data")
      return {
        address,
        name: `UP ${address.substring(0, 6)}...${address.substring(38)}`,
        profileImage: "/placeholder.svg?height=100&width=100",
        bio: "This is a mock Universal Profile for development purposes.",
        links: [],
        tags: ["Development", "Mock"],
      }
    }

    // Create ERC725 instance
    const erc725 = new ERC725(
      [
        {
          name: "SupportedStandards:LSP3UniversalProfile",
          key: "0xeafec4d89fa9619884b6b89135626455000000000000000000000000abe425d6",
          keyType: "Mapping",
          valueType: "bytes",
          valueContent: "0xabe425d6",
        },
        {
          name: "LSP3Profile",
          key: ERC725_SCHEMA_KEYS.LSP3_PROFILE,
          keyType: "Singleton",
          valueType: "bytes",
          valueContent: "JSONURL",
        },
      ],
      address,
      web3.currentProvider,
    )

    // Fetch profile data
    const profileData = await erc725.getData("LSP3Profile")

    // If no profile data, return basic address info
    if (!profileData || !profileData.value) {
      return {
        address,
        name: `UP ${address.substring(0, 6)}...${address.substring(38)}`,
      }
    }

    // Parse profile data
    let profile: any = {}

    try {
      // If it's a JSONURL, fetch the actual data
      if (typeof profileData.value === "string" && profileData.value.startsWith("ipfs://")) {
        const ipfsUrl = profileData.value.replace("ipfs://", `${IPFS_GATEWAY}/`)
        const response = await fetch(ipfsUrl)
        if (!response.ok) {
          throw new Error(`Failed to fetch profile data: ${response.status}`)
        }
        profile = await response.json()
      } else if (typeof profileData.value === "object") {
        profile = profileData.value
      }
    } catch (error) {
      console.error("Failed to parse profile data:", error)
    }

    // Return formatted profile data
    return {
      address,
      name: profile.name || `UP ${address.substring(0, 6)}...${address.substring(38)}`,
      profileImage: profile.profileImage?.[0]?.url || null,
      bio: profile.description || "",
      links: profile.links || [],
      tags: profile.tags || [],
    }
  } catch (error) {
    console.error("Failed to get Universal Profile:", error)
    return null
  }
}

// Get skills NFTs for a Universal Profile
export async function getSkillsNFTs(address: string): Promise<SkillBadge[]> {
  try {
    if (!web3) {
      await initLuksoSDK()
    }

    if (!web3 || !address) return []

    // In development mode, return mock data
    if (isDevelopmentMode()) {
      console.log("Development mode: Using mock skill badges")
      return [
        {
          id: "skill-1",
          address: "0x1234567890123456789012345678901234567890",
          name: "Smart Contract Development",
          description: "Proficient in developing smart contracts on LUKSO",
          issuer: "LUKSO Skill Verification",
          issuedAt: new Date().toISOString(),
          image: "/placeholder.svg?height=200&width=200",
        },
        {
          id: "skill-2",
          address: "0x2345678901234567890123456789012345678901",
          name: "Frontend Development",
          description: "Experienced in building web interfaces for blockchain applications",
          issuer: "LUKSO Skill Verification",
          issuedAt: new Date().toISOString(),
          image: "/placeholder.svg?height=200&width=200",
        },
      ]
    }

    // Create ERC725 instance
    const erc725 = new ERC725(
      [
        {
          name: "LSP12IssuedAssets[]",
          key: ERC725_SCHEMA_KEYS.LSP12_ISSUED_ASSETS,
          keyType: "Array",
          valueType: "address",
          valueContent: "Address",
        },
      ],
      address,
      web3.currentProvider,
    )

    // Fetch issued assets
    const issuedAssets = await erc725.getData("LSP12IssuedAssets[]")

    // If no assets, return empty array
    if (!issuedAssets || !issuedAssets.value || !Array.isArray(issuedAssets.value)) {
      return []
    }

    // Get contract addresses for the current network
    const networkName = currentNetwork
    const contractAddresses = CONTRACT_ADDRESSES[networkName as keyof typeof CONTRACT_ADDRESSES]

    // Get the skill verification contract address
    const skillVerificationAddress = contractAddresses.skillVerification

    // Filter assets that are issued by the skill verification contract
    const skillAssets = issuedAssets.value.filter((assetAddress: string) => {
      // In a real implementation, you would check if this asset is a skill badge
      // For now, we'll assume all assets from the skill verification contract are skill badges
      return true // Replace with actual verification logic
    })

    // Fetch metadata for each skill asset
    const skillBadges = await Promise.all(
      skillAssets.map(async (assetAddress: string, index: number) => {
        try {
          // Create contract instance for the asset
          const assetContract = new web3.eth.Contract(ABI_FRAGMENTS.lsp8IdentifiableDigitalAsset as any, assetAddress)

          // Get asset metadata from ERC725
          const assetErc725 = new ERC725(
            [
              {
                name: "LSP4TokenName",
                key: "0xdeba1e292f8ba88238e10ab3c7f88bd4be4fac56cad5194b6ecceaf653468af1",
                keyType: "Singleton",
                valueType: "string",
                valueContent: "String",
              },
              {
                name: "LSP4TokenSymbol",
                key: "0x2f0a68ab07768e01943a599e73362a0e17a63a72e94dd2e384d2c1d4db932756",
                keyType: "Singleton",
                valueType: "string",
                valueContent: "String",
              },
              {
                name: "LSP4Metadata",
                key: "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e",
                keyType: "Singleton",
                valueType: "bytes",
                valueContent: "JSONURL",
              },
            ],
            assetAddress,
            web3.currentProvider,
          )

          const [name, metadata] = await Promise.all([
            assetErc725.getData("LSP4TokenName"),
            assetErc725.getData("LSP4Metadata"),
          ])

          let metadataContent: any = {}

          // Fetch metadata content if available
          if (metadata?.value && typeof metadata.value === "string" && metadata.value.startsWith("ipfs://")) {
            try {
              const ipfsUrl = metadata.value.replace("ipfs://", `${IPFS_GATEWAY}/`)
              const response = await fetch(ipfsUrl)
              if (response.ok) {
                metadataContent = await response.json()
              }
            } catch (metadataError) {
              console.error("Error fetching asset metadata:", metadataError)
            }
          }

          return {
            id: `skill-${assetAddress}`,
            address: assetAddress,
            name: name?.value || "Unknown Skill",
            description: metadataContent.description || "",
            issuer: metadataContent.issuer || "LUKSO Skill Verification",
            issuedAt: metadataContent.issuedAt || new Date().toISOString(),
            image: metadataContent.image?.startsWith("ipfs://")
              ? metadataContent.image.replace("ipfs://", `${IPFS_GATEWAY}/`)
              : metadataContent.image || null,
          }
        } catch (error) {
          console.error(`Error processing skill asset ${assetAddress}:`, error)
          return {
            id: `skill-${index}`,
            address: assetAddress,
            name: "Unknown Skill",
            description: "",
            issuer: "Unknown",
            issuedAt: new Date().toISOString(),
            image: null,
          }
        }
      }),
    )

    return skillBadges
  } catch (error) {
    console.error("Failed to get skills NFTs:", error)
    return []
  }
}

// Get owned assets (tokens and NFTs) of a Universal Profile
export async function getProfileOwnedAssets(address: string): Promise<any[]> {
  try {
    // In development mode, return mock data
    if (isDevelopmentMode()) {
      console.log("Development mode: Using mock assets data")
      return [
        {
          address: "0x3456789012345678901234567890123456789012",
          name: "LUKSO Token",
          symbol: "LYX",
          type: "LSP7",
          balance: "1000.0",
          metadata: null,
        },
        {
          address: "0x4567890123456789012345678901234567890123",
          name: "TrustLink Badge",
          symbol: "TLB",
          type: "LSP8",
          tokenId: "0x1234",
          metadata: {
            image: "/placeholder.svg?height=150&width=150",
          },
        },
      ]
    }

    if (!web3) {
      await initLuksoSDK()
    }

    if (!web3 || !address) return []

    // Create ERC725 instance
    const erc725 = new ERC725(
      [
        {
          name: "LSP5ReceivedAssets[]",
          key: ERC725_SCHEMA_KEYS.LSP5_RECEIVED_ASSETS,
          keyType: "Array",
          valueType: "address",
          valueContent: "Address",
        },
      ],
      address,
      web3.currentProvider,
    )

    // Fetch received assets
    const receivedAssets = await erc725.getData("LSP5ReceivedAssets[]")

    // If no assets, return empty array
    if (!receivedAssets || !receivedAssets.value || !Array.isArray(receivedAssets.value)) {
      return []
    }

    // Format assets with additional metadata
    const assets = await Promise.all(
      receivedAssets.value.map(async (assetAddress: string) => {
        try {
          // Get asset metadata
          const assetErc725 = new ERC725(
            [
              {
                name: "LSP4TokenName",
                key: "0xdeba1e292f8ba88238e10ab3c7f88bd4be4fac56cad5194b6ecceaf653468af1",
                keyType: "Singleton",
                valueType: "string",
                valueContent: "String",
              },
              {
                name: "LSP4TokenSymbol",
                key: "0x2f0a68ab07768e01943a599e73362a0e17a63a72e94dd2e384d2c1d4db932756",
                keyType: "Singleton",
                valueType: "string",
                valueContent: "String",
              },
              {
                name: "LSP4Metadata",
                key: "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e",
                keyType: "Singleton",
                valueType: "bytes",
                valueContent: "JSONURL",
              },
              {
                name: "SupportedStandards:LSP7DigitalAsset",
                key: "0xeafec4d89fa9619884b6b89135626455000000000000000000000000a4d96624",
                keyType: "Mapping",
                valueType: "bytes",
                valueContent: "0xa4d96624",
              },
              {
                name: "SupportedStandards:LSP8IdentifiableDigitalAsset",
                key: "0xeafec4d89fa9619884b6b89135626455000000000000000000000000cbe54b82",
                keyType: "Mapping",
                valueType: "bytes",
                valueContent: "0xcbe54b82",
              },
            ],
            assetAddress,
            web3.currentProvider,
          )

          const [name, symbol, metadata, isLSP7, isLSP8] = await Promise.all([
            assetErc725.getData("LSP4TokenName"),
            assetErc725.getData("LSP4TokenSymbol"),
            assetErc725.getData("LSP4Metadata"),
            assetErc725.getData("SupportedStandards:LSP7DigitalAsset"),
            assetErc725.getData("SupportedStandards:LSP8IdentifiableDigitalAsset"),
          ])

          let metadataContent = {}
          let assetType = "Unknown"

          // Determine asset type
          if (isLSP7 && isLSP7.value) {
            assetType = "LSP7"
          } else if (isLSP8 && isLSP8.value) {
            assetType = "LSP8"
          }

          // Fetch metadata content if available
          if (metadata?.value && typeof metadata.value === "string" && metadata.value.startsWith("ipfs://")) {
            try {
              const ipfsUrl = metadata.value.replace("ipfs://", `${IPFS_GATEWAY}/`)
              const response = await fetch(ipfsUrl)
              if (response.ok) {
                metadataContent = await response.json()
              }
            } catch (error) {
              console.error(`Error fetching metadata for asset ${assetAddress}:`, error)
            }
          }

          return {
            address: assetAddress,
            name: name?.value || "Unknown Asset",
            symbol: symbol?.value || "???",
            metadata: metadataContent || null,
            type: assetType,
          }
        } catch (error) {
          console.error(`Error fetching metadata for asset ${assetAddress}:`, error)
          return {
            address: assetAddress,
            name: "Unknown Asset",
            symbol: "???",
            metadata: null,
            type: "Unknown",
          }
        }
      }),
    )

    return assets
  } catch (error) {
    console.error("Failed to get profile owned assets:", error)
    return []
  }
}

// Create an escrow contract
export async function createEscrowContract(
  clientAddress: string,
  freelancerAddress: string,
  budget: number,
  escrowSettings: EscrowSettings,
): Promise<{ address: string; txHash: string } | null> {
  try {
    // In development mode, return mock contract data
    if (isDevelopmentMode()) {
      console.log("Development mode: Using mock escrow contract creation")
      return {
        address: "0x" + Math.random().toString(16).substring(2, 42),
        txHash: "0x" + Math.random().toString(16).substring(2, 66),
      }
    }

    if (!web3) {
      const initialized = await initLuksoSDK()
      if (!initialized) {
        throw new Error("Failed to initialize LUKSO SDK")
      }
    }

    if (!web3) throw new Error("Web3 not initialized")

    const account = await getCurrentAccount()
    if (!account) throw new Error("No account connected")

    // Get contract addresses for the current network
    const networkName = currentNetwork
    const contractAddresses = CONTRACT_ADDRESSES[networkName as keyof typeof CONTRACT_ADDRESSES]

    // Create contract instance
    const escrowFactory = new web3.eth.Contract(ABI_FRAGMENTS.escrowFactory as any, contractAddresses.escrowFactory)

    // Encode milestone data
    const milestonesData = web3.eth.abi.encodeParameter(
      "tuple(string,uint256,string)[]",
      escrowSettings.milestones.map((m) => [m.title, m.percentage, m.description || ""]),
    )

    // Convert release type and dispute resolution to numbers
    const releaseTypeNum = escrowSettings.releaseType === "manual" ? 0 : 1
    const disputeResolutionNum =
      escrowSettings.disputeResolution === "arbitration" ? 0 : escrowSettings.disputeResolution === "multisig" ? 1 : 2

    // Convert budget to wei
    const budgetWei = web3.utils.toWei(budget.toString(), "ether")

    console.log("Creating escrow contract with parameters:", {
      clientAddress,
      freelancerAddress,
      budgetWei,
      milestonesCount: escrowSettings.milestones.length,
      releaseTypeNum,
      disputeResolutionNum,
      timelock: escrowSettings.timelock,
    })

    // Estimate gas for the transaction
    const gasEstimate = await escrowFactory.methods
      .createEscrow(
        clientAddress,
        freelancerAddress,
        budgetWei,
        milestonesData,
        releaseTypeNum,
        disputeResolutionNum,
        escrowSettings.timelock,
      )
      .estimateGas({
        from: account,
        value: budgetWei,
      })

    // Add 20% buffer to gas estimate
    const gasLimit = Math.ceil(gasEstimate * 1.2)

    // Create escrow contract
    const tx = await escrowFactory.methods
      .createEscrow(
        clientAddress,
        freelancerAddress,
        budgetWei,
        milestonesData,
        releaseTypeNum,
        disputeResolutionNum,
        escrowSettings.timelock,
      )
      .send({
        from: account,
        value: budgetWei, // Send the budget amount with the transaction
        gas: gasLimit,
      })

    console.log("Escrow contract created:", tx)

    // Get the escrow address from the transaction receipt
    const escrowAddress = tx.events.EscrowCreated.returnValues.escrowAddress
    const txHash = tx.transactionHash

    return { address: escrowAddress, txHash }
  } catch (error) {
    console.error("Failed to create escrow contract:", error)
    throw error
  }
}

// Submit a milestone
export async function submitMilestone(escrowAddress: string, milestoneId: number, evidence = ""): Promise<string> {
  try {
    // In development mode, return mock transaction hash
    if (isDevelopmentMode()) {
      console.log("Development mode: Using mock milestone submission")
      return "0x" + Math.random().toString(16).substring(2, 66)
    }

    if (!web3) {
      await initLuksoSDK()
    }

    if (!web3) throw new Error("Web3 not initialized")

    const account = await getCurrentAccount()
    if (!account) throw new Error("No account connected")

    // Create contract instance
    const escrowContract = new web3.eth.Contract(ABI_FRAGMENTS.escrow as any, escrowAddress)

    console.log(`Submitting milestone ${milestoneId} for contract ${escrowAddress}`)

    // Estimate gas
    const gasEstimate = await escrowContract.methods.submitMilestone(milestoneId).estimateGas({
      from: account,
    })

    // Add 20% buffer to gas estimate
    const gasLimit = Math.ceil(gasEstimate * 1.2)

    // Submit milestone
    const tx = await escrowContract.methods.submitMilestone(milestoneId).send({
      from: account,
      gas: gasLimit,
    })

    console.log("Milestone submitted:", tx)
    return tx.transactionHash
  } catch (error) {
    console.error("Failed to submit milestone:", error)
    throw new Error("Failed to submit milestone: " + (error instanceof Error ? error.message : "Unknown error"))
  }
}

// Approve a milestone
export async function approveMilestone(escrowAddress: string, milestoneId: number): Promise<string> {
  try {
    // In development mode, return mock transaction hash
    if (isDevelopmentMode()) {
      console.log("Development mode: Using mock milestone approval")
      return "0x" + Math.random().toString(16).substring(2, 66)
    }

    if (!web3) {
      await initLuksoSDK()
    }

    if (!web3) throw new Error("Web3 not initialized")

    const account = await getCurrentAccount()
    if (!account) throw new Error("No account connected")

    // Create contract instance
    const escrowContract = new web3.eth.Contract(ABI_FRAGMENTS.escrow as any, escrowAddress)

    console.log(`Approving milestone ${milestoneId} for contract ${escrowAddress}`)

    // Estimate gas
    const gasEstimate = await escrowContract.methods.approveMilestone(milestoneId).estimateGas({
      from: account,
    })

    // Add 20% buffer to gas estimate
    const gasLimit = Math.ceil(gasEstimate * 1.2)

    // Approve milestone
    const tx = await escrowContract.methods.approveMilestone(milestoneId).send({
      from: account,
      gas: gasLimit,
    })

    console.log("Milestone approved:", tx)
    return tx.transactionHash
  } catch (error) {
    console.error("Failed to approve milestone:", error)
    throw new Error("Failed to approve milestone: " + (error instanceof Error ? error.message : "Unknown error"))
  }
}

// Open a dispute
export async function openDispute(escrowAddress: string, reason: string): Promise<string> {
  try {
    // In development mode, return mock transaction hash
    if (isDevelopmentMode()) {
      console.log("Development mode: Using mock dispute opening")
      return "0x" + Math.random().toString(16).substring(2, 66)
    }

    if (!web3) {
      await initLuksoSDK()
    }

    if (!web3) throw new Error("Web3 not initialized")

    const account = await getCurrentAccount()
    if (!account) throw new Error("No account connected")

    // Create contract instance
    const escrowContract = new web3.eth.Contract(ABI_FRAGMENTS.escrow as any, escrowAddress)

    console.log(`Opening dispute for contract ${escrowAddress} with reason: ${reason}`)

    // Estimate gas
    const gasEstimate = await escrowContract.methods.openDispute(reason).estimateGas({
      from: account,
    })

    // Add 20% buffer to gas estimate
    const gasLimit = Math.ceil(gasEstimate * 1.2)

    // Open dispute
    const tx = await escrowContract.methods.openDispute(reason).send({
      from: account,
      gas: gasLimit,
    })

    console.log("Dispute opened:", tx)
    return tx.transactionHash
  } catch (error) {
    console.error("Failed to open dispute:", error)
    throw new Error("Failed to open dispute: " + (error instanceof Error ? error.message : "Unknown error"))
  }
}

// Create a properly formatted SIWE message for authentication
export async function createSiweMessage(
  address: string,
  statement = "Sign in with your Universal Profile to access TrustLink",
): Promise<{ message: SiweMessage; preparedMessage: string }> {
  if (!web3) {
    await initLuksoSDK()
  }

  if (!web3) throw new Error("Web3 not initialized")

  // Get current network info
  const networkName = currentNetwork
  const network = LUKSO_NETWORKS[networkName as keyof typeof LUKSO_NETWORKS]

  // Get the current domain
  const domain = APP_CONFIG.appDomain
  const origin = typeof window !== "undefined" ? window.location.origin : `https://${APP_CONFIG.appDomain}`

  // Create a secure nonce
  const nonce = generateNonce()

  // Get the current time for issued at
  const issuedAt = new Date().toISOString()

  // Set expiration time (configurable hours from now)
  const expirationTime = new Date()
  expirationTime.setHours(expirationTime.getHours() + APP_CONFIG.siweExpirationTime)
  const expirationTimeISO = expirationTime.toISOString()

  // Create fully compliant SIWE message with all required fields
  const siweMessage = new SiweMessage({
    domain,
    address,
    statement,
    uri: origin,
    version: "1",
    chainId: network.chainId,
    nonce,
    issuedAt,
    expirationTime: expirationTimeISO,
    resources: [
      // Include resources that this signature will grant access to
      `${origin}/api/auth`,
      `${origin}/api/profile`,
      `${origin}/api/projects`,
    ],
  })

  // Prepare the message for signing
  const preparedMessage = siweMessage.prepareMessage()

  // Log for debugging
  console.log("Created SIWE message:", {
    message: siweMessage,
    preparedMessage,
  })

  return { message: siweMessage, preparedMessage }
}

// Sign a message with the Universal Profile
export async function signMessage(message: string): Promise<string> {
  if (!web3) {
    await initLuksoSDK()
  }

  if (!web3) throw new Error("Web3 not initialized")

  const account = await getCurrentAccount()
  if (!account) throw new Error("No account connected")

  try {
    // Display the message in console for debugging
    console.log("Signing message:", message)

    // Use personal_sign for Universal Profile compatibility
    const signature = await web3.eth.personal.sign(message, account, "")
    return signature
  } catch (error) {
    console.error("Error signing message:", error)
    throw new Error(
      "Failed to sign message with Universal Profile: " +
        (error instanceof Error ? error.message : "User rejected the signature request"),
    )
  }
}

// Verify a SIWE signature
export async function verifySiweSignature(
  message: string | SiweMessage,
  signature: string,
  env = "production",
): Promise<SiweVerifyResult> {
  try {
    // For development mode, check if we're using the development signature
    if (
      (env === "development" || isDevelopmentMode()) &&
      message === "development-mode" &&
      signature === "development-signature"
    ) {
      console.log("Using development mode authentication, bypassing signature verification")
      return {
        success: true,
        data: {
          address: (await getCurrentAccount()) || "",
          chainId: LUKSO_NETWORKS[currentNetwork as keyof typeof LUKSO_NETWORKS].chainId,
          issuedAt: new Date().toISOString(),
          expirationTime: new Date(Date.now() + APP_CONFIG.siweExpirationTime * 60 * 60 * 1000).toISOString(),
        },
      }
    }

    // Parse message if it's a string
    let siweMessage: SiweMessage

    if (typeof message === "string") {
      try {
        // Try to parse as a SIWE message string
        siweMessage = new SiweMessage(message)
      } catch (parseError) {
        console.error("Error parsing SIWE message:", parseError)

        // Try to parse as JSON if it's stored that way
        try {
          const parsedMessage = JSON.parse(message)
          if (typeof parsedMessage === "object") {
            siweMessage = new SiweMessage(parsedMessage)
          } else {
            throw new Error("Invalid message format")
          }
        } catch (jsonError) {
          console.error("Error parsing message as JSON:", jsonError)

          if (env === "development" || isDevelopmentMode()) {
            // For development, allow bypass
            return {
              success: true,
              data: {
                address: (await getCurrentAccount()) || "",
                chainId: LUKSO_NETWORKS[currentNetwork as keyof typeof LUKSO_NETWORKS].chainId,
                issuedAt: new Date().toISOString(),
                expirationTime: new Date(Date.now() + APP_CONFIG.siweExpirationTime * 60 * 60 * 1000).toISOString(),
              },
            }
          }

          return {
            success: false,
            error: "Invalid message format",
          }
        }
      }
    } else {
      // Message is already a SiweMessage object
      siweMessage = message
    }

    // Verify the message against the signature
    try {
      const verifyResult = await siweMessage.verify({ signature })

      if (verifyResult.success) {
        // Check if the message is expired
        const expirationTime = siweMessage.expirationTime ? new Date(siweMessage.expirationTime) : null

        if (expirationTime && expirationTime < new Date()) {
          return {
            success: false,
            error: "Signature expired",
          }
        }

        return {
          success: true,
          data: {
            address: siweMessage.address,
            chainId: siweMessage.chainId,
            issuedAt: siweMessage.issuedAt,
            expirationTime: siweMessage.expirationTime,
          },
        }
      } else {
        return {
          success: false,
          error: "Signature verification failed",
        }
      }
    } catch (verifyError) {
      console.error("SIWE verification error:", verifyError)

      if (env === "development" || isDevelopmentMode()) {
        // For development, we'll allow bypassing verification errors
        console.log("SIWE verification bypassed for development")
        return {
          success: true,
          data: {
            address: siweMessage.address,
            chainId: siweMessage.chainId,
            issuedAt: siweMessage.issuedAt || new Date().toISOString(),
            expirationTime:
              siweMessage.expirationTime ||
              new Date(Date.now() + APP_CONFIG.siweExpirationTime * 60 * 60 * 1000).toISOString(),
          },
        }
      }

      return {
        success: false,
        error: "Verification error: " + (verifyError instanceof Error ? verifyError.message : "Unknown error"),
      }
    }
  } catch (error) {
    console.error("Error in signature verification:", error)

    if (env === "development" || isDevelopmentMode()) {
      // For development, allow bypass
      console.log("SIWE verification bypassed due to error")
      return {
        success: true,
        data: {
          address: (await getCurrentAccount()) || "",
          chainId: LUKSO_NETWORKS[currentNetwork as keyof typeof LUKSO_NETWORKS].chainId,
          issuedAt: new Date().toISOString(),
          expirationTime: new Date(Date.now() + APP_CONFIG.siweExpirationTime * 60 * 60 * 1000).toISOString(),
        },
      }
    }

    return {
      success: false,
      error: "Signature verification error: " + (error instanceof Error ? error.message : "Unknown error"),
    }
  }
}

// Check if a session needs refresh
export function needsSessionRefresh(expirationTime: string): boolean {
  if (!expirationTime) return true

  try {
    const expiration = new Date(expirationTime)
    const now = new Date()

    // Calculate the threshold time (e.g., 1 hour before expiration)
    const thresholdMs = APP_CONFIG.sessionRefreshThreshold * 60 * 60 * 1000
    const thresholdTime = new Date(expiration.getTime() - thresholdMs)

    // If current time is past the threshold, session needs refresh
    return now >= thresholdTime
  } catch (error) {
    console.error("Error checking session refresh:", error)
    return true // If there's an error, assume refresh is needed
  }
}

// Get escrow contract details
export async function getEscrowDetails(escrowAddress: string): Promise<any> {
  try {
    if (!web3) {
      await initLuksoSDK()
    }

    if (!web3) throw new Error("Web3 not initialized")

    // Create contract instance
    const escrowContract = new web3.eth.Contract(ABI_FRAGMENTS.escrow as any, escrowAddress)

    // Get escrow details
    const details = await escrowContract.methods.getEscrowDetails().call()

    // Get milestone details
    const milestonesCount = await escrowContract.methods.getMilestonesCount().call()
    const milestones = []

    for (let i = 0; i < milestonesCount; i++) {
      const milestone = await escrowContract.methods.getMilestone(i).call()
      milestones.push({
        title: milestone.title,
        percentage: Number(milestone.percentage),
        description: milestone.description,
        status: Number(milestone.status),
        submittedAt: milestone.submittedAt > 0 ? new Date(Number(milestone.submittedAt) * 1000) : null,
        approvedAt: milestone.approvedAt > 0 ? new Date(Number(milestone.approvedAt) * 1000) : null,
      })
    }

    return {
      client: details.client,
      freelancer: details.freelancer,
      budget: web3.utils.fromWei(details.budget, "ether"),
      status: Number(details.status),
      createdAt: new Date(Number(details.createdAt) * 1000),
      milestones,
    }
  } catch (error) {
    console.error("Failed to get escrow details:", error)
    throw error
  }
}

// Get transaction URL for block explorer
export function getTransactionUrl(txHash: string): string {
  const networkName = currentNetwork
  const network = LUKSO_NETWORKS[networkName as keyof typeof LUKSO_NETWORKS]
  return `${network.blockExplorerUrl}/tx/${txHash}`
}

// Get address URL for block explorer
export function getAddressUrl(address: string): string {
  const networkName = currentNetwork
  const network = LUKSO_NETWORKS[networkName as keyof typeof LUKSO_NETWORKS]
  return `${network.blockExplorerUrl}/address/${address}`
}
