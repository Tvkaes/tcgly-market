import { useQuery } from '@tanstack/react-query'
import tcgdex from '@/lib/tcgdex'
const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000

export interface PokemonSeries {
  id: string
  name: string
  releaseDate?: string
  logo?: string
  symbol?: string
  description?: string
  setCount: number
}

export interface PokemonSeriesSetSummary {
  id: string
  name: string
  logo?: string
  symbol?: string
  releaseDate?: string
  cardCount?: number
}

type TCGdexSeriesResponse = {
  id: string
  name: string
  logo?: string
  symbol?: string
  releaseDate?: string
  description?: string
  sets?: Array<{
    id: string
    name?: string
    logo?: string
    symbol?: string
    releaseDate?: string
    cardCount?: { total?: number; official?: number }
  }>
  cardCount?: { total?: number; official?: number }
}

const ensureAssetUrl = (url?: string) => {
  if (!url) return undefined
  const hasExtension = /\.(png|webp|jpg)$/i.test(url)
  return hasExtension ? url : `${url}.webp`
}

const fetchPokemonSeries = async (): Promise<PokemonSeries[]> => {
  try {
    const payload = (await tcgdex.fetch('series')) as TCGdexSeriesResponse[]

    return payload.map((serie) => {
      const setCount =
        (Array.isArray(serie.sets) ? serie.sets.length : undefined) ??
        serie.cardCount?.official ??
        serie.cardCount?.total ??
        0

      return {
        id: serie.id,
        name: serie.name,
        releaseDate: serie.releaseDate,
        logo: ensureAssetUrl(serie.logo),
        symbol: ensureAssetUrl(serie.symbol),
        description: serie.description,
        setCount,
      }
    })
  } catch (error) {
    console.error('fetchPokemonSeries error:', error)
    throw new Error('We could not fetch the series. Please try again later.')
  }
}

export const usePokemonSeries = () =>
  useQuery<PokemonSeries[], Error>({
    queryKey: ['pokemon-series'],
    queryFn: fetchPokemonSeries,
    staleTime: TWO_DAYS_MS,
    gcTime: TWO_DAYS_MS,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

const fetchSeriesSets = async (seriesId: string): Promise<PokemonSeriesSetSummary[]> => {
  try {
    const serie = (await tcgdex.fetch('series', seriesId)) as TCGdexSeriesResponse | null
    if (!serie?.sets?.length) return []

    return serie.sets.map((set) => ({
      id: set.id,
      name: set.name ?? set.id,
      logo: ensureAssetUrl(set.logo),
      symbol: ensureAssetUrl(set.symbol),
      releaseDate: set.releaseDate,
      cardCount: set.cardCount?.official ?? set.cardCount?.total,
    }))
  } catch (error) {
    console.error('fetchSeriesSets error:', error)
    throw new Error('We could not load the sets for this series. Please try again later.')
  }
}

export const useSeriesSets = (seriesId?: string, enabled = true) =>
  useQuery<PokemonSeriesSetSummary[], Error>({
    queryKey: ['series-sets', seriesId],
    queryFn: () => fetchSeriesSets(seriesId as string),
    enabled: Boolean(seriesId) && enabled,
    staleTime: TWO_DAYS_MS,
    gcTime: TWO_DAYS_MS,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
