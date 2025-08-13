/**
 * TRON-style Program Names and Descriptions System
 * Система названий и описаний программ в стиле Tron/Tron Legacy на основе характеристик
 */

export interface HeroData {
  name: string
  title: string
  description: string
  lore: string
}

// Правильные характеристики из GDD
export interface CardStats {
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
}

// Префиксы для имен на основе доминирующих характеристик
const CHARACTERISTIC_PREFIXES = {
  physical_damage: ['Combat', 'Strike', 'Blade', 'Force', 'Power', 'Impact'],
  magic_damage: ['Quantum', 'Energy', 'Pulse', 'Plasma', 'Data', 'Matrix'],
  attack_speed: ['Swift', 'Rapid', 'Lightning', 'Burst', 'Flash', 'Velocity'],
  accuracy: ['Target', 'Precision', 'Lock-On', 'Scan', 'Focus', 'Calibrate'],
  evasion: ['Ghost', 'Phase', 'Stealth', 'Dodge', 'Shift', 'Phantom'],
  physical_armor: ['Shield', 'Barrier', 'Fortress', 'Wall', 'Guard', 'Armor'],
  magic_armor: ['Firewall', 'Cipher', 'Encrypt', 'Debug', 'Filter', 'Secure'],
  crit_chance: ['Critical', 'Fatal', 'Override', 'Execute', 'Terminate', 'Delete']
}

// Имена в стиле Tron/Tron Legacy
const HERO_NAMES = [
  'Flynn', 'Clu', 'Tron', 'Kevin', 'Sam', 'Quorra', 'Castor', 'Gem', 'Zuse', 'Rinzler',
  'Beck', 'Paige', 'Tesler', 'Cyrus', 'Able', 'Link', 'Mara', 'Zed', 'Lux', 'Byte',
  'Data', 'Grid', 'Sync', 'Node', 'Core', 'Axis', 'Flux', 'Prism', 'Neon', 'Vox',
  'Echo', 'Zero', 'Prime', 'Alpha', 'Beta', 'Gamma', 'Delta', 'Omega', 'Sigma', 'Phi',
  'Hex', 'Binary', 'Logic', 'Code', 'Pixel', 'Vertex', 'Vector', 'Matrix', 'Nexus', 'Portal'
]

// Суффиксы для титулов на основе характеристик
const CHARACTERISTIC_SUFFIXES = {
  physical_damage: ['the Destroyer', 'Breaker', 'the Crusher', 'Devastator', 'the Annihilator', 'Wrecker'],
  magic_damage: ['the Processor', 'Compiler', 'the Digitizer', 'Encoder', 'the Generator', 'Synthesizer'],
  attack_speed: ['the Accelerated', 'Speedrun', 'the Optimized', 'Turbo', 'the Enhanced', 'Overclock'],
  accuracy: ['the Calibrated', 'Targeting', 'the Focused', 'Tracker', 'the Precise', 'Locked-On'],
  evasion: ['the Elusive', 'Phantom', 'the Untouchable', 'Ghost', 'the Shifter', 'Phasewalker'],
  physical_armor: ['the Fortified', 'Guardian', 'the Defended', 'Bastion', 'the Reinforced', 'Bulwark'],
  magic_armor: ['the Protected', 'Firewall', 'the Encrypted', 'Secured', 'the Filtered', 'Debugged'],
  crit_chance: ['the Executioner', 'Terminal', 'the Fatal', 'Critical', 'the Override', 'Systemkill']
}

// Описания способностей на основе доминирующих характеристик
const ABILITY_DESCRIPTIONS = {
  physical_damage: [
    'Executes devastating melee combat algorithms',
    'Processes maximum kinetic damage output protocols',
    'Runs advanced destruction subroutines',
    'Optimized for direct physical confrontation'
  ],
  magic_damage: [
    'Channels pure digital energy through quantum matrices',
    'Processes complex energy manipulation algorithms',
    'Harnesses the raw power of the digital realm',
    'Compiles devastating data streams into lethal attacks'
  ],
  attack_speed: [
    'Operates at maximum processing frequency',
    'Executes rapid-fire combat sequences',
    'Runs optimized speed enhancement protocols',
    'Processes multiple attack vectors simultaneously'
  ],
  accuracy: [
    'Features precision-guided targeting systems',
    'Never fails to acquire and eliminate targets',
    'Runs advanced trajectory calculation algorithms',
    'Locks onto enemies with perfect accuracy'
  ],
  evasion: [
    'Phases between digital dimensions at will',
    'Executes advanced stealth and avoidance protocols',
    'Manipulates light refraction to avoid detection',
    'Shifts through enemy attacks like living data'
  ],
  physical_armor: [
    'Reinforced with hardened security protocols',
    'Absorbs kinetic damage through advanced shielding',
    'Built with military-grade defensive subroutines',
    'Forms an impenetrable barrier against physical attacks'
  ],
  magic_armor: [
    'Protected by advanced encryption algorithms',
    'Filters magical attacks through quantum firewalls',
    'Debugs hostile code before it can cause damage',
    'Secured against all forms of digital intrusion'
  ],
  crit_chance: [
    'Executes critical system overrides on demand',
    'Processes fatal error cascades in enemy programs',
    'Runs termination protocols with lethal precision',
    'Delivers system-killing strikes to vital processes'
  ]
}

// Истории для разных редкостей в стиле Tron
const LORE_TEMPLATES = {
  common: [
    'A newly compiled program with basic operational parameters.',
    'Standard-issue combat software with room for optimization.',
    'Entry-level code with untapped processing potential.',
    'Basic program seeking to upgrade its core functionality.'
  ],
  rare: [
    'Enhanced program with optimized combat algorithms.',
    'Upgraded software featuring improved battle protocols.',
    'Refined code with enhanced operational efficiency.',
    'Advanced program with proven battlefield performance.'
  ],
  epic: [
    'Master-class program with legendary processing power.',
    'Elite-tier software with revolutionary combat systems.',
    'Pinnacle code representing the height of digital evolution.',
    'Champion program whose algorithms inspire system-wide admiration.'
  ],
  legendary: [
    'Mythical program that transcends normal system limitations.',
    'God-tier software with reality-altering capabilities.',
    'Perfect code that exists beyond conventional parameters.',
    'Ultimate program whose very existence reshapes the digital realm.'
  ]
}

// Связи с волнами в стиле Tron
const WAVE_AFFINITIES = {
  red: ['combat', 'aggression', 'power', 'destruction', 'force'],
  orange: ['stability', 'endurance', 'persistence', 'solid', 'foundation'],
  yellow: ['energy', 'speed', 'acceleration', 'frequency', 'velocity'],
  green: ['growth', 'regeneration', 'healing', 'restoration', 'renewal'],
  blue: ['logic', 'wisdom', 'processing', 'calculation', 'analysis'],
  purple: ['mystery', 'corruption', 'chaos', 'glitch', 'void']
}

/**
 * Определяет доминирующую характеристику карты
 */
function getDominantCharacteristic(stats: CardStats): keyof typeof CHARACTERISTIC_PREFIXES {
  const characteristics = {
    physical_damage: stats.physical_damage,
    magic_damage: stats.magic_damage,
    attack_speed: stats.attack_speed,
    accuracy: stats.accuracy,
    evasion: stats.evasion,
    physical_armor: stats.physical_armor,
    magic_armor: stats.magic_armor,
    crit_chance: stats.crit_chance * 4 // Умножаем на 4 чтобы уравнять с другими характеристиками (макс 25 -> 100)
  }
  
  // Находим характеристику с максимальным значением
  return Object.keys(characteristics).reduce((a, b) => 
    characteristics[a as keyof typeof characteristics] > characteristics[b as keyof typeof characteristics] ? a : b
  ) as keyof typeof CHARACTERISTIC_PREFIXES
}

/**
 * Генерирует данные программы на основе характеристик
 */
export function generateHeroData(
  stats: CardStats,
  rarity: keyof typeof LORE_TEMPLATES,
  wave: keyof typeof WAVE_AFFINITIES
): HeroData {
  const dominantChar = getDominantCharacteristic(stats)
  
  // Генерация имени
  const prefix = CHARACTERISTIC_PREFIXES[dominantChar][Math.floor(Math.random() * CHARACTERISTIC_PREFIXES[dominantChar].length)]
  const baseName = HERO_NAMES[Math.floor(Math.random() * HERO_NAMES.length)]
  const name = `${prefix} ${baseName}`
  
  // Генерация титула
  const suffix = CHARACTERISTIC_SUFFIXES[dominantChar][Math.floor(Math.random() * CHARACTERISTIC_SUFFIXES[dominantChar].length)]
  const waveAffinity = WAVE_AFFINITIES[wave][Math.floor(Math.random() * WAVE_AFFINITIES[wave].length)]
  const title = `${baseName} ${suffix} of the ${waveAffinity.charAt(0).toUpperCase() + waveAffinity.slice(1)} Circuit`
  
  // Генерация описания
  const abilityDesc = ABILITY_DESCRIPTIONS[dominantChar][Math.floor(Math.random() * ABILITY_DESCRIPTIONS[dominantChar].length)]
  const description = `${abilityDesc} Optimized for ${wave} wave frequency, processing ${waveAffinity} protocols.`
  
  // Генерация истории
  const loreTemplate = LORE_TEMPLATES[rarity][Math.floor(Math.random() * LORE_TEMPLATES[rarity].length)]
  const lore = loreTemplate
  
  return {
    name,
    title,
    description,
    lore
  }
}

/**
 * Расширенные данные NFT карты с правильными характеристиками из GDD
 */
export interface ExtendedNFTCardData extends CardStats {
  rarity: keyof typeof LORE_TEMPLATES
  hero: HeroData
}

/**
 * Вычисляет рейтинг силы карты по правильным характеристикам
 */
export function calculateCardPowerRating(card: CardStats): number {
  // Формула основана на важности характеристик в боевой системе
  const physicalComponent = card.physical_damage + card.physical_armor
  const magicalComponent = card.magic_damage + card.magic_armor
  const speedComponent = card.attack_speed * 2 // Скорость важна для DPS
  const precisionComponent = (card.accuracy + card.evasion) / 2
  const criticalComponent = card.crit_chance * 3 // Критическое повреждение очень важно
  
  return Math.round(physicalComponent + magicalComponent + speedComponent + precisionComponent + criticalComponent)
}

/**
 * Получает цвет редкости
 */
export function getRarityColor(rarity: keyof typeof LORE_TEMPLATES): string {
  const colors = {
    common: 'text-gray-400',
    rare: 'text-blue-400', 
    epic: 'text-purple-400',
    legendary: 'text-yellow-400'
  }
  return colors[rarity] || colors.common
}

/**
 * Получает цвет волны (обновлено для правильных волн из GDD)
 */
export function getWaveColor(wave: keyof typeof WAVE_AFFINITIES): string {
  const colors = {
    red: 'text-red-500',
    orange: 'text-orange-500',
    yellow: 'text-yellow-500', 
    green: 'text-green-500',
    blue: 'text-blue-500',
    purple: 'text-purple-500'
  }
  return colors[wave] || colors.red
}