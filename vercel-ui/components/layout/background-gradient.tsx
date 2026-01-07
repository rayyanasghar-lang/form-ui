"use client"

export function BackgroundGradient() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none"
      style={{
        background: 'linear-gradient(to top, rgba(255, 215, 0, 0.08) 0%, rgba(255, 215, 0, 0.04) 20%, rgba(255, 215, 0, 0.01) 40%, transparent 60%)',
        zIndex: -1
      }}
    />
  )
}
