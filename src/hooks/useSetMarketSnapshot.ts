import { useQuery } from '@tanstack/react-query'
import tcgdex from '../lib/tcgdex'

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000

const ensureAssetUrl = (url?: string) => {
  if (!url) return undefined
  const hasExtension = /\.(png|webp|jpg)$/i.test(url)
  return hasExtension ? url : `${url}.webp`
}

const ensureCardImage = (url?: string) => {
  if (!url) return undefined
  const hasQualitySuffix = /\/(high|low)\.(png|webp|jpg)$/i.test(url)
  if (hasQualitySuffix) return url
  const sanitized = url.replace(/\/$/, '')
  return `${sanitized}/high.webp`
}

const deterministicPrice = (seed: string, offset = 0) => {
  const base = seed.split('').reduce((acc, char, index) => acc + char.charCodeAt(0) * (index + 1), 0) + offset * 137
  const scaled = 4 + (base % 320) / 9
  return Number(scaled.toFixed(2))
}

const MARKETS = [
  { name: 'CardMarket', multiplier: 1 },
  { name: 'TCGplayer', multiplier: 1.08 },
  { name: 'eBay', multiplier: 0.95 },
  { name: 'Mercado Libre', multiplier: 1.04 },
]

export interface MarketHighlightCard {
  id: string
  name: string
  localId: string
  image?: string
  rarity?: string
  priceUsd: number
  dayChangePercent: number
  sources: Array<{ market: string; price: number }>
}

export interface MarketComparison {
  market: string
  avgPrice: number
  changePercent: number
}

export interface SetMarketSnapshot {
  set: {
    id: string
    name: string
    releaseDate?: string
    cardCount: number
    logo?: string
    symbol?: string
    series?: string
  }
  topCards: MarketHighlightCard[]
  priceComparisons: MarketComparison[]
  lastUpdated: string
}

const fetchSetMarketSnapshot = async (setId: string): Promise<SetMarketSnapshot> => {
  const set = await tcgdex.set.get(setId)
  if (!set) {
    throw new Error('No se encontró información del set.')
  }
  const cards = set.cards ?? []

  const enrichedCards: MarketHighlightCard[] = cards.map((card, index) => {
    const priceUsd = deterministicPrice(card.localId ?? card.id, index)
    const volatility = ((card.name.length % 7) - 3) * 1.25
    const sources = MARKETS.map((market, marketIndex) => ({
      market: market.name,
      price: Number((priceUsd * (1 + marketIndex * 0.03 - 0.04)).toFixed(2)),
    }))

    return {
      id: card.id,
      name: card.name,
      localId: card.localId ?? `${index + 1}`,
      image: ensureCardImage(card.image),
      rarity: (card as { rarity?: string }).rarity,
      priceUsd,
      dayChangePercent: Number((volatility / 2).toFixed(2)),
      sources,
    }
  })

  const topCards = enrichedCards.sort((a, b) => b.priceUsd - a.priceUsd).slice(0, 6)
  const avgPrice = enrichedCards.reduce((acc, card) => acc + card.priceUsd, 0) / (enrichedCards.length || 1)

  const priceComparisons = MARKETS.map((market, index) => {
    const changePercent = Number((((market.multiplier - 1) * 100 + index * 0.6).toFixed(2)))
    return {
      market: market.name,
      avgPrice: Number((avgPrice * market.multiplier).toFixed(2)),
      changePercent,
    }
  })

  return {
    set: {
      id: set.id,
      name: set.name,
      releaseDate: set.releaseDate,
      cardCount: set.cardCount?.official ?? set.cardCount?.total ?? cards.length,
      logo: ensureAssetUrl(set.logo),
      symbol: ensureAssetUrl(set.symbol),
      series: set.serie?.name,
    },
    topCards,
    priceComparisons,
    lastUpdated: new Date().toISOString(),
  }
}

export const useSetMarketSnapshot = (setId?: string | null) =>
  useQuery<SetMarketSnapshot>({
    queryKey: ['market-set', setId],
    queryFn: () => fetchSetMarketSnapshot(setId as string),
    enabled: Boolean(setId),
    staleTime: TWO_DAYS_MS,
    gcTime: TWO_DAYS_MS,
    refetchOnWindowFocus: false,
  })
