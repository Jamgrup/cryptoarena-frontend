/**
 * Unified Supabase Integration for NFT Cards
 * Combines Storage (images) + Database (metadata) + Generation logic
 */

// Import shared Supabase client from supabaseClient.ts to avoid duplicates
import { supabase } from './supabaseClient';

// Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dkukyfkinwpldnztoqhk.supabase.co';
const STORAGE_BUCKET = 'nft-images';

// Export the shared client instead of creating a new one
export { supabase };

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
  // Используем простые имена файлов, предполагая что они переименованы в Storage
  const waveFileNames: {[key: string]: string} = {
    'red': 'red.png',
    'orange': 'orange.png', 
    'yellow': 'yellow.png',
    'green': 'green.png',
    'blue': 'blue.png',
    'purple': 'purple.png'
  };
  
  const fileName = waveFileNames[waveName.toLowerCase()];
  if (!fileName) {
    console.warn(`Wave image not found for: ${waveName}`);
    return getPlaceholderImage('card');
  }
  
  return getImageUrl(`waves/${fileName}`);
}

/**
 * Получить URL изображения карты из Supabase Storage (реальные изображения)
 */
export function getCardImageUrl(card: { physical_damage: number, magic_damage: number, physical_armor: number, magic_armor: number, attack_speed: number, accuracy: number, evasion: number, crit_chance: number }, rarity?: string): string {
  // Используем рандомное изображение из доступных в bucket
  const availableImages = ['warior_1.png', 'warior_2.png', 'warior_3.png'];
  
  // Создаем стабильный seed на основе характеристик для консистентности
  const seed = card.physical_damage + card.magic_damage + card.attack_speed + card.accuracy;
  const imageIndex = seed % availableImages.length;
  const selectedImage = availableImages[imageIndex];
  
  return getImageUrl(`cards/${selectedImage}`);
}

/**
 * Получить случайное изображение карты для предпросмотра (без характеристик)
 */
export function getRandomCardImageUrl(): string {
  // Используем реальные изображения из Supabase Storage
  const availableImages = ['warior_1.png', 'warior_2.png', 'warior_3.png'];
  const randomImage = availableImages[Math.floor(Math.random() * availableImages.length)];
  
  return getImageUrl(`cards/${randomImage}`);
}

/**
 * Получить полные данные карты для предпросмотра через backend API
 */
export async function getRandomCardPreview(): Promise<{
  name: string;
  description: string;
  lore: string;
  rarity: string;
  powerRating: number;
  dominantStat: string;
  imageUrl: string;
} | null> {
  try {
    // Создаем рандомные атрибуты для preview API
    const randomAttributes = {
      wave: ['red', 'orange', 'yellow', 'green', 'blue', 'purple'][Math.floor(Math.random() * 6)],
      level: Math.floor(Math.random() * 10) + 1,
      physical_damage: Math.floor(Math.random() * 100) + 1,
      magic_damage: Math.floor(Math.random() * 100) + 1,
      physical_armor: Math.floor(Math.random() * 50),
      magic_armor: Math.floor(Math.random() * 50),
      attack_speed: Math.floor(Math.random() * 50) + 1,
      accuracy: Math.floor(Math.random() * 100),
      evasion: Math.floor(Math.random() * 100),
      crit_chance: Math.floor(Math.random() * 25)
    };

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cryptoarena-backend.onrender.com';
    const response = await fetch(`${backendUrl}/api/v1/nft/preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ attributes: randomAttributes }),
    });

    if (!response.ok) {
      throw new Error('Backend preview API failed');
    }

    const data = await response.json();
    if (data.success) {
      return data.data.metadata;
    } else {
      throw new Error(data.error || 'Preview generation failed');
    }
  } catch (error) {
    console.error('Error getting random card preview:', error);
    return null;
  }
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