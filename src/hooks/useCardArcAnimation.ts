import { useEffect, useMemo, useRef } from 'react'
import { animate } from 'animejs'
import type { Card } from './useFeaturedCards'

export interface ArcPreset {
  rotate: number
  lift: number
  shift: number
  depth: number
}

export function useCardArcAnimation(cards: Card[], isInitialLoading: boolean, presetArc: ArcPreset[]) {
  const cardsContainerRef = useRef<HTMLDivElement>(null)
  const visibleIndices = useMemo(() => {
    const limit = Math.min(cards.length, presetArc.length)
    return Array.from({ length: limit }, (_, index) => index)
  }, [cards, presetArc])

  useEffect(() => {
    if (isInitialLoading || cards.length === 0 || !cardsContainerRef.current) return

    const cardElements = cardsContainerRef.current.querySelectorAll('.card-item')

    cardElements.forEach((card, index) => {
      const arcPos = presetArc[index]
      if (!arcPos) return

      animate(card, {
        opacity: [0, 1],
        translateX: [0, arcPos.shift],
        translateY: [50, arcPos.lift],
        rotate: [0, arcPos.rotate],
        scale: [0.8, 1],
        duration: 700,
        delay: index * 80,
        ease: 'outBack(1.2)',
      })
    })
  }, [cards, isInitialLoading, presetArc])

  return { cardsContainerRef, visibleIndices }
}
