import { forwardRef, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

export interface NavLink {
  label: string
  path: string
}

interface HeaderBarProps {
  navLinks: NavLink[]
}

interface MenuListProps {
  links: NavLink[]
  className?: string
  onSelect?: () => void
}

const MenuList = ({ links, className = '', onSelect }: MenuListProps) => {
  const classes = useMemo(
    () => ['flex flex-col gap-4 text-base font-medium text-[#2f1646] md:flex-row md:text-sm md:text-[#5b456d]', className].filter(Boolean).join(' '),
    [className],
  )

  return (
    <ul className={classes}>
      {links.map((linkItem) => (
        <li
          key={linkItem.path}
          className="cursor-pointer rounded-full px-3 py-1 transition hover:bg-white/70 hover:text-[#2f1646]"
        >
          <Link
            to={linkItem.path}
            className="block w-full rounded-full px-2 py-1"
            onClick={onSelect}
          >
            {linkItem.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

const HeaderBar = forwardRef<HTMLElement, HeaderBarProps>(({ navLinks }, ref) => {
  const [isMenuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header
        ref={ref}
        className="sticky top-4 z-30 flex items-center justify-between gap-4 rounded-[32px] border border-white/30 bg-white/20 px-6 py-4 shadow-2xl shadow-purple-500/10 backdrop-blur-xl"
      >
        <div className="flex flex-1 items-center gap-4">
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/30 bg-white/40 text-[#2f1646] shadow-sm transition hover:bg-white/70 md:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <Link to="/" className="font-display text-2xl font-semibold tracking-tight text-[#2f1646]">
            TCGly<span className="text-[#ff4d6d]">.Market</span>
          </Link>
        </div>

        <nav className="hidden flex-1 justify-center md:flex">
          <MenuList links={navLinks} className="items-center gap-4 md:gap-6" />
        </nav>

        <div className="hidden flex-col gap-4 md:flex md:flex-row md:items-center">
          <label className="flex items-center gap-3 rounded-full border border-white/30 bg-white/20 px-4 py-2 text-sm text-[#5b456d] shadow-lg shadow-purple-500/5 backdrop-blur-md">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#2f1646]">
              <path
                d="M21 21l-4.35-4.35M3 10.5a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <input
              className="w-full border-none bg-transparent text-sm font-medium text-[#2f1646] outline-none placeholder:text-[#9c8dad]"
              placeholder="Search Pokémon cards, sets or values..."
            />
          </label>
          <button className="rounded-full border border-white/30 bg-white/20 px-6 py-2 text-sm font-semibold text-[#2f1646] shadow-lg shadow-purple-500/5 backdrop-blur-md transition hover:bg-white/40 hover:shadow-purple-500/20">
            Sign in
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${isMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={() => setMenuOpen(false)}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col gap-8 border-r border-white/20 bg-gradient-to-b from-white/80 to-white/60 p-6 text-[#2f1646] shadow-2xl shadow-purple-500/20 backdrop-blur-xl transition-transform duration-300 md:hidden ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <Link to="/" className="font-display text-2xl font-semibold tracking-tight">
            TCGly<span className="text-[#ff4d6d]">.Market</span>
          </Link>
          <button
            className="rounded-2xl border border-white/30 bg-white/50 p-2 text-[#2f1646]"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <MenuList links={navLinks} onSelect={() => setMenuOpen(false)} />

        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-3 rounded-2xl border border-white/30 bg-white/40 px-4 py-2 text-sm text-[#2f1646] shadow-lg shadow-purple-500/10 backdrop-blur-md">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#2f1646]">
              <path
                d="M21 21l-4.35-4.35M3 10.5a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <input
              className="w-full border-none bg-transparent text-sm font-medium text-[#2f1646] outline-none placeholder:text-[#9c8dad]"
              placeholder="Search Pokémon cards, sets or values..."
            />
          </label>
          <button className="rounded-full border border-white/30 bg-white/70 px-6 py-2 text-sm font-semibold text-[#2f1646] shadow-lg shadow-purple-500/10 backdrop-blur-md transition hover:bg-white">
            Sign in
          </button>
        </div>
      </aside>
    </>
  )
})

HeaderBar.displayName = 'HeaderBar'

export default HeaderBar
