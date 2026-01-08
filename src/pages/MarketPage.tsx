import { useMemo } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useSetMarketSnapshot } from '../hooks/useSetMarketSnapshot'
import MarketPriceChart from '../components/shared/MarketPriceChart'
import HoloCard from '../components/shared/HoloCard'

const formatCurrency = (value: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value)

const trendColor = (value: number) => (value >= 0 ? 'text-[#0f9d58]' : 'text-[#d93025]')

const MarketPage = () => {
  const { setId: paramSetId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const fallbackSetId = typeof location.state?.setId === 'string' ? location.state.setId : null
  const currentSetId = paramSetId ?? fallbackSetId

  const { data, isLoading, isError, error, refetch } = useSetMarketSnapshot(currentSetId)

  const lastUpdated = data ? new Date(data.lastUpdated).toLocaleString() : null

  const pageTitle = useMemo(() => {
    if (!currentSetId) return 'Market Dashboard'
    if (data?.set?.name) return `${data.set.name} Market Intelligence`
    return 'Market Dashboard'
  }, [currentSetId, data?.set?.name])

  return (
    <section className="mx-auto flex w-full max-w-[1400px] flex-col gap-10 px-4 text-left text-[#1f1235] sm:px-6 lg:px-10">
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.4em] text-[#a27ec8]">Market Intelligence</p>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="font-display text-4xl font-semibold">{pageTitle}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-[#7a678f]">
            {lastUpdated && (
              <span className="rounded-full bg-white/70 px-4 py-1 text-xs font-semibold text-[#2f1646] shadow-sm shadow-purple-500/10">
                Última actualización: {lastUpdated}
              </span>
            )}
            <button
              onClick={() => refetch()}
              className="rounded-full border border-white/30 bg-white/70 px-4 py-2 text-xs font-semibold text-[#2f1646] shadow-sm shadow-purple-500/10 transition hover:-translate-y-0.5 hover:bg-white"
            >
              Refrescar snapshot
            </button>
          </div>
        </div>
      </div>

      {!currentSetId && (
        <div className="rounded-3xl border border-dashed border-white/40 bg-white/40 px-8 py-10 text-center text-[#5b456d] shadow-inner shadow-purple-500/5">
          <p className="text-lg">Selecciona un set en la pestaña “Sets” para analizarlo aquí.</p>
          <Link
            to="/sets"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-[#ff4d6d] px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-[#ff4d6d]/40 transition hover:-translate-y-0.5"
          >
            Ir a Sets
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
              <div className="grid gap-6 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="rounded-2xl bg-white/60 p-5 shadow-inner shadow-purple-500/5">
                    <div className="h-4 w-1/2 rounded-full bg-white/80" />
                    <div className="mt-4 h-24 rounded-2xl bg-white/80" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {isError && (
            <div className="rounded-3xl border border-red-200 bg-red-50/80 px-8 py-10 text-center text-red-600 shadow-inner shadow-red-500/20">
              <p>{error?.message ?? 'No se pudo generar el snapshot de mercado.'}</p>
              <button
                onClick={() => refetch()}
                className="mt-4 rounded-full bg-red-500/90 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-red-500"
              >
                Reintentar
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
                    <p className="text-sm uppercase tracking-[0.5em] text-white/70">Set analizado</p>
                    <h2 className="font-display text-4xl font-semibold">{data.set.name}</h2>
                    <div className="flex flex-wrap gap-4 text-sm text-white/80">
                      {data.set.series && (
                        <span className="rounded-full border border-white/20 px-4 py-1">{data.set.series}</span>
                      )}
                      {data.set.releaseDate && (
                        <span className="rounded-full border border-white/20 px-4 py-1">
                          Lanzamiento: {new Date(data.set.releaseDate).toLocaleDateString()}
                        </span>
                      )}
                      <span className="rounded-full border border-white/20 px-4 py-1">{data.set.cardCount} cartas</span>
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

              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-3xl border border-white/30 bg-white/90 p-6 shadow-lg shadow-purple-500/20">
                  <div className="flex items-center justify_between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-[#a27ec8]">Comparativa</p>
                      <h3 className="font-display text-2xl text-[#1f1235]">Precio medio por mercado</h3>
                    </div>
                  </div>
                  <div className="mt-6">
                    <MarketPriceChart data={data.priceComparisons} />
                  </div>
                </div>
                <div className="rounded-3xl border border-white/30 bg-white/90 p-6 shadow-lg shadow-purple-500/20">
                  {data.priceComparisons.map((market) => (
                    <div key={`summary-${market.market}`} className="rounded-2xl border border-white/40 bg-white/80 p-4 +mb-0 mt-4 first:mt-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-[#1f1235]">{market.market}</p>
                        <span className={`text-xs font-semibold ${trendColor(market.changePercent)}`}>
                          {market.changePercent > 0 ? '+' : ''}
                          {market.changePercent}%
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-[#2f1646]">{formatCurrency(market.avgPrice)}</p>
                      <p className="text-xs text-[#7a678f]">Promedio 48h</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-[#a27ec8]">Premium radar</p>
                    <h3 className="font-display text-2xl font-semibold text-[#1f1235]">Cartas más valiosas del set</h3>
                  </div>
                  <span className="rounded-full bg-white/60 px-4 py-1 text-xs font-semibold text-[#5b456d]">
                    Valores calculados automáticamente
                  </span>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  {data.topCards.map((card) => {
                    const rarity = card.rarity?.toLowerCase()
                    const isPremium = rarity ? !['common', 'uncommon'].includes(rarity) : false
                    const cardContainerClasses = [
                      'group flex flex-col gap-4 rounded-2xl border p-5 text-left transition focus:outline-none focus:ring-2 focus:ring-[#ff4d6d]/30',
                      isPremium
                        ? 'border-white/40 bg-white/20 shadow-2xl shadow-purple-500/30 backdrop-blur-lg hover:-translate-y-1 hover:shadow-purple-500/50'
                        : 'border-white/40 bg-white/90 shadow-xl shadow-purple-500/10 hover:-translate-y-1 hover:shadow-purple-500/30',
                    ].join(' ')

                    return (
                      <button
                        type="button"
                        onClick={() => navigate(`/card/${card.id}`, { state: { cardId: card.id, cardName: card.name } })}
                        key={card.id}
                        className={cardContainerClasses}
                      >
                        <div className="flex items-center gap-4">
                          <HoloCard
                            image={card.image}
                            alt={card.name}
                            isHolo={isPremium}
                            wrapperClassName={isPremium ? 'h-48 w-32' : 'h-24 w-20'}
                            fallbackLabel="Sin imagen"
                          />
                          <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-[#a27ec8]">#{card.localId}</p>
                            <h4 className="text-lg font-semibold text-[#1f1235]">{card.name}</h4>
                            {card.rarity && (
                              <p className="text-xs font-medium text-[#7a678f]">
                                Rarity: <span className="uppercase tracking-[0.2em] text-[#2f1646]">{card.rarity}</span>
                              </p>
                            )}
                            <p className={`text-sm font-semibold ${trendColor(card.dayChangePercent)}`}>
                              {card.dayChangePercent > 0 ? '+' : ''}
                              {card.dayChangePercent}% diario
                            </p>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-white/70 bg-white p-4 text-sm text-[#5b456d] shadow-lg shadow-purple-500/10">
                          <div className="flex items-center justify-between text-[#1f1235]">
                            <span>Precio spot</span>
                            <span className="text-lg font-semibold">{formatCurrency(card.priceUsd)}</span>
                          </div>
                          <div className="mt-3 space-y-2 text-xs">
                            {card.sources.map((source) => (
                              <div key={`${card.id}-${source.market}`} className="flex items-center justify-between">
                                <span className="text-[#7a678f]">{source.market}</span>
                                <span className="font-semibold text-[#1f1235]">{formatCurrency(source.price)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </section>
  )
}

export default MarketPage
