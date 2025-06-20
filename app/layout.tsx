import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ContextProvider from "@/context"
import { headers } from "next/headers"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ArbiMint - Decentralized Arbitrage Platform",
  description: "Mint USDC and execute automated arbitrage strategies on Ethereum",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookies = headers().get("cookie")

  return (
    <html lang="en">
      <body className={inter.className}><ContextProvider cookies={cookies}>{children}</ContextProvider></body>
    </html>
  )
}
