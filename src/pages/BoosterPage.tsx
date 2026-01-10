import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const BoosterPage = () => {
  const navigate = useNavigate()
  const { setId } = useParams<{ setId: string }>()

  const title = useMemo(() => {
    if (!setId) return 'Booster Pack'
    return `Booster Pack – ${setId.toUpperCase()}`
  }, [setId])

  return (
    <section className="flex w-full max-w-3xl flex-col gap-8 rounded-3xl border border-white/20 bg-white/80 px-8 py-12 text-left text-[#1f1230] shadow-2xl shadow-purple-500/20">
      <header>
        <p className="text-sm uppercase tracking-[0.35em] text-[#a38cc5]">Pack opening</p>
        <h1 className="mt-2 text-4xl font-black leading-tight text-[#2f1646]">{title}</h1>
        <p className="mt-3 text-base text-[#6b567f]">
          This page is a placeholder for the booster-opening experience. Hook your booster-opening flow here to let collectors rip packs,
          inspect contents, and send cards to their binder.
        </p>
      </header>

      <div className="rounded-2xl border border-dashed border-[#c9b6df] bg-[#f8f4ff] p-6 text-center text-[#705084]">
        <p className="text-lg font-semibold">No booster simulation yet</p>
        <p className="mt-2 text-sm text-[#8d789f]">
          When the backend is ready, fetch booster data for <span className="font-bold text-[#5a2f91]">{setId ?? 'your set'}</span> and render the cards here.
        </p>
      </div>

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="self-start rounded-full border border-[#c9b6df] bg-white/80 px-6 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#5a2f91] transition hover:-translate-y-0.5 hover:border-[#a27ec8] hover:bg-white"
      >
        Back
      </button>
    </section>
  )
}

export default BoosterPage
