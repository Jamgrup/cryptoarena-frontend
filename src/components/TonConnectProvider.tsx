'use client'

import { TonConnectUIProvider, THEME } from '@tonconnect/ui-react'

const manifestUrl = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/tonconnect-manifest.json`
  : 'https://cryptoarena-frontend.vercel.app/tonconnect-manifest.json'

export function TonConnectProvider({ children }: { children: React.ReactNode }) {
  return (
    <TonConnectUIProvider 
      manifestUrl={manifestUrl}
      uiPreferences={{ theme: THEME.DARK }}
    >
      {children}
    </TonConnectUIProvider>
  )
}