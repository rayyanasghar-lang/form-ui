import { useState, useEffect } from 'react'
import { Project } from '@/types/project'
import { fetchProjectsAction } from '@/app/actions/project-service'

export function useProjectsList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const result = await fetchProjectsAction()
        
        if ('error' in result) {
            // Only set error if we don't have data yet, to avoid flashing error on intermittent failures
            if (projects.length === 0) {
                setError(result.error)
            }
        } else {
          setProjects(result.data)
          setError(null)
        }
      } catch (err) {
        console.error('Error fetching projects:', err)
        if (projects.length === 0) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        }
      } finally {
        // Only set loading to false after first fetch
        if (isLoading) {
            setIsLoading(false)
        }
      }
    }

    // Initial fetch
    fetchProjects()

    // Poll every 5 seconds
    const intervalId = setInterval(fetchProjects, 5000)

    return () => clearInterval(intervalId)
  }, []) // Empty dependency array as we want this to run once on mount

  return { projects, isLoading, error }
}
