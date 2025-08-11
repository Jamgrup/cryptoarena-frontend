import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { TonConnectProvider } from '@/components/TonConnectProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CryptoArena - TON NFT Game',
  description: 'Create and battle with NFT cards on TON blockchain',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TonConnectProvider>
          {children}
        </TonConnectProvider>
      </body>
    </html>
  )
}