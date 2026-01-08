import { useQuery } from '@tanstack/react-query'
import tcgdex from '../lib/tcgdex'

export interface PokemonSet {
  id: string
  name: string
  series?: string
  cardCount: number
  releaseDate?: string
  logo?: string
  symbol?: string
}

type TCGdexSetResume = {
  id: string
  name: string
  logo?: string
  symbol?: string
  releaseDate?: string
  cardCount?: { total?: number; official?: number }
  getSet?: () => Promise<TCGdexFullSet>
}

type TCGdexSeries = {
  id: string
  name: string
}

type TCGdexFullSet = TCGdexSetResume & {
  releaseDate?: string
  serie?: TCGdexSeries
  symbol?: string
}

const ensureAssetUrl = (url?: string) => {
  if (!url) return undefined
  const hasExtension = /\.(png|webp|jpg)$/i.test(url)
  return hasExtension ? url : `${url}.webp`
}

const fetchMissingDetails = async (sets: TCGdexSetResume[], batchSize = 12) => {
  const details = new Map<string, TCGdexFullSet>()

  for (let i = 0; i < sets.length; i += batchSize) {
    const batch = sets.slice(i, i + batchSize)
    const batchDetails = await Promise.all(
      batch.map((set) =>
        set
          .getSet?.()
          .catch((error) => {
            console.error(`getSet error for ${set.id}`, error)
            return null
          }),
      ),
    )

    batchDetails.forEach((detail) => {
      if (detail) {
        details.set(detail.id, detail)
      }
    })
  }

  return details
}

const fetchPokemonSets = async (): Promise<PokemonSet[]> => {
  try {
    const sets = (await tcgdex.set.list()) as TCGdexSetResume[]
    const detailedSets = await fetchMissingDetails(sets)
    console.log(sets)
    console.log(detailedSets)

    return sets.map((set) => ({
      id: set.id,
      name: set.name,
      series: detailedSets.get(set.id)?.serie?.name,
      cardCount: set.cardCount?.official ?? set.cardCount?.total ?? 0,
      releaseDate: detailedSets.get(set.id)?.releaseDate,
      logo: ensureAssetUrl(set.logo),
      symbol: ensureAssetUrl(detailedSets.get(set.id)?.symbol ?? set.symbol),
    }))
  } catch (error) {
    console.error('SDK set.list error:', error)
    throw new Error('No se pudieron obtener los sets. Intenta de nuevo más tarde.')
  }
}

const POKEMON_SETS_TTL_MS = 2 * 24 * 60 * 60 * 1000

export const usePokemonSets = () =>
  useQuery<PokemonSet[], Error>({
    queryKey: ['pokemon-sets'],
    queryFn: fetchPokemonSets,
    staleTime: POKEMON_SETS_TTL_MS,
    gcTime: POKEMON_SETS_TTL_MS,
    refetchOnWindowFocus: false,
  })
