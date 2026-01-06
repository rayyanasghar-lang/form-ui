"use client"

export function BackgroundGradient() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none"
      style={{
        background: 'linear-gradient(to top, rgba(83, 103, 233, 0.05) 0%, rgba(83, 103, 233, 0.03) 20%, rgba(83, 103, 233, 0.01) 40%, transparent 60%)',
        zIndex: -1
      }}
    />
  )
}
