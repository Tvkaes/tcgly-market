import type { Card } from '../../hooks/useFeaturedCards'
import type { ArcPreset } from '../../hooks/useCardArcAnimation'
import HoloCard from '../shared/HoloCard'

interface CardCarouselProps {
  cards: Card[]
  visibleIndices: number[]
  presetArc: ArcPreset[]
  cardsContainerRef: React.RefObject<HTMLDivElement | null>
  isError: boolean
  isInitialLoading: boolean
  errorMessage: string
  onRetry: () => void
}

const CardCarousel = ({
  cards,
  visibleIndices,
  presetArc,
  cardsContainerRef,
  isError,
  isInitialLoading,
  errorMessage,
  onRetry,
}: CardCarouselProps) => (
  <div className="flex w-full flex-col items-center">
    <div className="relative h-72 w-[90vw] overflow-visible">
      {isError && !isInitialLoading && (
        <div className="flex min-w-max justify-center">
          <div className="flex h-64 flex-col items-center justify-center gap-4">
            <p className="text-sm text-red-400">{errorMessage}</p>
            <button
              onClick={onRetry}
              className="rounded-full bg-white/30 px-4 py-2 text-sm font-medium text-[#2f1646] backdrop-blur-sm transition hover:bg-white/50"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}
      <div ref={cardsContainerRef} className="relative flex items-end justify-center" style={{ height: '280px' }}>
        {cards.map((card, index) => {
          const isVisible = visibleIndices.includes(index)
          return (
            <HoloCard
              key={card.id}
              data-index={index}
              isHolo={card.isHolo}
              image={card.image ?? ''}
              alt={`${card.name} pokemon card market price`}
              wrapperClassName="absolute h-64 w-44 origin-bottom"
              wrapperStyle={{
                zIndex: presetArc[index]?.depth ?? 1,
                opacity: 0,
                visibility: isVisible ? 'visible' : 'hidden',
              }}
            />
          )
        })}
      </div>
    </div>
  </div>
)

export default CardCarousel
