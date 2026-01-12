import { useState, useEffect } from 'react'
import { ProjectUpdateData, ProjectUpdateResponse } from '@/types/project-updates'
import { fetchProjectUpdatesAction } from '@/app/actions/project-service'

export function useProjectUpdates(projectId: string | undefined) {
  const [data, setData] = useState<ProjectUpdateData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId) {
      setIsLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        const json = await fetchProjectUpdatesAction(projectId)
        
        if (json.status === 'success') {
          setData(json.data)
          setError(null)
        } else {
          // If server action returns { status: 'error', error: ... } or API failure structure
          throw new Error(json.error || 'API returned unsuccessful status')
        }
      } catch (err) {
        console.error('Error fetching project updates:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    // Initial fetch
    fetchData()

    // Poll every 5 seconds
    const intervalId = setInterval(fetchData, 5000)

    return () => clearInterval(intervalId)
  }, [projectId])

  return { data, isLoading, error }
}

