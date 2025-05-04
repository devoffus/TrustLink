// LUKSO network configuration
export const LUKSO_NETWORKS = {
  mainnet: {
    chainId: 42,
    name: "LUKSO Mainnet",
    rpcUrl: "https://rpc.lukso.gateway.fm/",
    blockExplorerUrl: "https://explorer.lukso.network/",
  },
  testnet: {
    chainId: 4201,
    name: "LUKSO Testnet",
    rpcUrl: "https://rpc.testnet.lukso.network/",
    blockExplorerUrl: "https://explorer.testnet.lukso.network/",
  },
}

// Default network to use
export const DEFAULT_NETWORK = "testnet"

// Contract addresses for TrustLink escrow
export const CONTRACT_ADDRESSES = {
  testnet: {
    escrowFactory: "0x1234567890123456789012345678901234567890", // Replace with actual contract address
    skillVerification: "0x0987654321098765432109876543210987654321", // Replace with actual contract address
  },
  mainnet: {
    escrowFactory: "", // To be deployed
    skillVerification: "", // To be deployed
  },
}

// ABI fragments for common interactions
export const ABI_FRAGMENTS = {
  // Escrow Factory ABI
  escrowFactory: [
    {
      inputs: [
        { name: "client", type: "address" },
        { name: "freelancer", type: "address" },
        { name: "budget", type: "uint256" },
        { name: "milestones", type: "bytes" },
        { name: "releaseType", type: "uint8" },
        { name: "disputeResolution", type: "uint8" },
        { name: "timelock", type: "uint256" },
      ],
      name: "createEscrow",
      outputs: [{ name: "escrowAddress", type: "address" }],
      stateMutability: "payable",
      type: "function",
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, name: "creator", type: "address" },
        { indexed: true, name: "escrowAddress", type: "address" },
        { indexed: false, name: "client", type: "address" },
        { indexed: false, name: "freelancer", type: "address" },
      ],
      name: "EscrowCreated",
      type: "event",
    },
  ],

  // Escrow Contract ABI
  escrow: [
    {
      inputs: [],
      name: "getEscrowDetails",
      outputs: [
        { name: "client", type: "address" },
        { name: "freelancer", type: "address" },
        { name: "budget", type: "uint256" },
        { name: "status", type: "uint8" },
        { name: "createdAt", type: "uint256" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getMilestonesCount",
      outputs: [{ name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ name: "milestoneId", type: "uint256" }],
      name: "getMilestone",
      outputs: [
        { name: "title", type: "string" },
        { name: "percentage", type: "uint256" },
        { name: "description", type: "string" },
        { name: "status", type: "uint8" },
        { name: "submittedAt", type: "uint256" },
        { name: "approvedAt", type: "uint256" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ name: "milestoneId", type: "uint256" }],
      name: "submitMilestone",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ name: "milestoneId", type: "uint256" }],
      name: "approveMilestone",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ name: "reason", type: "string" }],
      name: "openDispute",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, name: "milestoneId", type: "uint256" },
        { indexed: false, name: "submitter", type: "address" },
        { indexed: false, name: "timestamp", type: "uint256" },
      ],
      name: "MilestoneSubmitted",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, name: "milestoneId", type: "uint256" },
        { indexed: false, name: "approver", type: "address" },
        { indexed: false, name: "timestamp", type: "uint256" },
      ],
      name: "MilestoneApproved",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        { indexed: false, name: "initiator", type: "address" },
        { indexed: false, name: "reason", type: "string" },
        { indexed: false, name: "timestamp", type: "uint256" },
      ],
      name: "DisputeOpened",
      type: "event",
    },
  ],
}
