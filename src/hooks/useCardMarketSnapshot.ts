import { useQuery } from '@tanstack/react-query'
import tcgdex from '@/lib/tcgdex'

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000
const EUR_TO_USD = 1.08

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

const FALLBACK_MARKETS = [
  { name: 'CardMarket', multiplier: 1 },
  { name: 'TCGplayer', multiplier: 1.1 },
  { name: 'eBay', multiplier: 0.92 },
  { name: 'Mercado Libre', multiplier: 1.05 },
]

type TCGdexPriceVariant = {
  lowPrice?: number
  midPrice?: number
  highPrice?: number
  marketPrice?: number
  directLowPrice?: number
}

type TCGdexTCGPlayerPricing = {
  updated?: string
  unit?: string
  [variant: string]: TCGdexPriceVariant | string | undefined
}

type TCGdexCardMarketPricing = {
  updated?: string
  unit?: string
  [key: string]: number | string | undefined
}

type TCGdexCardPricing = {
  tcgplayer?: TCGdexTCGPlayerPricing
  cardmarket?: TCGdexCardMarketPricing
}

type TCGdexFullCard = {
  id: string
  name: string
  image?: string
  category?: string
  rarity?: string
  supertype?: string
  subtypes?: string[]
  types?: string[]
  hp?: string
  set?: { id?: string; name?: string }
  releaseDate?: string
  regulationMark?: string
  description?: string
  flavorText?: string
  illustrator?: string
  stage?: string
  evolveFrom?: string
  retreat?: number | string
  attacks?: CardAttack[]
  weaknesses?: CardWeakness[]
  trainerType?: string
  effect?: string
  energyType?: string
  pricing?: TCGdexCardPricing
}

const bestVariantPrice = (variant?: TCGdexPriceVariant) => {
  if (!variant) return undefined
  return (
    variant.marketPrice ??
    variant.highPrice ??
    variant.midPrice ??
    variant.lowPrice ??
    variant.directLowPrice
  )
}

type PriceResolution = {
  priceUsd: number
  source: string
}

const resolveFromTCGPlayer = (pricing?: TCGdexTCGPlayerPricing): PriceResolution | null => {
  if (!pricing) return null
  let best: PriceResolution | null = null
  Object.entries(pricing).forEach(([variant, value]) => {
    if (variant === 'unit' || variant === 'updated') return
    if (!value || typeof value !== 'object') return
    const candidate = bestVariantPrice(value as TCGdexPriceVariant)
    if (typeof candidate === 'number' && candidate > 0) {
      if (!best || candidate > best.priceUsd) {
        best = {
          priceUsd: candidate,
          source: `tcgplayer.${variant}`,
        }
      }
    }
  })
  return best
}

const resolveFromCardMarket = (pricing?: TCGdexCardMarketPricing): PriceResolution | null => {
  if (!pricing) return null
  const candidateKeys = [
    'trend-holo',
    'avg-holo',
    'avg30-holo',
    'avg7-holo',
    'avg1-holo',
    'low-holo',
    'trend',
    'avg',
    'avg30',
    'avg7',
    'avg1',
    'low',
  ]
  let best: PriceResolution | null = null
  candidateKeys.forEach((key) => {
    const value = pricing[key]
    if (typeof value !== 'number') return
    const usdValue = Number((value * EUR_TO_USD).toFixed(2))
    if (!best || usdValue > best.priceUsd) {
      best = {
        priceUsd: usdValue,
        source: `cardmarket.${key}`,
      }
    }
  })
  return best
}

const resolvePricing = (pricing?: TCGdexCardPricing): PriceResolution | null => {
  const tcg = resolveFromTCGPlayer(pricing?.tcgplayer)
  const cardMarket = resolveFromCardMarket(pricing?.cardmarket)
  if (tcg && cardMarket) {
    return tcg.priceUsd >= cardMarket.priceUsd ? tcg : cardMarket
  }
  return tcg ?? cardMarket ?? null
}

const buildPriceTrend = (basePrice: number): CardPriceHistoryPoint[] =>
  Array.from({ length: 8 }).map((_, index) => {
    const label = `D-${7 - index}`
    const drift = Math.sin((index / 8) * Math.PI) * 1.2
    const noise = ((index % 3) - 1) * 0.18
    const value = Number((basePrice + drift + noise + index * 0.1).toFixed(2))
    return { label, price: Math.max(0, value) }
  })

const buildFallbackComparisons = (basePrice: number): CardMarketSnapshot['priceComparisons'] =>
  FALLBACK_MARKETS.map((market, index) => ({
    market: market.name,
    avgPrice: Number((basePrice * market.multiplier).toFixed(2)),
    changePercent: Number((((market.multiplier - 1) * 100 + index * 0.8).toFixed(2))),
  }))

const buildComparisonsFromPricing = (
  pricing: TCGdexCardPricing | undefined,
  fallbackBase: number,
): CardMarketSnapshot['priceComparisons'] => {
  const entries: CardMarketSnapshot['priceComparisons'] = []
  const tcg = resolveFromTCGPlayer(pricing?.tcgplayer)
  if (tcg) {
    entries.push({
      market: 'TCGplayer',
      avgPrice: tcg.priceUsd,
      changePercent: 0,
    })
  }
  const cardMarket = resolveFromCardMarket(pricing?.cardmarket)
  if (cardMarket) {
    entries.push({
      market: 'Cardmarket',
      avgPrice: cardMarket.priceUsd,
      changePercent: 0,
    })
  }
  if (!entries.length) return buildFallbackComparisons(fallbackBase)

  const baseline = entries[0].avgPrice || fallbackBase || 1
  return entries.map((entry) => ({
    ...entry,
    changePercent: baseline ? Number((((entry.avgPrice - baseline) / baseline) * 100).toFixed(2)) : 0,
  }))
}

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
  pricing?: {
    best?: PriceResolution | null
    tcgplayer?: TCGdexTCGPlayerPricing
    cardmarket?: TCGdexCardMarketPricing
  }
}

const fetchCardMarketSnapshot = async (cardId: string): Promise<CardMarketSnapshot> => {
  const card = (await tcgdex.card.get(cardId)) as TCGdexFullCard | null
  if (!card) throw new Error('Card information was not found.')

  const pricing = card.pricing
  const resolvedPrice = resolvePricing(pricing)
  const basePrice = resolvedPrice?.priceUsd ?? deterministicPrice(cardId)
  const priceTrend = buildPriceTrend(basePrice)
  const priceComparisons = buildComparisonsFromPricing(pricing, basePrice)

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
      retreat: typeof card.retreat === 'number' ? card.retreat : card.retreat ? Number(card.retreat) : undefined,
      attacks: card.attacks,
      weaknesses: card.weaknesses,
      trainerType: (card as { trainerType?: string }).trainerType,
      effect: (card as { effect?: string }).effect,
      energyType: (card as { energyType?: string }).energyType,
    },
    priceTrend,
    priceComparisons,
    stats,
    pricing: {
      best: resolvedPrice,
      tcgplayer: pricing?.tcgplayer,
      cardmarket: pricing?.cardmarket,
    },
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
