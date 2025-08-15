/**
 * Unified Supabase Integration for NFT Cards
 * Combines Storage (images) + Database (metadata) + Generation logic
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dkukyfkinwpldnztoqhk.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const STORAGE_BUCKET = 'nft-images';

// Create Supabase client for frontend
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Card attributes interface
export interface CardAttributes {
  wave: string;
  level: number;
  physical_damage: number;
  magic_damage: number;
  physical_armor: number;
  magic_armor: number;
  attack_speed: number;
  accuracy: number;
  evasion: number;
  crit_chance: number;
}

// Generated card metadata interface
export interface GeneratedCardMetadata {
  name: string;
  description: string;
  lore: string;
  rarity: string;
  powerRating: number;
  dominantStat: string;
  imageUrl: string;
}

/**
 * Получить публичный URL для изображения из Supabase Storage
 */
export function getImageUrl(path: string): string {
  // Убираем начальный слеш, если есть
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Формируем публичный URL
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${cleanPath}`;
}

/**
 * Получить URL изображения волны (wave) - размер 36x36px
 */
export function getWaveImageUrl(waveName: string): string {
  const waveFileNames: {[key: string]: string} = {
    'red': 'Color=RED.png',
    'orange': 'Color=Orange.png', 
    'yellow': 'Color=Yellow.png',
    'green': 'Color=Green.png',
    'blue': 'Color=Blue.png',
    'pink': 'Color=Pink.png'
  };
  
  const fileName = waveFileNames[waveName.toLowerCase()];
  if (!fileName) {
    console.warn(`Wave image not found for: ${waveName}`);
    return getPlaceholderImage('card');
  }
  
  return getImageUrl(`waves/${fileName}`);
}

/**
 * Получить URL изображения карты по доминирующей характеристике и редкости
 */
export function getCardImageUrl(card: { physical_damage: number, magic_damage: number, physical_armor: number, magic_armor: number, attack_speed: number, accuracy: number, evasion: number, crit_chance: number }, rarity: string): string {
  // Определяем доминирующую характеристику для выбора типа изображения
  const characteristics = {
    physical_damage: card.physical_damage,
    magic_damage: card.magic_damage,
    attack_speed: card.attack_speed,
    accuracy: card.accuracy,
    evasion: card.evasion,
    physical_armor: card.physical_armor,
    magic_armor: card.magic_armor,
    crit_chance: card.crit_chance * 4
  }
  
  const dominantChar = Object.keys(characteristics).reduce((a, b) => 
    characteristics[a as keyof typeof characteristics] > characteristics[b as keyof typeof characteristics] ? a : b
  ) as keyof typeof characteristics
  
  // Маппинг характеристик на существующие типы карт
  const charToType: {[key: string]: string} = {
    physical_damage: 'warrior',
    magic_damage: 'mage', 
    attack_speed: 'assassin',
    accuracy: 'archer',
    evasion: 'hunter',
    physical_armor: 'paladin',
    magic_armor: 'priest',
    crit_chance: 'warlock'
  }
  
  const type = charToType[dominantChar] || 'warrior'
  return getImageUrl(`cards/${type.toLowerCase()}_${rarity.toLowerCase()}.svg`);
}

/**
 * Получить URL аватара пользователя
 */
export function getAvatarUrl(userId: string): string {
  return getImageUrl(`avatars/${userId}.png`);
}

/**
 * Получить URL изображения босса для рейда
 */
export function getBossImageUrl(bossId: string): string {
  return getImageUrl(`bosses/boss_${bossId}.svg`);
}

/**
 * Получить placeholder изображение если основное не загрузилось
 */
export function getPlaceholderImage(type: 'card' | 'avatar' | 'boss' = 'card'): string {
  const placeholders = {
    card: `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/placeholders/card_placeholder.svg`,
    avatar: `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/placeholders/avatar_placeholder.svg`,
    boss: `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/placeholders/boss_placeholder.svg`
  };
  
  return placeholders[type];
}

/**
 * Проверить доступность изображения
 */
export async function checkImageAvailability(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Компонент для отображения изображения с fallback
 */
export function getImageWithFallback(
  primaryUrl: string,
  fallbackUrl: string,
  onError?: () => void
): string {
  // Эта функция возвращает URL, а обработку ошибок нужно делать в компоненте
  return primaryUrl;
}

// Экспорт констант для использования в других местах
export const SUPABASE_CONFIG = {
  url: SUPABASE_URL,
  bucket: STORAGE_BUCKET,
  paths: {
    cards: 'cards',
    waves: 'waves',
    avatars: 'avatars',
    bosses: 'bosses',
    placeholders: 'placeholders'
  }
};