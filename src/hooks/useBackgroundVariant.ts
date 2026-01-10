import { useLocation } from 'react-router-dom'

export type BackgroundVariant = 'hero' | 'pages'

const useBackgroundVariant = (): BackgroundVariant => {
  const { pathname } = useLocation()
  const useHeroBackground = pathname === '/' || pathname.startsWith('/open/booster')

  return useHeroBackground ? 'hero' : 'pages'
}

export default useBackgroundVariant
