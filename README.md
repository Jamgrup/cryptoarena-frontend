# CryptoArena Frontend

Next.js frontend application for the CryptoArena NFT card game on TON blockchain.

## Features

- 🎮 **NFT Card Creation**: Generate random cards with different types, rarities, and stats
- 🔗 **TON Connect Integration**: Connect TON wallets for blockchain interactions  
- 🌊 **Wave System**: 6 different wave types (red, orange, yellow, green, blue, purple)
- 🎨 **Dynamic Images**: Loads NFT card and wave images from Supabase Storage
- ⚡ **Real-time Stats**: Dynamic card statistics and power calculations
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **TON Connect** for wallet integration
- **Axios** for API calls

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.local.example .env.local
```

3. Run development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: https://cryptoarena-backend.onrender.com)

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── TonConnectProvider.tsx  # TON Connect setup
│   ├── WalletConnector.tsx     # Wallet connection UI
│   ├── NFTCardCreator.tsx      # Card generation interface
│   └── WaveDisplay.tsx         # Wave system showcase
└── lib/                 # Utilities and API client
    └── api.ts          # Backend API integration

public/
├── tonconnect-manifest.json    # TON Connect app manifest
├── placeholder-card.svg        # Fallback card image
└── placeholder-wave.svg        # Fallback wave image
```

## Card Generation

The app generates NFT cards with:

- **Types**: Warrior, Mage, Archer, Tank
- **Rarities**: Common, Rare, Epic, Legendary  
- **Stats**: Attack, Defense, Health, Speed
- **Waves**: Red, Orange, Yellow, Green, Blue, Purple

Each rarity has different base stats and visual styling.

## TON Connect Integration

The app uses TON Connect for wallet connectivity:

1. Users can connect supported TON wallets
2. Wallet address is displayed when connected
3. Ready for future smart contract interactions

## Wave System

6 elemental waves each with unique colors and strategic implications:
- Cards from same wave have potential synergies
- Wave images loaded from Supabase Storage
- Interactive wave selector

## Deployment

The app is configured for deployment on Vercel:

```bash
npm run build
```

## API Integration

Connects to the CryptoArena backend for:
- Health checks
- NFT metadata generation  
- Card image URLs from Supabase Storage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request