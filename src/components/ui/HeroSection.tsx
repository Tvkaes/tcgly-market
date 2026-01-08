import { forwardRef } from 'react'

interface HeroSectionProps {
  onRefetch: () => void
  disabled: boolean
}

const HeroSection = forwardRef<HTMLDivElement, HeroSectionProps>(({ onRefetch, disabled }, ref) => (
  <div ref={ref} style={{ opacity: 0 }} className="max-w-4xl">
    <p className="text-sm uppercase tracking-[0.3em] text-[#a27ec8]">Pokémon TCG Prices & Market Insights</p>
    <h1 className="mt-6 font-display text-4xl font-semibold text-[#1f1235] sm:text-5xl lg:text-6xl">
      Track Pokémon Card Prices &amp; Trade Smarter
    </h1>
    <p className="mt-6 text-lg text-[#5b456d] sm:text-xl">
      Check real-time Pokémon TCG prices, compare market values, and make smarter trading decisions.
      Data refreshed hourly across global marketplaces.
    </p>
    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
      <button
        onClick={onRefetch}
        disabled={disabled}
        className="rounded-full bg-gradient-to-r from-[#ff6b9d] to-[#a855f7] px-8 py-3 text-base font-semibold tracking-tight text-white shadow-2xl shadow-purple-500/40 transition hover:-translate-y-1 hover:shadow-purple-500/60 disabled:cursor-not-allowed disabled:opacity-70"
      >
        Check Card Prices
      </button>
      <button className="rounded-full border border-white/30 bg-white/20 px-6 py-3 text-sm font-semibold text-[#2f1646] shadow-lg shadow-purple-500/10 backdrop-blur-md transition hover:bg-white/40">
        Market Trends
      </button>
    </div>
  </div>
))

HeroSection.displayName = 'HeroSection'

export default HeroSection
