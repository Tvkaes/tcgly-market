import { useRef } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import '@/App.css'
import AppFooter from '@/components/shared/AppFooter'
import HeaderBar, { type NavLink } from '@/components/shared/HeaderBar'
import GridBackground from '@/components/ui/GridBackground'
import useBackgroundVariant from '@/hooks/useBackgroundVariant'
import BoosterPage from '@/pages/BoosterPage'
import CardPage from '@/pages/CardPage.tsx'
import FavoritesPage from '@/pages/FavoritesPage'
import HomePage from '@/pages/HomePage'
import MarketPage from '@/pages/MarketPage.tsx'
import SetsPage from '@/pages/SetsPage'
import TopCardsPage from '@/pages/TopCardsPage'


const navLinks: NavLink[] = [
  { label: 'Sets', path: '/sets' },
  { label: 'Series', path: '/top-cards' },
  { label: 'Favorites', path: '/favorites' },
  { label: 'Market', path: '/market' },
]

function App() {
  const headerRef = useRef<HTMLElement>(null)
  const backgroundVariant = useBackgroundVariant()
  const location = useLocation()


  return (
    <>
      <GridBackground variant={backgroundVariant} />
      
      <div className="relative z-10 flex min-h-screen flex-col px-6 pb-12 pt-6 lg:px-16">
        <HeaderBar ref={headerRef} navLinks={navLinks} />

        <main className="mt-12 flex flex-1 flex-col items-center text-center">
          <div key={location.pathname} className="page-transition-wrapper">
            <Routes location={location}>
              <Route path="/" element={<HomePage headerRef={headerRef} />} />
              <Route path="/sets" element={<SetsPage />} />
              <Route path="/sets/:seriesId" element={<SetsPage />} />
              <Route path="/top-cards" element={<TopCardsPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/market" element={<MarketPage />} />
              <Route path="/set/:setId" element={<MarketPage />} />
              <Route path="/open/booster/:setId" element={<BoosterPage />} />
              <Route path="/card/:cardId" element={<CardPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>

        <AppFooter />
      </div>
    </>
  )
}

export default App
