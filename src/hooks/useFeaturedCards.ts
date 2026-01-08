import { useQuery } from '@tanstack/react-query'
import TCGdex from '@tcgdex/sdk'

export interface Card {
  id: string
  name: string
  image: string | null
  rarity: string | null
  isHolo: boolean
}

interface SdkCardResume {
  id: string
  localId: string
  name: string
  image?: string
}

interface SdkSet {
  id: string
  cards: SdkCardResume[]
}

interface SdkCardDetails {
  id: string
  rarity?: string
  image?: string
  variants?: {
    holo?: boolean
    reverse?: boolean
    normal?: boolean
  }
}

const tcgdex = new TCGdex('en')
tcgdex.setCacheTTL(0)

export const FEATURED_CARDS_COUNT = 7
const MAX_SET_ATTEMPTS = 8

const fetchFeaturedCards = async (): Promise<Card[]> => {
  const collectedCards: Card[] = []
  const seenIds = new Set<string>()

  for (let attempt = 0; attempt < MAX_SET_ATTEMPTS && collectedCards.length < FEATURED_CARDS_COUNT; attempt += 1) {
    const randomSet = (await tcgdex.random.set().catch((e) => {
      console.error('random.set error:', e)
      return null
    })) as SdkSet | null

    if (!randomSet?.cards?.length) continue

    const shuffledCards = [...randomSet.cards].sort(() => Math.random() - 0.5)

    for (const cardResume of shuffledCards) {
      if (collectedCards.length === FEATURED_CARDS_COUNT) break
      if (seenIds.has(cardResume.id)) continue

      const cardDetails = (await tcgdex.card.get(cardResume.id).catch((e) => {
        console.error('card.get error:', e)
        return null
      })) as SdkCardDetails | null

      seenIds.add(cardResume.id)
      const imageBase = cardDetails?.image ?? cardResume.image ?? null
      const rarity = cardDetails?.rarity ?? null
      const isHolo =
        Boolean(cardDetails?.variants?.holo) === true &&
        rarity !== null &&
        rarity.toLowerCase() !== 'common' &&
        rarity.toLowerCase() !== 'uncommon'

      collectedCards.push({
        id: cardResume.id,
        name: cardResume.name,
        image: imageBase ? `${imageBase}/high.webp` : null,
        rarity,
        isHolo,
      })
    }
  }

  if (!collectedCards.length) {
    throw new Error('No se pudieron obtener cartas. Intenta de nuevo.')
  }

  return collectedCards.slice(0, FEATURED_CARDS_COUNT)
}

export const useFeaturedCards = () =>
  useQuery<Card[], Error>({
    queryKey: ['featured-cards', FEATURED_CARDS_COUNT],
    queryFn: fetchFeaturedCards,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
