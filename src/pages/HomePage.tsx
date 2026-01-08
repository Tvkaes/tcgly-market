import { useRef } from 'react'
import HeroSection from '../components/ui/HeroSection'
import CardCarousel from '../components/ui/CardCarousel'
import LoadingSplash from '../components/ui/LoadingSplash'
import { useFeaturedCards } from '../hooks/useFeaturedCards'
import { useCardArcAnimation, type ArcPreset } from '../hooks/useCardArcAnimation'
import { usePageReveal } from '../hooks/usePageReveal'

const presetArc: ArcPreset[] = [
  { rotate: -21, lift: 38, shift: -360, depth: 2 },
  { rotate: -14, lift: 22, shift: -235, depth: 3 },
  { rotate: -7, lift: 10, shift: -115, depth: 4 },
  { rotate: 0, lift: 0, shift: 0, depth: 5 },
  { rotate: 7, lift: 10, shift: 115, depth: 4 },
  { rotate: 14, lift: 22, shift: 235, depth: 3 },
  { rotate: 21, lift: 38, shift: 360, depth: 2 },
]

interface HomePageProps {
  headerRef: React.RefObject<HTMLElement | null>
}

const HomePage = ({ headerRef }: HomePageProps) => {
  const heroRef = useRef<HTMLDivElement>(null)
  const {
    data: cards = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useFeaturedCards()

  const isInitialLoading = isLoading && cards.length === 0
  const { cardsContainerRef, visibleIndices } = useCardArcAnimation(cards, isInitialLoading, presetArc)
  const { showSplash } = usePageReveal(isInitialLoading, headerRef, heroRef)

  const isFetchingInBackground = isFetching && !isInitialLoading
  const errorMessage = error?.message ?? 'Error al cargar las cartas. Intenta de nuevo.'

  return (
    <div className="flex w-full flex-col items-center gap-12 text-center">
      <LoadingSplash isVisible={showSplash} />

      <HeroSection ref={heroRef} onRefetch={refetch} disabled={isFetchingInBackground} />

      <CardCarousel
        cards={cards}
        visibleIndices={visibleIndices}
        presetArc={presetArc}
        cardsContainerRef={cardsContainerRef}
        isError={isError}
        isInitialLoading={isInitialLoading}
        errorMessage={errorMessage}
        onRetry={refetch}
      />
    </div>
  )
}

export default HomePage
