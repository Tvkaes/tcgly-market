import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePokemonSets } from '../hooks/usePokemonSets'

const PAGE_SIZE = 12

const SetsPage = () => {
  const [activeSetId, setActiveSetId] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [isExtending, setIsExtending] = useState(false)
  const transitionTimeoutRef = useRef<number | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const fakeLoadTimeoutRef = useRef<number | null>(null)
  const navigate = useNavigate()
  const { data: sets, isLoading, isError, error, refetch } = usePokemonSets()

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
    if (!sets || isExtending) return
    const totalAvailable = sets.length
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
  }, [sets, isExtending, visibleCount])

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
  }, [extendSets])

  const handleSelectSet = (setId: string, setName: string) => {
    setActiveSetId(setId)
    transitionTimeoutRef.current = window.setTimeout(() => {
      navigate(`/market/${setId}`, { state: { setId, setName } })
    }, 320)
  }

  const totalSets = sets?.length ?? 0
  const clampedVisibleCount = Math.min(visibleCount, totalSets || PAGE_SIZE)

  const displayedSets = useMemo(() => {
    if (!sets) return []
    return sets.slice(0, clampedVisibleCount)
  }, [sets, clampedVisibleCount])

  return (
    <section className="mx-auto w-full max-w-[1400px] space-y-10 px-4 text-left text-[#2f1646] sm:px-6 lg:px-10">
      <div className="space-y-4 text-center md:text-left">
        <p className="text-sm uppercase tracking-[0.3em] text-[#a27ec8]">Pokémon TCG Sets</p>
        <h1 className="font-display text-4xl font-semibold text-[#1f1235]">Explore Pokémon Card Sets</h1>
        <p className="text-lg text-[#5b456d]">
          Consulta todos los sets oficiales con información de lanzamiento y tamaño. La data se actualiza cada 24 horas usando la API de TCGdex.
        </p>
      </div>

      {isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-3xl border border-white/40 bg-white/30 p-5 shadow-lg shadow-purple-500/10 backdrop-blur">
              <div className="mb-4 h-12 w-12 rounded-2xl bg-gradient-to-br from-[#f5f0ff] to-[#e3d6ff]" />
              <div className="h-6 w-3/4 rounded-full bg-white/60" />
              <div className="mt-2 h-4 w-1/2 rounded-full bg-white/40" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-3xl border border-red-200 bg-red-50/70 p-6 text-center text-red-600">
          <p>{error?.message ?? 'No se pudieron cargar los sets.'}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded-full bg-red-500/90 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-red-500"
          >
            Reintentar
          </button>
        </div>
      )}

      {!isLoading && sets && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayedSets.map((set) => {
            const isActive = activeSetId === set.id
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
                className={`group rounded-3xl border border-white/40 bg-white/30 p-5 text-[#2f1646] shadow-xl shadow-purple-500/10 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1 hover:shadow-purple-500/30 focus:outline-none focus:ring-2 focus:ring-[#ff4d6d]/40 ${
                  isActive ? 'scale-[1.02] bg-gradient-to-br from-white/80 to-[#f8efff]/90 shadow-purple-500/50' : ''
                }`}
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
                    {set.releaseDate ? new Date(set.releaseDate).toLocaleDateString() : 'Fecha no disponible'}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-[#5b456d]">
                <span>{set.cardCount ?? 0} cartas</span>
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

      {sets && clampedVisibleCount < sets.length && (
        <div className="flex flex-col items-center gap-2 pt-4">
          <button
            onClick={extendSets}
            className="rounded-full border border-white/40 bg-white/80 px-6 py-2 text-sm font-semibold text-[#2f1646] shadow-lg shadow-purple-500/10 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isExtending}
          >
            {isExtending ? 'Cargando...' : 'Cargar más sets'}
          </button>
          {isExtending && (
            <div className="flex items-center gap-2 text-sm text-[#7a678f]">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#a27ec8]/40 border-t-[#ff4d6d]" />
              Preparando nuevos sets...
            </div>
          )}
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#a27ec8]">
            {clampedVisibleCount}/{sets.length}
          </div>
          <div ref={sentinelRef} className="h-px w-full opacity-0" aria-hidden />
        </div>
      )}
    </section>
  )
}

export default SetsPage
