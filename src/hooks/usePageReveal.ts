import { useEffect, useRef, type RefObject } from 'react'
import { animate } from 'animejs'

export const usePageReveal = (
  isInitialLoading: boolean,
  headerRef: RefObject<HTMLElement | null>,
  heroRef: RefObject<HTMLDivElement | null>,
) => {
  const hasPlayedEntryAnimation = useRef(false)

  useEffect(() => {
    if (isInitialLoading || hasPlayedEntryAnimation.current) return

    hasPlayedEntryAnimation.current = true

    if (headerRef.current) {
      animate(headerRef.current, {
        opacity: [0, 1],
        translateY: [-30, 0],
        duration: 600,
        ease: 'outQuart',
      })
    }

    if (heroRef.current) {
      animate(heroRef.current, {
        opacity: [0, 1],
        translateY: [40, 0],
        duration: 700,
        delay: 150,
        ease: 'outQuart',
      })
    }
  }, [heroRef, headerRef, isInitialLoading])

  return { showSplash: isInitialLoading }
}
