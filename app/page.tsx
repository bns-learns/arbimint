declare global {
  namespace JSX {
    interface IntrinsicElements {
      "w3m-button": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
      "w3m-network-button": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
    }
  }
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Wallet, Info, ExternalLink, Github, Twitter, Linkedin, Mail, Network } from "lucide-react"
import { useAccount } from "wagmi"

interface Token {
  symbol: string
  name: string
  icon: string
  price: number
  coingeckoId: string
  address?: string
}

// Expanded token list with popular Uniswap tokens
const initialTokens: Token[] = [
  { symbol: "ETH", name: "Ethereum", icon: "⟠", price: 0, coingeckoId: "ethereum" },
  { symbol: "BTC", name: "Bitcoin", icon: "₿", price: 0, coingeckoId: "bitcoin" },
  {
    symbol: "USDC",
    name: "USD Coin",
    icon: "💵",
    price: 0,
    coingeckoId: "usd-coin",
    address: "0xA0b86a33E6441b8435b662c8C0b0E8E6C5b8B8E8",
  },
  {
    symbol: "USDT",
    name: "Tether",
    icon: "₮",
    price: 0,
    coingeckoId: "tether",
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  },
  { symbol: "SOL", name: "Solana", icon: "◎", price: 0, coingeckoId: "solana" },
  { symbol: "ADA", name: "Cardano", icon: "₳", price: 0, coingeckoId: "cardano" },
  { symbol: "DOT", name: "Polkadot", icon: "●", price: 0, coingeckoId: "polkadot" },
  {
    symbol: "LINK",
    name: "Chainlink",
    icon: "🔗",
    price: 0,
    coingeckoId: "chainlink",
    address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
  },
  {
    symbol: "UNI",
    name: "Uniswap",
    icon: "🦄",
    price: 0,
    coingeckoId: "uniswap",
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
  },
  {
    symbol: "AAVE",
    name: "Aave",
    icon: "👻",
    price: 0,
    coingeckoId: "aave",
    address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
  },
  {
    symbol: "COMP",
    name: "Compound",
    icon: "🏛️",
    price: 0,
    coingeckoId: "compound-governance-token",
    address: "0xc00e94Cb662C3520282E6f5717214004A7f26888",
  },
  {
    symbol: "MKR",
    name: "Maker",
    icon: "Ⓜ️",
    price: 0,
    coingeckoId: "maker",
    address: "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2",
  },
  {
    symbol: "SNX",
    name: "Synthetix",
    icon: "⚡",
    price: 0,
    coingeckoId: "havven",
    address: "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F",
  },
  {
    symbol: "CRV",
    name: "Curve DAO",
    icon: "🌊",
    price: 0,
    coingeckoId: "curve-dao-token",
    address: "0xD533a949740bb3306d119CC777fa900bA034cd52",
  },
  {
    symbol: "1INCH",
    name: "1inch",
    icon: "1️⃣",
    price: 0,
    coingeckoId: "1inch",
    address: "0x111111111117dC0aa78b770fA6A738034120C302",
  },
  {
    symbol: "SUSHI",
    name: "SushiSwap",
    icon: "🍣",
    price: 0,
    coingeckoId: "sushi",
    address: "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2",
  },
  {
    symbol: "YFI",
    name: "yearn.finance",
    icon: "💰",
    price: 0,
    coingeckoId: "yearn-finance",
    address: "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e",
  },
  {
    symbol: "BAL",
    name: "Balancer",
    icon: "⚖️",
    price: 0,
    coingeckoId: "balancer",
    address: "0xba100000625a3754423978a60c9317c58a424e3D",
  },
  { symbol: "MATIC", name: "Polygon", icon: "🔷", price: 0, coingeckoId: "matic-network" },
  { symbol: "AVAX", name: "Avalanche", icon: "🏔️", price: 0, coingeckoId: "avalanche-2" },
]

export default function ArbiMintApp() {
  const { isConnected } = useAccount()
  const [tokens, setTokens] = useState<Token[]>(initialTokens)
  const [selectedToken, setSelectedToken] = useState<Token>(initialTokens[0])
  const [amount, setAmount] = useState("")
  const [usdValue, setUsdValue] = useState(0)
  const [expectedProfit, setExpectedProfit] = useState(0)
  const [priceLoading, setPriceLoading] = useState(true)
  const [selectedChain, setSelectedChain] = useState("Ethereum")
  const [externalPrice, setExternalPrice] = useState(0) // For profit calculation

  // Placeholder: List of supported chains
  const supportedChains = [
    { name: "Ethereum", rpc: "https://mainnet.infura.io/v3/" },
    { name: "Polygon", rpc: "https://polygon-rpc.com/" },
    { name: "Arbitrum", rpc: "https://arb1.arbitrum.io/rpc" },
    { name: "Optimism", rpc: "https://mainnet.optimism.io" },
    { name: "Binance Smart Chain", rpc: "https://bsc-dataseed.binance.org/" },
    { name: "Avalanche", rpc: "https://api.avax.network/ext/bc/C/rpc" },
  ]

  // Placeholder: Fetch tokens from UniswapV4Factory based on selectedChain
  // TODO: Implement actual on-chain fetch using ethers.js and UniswapV4Factory ABI
  const fetchTokensFromUniswap = async (chain: string) => {
    // Example: Use ethers.js to connect to the correct RPC and UniswapV4Factory
    // For now, just log and do nothing
    console.log(`Would fetch tokens for chain: ${chain}`)
    // setTokens(fetchedTokens)
  }

  useEffect(() => {
    fetchTokensFromUniswap(selectedChain)
  }, [selectedChain])

  // Placeholder: Fetch external price for profit calculation
  useEffect(() => {
    // In real implementation, fetch from an external source (e.g., another DEX or oracle)
    // For now, mock as selectedToken.price * 0.98 (simulate a 2% lower price elsewhere)
    setExternalPrice(selectedToken.price * 0.98)
  }, [selectedToken, priceLoading])

  // Fetch real-time prices from CoinGecko API
  const fetchTokenPrices = async () => {
    try {
      setPriceLoading(true)
      const tokenIds = tokens.map((token) => token.coingeckoId).join(",")

      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${tokenIds}&vs_currencies=usd`, {
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const priceData = await response.json()

      const updatedTokens = tokens.map((token) => ({
        ...token,
        price: priceData[token.coingeckoId]?.usd || token.price || 0,
      }))

      setTokens(updatedTokens)

      // Update selected token price
      const updatedSelectedToken = updatedTokens.find((t) => t.symbol === selectedToken.symbol)
      if (updatedSelectedToken) {
        setSelectedToken(updatedSelectedToken)
      }
    } catch (error) {
      console.warn("Failed to fetch token prices:", error)
      // Keep existing prices if fetch fails
    } finally {
      setPriceLoading(false)
    }
  }

  // Fetch additional tokens from Uniswap token list
  const fetchUniswapTokens = async () => {
    try {
      // Use the official Uniswap token list URL
      const response = await fetch("https://gateway.ipfs.io/ipns/tokens.uniswap.org", {
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Check if data has the expected structure
      if (!data.tokens || !Array.isArray(data.tokens)) {
        console.warn("Unexpected token list structure, using fallback tokens")
        return
      }

      // Add popular tokens from Uniswap list (limit to prevent overwhelming UI)
      const popularTokens = data.tokens
        .filter((token: any) => token.chainId === 1) // Ethereum mainnet only
        .filter((token: any) => token.symbol && token.name && token.address) // Valid tokens only
        .slice(0, 30) // Limit to first 30 tokens
        .map((token: any) => ({
          symbol: token.symbol,
          name: token.name,
          icon: "🪙", // Generic icon for unknown tokens
          price: 0,
          coingeckoId: token.symbol.toLowerCase().replace(/\s+/g, "-"),
          address: token.address,
        }))

      // Merge with existing tokens (avoid duplicates)
      const existingSymbols = tokens.map((t) => t.symbol.toLowerCase())
      const newTokens = popularTokens.filter((token: Token) => !existingSymbols.includes(token.symbol.toLowerCase()))

      if (newTokens.length > 0) {
        setTokens((prev) => [...prev, ...newTokens])
        console.log(`Added ${newTokens.length} tokens from Uniswap list`)
      }
    } catch (error) {
      console.warn("Failed to fetch Uniswap tokens, using default token list:", error)

      // Fallback: Add some popular tokens manually if API fails
      const fallbackTokens: Token[] = [
        {
          symbol: "DAI",
          name: "Dai Stablecoin",
          icon: "💎",
          price: 0,
          coingeckoId: "dai",
          address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        },
        {
          symbol: "WETH",
          name: "Wrapped Ether",
          icon: "🔄",
          price: 0,
          coingeckoId: "weth",
          address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        },
        {
          symbol: "PEPE",
          name: "Pepe",
          icon: "🐸",
          price: 0,
          coingeckoId: "pepe",
          address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
        },
        {
          symbol: "SHIB",
          name: "Shiba Inu",
          icon: "🐕",
          price: 0,
          coingeckoId: "shiba-inu",
          address: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
        },
      ]

      // Add fallback tokens if they don't exist
      const existingSymbols = tokens.map((t) => t.symbol.toLowerCase())
      const newFallbackTokens = fallbackTokens.filter((token) => !existingSymbols.includes(token.symbol.toLowerCase()))

      if (newFallbackTokens.length > 0) {
        setTokens((prev) => [...prev, ...newFallbackTokens])
        console.log(`Added ${newFallbackTokens.length} fallback tokens`)
      }
    }
  }

  useEffect(() => {
    // Initial price fetch
    fetchTokenPrices()

    // Fetch additional tokens after a short delay
    setTimeout(() => {
      fetchUniswapTokens()
    }, 1000)

    // Refresh prices every 30 seconds
    const interval = setInterval(fetchTokenPrices, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const numAmount = Number.parseFloat(amount) || 0
    setUsdValue(numAmount * selectedToken.price)
    // Mock profit calculation (3-5% of USD value)
    setExpectedProfit(numAmount * selectedToken.price * 0.04)
  }, [amount, selectedToken])

  const handleMintAndArbitrage = () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      alert("Please enter a valid amount")
      return
    }
    // Mock minting and arbitrage process
    alert(`Minting ${amount} ${selectedToken.symbol} and starting arbitrage...`)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />

      {/* Border frame - responsive padding */}
      <div className="absolute inset-2 sm:inset-4 border-2 border-gray-600 rounded-2xl sm:rounded-3xl" />

      <div className="relative z-10 p-4 sm:p-6 lg:p-8 flex flex-col min-h-screen">
        {/* Header - responsive layout */}
        <header className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 sm:gap-0 mb-8 sm:mb-16">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-8 w-full sm:w-auto">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white text-black rounded-full flex items-center justify-center font-bold text-sm sm:text-base">
                A
              </div>
              <span className="text-xl sm:text-2xl font-bold">arbimint</span>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-black hover:bg-white transition-colors text-sm sm:text-base"
                >
                  <Info className="w-4 h-4 mr-2" />
                  Know More
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700 mx-4 sm:mx-0">
                <DialogHeader>
                  <DialogTitle className="text-white">About ArbiMint</DialogTitle>
                </DialogHeader>
                <div className="text-gray-300 space-y-4 text-sm sm:text-base">
                  <p>
                    ArbiMint is a decentralized arbitrage platform that allows users to mint USDC and automatically
                    execute arbitrage strategies across multiple DEXs.
                  </p>
                  <p>
                    Our advanced algorithms identify price discrepancies and execute trades to generate consistent
                    profits for our users.
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Ethereum Mainnet
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Automated Trading
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      DeFi
                    </Badge>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex items-center gap-4">
            <w3m-network-button />
            <w3m-button />
          </div>
        </header>

        {/* Main Content - centered and responsive */}
        <div className="flex-1 flex items-center justify-center px-2 sm:px-4">
          <Card className="w-full max-w-sm sm:max-w-md bg-gray-800/50 border-gray-600 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-6 lg:p-8 space-y-6">
              {/* Note about Token-2 (USDC) - now centered and in place of Ethereum Mainnet badge */}
              <div className="text-xs text-blue-400 mb-2 text-center">Token-2 is <b>USDC</b> by default. Please select Token-1 from the dropdown below.</div>
              {/* Amount Input */}
              <div className="space-y-3">
                <label className="text-xs sm:text-sm text-gray-400 block">Amount To Be Minted</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-transparent border-none p-0 h-auto text-white placeholder:text-gray-600 text-left"
                  />
                  <div className="text-base sm:text-lg text-gray-400 mt-2">
                    {priceLoading ? "Loading..." : `$${usdValue.toFixed(2)}`}
                  </div>
                </div>
              </div>
              {/* Token Selection - Fixed alignment */}
              <div className="flex justify-end items-center mb-2">
                <Select
                  value={selectedToken.symbol}
                  onValueChange={(value) => {
                    const token = tokens.find((t) => t.symbol === value)
                    if (token) setSelectedToken(token)
                  }}
                >
                  <SelectTrigger className="w-auto min-w-[160px] bg-gray-700 border-gray-600 text-sm sm:text-base">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{selectedToken.icon}</span>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{selectedToken.symbol}</span>
                        <span className="text-xs text-gray-400">{selectedToken.name}</span>
                      </div>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 max-h-60 overflow-y-auto">
                    {/* TODO: Improve listing by fetching from UniswapV4Factory */}
                    {tokens.map((token) => (
                      <SelectItem key={token.symbol} value={token.symbol} className="cursor-pointer">
                        <div className="flex items-center justify-between w-full min-w-[160px]">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg flex-shrink-0 w-6 text-center">{token.icon}</span>
                            <div className="flex flex-col items-start">
                              <div className="font-medium text-sm sm:text-base">{token.symbol}</div>
                              <div className="text-xs text-gray-400 truncate max-w-[100px]">{token.name}</div>
                            </div>
                          </div>
                          {!priceLoading && token.price > 0 && (
                            <div className="text-xs text-green-400 ml-2">${token.price.toFixed(2)}</div>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Chain Selection Dropdown - now below token dropdown, slightly smaller width */}
              <div className="mb-2 flex justify-end">
                <select
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  style={{ minWidth: '130px', maxWidth: '160px' }}
                  value={selectedChain}
                  onChange={e => setSelectedChain(e.target.value)}
                >
                  {supportedChains.map(chain => (
                    <option key={chain.name} value={chain.name}>{chain.name}</option>
                  ))}
                </select>
              </div>
              {/* Expt. Profit (single profit field, correct formula) */}
              <div className="flex justify-between items-center py-4 border-t border-gray-700">
                <span className="text-gray-400 text-sm sm:text-base">Expt. Profit</span>
                <span className="text-lg sm:text-xl font-bold text-green-400">
                  {priceLoading ? "..." : `$${((Number(amount) || 0) * (selectedToken.price - externalPrice)).toFixed(2)}`}
                </span>
              </div>
              {/* Action Button */}
              <Button
                onClick={handleMintAndArbitrage}
                className="w-full bg-white text-black hover:bg-gray-200 py-4 sm:py-6 text-base sm:text-lg font-medium rounded-xl"
                disabled={!isConnected || !amount || Number.parseFloat(amount) <= 0}
              >
                {isConnected ? (
                  <span className="text-center">
                    <span className="hidden sm:inline">Mint USDC & Start Arbitrage</span>
                    <span className="sm:hidden">Mint & Arbitrage</span>
                  </span>
                ) : (
                  "Connect Wallet"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer - responsive positioning */}
        <footer className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 mt-8 sm:mt-0 px-2">
          <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">Designed by BNS</div>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-black hover:bg-white transition-colors text-xs sm:text-sm"
              >
                Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 mx-4 sm:mx-0">
              <DialogHeader>
                <DialogTitle className="text-white">Contact & Portfolio</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Button variant="outline" className="border-gray-600 hover:bg-gray-800 text-sm justify-center">
                    <Github className="w-4 h-4 mr-2" />
                    GitHub
                  </Button>
                  <Button variant="outline" className="border-gray-600 hover:bg-gray-800 text-sm justify-center">
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </Button>
                  <Button variant="outline" className="border-gray-600 hover:bg-gray-800 text-sm justify-center">
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </Button>
                  <Button variant="outline" className="border-gray-600 hover:bg-gray-800 text-sm justify-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                </div>
                <div className="text-center">
                  <Button variant="ghost" className="text-blue-400 hover:text-blue-300 text-sm justify-center">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Full Portfolio
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </footer>
      </div>
    </div>
  )
}
