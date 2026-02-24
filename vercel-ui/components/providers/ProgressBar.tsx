"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import nprogress from "nprogress"
import "nprogress/nprogress.css"

export default function ProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    nprogress.configure({ showSpinner: false })
  }, [])

  useEffect(() => {
    nprogress.done()
  }, [pathname, searchParams])

  return null
}
