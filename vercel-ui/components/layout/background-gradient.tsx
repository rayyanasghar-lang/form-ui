"use client"

export function BackgroundGradient() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none"
      style={{
        background: 'linear-gradient(to top, rgba(255, 216, 95, 0.4) 0%, rgba(255, 216, 95, 0.2) 20%, rgba(255, 216, 95, 0.08) 40%, transparent 60%)',
        zIndex: -1
      }}
    />
  )
}
