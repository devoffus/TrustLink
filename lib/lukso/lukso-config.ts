// LUKSO network configuration
export const LUKSO_NETWORKS = {
  mainnet: {
    name: "LUKSO Mainnet",
    chainId: 42,
    rpcUrl: "https://rpc.lukso.gateway.fm",
    blockExplorerUrl: "https://explorer.lukso.network",
    isTestnet: false,
  },
  testnet: {
    name: "LUKSO Testnet",
    chainId: 4201,
    rpcUrl: "https://rpc.testnet.lukso.network",
    blockExplorerUrl: "https://explorer.testnet.lukso.network",
    isTestnet: true,
  },
}

// Default network to use
export const DEFAULT_NETWORK = "mainnet"

// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  mainnet: {
    universalProfileFactory: "0x1eB9d1E93B972F9751a8875748B8793F66DEf5c6",
    escrowFactory: "0x2D21A1B1d4C0CbE4E0F3F5B7E5d4c86e1489cDd5",
    skillVerification: "0x3D21A1B1d4C0CbE4E0F3F5B7E5d4c86e1489cDd6",
    lsp7DigitalAsset: "0x4D21A1B1d4C0CbE4E0F3F5B7E5d4c86e1489cDd7",
  },
  testnet: {
    universalProfileFactory: "0x5eB9d1E93B972F9751a8875748B8793F66DEf5c6",
    escrowFactory: "0x6D21A1B1d4C0CbE4E0F3F5B7E5d4c86e1489cDd5",
    skillVerification: "0x7D21A1B1d4C0CbE4E0F3F5B7E5d4c86e1489cDd6",
    lsp7DigitalAsset: "0x8D21A1B1d4C0CbE4E0F3F5B7E5d4c86e1489cDd7",
  },
}

// ABI fragments for contracts
export const ABI_FRAGMENTS = {
  // Universal Profile ABI
  universalProfile: [
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_key",
          type: "bytes32",
        },
      ],
      name: "getData",
      outputs: [
        {
          internalType: "bytes",
          name: "_value",
          type: "bytes",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32[]",
          name: "_keys",
          type: "bytes32[]",
        },
      ],
      name: "getDataBatch",
      outputs: [
        {
          internalType: "bytes[]",
          name: "_values",
          type: "bytes[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ],

  // Escrow Factory ABI
  escrowFactory: [
    {
      inputs: [
        {
          internalType: "address",
          name: "_client",
          type: "address",
        },
        {
          internalType: "address",
          name: "_freelancer",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "_budget",
          type: "uint256",
        },
        {
          internalType: "bytes",
          name: "_milestonesData",
          type: "bytes",
        },
        {
          internalType: "uint8",
          name: "_releaseType",
          type: "uint8",
        },
        {
          internalType: "uint8",
          name: "_disputeResolution",
          type: "uint8",
        },
        {
          internalType: "uint256",
          name: "_timelock",
          type: "uint256",
        },
      ],
      name: "createEscrow",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "payable",
      type: "function",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "escrowAddress",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "client",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "freelancer",
          type: "address",
        },
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
        {
          components: [
            {
              internalType: "address",
              name: "client",
              type: "address",
            },
            {
              internalType: "address",
              name: "freelancer",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "budget",
              type: "uint256",
            },
            {
              internalType: "uint8",
              name: "status",
              type: "uint8",
            },
            {
              internalType: "uint256",
              name: "createdAt",
              type: "uint256",
            },
          ],
          internalType: "struct Escrow.EscrowDetails",
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getMilestonesCount",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_index",
          type: "uint256",
        },
      ],
      name: "getMilestone",
      outputs: [
        {
          components: [
            {
              internalType: "string",
              name: "title",
              type: "string",
            },
            {
              internalType: "uint256",
              name: "percentage",
              type: "uint256",
            },
            {
              internalType: "string",
              name: "description",
              type: "string",
            },
            {
              internalType: "uint8",
              name: "status",
              type: "uint8",
            },
            {
              internalType: "uint256",
              name: "submittedAt",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "approvedAt",
              type: "uint256",
            },
          ],
          internalType: "struct Escrow.Milestone",
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_milestoneId",
          type: "uint256",
        },
      ],
      name: "submitMilestone",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_milestoneId",
          type: "uint256",
        },
      ],
      name: "approveMilestone",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "_reason",
          type: "string",
        },
      ],
      name: "openDispute",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],

  // LSP7 Digital Asset ABI
  lsp7DigitalAsset: [
    {
      inputs: [
        {
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "balanceOf",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "name",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "symbol",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ],

  // LSP8 Identifiable Digital Asset ABI (for NFTs)
  lsp8IdentifiableDigitalAsset: [
    {
      inputs: [
        {
          internalType: "address",
          name: "tokenOwner",
          type: "address",
        },
      ],
      name: "tokenIdsOf",
      outputs: [
        {
          internalType: "bytes32[]",
          name: "",
          type: "bytes32[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "tokenId",
          type: "bytes32",
        },
      ],
      name: "tokenOwnerOf",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ],

  // Key Manager ABI
  keyManager: [
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "_key",
          type: "bytes32",
        },
      ],
      name: "getPermissionsFor",
      outputs: [
        {
          internalType: "bytes",
          name: "",
          type: "bytes",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ],
}

// ERC725 schema keys
export const ERC725_SCHEMA_KEYS = {
  LSP3_PROFILE: "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5",
  LSP12_ISSUED_ASSETS: "0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd",
  LSP5_RECEIVED_ASSETS: "0x6460ee3c0aac563ccbf76d6e1d07bada78e3a9514e6382b736ed3f478ab7b90b",
  LSP6_CONTROLLERS: "0x5117b691d7e22ef0d6c5037c0195b5b62b58d82b892994a1d769431e2e09d593",
}

// LUKSO LSP standards
export const LSP_STANDARDS = {
  LSP0_ERC725Account: "0xeafec4d89fa9619884b6b89135626455000000000000000000000000abe425d6",
  LSP3_UniversalProfile: "0xeafec4d89fa9619884b6b89135626455000000000000000000000000abe425d6",
  LSP7_DigitalAsset: "0xeafec4d89fa9619884b6b89135626455000000000000000000000000a4d96624",
  LSP8_IdentifiableDigitalAsset: "0xeafec4d89fa9619884b6b89135626455000000000000000000000000cbe54b82",
}

// IPFS gateway for LUKSO
export const IPFS_GATEWAY = "https://api.universalprofile.cloud/ipfs"

// App configuration
export const APP_CONFIG = {
  appName: "TrustLink",
  appDomain: typeof window !== "undefined" ? window.location.host : "trustlink.app",
  siweExpirationTime: 24, // hours
  sessionRefreshThreshold: 1, // hour
  networkPollingInterval: 15000, // 15 seconds
}
