"use client"

export function BackgroundGradient() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Bottom to Top Gradient */}
        <div 
          className="absolute inset-x-0 bottom-0 h-[70vh]" 
          style={{ 
            background: 'linear-gradient(to top, var(--primary) 0%, transparent 100%)',
            opacity: 0.15
          }} 
        />
        {/* Right to Left Gradient */}
        <div 
          className="absolute inset-y-0 right-0 w-[50vw]" 
          style={{ 
            background: 'linear-gradient(to left, var(--primary) 0%, transparent 100%)',
            opacity: 0.25
          }} 
        />

      </div>

  )
}
