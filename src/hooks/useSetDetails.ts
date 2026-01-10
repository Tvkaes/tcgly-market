import { useQuery } from '@tanstack/react-query'
import TCGdex from '@tcgdex/sdk'

const BOOSTER_DETAILS_TTL_MS = 24 * 60 * 60 * 1000

type BoosterValue = string | null | undefined

type TCGdexSerie = { id?: string; name?: string }

type TCGdexBoosterPayload =
  | BoosterValue[]
  | {
      art?: BoosterValue[]
      images?: BoosterValue[]
      artworks?: BoosterValue[]
      pack?: BoosterValue[]
      image?: BoosterValue
      logo?: BoosterValue
      [key: string]: unknown
    }

export interface TCGdexFullSet {
  id: string
  name: string
  serie?: TCGdexSerie
  releaseDate?: string
  cardCount?: { official?: number; total?: number }
  booster?: TCGdexBoosterPayload | null
  cards?: Array<{
    id: string
    name: string
    localId?: string
    image?: string
    rarity?: string
  }>
}

const fetchSetDetails = async (setId: string): Promise<TCGdexFullSet> => {
 
  const tcgdexClient = new TCGdex()
  const payload = await tcgdexClient.set.get(setId)
  console.log('[useSetDetails] tcgdex.set.get payload', payload)
  return payload as TCGdexFullSet
}

export const useSetDetails = (setId?: string | null) =>
  useQuery<TCGdexFullSet>({
    queryKey: ['tcgdex-set-details', setId],
    queryFn: () => fetchSetDetails(setId as string),
    enabled: Boolean(setId),
    staleTime: BOOSTER_DETAILS_TTL_MS,
    gcTime: BOOSTER_DETAILS_TTL_MS,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
