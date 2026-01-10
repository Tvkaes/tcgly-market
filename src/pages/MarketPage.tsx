import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import HoloCard from '@/components/shared/HoloCard'
import { useSetMarketSnapshot } from '@/hooks/useSetMarketSnapshot'

const MARKET_CARD_SKELETON_COUNT = 9

const MarketCardSkeleton = ({ index }: { index: number }) => (
  <div
    className="relative overflow-hidden rounded-2xl border border-white/30 bg-white/40 p-5 shadow-inner shadow-purple-500/5"
    style={{ animationDelay: `${index * 70}ms` }}
  >
    <div className="flex items-center gap-4">
      <div className="h-28 w-20 rounded-2xl bg-gradient-to-br from-white/90 to-white/60" />
      <div className="flex-1 space-y-3">
        <div className="h-3.5 w-16 rounded-full bg-white/70" />
        <div className="h-5 w-3/4 rounded-full bg-white/90" />
        <div className="h-4 w-1/2 rounded-full bg-white/60" />
        <div className="h-3 w-2/3 rounded-full bg-white/40" />
        <div className="h-3 w-2/5 rounded-full bg-white/30" />
      </div>
    </div>
    <div className="mt-5 h-16 rounded-2xl border border-white/50 bg-white/70" />
  </div>
)

const MarketPage = () => {
  const { setId: paramSetId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const fallbackSetId = typeof location.state?.setId === 'string' ? location.state.setId : null
  const currentSetId = paramSetId ?? fallbackSetId

  const { data, isLoading, isError, error, refetch } = useSetMarketSnapshot(currentSetId)
  const [cardRevealCount, setCardRevealCount] = useState(0)

  const lastUpdated = data ? new Date(data.lastUpdated).toLocaleString() : null
  const cards = data?.cards ?? []
  const cardsLength = cards.length

  const pageTitle = useMemo(() => {
    if (!currentSetId) return 'Market Dashboard'
    if (data?.set?.name) return `${data.set.name} Market Intelligence`
    return 'Market Dashboard'
  }, [currentSetId, data?.set?.name])

  useEffect(() => {
    if (isLoading || !currentSetId || cardsLength === 0) {
      const frame = window.requestAnimationFrame(() => setCardRevealCount(0))
      return () => window.cancelAnimationFrame(frame)
    }
    if (cardRevealCount >= cardsLength) return
    const timeout = window.setTimeout(() => {
      setCardRevealCount((current) => Math.min(current + 1, cardsLength))
    }, 55)
    return () => window.clearTimeout(timeout)
  }, [cardRevealCount, cardsLength, currentSetId, isLoading])

  return (
    <section className="mx-auto flex w-full max-w-[1400px] flex-col gap-10 px-4 text-left text-[#1f1235] sm:px-6 lg:px-10">
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.4em] text-[#a27ec8]">Market Intelligence</p>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="font-display text-4xl font-semibold">{pageTitle}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-[#7a678f]">
            {lastUpdated && (
              <span className="rounded-full bg-white/70 px-4 py-1 text-xs font-semibold text-[#2f1646] shadow-sm shadow-purple-500/10">
                Last updated: {lastUpdated}
              </span>
            )}
            <button
              onClick={() => refetch()}
              className="rounded-full border border-white/30 bg-white/70 px-4 py-2 text-xs font-semibold text-[#2f1646] shadow-sm shadow-purple-500/10 transition hover:-translate-y-0.5 hover:bg-white"
            >
              Refresh snapshot
            </button>
          </div>
        </div>
      </div>

      {!currentSetId && (
        <div className="rounded-3xl border border-dashed border-white/40 bg-white/40 px-8 py-10 text-center text-[#5b456d] shadow-inner shadow-purple-500/5">
          <p className="text-lg">Pick a set in the “Sets” tab to analyze it here.</p>
          <Link
            to="/sets"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-[#ff4d6d] px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-[#ff4d6d]/40 transition hover:-translate-y-0.5"
          >
            Go to Sets
          </Link>
        </div>
      )}

      {currentSetId && (
        <>
          {isLoading && (
            <div className="space-y-8">
              <div className="animate-pulse rounded-3xl bg-white/50 p-8 shadow-lg shadow-purple-500/10">
                <div className="h-6 w-1/3 rounded-full bg-white/80" />
                <div className="mt-4 h-10 w-2/3 rounded-full bg-white/70" />
                <div className="mt-6 grid gap-6 md:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="rounded-2xl bg-white/60 p-6">
                      <div className="h-4 w-1/2 rounded-full bg-white/80" />
                      <div className="mt-4 h-6 w-1/3 rounded-full bg-white/80" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: MARKET_CARD_SKELETON_COUNT }).map((_, index) => (
                  <MarketCardSkeleton key={index} index={index} />
                ))}
              </div>
            </div>
          )}

          {isError && (
            <div className="rounded-3xl border border-red-200 bg-red-50/80 px-8 py-10 text-center text-red-600 shadow-inner shadow-red-500/20">
              <p>{error?.message ?? 'We could not generate this market snapshot.'}</p>
              <button
                onClick={() => refetch()}
                className="mt-4 rounded-full bg-red-500/90 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-red-500"
              >
                Try again
              </button>
            </div>
          )}

          {data && (
            <>
                  <div className="relative overflow-hidden rounded-3xl border border-white/30 bg-gradient-to-br from-[#1b0f2b] via-[#2d1942] to-[#40275d] px-8 py-10 text-white shadow-2xl shadow-purple-500/30">
                    <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden>
                      <div className="absolute -right-20 top-0 h-64 w-64 rounded-full bg-[#ff4d6d]/40 blur-[120px]" />
                      <div className="absolute -left-10 bottom-0 h-72 w-72 rounded-full bg-[#7f5af0]/40 blur-[140px]" />
                    </div>
                    <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-4">
                        <p className="text-sm uppercase tracking-[0.5em] text-white/70">Analyzed set</p>
                        <h2 className="font-display text-4xl font-semibold">{data.set.name}</h2>
                        <div className="flex flex-wrap gap-4 text-sm text-white/80">
                          {data.set.series && (
                            <span className="rounded-full border border-white/20 px-4 py-1">{data.set.series}</span>
                          )}
                          {data.set.releaseDate && (
                            <span className="rounded-full border border-white/20 px-4 py-1">
                              Release: {new Date(data.set.releaseDate).toLocaleDateString()}
                            </span>
                          )}
                          <span className="rounded-full border border-white/20 px-4 py-1">{data.set.cardCount} cards</span>
                        </div>
                      </div>
                      {data.set.logo && (
                        <div className="relative inline-flex h-32 w-32 items-center justify-center rounded-[28px] bg-white/15 p-4 shadow-inner shadow-black/20">
                          <span className="absolute inset-0 rounded-[28px] border border-white/20" aria-hidden />
                          <img src={data.set.logo} alt={`${data.set.name} logo`} className="relative z-10 h-full w-full object-contain" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-[#a27ec8]">Available cards</p>
                        <h3 className="font-display text-2xl font-semibold text-[#1f1235]">
                          {cards.length} cards in this set
                        </h3>
                        <p className="text-sm text-[#7a678f]">
                          Select any card to see full details. Pricing is only calculated once you open the card view.
                        </p>
                      </div>
                      <span className="rounded-full bg-white/60 px-4 py-1 text-xs font-semibold text-[#5b456d]">
                        Click any card to open its detail and pricing
                      </span>
                    </div>

                    {cards.length > 0 ? (
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {cards.map((card, index) => {
                          const rarity = card.rarity?.toLowerCase()
                          const isPremium = rarity ? !['common', 'uncommon'].includes(rarity) : false
                          const isRevealed = index < cardRevealCount
                          return (
                            <button
                              key={card.id}
                              type="button"
                              onClick={() => navigate(`/card/${card.id}`, { state: { cardId: card.id, cardName: card.name } })}
                              className={[
                                'group flex flex-col gap-4 rounded-2xl border p-5 text-left transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus:outline-none focus:ring-2 focus:ring-[#ff4d6d]/30',
                                isPremium
                                  ? 'border-white/40 bg-white/20 shadow-2xl shadow-purple-500/30 backdrop-blur-lg hover:-translate-y-1 hover:shadow-purple-500/50'
                                  : 'border-white/40 bg-white/90 shadow-xl shadow-purple-500/10 hover:-translate-y-1 hover:shadow-purple-500/30',
                                isRevealed ? 'opacity-100 translate-y-0 blur-0' : 'pointer-events-none opacity-0 blur-[2px] translate-y-4',
                              ].join(' ')}
                              style={{ transitionDelay: `${Math.min(index, 12) * 45}ms` }}
                            >
                              <div className="flex items-center gap-4">
                                <HoloCard
                                  image={card.image}
                                  alt={card.name}
                                  isHolo={isPremium}
                                  wrapperClassName={isPremium ? 'h-48 w-32' : 'h-24 w-20'}
                                  fallbackLabel="No image available"
                                />
                                <div>
                                  <p className="text-xs uppercase tracking-[0.3em] text-[#a27ec8]">#{card.localId}</p>
                                  <h4 className="text-lg font-semibold text-[#1f1235]">{card.name}</h4>
                                  {card.rarity && (
                                    <p className="text-xs font-medium text-[#7a678f]">
                                      Rarity: <span className="uppercase tracking-[0.2em] text-[#2f1646]">{card.rarity}</span>
                                    </p>
                                  )}
                                  {card.types?.length && (
                                    <p className="text-xs text-[#7a678f]">Types: {card.types.join(' · ')}</p>
                                  )}
                                  {card.regulationMark && (
                                    <p className="text-xs text-[#7a678f]">Regulation: {card.regulationMark}</p>
                                  )}
                                </div>
                              </div>
                              <div className="rounded-2xl border border-white/70 bg-white p-4 text-sm text-[#5b456d] shadow-lg shadow-purple-500/10">
                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a27ec8]">On click</p>
                                <p className="mt-1 text-[13px] text-[#5b456d]">
                                  We’ll take you to the card detail to review pricing, attacks, and stats.
                                </p>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="rounded-3xl border border-dashed border-white/40 bg-white/50 px-6 py-12 text-center text-[#5b456d]">
                        This set does not expose cards in the SDK summary.
                      </div>
                    )}
                  </div>
            </>
          )}
        </>
      )}
    </section>
  )
}

export default MarketPage
