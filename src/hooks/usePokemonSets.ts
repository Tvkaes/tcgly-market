import { useQuery } from '@tanstack/react-query'
import tcgdex from '@/lib/tcgdex'

const POKEMON_SETS_TTL_MS = 2 * 24 * 60 * 60 * 1000

export interface PokemonSet {
  id: string
  name: string
  series?: string
  seriesId?: string
  cardCount: number
  releaseDate?: string
  logo?: string
  symbol?: string
}

type TCGdexSeries = {
  id: string
  name: string
}

type TCGdexSetResume = {
  id: string
  name: string
  logo?: string
  symbol?: string
  releaseDate?: string
  serie?: TCGdexSeries
  cardCount?: { total?: number; official?: number }
}

const ensureAssetUrl = (url?: string) => {
  if (!url) return undefined
  const hasExtension = /\.(png|webp|jpg)$/i.test(url)
  return hasExtension ? url : `${url}.webp`
}

const fetchPokemonSets = async (): Promise<PokemonSet[]> => {
  try {
    const sets = (await tcgdex.set.list()) as TCGdexSetResume[]

    return sets.map((set) => ({
      id: set.id,
      name: set.name,
      series: set.serie?.name,
      seriesId: set.serie?.id,
      cardCount: set.cardCount?.official ?? set.cardCount?.total ?? 0,
      releaseDate: set.releaseDate,
      logo: ensureAssetUrl(set.logo),
      symbol: ensureAssetUrl(set.symbol),
    }))
  } catch (error) {
    console.error('SDK set.list error:', error)
    throw new Error('We could not load the sets. Please try again later.')
  }
}

export const usePokemonSets = () =>
  useQuery<PokemonSet[], Error>({
    queryKey: ['pokemon-sets'],
    queryFn: fetchPokemonSets,
    staleTime: POKEMON_SETS_TTL_MS,
    gcTime: POKEMON_SETS_TTL_MS,
    refetchOnWindowFocus: false,
  })
