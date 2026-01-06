"use client"

export function BackgroundGradient() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none"
      style={{
        background: 'linear-gradient(to top, oklch(0.63 0.22 270 / 0.15) 0%, oklch(0.63 0.22 270 / 0.08) 20%, oklch(0.63 0.22 270 / 0.03) 40%, transparent 60%)',
        zIndex: -1
      }}
    />
  )
}
