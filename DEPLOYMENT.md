# CryptoArena Frontend Deployment Guide

## Автоматический деплой на Vercel

Этот проект настроен для автоматического деплоя на Vercel через GitHub Actions.

### Настройка GitHub Secrets

Добавьте следующие секреты в настройки GitHub репозитория:

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id  
VERCEL_PROJECT_ID=your_vercel_project_id
NEXT_PUBLIC_API_URL=https://cryptoarena-backend.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://your_supabase_url.supabase.co
```

### Получение Vercel токена

1. Зайдите в [Vercel Dashboard](https://vercel.com/dashboard)
2. Перейдите в Settings → Tokens
3. Создайте новый токен для GitHub Actions
4. Скопируйте токен в GitHub Secrets как `VERCEL_TOKEN`

### Получение Project ID и Org ID

1. В корне проекта выполните: `vercel link`
2. Выберите ваш проект
3. Найдите файл `.vercel/project.json`
4. Скопируйте `projectId` и `orgId` в GitHub Secrets

### Переменные окружения

Создайте файл `.env.local` для локальной разработки:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your_supabase_url.supabase.co
```

## Ручной деплой

### Через Vercel CLI

```bash
# Установка Vercel CLI
npm i -g vercel

# Первый раз - связывание проекта
vercel link

# Деплой на продакшн
vercel --prod

# Деплой на preview
vercel
```

### Через Git

Просто сделайте push в ветку `main` или `master`:

```bash
git add .
git commit -m "Update frontend"
git push origin main
```

Деплой произойдет автоматически через GitHub Actions.

## Мониторинг

- **Vercel Dashboard**: Мониторинг деплоев и производительности
- **GitHub Actions**: Логи сборки и деплоя в разделе Actions
- **Vercel Analytics**: Аналитика использования (если включена)

## Структура веток

- `main` - продакшн ветка, автоматический деплой
- `dev` - ветка разработки
- feature ветки создают preview деплои

## Troubleshooting

### Ошибка сборки TypeScript

```bash
npm run type-check
```

### Ошибка линтера

```bash
npm run lint
npm run lint -- --fix
```

### Проблемы с зависимостями

```bash
rm -rf node_modules package-lock.json
npm install
```

### Очистка кэша Next.js

```bash
rm -rf .next
npm run build
```

## Технические детали

- **Framework**: Next.js 14
- **Hosting**: Vercel
- **CI/CD**: GitHub Actions
- **TypeScript**: Полная типизация
- **Styling**: Tailwind CSS
- **State**: React hooks + Zustand