import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePokemonSeries, useSeriesSets } from '@/hooks/usePokemonSeries'

const PAGE_SIZE = 9
const PLACEHOLDER_COUNT = 6

const SeriesCardSkeleton = ({ index }: { index: number }) => (
  <div
    className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/25 p-5 shadow-lg shadow-purple-500/5"
    style={{ animationDelay: `${index * 70}ms` }}
  >
    <div className="flex items-center gap-4">
      <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-[#f5f0ff]/80 via-white/70 to-[#d6f5ff]/70">
        <span className="absolute inset-0 animate-pulse rounded-2xl bg-white/40" />
      </div>
      <div className="flex-1 space-y-3">
        <div className="h-4 w-2/3 rounded-full bg-white/70" />
        <div className="h-3 w-1/2 rounded-full bg-white/50" />
      </div>
    </div>
    <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
      <div className="h-3 rounded-full bg-white/40" />
      <div className="h-3 rounded-full bg-white/30" />
      <div className="col-span-2 h-3 rounded-full bg-white/30" />
    </div>
  </div>
)



const SeriesSetsPreview = ({
  seriesId,
  shouldPrefetch,
}: {
  seriesId: string
  shouldPrefetch: boolean
}) => {
  const { data, isFetching } = useSeriesSets(seriesId, shouldPrefetch)
  if (!shouldPrefetch) return null

  const previewSets = (data ?? []).slice(0, 3)

  return (
    <div className="mt-4 rounded-2xl border border-white/60 bg-white/70 p-3 text-xs text-[#5b456d] shadow-inner shadow-purple-500/5">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-[#2f1646]">{data?.length ?? 0} sets</span>
        {isFetching && <span className="text-[10px] uppercase tracking-[0.3em] text-[#a27ec8]">Syncing…</span>}
      </div>
      {previewSets.length === 0 && !isFetching && <p className="mt-1 text-[11px] text-[#7a678f]">Sets will appear as soon as the SDK responds.</p>}
    </div>
  )
}

const SeriesPage = () => {
  const navigate = useNavigate()
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [isExtending, setIsExtending] = useState(false)
  const [revealCount, setRevealCount] = useState(0)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const extendTimeoutRef = useRef<number | null>(null)
  const { data: series, isLoading, isError, error, refetch } = usePokemonSeries()

  const totalSeries = series?.length ?? 0
  const clampedVisible = Math.min(visibleCount, totalSeries || PAGE_SIZE)

  useEffect(() => {
    return () => {
      if (extendTimeoutRef.current) window.clearTimeout(extendTimeoutRef.current)
    }
  }, [])

  const extendSeries = useCallback(() => {
    if (!series || isExtending) return
    const totalAvailable = series.length
    if (visibleCount >= totalAvailable) return
    setIsExtending(true)
    if (extendTimeoutRef.current) window.clearTimeout(extendTimeoutRef.current)
    extendTimeoutRef.current = window.setTimeout(() => {
      setVisibleCount((current) => Math.min(current + PAGE_SIZE, totalAvailable))
      setIsExtending(false)
      extendTimeoutRef.current = null
    }, 1800)
  }, [isExtending, series, visibleCount])

  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          extendSeries()
        }
      },
      { rootMargin: '120px' },
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [extendSeries])

  const displayedSeries = useMemo(() => {
    if (!series) return []
    return series.slice(0, clampedVisible)
  }, [series, clampedVisible])

  useEffect(() => {
    if (isLoading || !clampedVisible) {
      const frame = window.requestAnimationFrame(() => setRevealCount(0))
      return () => window.cancelAnimationFrame(frame)
    }

    if (revealCount >= clampedVisible) return

    const timeout = window.setTimeout(() => {
      setRevealCount((current) => Math.min(current + 1, clampedVisible))
    }, 65)
    return () => window.clearTimeout(timeout)
  }, [clampedVisible, isLoading, revealCount])

  return (
    <section className="mx-auto w-full max-w-[1400px] space-y-10 px-4 text-left text-[#1f1235] sm:px-6 lg:px-10">
      <div className="space-y-4 text-center md:text-left">
        <p className="text-xs uppercase tracking-[0.5em] text-[#a27ec8]">Pokémon TCG Series</p>
        <h1 className="font-display text-4xl font-semibold text-[#1f1235]">Explore every official series</h1>
        <p className="text-lg text-[#5b456d]">
          Browse every Pokémon TCG series, see their original logos, release timelines, and the number of sets inside each collection.
          Pulled directly from the TCGdex API.
        </p>
      </div>

      {isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: PLACEHOLDER_COUNT }).map((_, index) => (
            <SeriesCardSkeleton key={index} index={index} />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-3xl border border-red-200 bg-red-50/90 p-8 text-center text-red-600 shadow-inner shadow-red-500/20">
          <p>{error?.message ?? 'We could not load the series.'}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 rounded-full bg-red-500/90 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-red-500"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && series && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayedSeries.map((serie, index) => {
            const isRevealed = index < revealCount
            return (
              <article
                key={serie.id}
                className={`group flex flex-col gap-4 rounded-3xl border border-white/40 bg-white/80 p-6 text-[#1f1235] shadow-xl shadow-purple-500/10 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1 hover:shadow-purple-500/40 ${
                  isRevealed ? 'opacity-100 translate-y-0 blur-0' : 'pointer-events-none opacity-0 translate-y-4 blur-[2px]'
                }`}
                style={{ transitionDelay: `${Math.min(index, 12) * 45}ms` }}
              >
                <div className="flex items-center gap-4">
                  {serie.logo ? (
                    <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/70 p-2 shadow-inner shadow-black/5 transition-all duration-500 group-hover:scale-105">
                      <span
                        aria-hidden
                        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#ffd1f7]/60 to-[#d6f5ff]/60 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
                      />
                      <img src={serie.logo} alt={`${serie.name} logo`} className="relative z-10 h-full w-full object-contain" loading="lazy" />
                    </span>
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f5f0ff] to-[#e3d6ff] text-sm font-semibold">
                      {serie.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-[#a27ec8]">Series</p>
                    <h2 className="font-display text-2xl font-semibold">{serie.name}</h2>
                    <p className="text-sm text-[#7a678f]">
                      {serie.releaseDate ? new Date(serie.releaseDate).toLocaleDateString() : 'Release date unavailable'}
                    </p>
                  </div>
                </div>
                <SeriesSetsPreview seriesId={serie.id} shouldPrefetch={isRevealed} />

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/sets/${serie.id}`, { state: { seriesName: serie.name } })}
                    className="inline-flex flex-1 items-center justify-center rounded-full bg-[#ff4d6d] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#ff4d6d]/40 transition hover:-translate-y-0.5"
                  >
                    View sets
                  </button>
                  <span className="rounded-full border border-white/60 bg-white/80 px-4 py-2 text-xs font-semibold text-[#5b456d]">
                    ID: {serie.id}
                  </span>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {series && clampedVisible < series.length && (
        <div className="flex flex-col items-center gap-2 pt-6">
          <button
            onClick={extendSeries}
            className="rounded-full border border-white/40 bg-white/80 px-6 py-2 text-sm font-semibold text-[#2f1646] shadow-lg shadow-purple-500/10 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isExtending}
            type="button"
          >
            {isExtending ? 'Loading more series…' : 'Load more series'}
          </button>
          <div className="text-xs uppercase tracking-[0.3em] text-[#a27ec8]">
            {clampedVisible}/{series.length}
          </div>
          <div ref={sentinelRef} className="h-px w-full opacity-0" aria-hidden />
        </div>
      )}
    </section>
  )
}

export default SeriesPage
