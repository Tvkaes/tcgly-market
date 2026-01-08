interface LoadingSplashProps {
  isVisible: boolean
}

const LoadingSplash = ({ isVisible }: LoadingSplashProps) => {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#f5f0ff] to-[#efe8ff]">
      <div className="flex flex-col items-center gap-6">
        <div className="font-display text-3xl font-semibold tracking-tight text-[#2f1646]">
          TCGly
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-purple-400" style={{ animationDelay: '0ms' }} />
          <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-pink-400" style={{ animationDelay: '150ms' }} />
          <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-sm text-[#9c8dad]">Loading cards...</p>
      </div>
    </div>
  )
}

export default LoadingSplash
