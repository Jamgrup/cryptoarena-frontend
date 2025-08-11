const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cryptoarena-backend.onrender.com'

export interface CardMetadata {
  cardIndex: number
  name: string
  description: string
  image: string
  attributes: {
    trait_type: string
    value: string | number
  }[]
}

export interface NFTCardData {
  type: 'warrior' | 'mage' | 'archer' | 'tank'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  attack: number
  defense: number
  health: number
  speed: number
  wave: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple'
}

export interface GemTokenInfo {
  address: string
  name: string
  symbol: string
  decimals: number
  totalSupply: string
  mintable: boolean
  adminAddress: string
  state: string
  balance: string
}

export interface GemBalance {
  userAddress: string
  walletAddress: string
  balance: string
  decimals: number
  formatted: string
}

class ApiClient {
  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 10000) {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      clearTimeout(id)
      return response
    } catch (error) {
      clearTimeout(id)
      throw error
    }
  }

  async getHealth(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/health`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Health check failed:', error)
      throw new Error('Backend service unavailable')
    }
  }

  async getCardMetadata(cardIndex: number): Promise<CardMetadata> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/api/nft/${cardIndex}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to get card metadata:', error)
      throw new Error('Failed to load card data')
    }
  }

  async generateRandomCard(): Promise<NFTCardData> {
    const types: NFTCardData['type'][] = ['warrior', 'mage', 'archer', 'tank']
    const rarities: NFTCardData['rarity'][] = ['common', 'rare', 'epic', 'legendary']
    const waves: NFTCardData['wave'][] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple']
    
    const rarity = rarities[Math.floor(Math.random() * rarities.length)]
    
    let baseStats = { attack: 10, defense: 10, health: 100, speed: 5 }
    switch (rarity) {
      case 'rare':
        baseStats = { attack: 15, defense: 15, health: 150, speed: 7 }
        break
      case 'epic':
        baseStats = { attack: 25, defense: 25, health: 250, speed: 10 }
        break
      case 'legendary':
        baseStats = { attack: 40, defense: 40, health: 400, speed: 15 }
        break
    }
    
    return {
      type: types[Math.floor(Math.random() * types.length)],
      rarity,
      attack: baseStats.attack + Math.floor(Math.random() * 10),
      defense: baseStats.defense + Math.floor(Math.random() * 10),
      health: baseStats.health + Math.floor(Math.random() * 50),
      speed: baseStats.speed + Math.floor(Math.random() * 5),
      wave: waves[Math.floor(Math.random() * waves.length)]
    }
  }

  // GEM Token Methods
  async getGemTokenInfo(): Promise<GemTokenInfo> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/api/v1/gem/info`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Failed to get GEM token info:', error)
      throw new Error('Failed to load GEM token information')
    }
  }

  async getGemBalance(userAddress: string): Promise<GemBalance> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/api/v1/gem/balance/${userAddress}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Failed to get GEM balance:', error)
      throw new Error('Failed to load GEM balance')
    }
  }

  async getGemWallet(userAddress: string): Promise<{ userAddress: string; walletAddress: string; balance: string; decimals: number }> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/api/v1/gem/wallet/${userAddress}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Failed to get GEM wallet:', error)
      throw new Error('Failed to load GEM wallet')
    }
  }

  async getTestnetInfo(): Promise<any> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/api/v1/gem/testnet-info`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Failed to get testnet info:', error)
      throw new Error('Failed to load testnet information')
    }
  }
}

export const apiClient = new ApiClient()