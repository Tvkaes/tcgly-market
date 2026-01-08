import { useRef } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import GridBackground from './components/ui/GridBackground'
import HeaderBar, { type NavLink } from './components/shared/HeaderBar'
import './App.css'
import HomePage from './pages/HomePage'
import SetsPage from './pages/SetsPage'
import PricesPage from './pages/PricesPage'
import FavoritesPage from './pages/FavoritesPage'
import MarketTrendsPage from './pages/MarketTrendsPage'
import MarketPage from './pages/MarketPage.tsx'
import CardPage from './pages/CardPage.tsx'

const navLinks: NavLink[] = [
  { label: 'Sets', path: '/sets' },
  { label: 'Prices', path: '/prices' },
  { label: 'Favorites', path: '/favorites' },
  { label: 'Market Trends', path: '/market-trends' },
  { label: 'Market', path: '/market' },
]

function App() {
  const headerRef = useRef<HTMLElement>(null)
  const location = useLocation()

  return (
    <>
      <GridBackground />
      
      <div className="relative z-10 flex min-h-screen flex-col px-6 pb-12 pt-6 lg:px-16">
        <HeaderBar ref={headerRef} navLinks={navLinks} />

        <main className="mt-12 flex flex-1 flex-col items-center text-center">
          <div key={location.pathname} className="page-transition-wrapper">
            <Routes location={location}>
              <Route path="/" element={<HomePage headerRef={headerRef} />} />
              <Route path="/sets" element={<SetsPage />} />
              <Route path="/prices" element={<PricesPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/market-trends" element={<MarketTrendsPage />} />
              <Route path="/market" element={<MarketPage />} />
              <Route path="/market/:setId" element={<MarketPage />} />
              <Route path="/card/:cardId" element={<CardPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>

        {/* Footer with legal disclaimer */}
        <footer className="mt-auto py-8 text-center">
          <div className="mx-auto mt-4 max-w-3xl px-4">
            
            <p className="text-xs leading-relaxed text-[#9c8dad]">
              TCGly is an independent project and is not affiliated with, endorsed, sponsored, or approved by Nintendo, Game Freak, or The Pokémon Company.
              Pokémon and Pokémon character names are trademarks of Nintendo.
            </p>
            <p className="mt-2 text-xs text-[#b6a3cc]">© 2025 TCGly. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  )
}

export default App
