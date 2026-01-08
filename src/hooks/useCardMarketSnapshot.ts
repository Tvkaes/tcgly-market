import { useQuery } from '@tanstack/react-query'
import tcgdex from '../lib/tcgdex'

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000

const ensureCardImage = (url?: string) => {
  if (!url) return undefined
  const hasQualitySuffix = /\/(high|low)\.(png|webp|jpg)$/i.test(url)
  if (hasQualitySuffix) return url
  const sanitized = url.replace(/\/$/, '')
  return `${sanitized}/high.webp`
}

const deterministicPrice = (seed: string, offset = 0) => {
  const base = seed.split('').reduce((acc, char, index) => acc + char.charCodeAt(0) * (index + 1), 0) + offset * 97
  const scaled = 4 + (base % 220) / 7
  return Number(scaled.toFixed(2))
}

const MARKETS = [
  { name: 'CardMarket', multiplier: 1 },
  { name: 'TCGplayer', multiplier: 1.1 },
  { name: 'eBay', multiplier: 0.92 },
  { name: 'Mercado Libre', multiplier: 1.05 },
]

export interface CardPriceHistoryPoint {
  label: string
  price: number
}

export interface CardAttack {
  name: string
  cost?: string[]
  damage?: number | string
  effect?: string
}

export interface CardWeakness {
  type: string
  value?: string
}

export interface CardMarketSnapshot {
  card: {
    id: string
    name: string
    image?: string
    category?: string
    rarity?: string
    supertype?: string
    subtypes?: string[]
    types?: string[]
    hp?: string
    setName?: string
    setId?: string
    releaseDate?: string
    regulationMark?: string
    description?: string
    illustrator?: string
    stage?: string
    evolveFrom?: string
    retreat?: number
    attacks?: CardAttack[]
    weaknesses?: CardWeakness[]
    trainerType?: string
    effect?: string
    energyType?: string
  }
  priceTrend: CardPriceHistoryPoint[]
  priceComparisons: { market: string; avgPrice: number; changePercent: number }[]
  stats: Array<{ label: string; value?: string | number }>
}

const fetchCardMarketSnapshot = async (cardId: string): Promise<CardMarketSnapshot> => {
  const card = await tcgdex.card.get(cardId)
  if (!card) throw new Error('No se encontró información de la carta.')

  const basePrice = deterministicPrice(cardId)
  const priceTrend: CardPriceHistoryPoint[] = Array.from({ length: 8 }).map((_, index) => {
    const label = `D-${7 - index}`
    const drift = Math.sin((index / 8) * Math.PI) * 1.2
    const value = Number((basePrice + drift + index * 0.15).toFixed(2))
    return { label, price: value }
  })

  const priceComparisons = MARKETS.map((market, index) => ({
    market: market.name,
    avgPrice: Number((basePrice * market.multiplier).toFixed(2)),
    changePercent: Number((((market.multiplier - 1) * 100 + index * 0.8).toFixed(2))),
  }))

  const stats = [
    { label: 'Rarity', value: card.rarity },
    { label: 'Supertype', value: card.supertype },
    { label: 'Subtypes', value: card.subtypes?.join(', ') },
    { label: 'HP', value: card.hp },
    { label: 'Tipos', value: card.types?.join(' · ') },
    { label: 'Regulation', value: card.regulationMark },
  ]

  return {
    card: {
      id: card.id,
      name: card.name,
      image: ensureCardImage(card.image),
      category: card.category,
      rarity: card.rarity,
      supertype: card.supertype,
      subtypes: card.subtypes,
      types: card.types,
      hp: card.hp,
      setName: card.set?.name,
      setId: card.set?.id,
      releaseDate: card.releaseDate,
      regulationMark: card.regulationMark,
      description: card.flavorText ?? card.description,
      illustrator: card.illustrator,
      stage: card.stage,
      evolveFrom: card.evolveFrom,
      retreat: card.retreat,
      attacks: card.attacks,
      weaknesses: card.weaknesses,
      trainerType: (card as { trainerType?: string }).trainerType,
      effect: (card as { effect?: string }).effect,
      energyType: (card as { energyType?: string }).energyType,
    },
    priceTrend,
    priceComparisons,
    stats,
  }
}

export const useCardMarketSnapshot = (cardId?: string) =>
  useQuery<CardMarketSnapshot>({
    queryKey: ['market-card', cardId],
    queryFn: () => fetchCardMarketSnapshot(cardId as string),
    enabled: Boolean(cardId),
    staleTime: TWO_DAYS_MS,
    gcTime: TWO_DAYS_MS,
    refetchOnWindowFocus: false,
  })
