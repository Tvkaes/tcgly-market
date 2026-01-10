import { createPortal } from 'react-dom'

interface LoadingSplashProps {
  isVisible: boolean
}

const LoadingSplash = ({ isVisible }: LoadingSplashProps) => {
  if (!isVisible || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[1000] overflow-hidden bg-[#050312]/95">
      <div className="absolute inset-0 bg-gradient-to-br from-[#050312] via-[#120a2a] to-[#1d0c3c] opacity-90" />
      <div className="pointer-events-none absolute -left-32 top-[-10%] h-96 w-96 rounded-full bg-[#ff4d6d]/30 blur-[160px]" />
      <div className="pointer-events-none absolute -right-24 bottom-[-10%] h-[420px] w-[420px] rounded-full bg-[#7f5af0]/30 blur-[180px]" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-8 px-4 text-center text-white">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.6em] text-white/50">Preparing dashboard</p>
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">TCGly</h1>
          <p className="mx-auto max-w-md text-sm text-white/70">
            Syncing sets, featured cards, and market metrics. This only takes a few seconds.
          </p>
        </div>

        <div className="relative flex flex-col items-center gap-5" role="status" aria-live="polite">
          <div className="relative h-20 w-20">
            <span className="absolute inset-0 animate-spin rounded-full border-2 border-white/20 border-t-transparent" />
            <span className="absolute inset-2 animate-[spin_1.8s_linear_infinite_reverse] rounded-full border-2 border-white/30 border-b-transparent" />
            <span className="absolute inset-4 rounded-full bg-gradient-to-br from-[#ff6b9d] to-[#7f5af0]/60 opacity-70 blur-xl" />
            <span className="absolute inset-4 rounded-full bg-[#120a2a] shadow-inner shadow-black/50" />
          </div>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <span className="h-2 w-2 rounded-full bg-white/40" />
            <span className="h-2 w-2 rounded-full bg-white/60 animate-pulse" />
            <span className="h-2 w-2 rounded-full bg-white/40" />
          </div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">Loading experience</p>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default LoadingSplash
