import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCardMarketSnapshot } from '@/hooks/useCardMarketSnapshot'
import CardPriceTrendChart from '@/components/shared/CardPriceTrendChart'
import HoloCard from '@/components/shared/HoloCard'
import { getTypeColor } from '@/constants/pokemonTypes'

const formatCurrency = (value: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value)

const trendColor = (value: number) => (value >= 0 ? 'text-[#0f9d58]' : 'text-[#d93025]')

const CardPage = () => {
  const { cardId } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, isError, error, refetch } = useCardMarketSnapshot(cardId)

  const isPokemon = data?.card.category === 'Pokemon'
  const isTrainer = data?.card.category === 'Trainer'
  const isEnergy = data?.card.category === 'Energy'
  const currentPrice = data?.priceTrend.at(-1)?.price ?? 0

  const quickStats = useMemo(() => {
    if (!data) return []
    const items: Array<{ label: string; value: string }> = []
    if (data.card.category) items.push({ label: 'Category', value: data.card.category })
    if (data.card.rarity) items.push({ label: 'Rarity', value: data.card.rarity })
    if (data.card.hp) items.push({ label: 'HP', value: data.card.hp })
    if (data.card.types?.length) items.push({ label: 'Type', value: data.card.types.join(' · ') })
    if (data.card.stage) items.push({ label: 'Stage', value: data.card.stage })
    if (data.card.evolveFrom) items.push({ label: 'Evolves from', value: data.card.evolveFrom })
    if (data.card.retreat !== undefined) items.push({ label: 'Retreat', value: String(data.card.retreat) })
    if (data.card.regulationMark) items.push({ label: 'Regulation', value: data.card.regulationMark })
    if (isTrainer && data.card.trainerType) items.push({ label: 'Trainer type', value: data.card.trainerType })
    if (isEnergy && data.card.energyType) items.push({ label: 'Energy type', value: data.card.energyType })
    return items
  }, [data, isTrainer, isEnergy])

  const buildTypeBadgeStyle = (type?: string) => {
    const color = getTypeColor(type)
    return {
      background: `linear-gradient(135deg, ${color.gradientFrom}, ${color.gradientTo})`,
      borderColor: `${color.base}66`,
      color: color.text ?? '#fff',
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-4 text-left text-[#1f1235] sm:px-6 lg:px-10">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[#a27ec8]">Card Intelligence</p>
          <h1 className="font-display text-3xl font-semibold md:text-4xl">
            {data?.card.name ?? 'Card details'}
          </h1>
          <p className="text-sm text-[#7a678f]">ID: {cardId}</p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <button
            onClick={() => refetch()}
            className="rounded-full border border-white/30 bg-white/70 px-4 py-2 font-semibold text-[#2f1646] shadow-sm shadow-purple-500/10 transition hover:-translate-y-0.5 hover:bg-white"
          >
            Refresh
          </button>
          <button
            onClick={() => navigate(-1)}
            className="rounded-full border border-transparent bg-[#ff4d6d] px-4 py-2 font-semibold text-white shadow-lg shadow-[#ff4d6d]/50 transition hover:-translate-y-0.5 hover:bg-[#ff3b5a]"
          >
            Go back
          </button>
        </div>
      </div>

      {!cardId && (
        <div className="rounded-3xl border border-dashed border-white/40 bg-white/40 px-8 py-10 text-center text-[#5b456d] shadow-inner shadow-purple-500/5">
          <p className="text-lg">Select a card from the market dashboard to analyze it here.</p>
          <Link
            to="/market"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-[#ff4d6d] px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-[#ff4d6d]/40 transition hover:-translate-y-0.5"
          >
            Go to Market
          </Link>
        </div>
      )}

      {cardId && (
        <>
          {isLoading && (
            <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
              <div className="h-[500px] animate-pulse rounded-3xl bg-white/60" />
              <div className="space-y-4">
                <div className="h-10 w-2/3 rounded-full bg-white/60" />
                <div className="h-6 w-1/3 rounded-full bg-white/60" />
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-20 rounded-2xl bg-white/60" />
                  ))}
                </div>
              </div>
            </div>
          )}

          {isError && (
            <div className="rounded-3xl border border-red-200 bg-red-50/80 px-8 py-10 text-center text-red-600 shadow-inner shadow-red-500/20">
              <p>{error?.message ?? 'We couldn’t load this card data.'}</p>
              <button
                onClick={() => refetch()}
                className="mt-4 rounded-full bg-red-500/90 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-red-500"
              >
                Try again
              </button>
            </div>
          )}

          {data && (
            <div className="grid gap-8 lg:grid-cols-[420px_minmax(0,1fr)]">
              {/* Left column: Card image */}
              <div className="sticky top-6 self-start space-y-4">
                <div className="relative overflow-hidden rounded-[28px] border border-white/40 bg-gradient-to-br from-[#fefaff] via-[#f5eaff] to-[#e9ddff] p-6 shadow-2xl shadow-purple-500/20 backdrop-blur-xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(127,90,240,0.15),_transparent_60%)]" aria-hidden />
                  <div className="relative flex flex-col items-center gap-5">
                    <div className="w-[240px]">
                      <HoloCard
                        image={data.card.image}
                        alt={data.card.name}
                        isHolo={data.card.rarity?.toLowerCase() !== 'common'}
                        wrapperClassName="aspect-[63/88]"
                        fallbackLabel="No image available"
                      />
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 text-xs">
                      {data.card.setName && (
                        <span className="rounded-full border border-white/50 bg-white/80 px-3 py-1 font-medium text-[#2f1646] shadow-sm">
                          {data.card.setName}
                        </span>
                      )}
                      {data.card.illustrator && (
                        <span className="rounded-full border border-white/50 bg-white/80 px-3 py-1 text-[#7a678f] shadow-sm">
                          Illustrator: {data.card.illustrator}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price box */}
                <div className="rounded-2xl border border-white/40 bg-white/90 p-5 shadow-lg shadow-purple-500/10 backdrop-blur-lg">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#a27ec8]">Current price</p>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-3xl font-bold text-[#1f1235]">{formatCurrency(currentPrice)}</span>
                    {data.card.setId && (
                      <Link to={`/market/${data.card.setId}`} className="text-sm font-semibold text-[#7f5af0] hover:underline">
                        View full set
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Right column: Details */}
              <div className="card-details-scroll space-y-6 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto lg:pr-3">
                {/* Quick stats grid */}
                <div className="rounded-[24px] border border-white/30 bg-white/85 p-6 shadow-xl shadow-purple-500/10 backdrop-blur-lg">
                  <h2 className="mb-4 text-xs uppercase tracking-[0.4em] text-[#a27ec8]">Highlights</h2>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {quickStats.map((stat) => (
                      <div key={stat.label} className="rounded-xl border border-white/50 bg-white/70 p-4 shadow-inner shadow-purple-500/5">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-[#a27ec8]">{stat.label}</p>
                        <p className="mt-1 text-base font-semibold text-[#1f1235]">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                  {data.card.description && (
                    <p className="mt-5 rounded-xl border border-white/40 bg-white/60 p-4 text-sm leading-relaxed text-[#5b456d]">
                      {data.card.description}
                    </p>
                  )}
                </div>

                {(isTrainer && (data.card.trainerType || data.card.effect)) && (
                  <div className="rounded-[24px] border border-white/30 bg-white/85 p-6 shadow-xl shadow-purple-500/10 backdrop-blur-lg">
                    <h2 className="mb-4 text-xs uppercase tracking-[0.4em] text-[#a27ec8]">Trainer details</h2>
                    {data.card.trainerType && (
                      <p className="mb-3 text-sm font-semibold text-[#1f1235]">Type: {data.card.trainerType}</p>
                    )}
                    {data.card.effect && (
                      <p className="text-sm leading-relaxed text-[#5b456d]">{data.card.effect}</p>
                    )}
                  </div>
                )}

                {(isEnergy && (data.card.energyType || data.card.effect)) && (
                  <div className="rounded-[24px] border border-white/30 bg-white/85 p-6 shadow-xl shadow-purple-500/10 backdrop-blur-lg">
                    <h2 className="mb-4 text-xs uppercase tracking-[0.4em] text-[#a27ec8]">Energy details</h2>
                    {data.card.energyType && (
                      <p className="mb-3 text-sm font-semibold text-[#1f1235]">Energy type: {data.card.energyType}</p>
                    )}
                    {data.card.effect && (
                      <p className="text-sm leading-relaxed text-[#5b456d]">{data.card.effect}</p>
                    )}
                  </div>
                )}

                {/* Attacks section (only for Pokémon) */}
                {isPokemon && data.card.attacks && data.card.attacks.length > 0 && (
                  <div className="rounded-[24px] border border-white/30 bg-white/85 p-6 shadow-xl shadow-purple-500/10 backdrop-blur-lg">
                    <h2 className="mb-4 text-xs uppercase tracking-[0.4em] text-[#a27ec8]">Attacks</h2>
                    <div className="space-y-4">
                      {data.card.attacks.map((attack, idx) => (
                        <div key={`${attack.name}-${idx}`} className="rounded-xl border border-white/50 bg-white/70 p-4 shadow-inner shadow-purple-500/5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {attack.cost && attack.cost.length > 0 && (
                                <div className="flex gap-1">
                                  {attack.cost.map((c, i) => (
                                    <span
                                      key={`${c}-${i}`}
                                      className="flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold shadow"
                                      style={buildTypeBadgeStyle(c)}
                                    >
                                      {c.slice(0, 1)}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <span className="font-semibold text-[#1f1235]">{attack.name}</span>
                            </div>
                            {attack.damage && (
                              <span className="text-lg font-bold text-[#ff4d6d]">{attack.damage}</span>
                            )}
                          </div>
                          {attack.effect && (
                            <p className="mt-2 text-sm text-[#5b456d]">{attack.effect}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weaknesses section */}
                {isPokemon && data.card.weaknesses && data.card.weaknesses.length > 0 && (
                  <div className="rounded-[24px] border border-white/30 bg-white/85 p-6 shadow-xl shadow-purple-500/10 backdrop-blur-lg">
                    <h2 className="mb-4 text-xs uppercase tracking-[0.4em] text-[#a27ec8]">Weaknesses</h2>
                    <div className="flex flex-wrap gap-3">
                      {data.card.weaknesses.map((w, idx) => (
                        <div
                          key={`${w.type}-${idx}`}
                          className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm"
                          style={buildTypeBadgeStyle(w.type)}
                        >
                          <span>{w.type}</span>
                          {w.value && <span className="opacity-80">{w.value}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price trend chart */}
                <div className="rounded-[24px] border border-white/30 bg-white/90 p-6 shadow-lg shadow-purple-500/10 backdrop-blur-lg">
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-[#a27ec8]">History</p>
                      <h3 className="font-display text-xl text-[#1f1235]">Price behavior</h3>
                    </div>
                    <span className="text-xs font-semibold text-[#7a678f]">Last 8 snapshots</span>
                  </div>
                  <CardPriceTrendChart data={data.priceTrend} />
                </div>

                {/* Market comparison */}
                <div className="rounded-[24px] border border-white/30 bg-white/90 p-6 shadow-lg shadow-purple-500/10 backdrop-blur-lg">
                  <p className="text-xs uppercase tracking-[0.4em] text-[#a27ec8]">Comparison</p>
                  <h3 className="font-display text-xl text-[#1f1235]">Market prices</h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {data.priceComparisons.map((market) => (
                      <div key={`card-market-${market.market}`} className="rounded-xl border border-white/50 bg-white/70 p-4 shadow-inner shadow-purple-500/5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#1f1235]">{market.market}</span>
                          <span className={`text-xs font-semibold ${trendColor(market.changePercent)}`}>
                            {market.changePercent > 0 ? '+' : ''}
                            {market.changePercent}%
                          </span>
                        </div>
                        <p className="mt-1 text-lg font-bold text-[#2f1646]">{formatCurrency(market.avgPrice)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default CardPage
