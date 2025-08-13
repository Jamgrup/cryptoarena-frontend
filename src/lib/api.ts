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
  // Правильные характеристики из GDD v3
  physical_damage: number  // 1-100
  magic_damage: number     // 1-100
  attack_speed: number     // 1-50
  accuracy: number         // 0-100
  evasion: number         // 0-100
  physical_armor: number   // 0-50
  magic_armor: number      // 0-50
  crit_chance: number      // 0-25
  level: number           // 1-10
  wave: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  
  // Поля для программы/героя
  name?: string
  title?: string
  description?: string
  lore?: string
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
    const rarities: NFTCardData['rarity'][] = ['common', 'rare', 'epic', 'legendary']
    const waves: NFTCardData['wave'][] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple']
    
    const rarity = rarities[Math.floor(Math.random() * rarities.length)]
    const wave = waves[Math.floor(Math.random() * waves.length)]
    const level = 1 // Новые карты всегда уровня 1
    
    // Генерация характеристик согласно GDD v3
    // Базовые значения зависят от редкости
    let baseMultiplier = 1
    switch (rarity) {
      case 'rare':
        baseMultiplier = 1.5
        break
      case 'epic':
        baseMultiplier = 2.5
        break
      case 'legendary':
        baseMultiplier = 4
        break
    }
    
    // Генерируем характеристики в указанных диапазонах
    const physical_damage = Math.floor((10 + Math.random() * 40) * baseMultiplier) // 1-100
    const magic_damage = Math.floor((10 + Math.random() * 40) * baseMultiplier)    // 1-100
    const attack_speed = Math.floor((5 + Math.random() * 20) * Math.min(baseMultiplier, 2)) // 1-50
    const accuracy = Math.floor(30 + Math.random() * 50)        // 0-100
    const evasion = Math.floor(10 + Math.random() * 40)         // 0-100
    const physical_armor = Math.floor((5 + Math.random() * 20) * Math.min(baseMultiplier, 2)) // 0-50
    const magic_armor = Math.floor((5 + Math.random() * 20) * Math.min(baseMultiplier, 2))    // 0-50
    const crit_chance = Math.floor((2 + Math.random() * 8) * Math.min(baseMultiplier, 2))     // 0-25
    
    const cardStats = {
      physical_damage,
      magic_damage,
      attack_speed,
      accuracy,
      evasion,
      physical_armor,
      magic_armor,
      crit_chance,
      level,
      wave
    }
    
    // Динамический импорт героев
    const { generateHeroData } = await import('@/lib/heroes')
    const heroData = generateHeroData(cardStats, rarity, wave)
    
    return {
      ...cardStats,
      rarity,
      name: heroData.name,
      title: heroData.title,
      description: heroData.description,
      lore: heroData.lore
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