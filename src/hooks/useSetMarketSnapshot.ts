import { useQuery } from '@tanstack/react-query'
import tcgdex from '@/lib/tcgdex'

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

type TCGdexSerie = {
  id: string
  name: string
}

type TCGdexCardSummary = {
  id: string
  name: string
  localId?: string
  image?: string
  rarity?: string
  supertype?: string
  subtypes?: string[]
  types?: string[]
  regulationMark?: string
}

type TCGdexSetResponse = {
  id: string
  name: string
  releaseDate?: string
  cardCount?: { total?: number; official?: number }
  logo?: string
  symbol?: string
  serie?: TCGdexSerie
  cards?: TCGdexCardSummary[]
}

export interface SetCardSummary {
  id: string
  name: string
  localId: string
  image?: string
  rarity?: string
  supertype?: string
  subtypes?: string[]
  types?: string[]
  regulationMark?: string
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
  cards: SetCardSummary[]
  lastUpdated: string
}

const fetchSetMarketSnapshot = async (setId: string): Promise<SetMarketSnapshot> => {
  const set = (await tcgdex.set.get(setId)) as TCGdexSetResponse | undefined
  if (import.meta.env.DEV) {
    console.log('[useSetMarketSnapshot] tcgdex.set.get payload', set)
  }
  if (!set) {
    throw new Error('Set information was not found.')
  }

  const cards = (set.cards ?? []).map((card, index): SetCardSummary => ({
    id: card.id,
    name: card.name,
    localId: card.localId ?? `${index + 1}`,
    image: ensureCardImage(card.image),
    rarity: card.rarity,
    supertype: card.supertype,
    subtypes: card.subtypes,
    types: card.types,
    regulationMark: card.regulationMark,
  }))

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
    cards,
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
