import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { usePokemonSets, type PokemonSet } from '@/hooks/usePokemonSets'
import type { PokemonSeriesSetSummary } from '@/hooks/usePokemonSeries'

const PAGE_SIZE = 12
const PLACEHOLDER_COUNT = 6

const LoadingSetSkeleton = ({ index }: { index: number }) => (
  <div
    className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/20 p-5 shadow-lg shadow-purple-500/5"
    style={{ animationDelay: `${index * 80}ms` }}
  >
    <div className="flex items-center gap-4">
      <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-[#f5f0ff]/80 via-white/70 to-[#e3d6ff]/80">
        <span className="absolute inset-0 animate-pulse rounded-2xl bg-white/40" />
      </div>
      <div className="flex-1 space-y-3">
        <div className="h-4 w-3/4 rounded-full bg-white/60" />
        <div className="h-3 w-1/2 rounded-full bg-white/30" />
      </div>
    </div>
    <div className="mt-6 flex items-center justify-between">
      <div className="h-3 w-1/4 rounded-full bg-white/30" />
      <div className="h-3 w-1/3 rounded-full bg-white/30" />
    </div>
  </div>
)

const SetsPage = () => {
  const { seriesId: paramSeriesId } = useParams()
  const location = useLocation()
  const preferredSeriesName = typeof location.state?.seriesName === 'string' ? location.state.seriesName : undefined
  const [activeSetId, setActiveSetId] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [isExtending, setIsExtending] = useState(false)
  const [revealCount, setRevealCount] = useState(0)
  const transitionTimeoutRef = useRef<number | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const fakeLoadTimeoutRef = useRef<number | null>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: sets, isLoading, isError, error, refetch } = usePokemonSets()

  const cachedSeriesSets = useMemo<PokemonSet[] | null>(() => {
    if (!paramSeriesId) return null
    const cached = queryClient.getQueryData<PokemonSeriesSetSummary[]>(['series-sets', paramSeriesId])
    if (!cached?.length) return null
    return cached.map((set) => ({
      id: set.id,
      name: set.name,
      series: preferredSeriesName,
      seriesId: paramSeriesId,
      cardCount: set.cardCount ?? 0,
      releaseDate: set.releaseDate,
      logo: set.logo,
      symbol: set.symbol,
    }))
  }, [paramSeriesId, preferredSeriesName, queryClient])

  const baseSets = useMemo<PokemonSet[]>(() => {
    if (cachedSeriesSets) return cachedSeriesSets
    return sets ?? []
  }, [cachedSeriesSets, sets])

  const filteredSets = useMemo(() => {
    if (!baseSets.length) return []
    if (cachedSeriesSets) return baseSets
    if (!paramSeriesId) return baseSets
    return baseSets.filter((set) => set.seriesId === paramSeriesId)
  }, [baseSets, cachedSeriesSets, paramSeriesId])

  const isSeriesFiltered = Boolean(paramSeriesId)
  const isLoadingSets = isLoading && !cachedSeriesSets

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current)
      }
      if (fakeLoadTimeoutRef.current) {
        window.clearTimeout(fakeLoadTimeoutRef.current)
      }
    }
  }, [])

  const extendSets = useCallback(() => {
    const totalAvailable = filteredSets.length
    if (!totalAvailable || isExtending) return
    if (visibleCount >= totalAvailable) return
    setIsExtending(true)
    if (fakeLoadTimeoutRef.current) {
      window.clearTimeout(fakeLoadTimeoutRef.current)
    }
    fakeLoadTimeoutRef.current = window.setTimeout(() => {
      setVisibleCount((current) => Math.min(current + PAGE_SIZE, totalAvailable))
      setIsExtending(false)
      fakeLoadTimeoutRef.current = null
    }, 2000)
  }, [filteredSets.length, isExtending, visibleCount])

  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          extendSets()
        }
      },
      { rootMargin: '120px' }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [extendSets, filteredSets.length])

  const handleSelectSet = (setId: string, setName: string) => {
    setActiveSetId(setId)
    transitionTimeoutRef.current = window.setTimeout(() => {
      navigate(`/set/${setId}`, { state: { setId, setName } })
    }, 320)
  }

  const totalSets = filteredSets.length
  const clampedVisibleCount = Math.min(visibleCount, totalSets || PAGE_SIZE)
  const targetRevealCount = isLoadingSets ? 0 : clampedVisibleCount

  const displayedSets = useMemo(() => {
    if (!filteredSets.length) return []
    return filteredSets.slice(0, clampedVisibleCount)
  }, [filteredSets, clampedVisibleCount])

  useEffect(() => {
    if (isLoadingSets || !targetRevealCount) {
      const frame = window.requestAnimationFrame(() => setRevealCount(0))
      return () => window.cancelAnimationFrame(frame)
    }

    if (revealCount >= targetRevealCount) {
      return
    }

    const timeout = window.setTimeout(() => {
      setRevealCount((current) => Math.min(current + 1, targetRevealCount))
    }, 60)

    return () => window.clearTimeout(timeout)
  }, [isLoadingSets, targetRevealCount, revealCount])

  return (
    <section className="mx-auto w-full max-w-[1400px] space-y-10 px-4 text-left text-[#2f1646] sm:px-6 lg:px-10">
      <div className="space-y-4 text-center md:text-left">
        <p className="text-sm uppercase tracking-[0.3em] text-[#a27ec8]">
          {isSeriesFiltered ? 'Series-filtered view' : 'Pokémon TCG Sets'}
        </p>
        <h1 className="font-display text-4xl font-semibold text-[#1f1235]">
          {isSeriesFiltered && preferredSeriesName ? `${preferredSeriesName} Sets` : 'Explore Pokémon Card Sets'}
        </h1>
        <p className="text-lg text-[#5b456d]">
          {isSeriesFiltered
            ? 'Showing only the sets that belong to this series. All pricing data will respect this filtered list.'
            : 'Browse every official set with release insights, card counts, and updated data every 24 hours via the TCGdex API.'}
        </p>
      </div>

      {isLoadingSets && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: PLACEHOLDER_COUNT }).map((_, index) => (
            <LoadingSetSkeleton key={index} index={index} />
          ))}
        </div>
      )}

      {!isLoadingSets && filteredSets.length === 0 && (
        <div className="rounded-3xl border border-dashed border-white/50 bg-white/60 px-6 py-12 text-center text-[#5b456d]">
          No sets were found for this series filter.
        </div>
      )}

      {isError && (
        <div className="rounded-3xl border border-red-200 bg-red-50/70 p-6 text-center text-red-600">
          <p>{error?.message ?? 'We couldn’t load the sets.'}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded-full bg-red-500/90 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-red-500"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && filteredSets.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayedSets.map((set, index) => {
            const isActive = activeSetId === set.id
            const isRevealed = index < revealCount
            return (
              <article
                key={set.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelectSet(set.id, set.name)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    handleSelectSet(set.id, set.name)
                  }
                }}
                className={`group rounded-3xl border border-white/40 bg-white/30 p-5 text-[#2f1646] shadow-xl shadow-purple-500/10 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1 hover:shadow-purple-500/30 focus:outline-none focus:ring-2 focus:ring-[#ff4d6d]/40 ${
                  isActive ? 'scale-[1.02] bg-gradient-to-br from-white/80 to-[#f8efff]/90 shadow-purple-500/50' : ''
                } ${isRevealed ? 'opacity-100 translate-y-0 blur-0' : 'pointer-events-none opacity-0 blur-[2px] translate-y-4'}`}
                style={{ transitionDelay: `${Math.min(index, 12) * 40}ms` }}
              >
              <div className="flex items-center gap-4">
                {set.logo ? (
                  <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/70 p-2 transition-all duration-500 group-hover:scale-105">
                    <span
                      aria-hidden
                      className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#ffd1f7]/60 to-[#d6f5ff]/60 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
                    />
                    <img src={set.logo} alt={`${set.name} logo`} className="relative z-10 h-full w-full object-contain" loading="lazy" />
                  </span>
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f5f0ff] to-[#e3d6ff] text-sm font-semibold">
                    {set.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="font-display text-xl font-semibold">{set.name}</h2>
                  <p className="text-sm text-[#7a678f]">
                    {set.releaseDate ? new Date(set.releaseDate).toLocaleDateString() : 'Release date unavailable'}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-[#5b456d]">
                <span>{set.cardCount ?? 0} cards</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isActive ? 'bg-[#ff4d6d]/10 text-[#ff4d6d]' : 'bg-white/60 text-[#2f1646]'
                  }`}
                >
                  Set ID: {set.id}
                </span>
              </div>
            </article>
            )
          })}
        </div>
      )}

      {filteredSets.length > 0 && clampedVisibleCount < filteredSets.length && (
        <div className="flex flex-col items-center gap-2 pt-4">
          <button
            onClick={extendSets}
            className="rounded-full border border-white/40 bg-white/80 px-6 py-2 text-sm font-semibold text-[#2f1646] shadow-lg shadow-purple-500/10 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isExtending}
          >
            {isExtending ? 'Loading…' : 'Load more sets'}
          </button>
          {isExtending && (
            <div className="flex items-center gap-2 text-sm text-[#7a678f]">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#a27ec8]/40 border-t-[#ff4d6d]" />
              Preparing more sets…
            </div>
          )}
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#a27ec8]">
            {clampedVisibleCount}/{filteredSets.length}
          </div>
          <div ref={sentinelRef} className="h-px w-full opacity-0" aria-hidden />
        </div>
      )}
    </section>
  )
}

export default SetsPage
