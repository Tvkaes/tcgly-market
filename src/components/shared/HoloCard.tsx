import type { CSSProperties, HTMLAttributes } from 'react'

interface HoloCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  image?: string
  alt: string
  isHolo?: boolean
  wrapperClassName?: string
  imageWrapperClassName?: string
  wrapperStyle?: CSSProperties
  fallbackLabel?: string
}

const HoloCard = ({
  image,
  alt,
  isHolo = true,
  wrapperClassName = '',
  imageWrapperClassName = '',
  wrapperStyle,
  fallbackLabel = 'No image',
  className,
  ...wrapperProps
}: HoloCardProps) => {
  const wrapperClasses = [
    'card-item shadow-2xl shadow-[#d5c3ff]/60',
    isHolo ? 'holo' : '',
    wrapperClassName,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const imageClasses = [
    'card-image-wrapper h-full w-full overflow-hidden rounded-2xl bg-gradient-to-br from-transparent to-[#f5d8ff]',
    imageWrapperClassName,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={wrapperClasses} style={wrapperStyle} {...wrapperProps}>
      <div className={imageClasses}>
        {image ? (
          <img src={image} alt={alt} loading="lazy" className="h-full w-full " />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-[#b6a3cc]">{fallbackLabel}</div>
        )}
      </div>
    </div>
  )
}

export default HoloCard
