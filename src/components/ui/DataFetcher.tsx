'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LoadingSpinner, LoadingPage } from './LoadingSpinner'
import { ApiResponse } from '@/types'

interface DataFetcherProps<T> {
  queryKey: string[]
  queryFn: () => Promise<T>
  children: (data: T) => ReactNode
  loadingComponent?: ReactNode
  errorComponent?: (error: Error) => ReactNode
  enabled?: boolean
  staleTime?: number
}

export function DataFetcher<T>({
  queryKey,
  queryFn,
  children,
  loadingComponent,
  errorComponent,
  enabled = true,
  staleTime = 5 * 60 * 1000, // 5 minutes
}: DataFetcherProps<T>) {
  const {
    data,
    error,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey,
    queryFn,
    enabled,
    staleTime,
  })

  if (isLoading) {
    return loadingComponent || <LoadingPage />
  }

  if (isError) {
    if (errorComponent) {
      return errorComponent(error as Error)
    }

    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {error?.message || 'An error occurred while loading data'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return <LoadingPage message="No data found" />
  }

  return <>{children(data as T)}</>
}

// Specialized version for API responses
interface ApiDataFetcherProps<T> extends Omit<DataFetcherProps<ApiResponse<T>>, 'children'> {
  children: (data: T) => ReactNode
}

export function ApiDataFetcher<T>(props: ApiDataFetcherProps<T>) {
  return (
    <DataFetcher<ApiResponse<T>>
      {...props}
      children={(response) => {
        if (!response.success) {
          throw new Error(response.error || 'API request failed')
        }
        return props.children(response.data!)
      }}
    />
  )
}

// Hook version for programmatic data fetching
export function useDataFetcher<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey,
    queryFn,
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
  })
}
