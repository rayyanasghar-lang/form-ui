"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      // Check for token in cookies (client-side)
      const hasToken = document.cookie.split(';').some((item) => item.trim().startsWith('auth_token='))
      
      if (!hasToken) {
        router.push("/")
      } else {
        setIsAuthorized(true)
      }
    }

    checkAuth()
  }, [router])

  if (!isAuthorized) {
    return null // Or a loading spinner
  }

  return <>{children}</>
}
