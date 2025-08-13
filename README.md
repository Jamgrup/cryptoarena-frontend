# CryptoArena Frontend

Next.js frontend application for the CryptoArena NFT card game on TON blockchain featuring TRON-style cyberpunk design.

## Features

- 🎮 **TRON-Style NFT System**: Generate program cards with 8 detailed characteristics from GDD v3
- 🤖 **AI Program Names**: Dynamic cyberpunk names like "Combat Flynn", "Quantum Tron", "Stealth Quorra"
- 🔗 **TON Connect Integration**: Connect TON wallets for blockchain interactions  
- 🌊 **Wave System**: 6 frequency waves (red, orange, yellow, green, blue, purple) with 36x36px images
- 🎨 **Supabase Storage**: Dynamic loading of wave and card images
- ⚡ **8 Combat Stats**: physical_damage, magic_damage, attack_speed, accuracy, evasion, physical_armor, magic_armor, crit_chance
- 📱 **Cyberpunk UI**: Responsive design with Tron/Tron Legacy aesthetics

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
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL for image storage
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── TonConnectProvider.tsx  # TON Connect setup
│   ├── WalletConnector.tsx     # Wallet connection UI
│   ├── NFTCardCreator.tsx      # TRON-style card generation interface
│   └── WaveDisplay.tsx         # Wave frequency showcase with images
└── lib/                 # Utilities and API client
    ├── api.ts          # Backend API integration
    ├── heroes.ts       # TRON-style program naming system
    └── supabase.ts     # Supabase image storage integration

public/
├── tonconnect-manifest.json    # TON Connect app manifest
├── placeholder-card.svg        # Fallback card image
└── placeholder-wave.svg        # Fallback wave image
```

## TRON-Style Program Generation

The app generates cyberpunk NFT programs with:

- **8 Characteristics** (GDD v3 compliant):
  - Physical Damage (1-100) ⚔️
  - Magic Damage (1-100) ✨
  - Attack Speed (1-50) ⚡
  - Accuracy (0-100%) 🎯
  - Evasion (0-100%) 👻
  - Physical Armor (0-50) 🛡️
  - Magic Armor (0-50) 🔮
  - Critical Chance (0-25%) 💥

- **Dynamic Names**: Based on dominant characteristics
  - "Combat Flynn the Destroyer of the Force Circuit"
  - "Quantum Tron the Processor of the Energy Circuit"
  - "Stealth Quorra the Phantom of the Chaos Circuit"

- **Rarities**: Common, Rare, Epic, Legendary with cyberpunk lore
- **Wave Frequencies**: Red, Orange, Yellow, Green, Blue, Purple

Each program has unique descriptions, titles, and power ratings calculated from all characteristics.

## TON Connect Integration

The app uses TON Connect for wallet connectivity:

1. Users can connect supported TON wallets
2. Wallet address is displayed when connected
3. Ready for future smart contract interactions

## Wave Frequency System

6 digital wave frequencies each with unique properties and visual design:
- Programs from same wave frequency have battle synergies  
- Wave images (36x36px) dynamically loaded from Supabase Storage
- Interactive frequency selector with real cyberpunk visuals
- Each wave represents different digital energy types (combat, logic, energy, etc.)

## Deployment

The app is configured for deployment on Vercel:

```bash
npm run build
```

## API Integration

Connects to multiple services for full functionality:

**Backend API:**
- Health checks and system status
- NFT program metadata generation with TRON-style names
- GEM token balance and wallet integration

**Supabase Storage:**
- Wave frequency images (36x36px): Color=Red.png, Color=Blue.png, etc.
- Program card images mapped by dominant characteristics
- Fallback placeholder system for missing assets

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request