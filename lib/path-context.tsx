'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type PathType = 'azure-ai-search' | 'foundry-agent-service' | null

interface PathContextType {
  selectedPath: PathType
  setSelectedPath: (path: PathType) => void
}

const PathContext = createContext<PathContextType | undefined>(undefined)

interface PathProviderProps {
  children: ReactNode
}

export function PathProvider({ children }: PathProviderProps) {
  const [selectedPath, setSelectedPathState] = useState<PathType>(null)

  // Load path from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('selectedPath')
      if (saved === 'azure-ai-search' || saved === 'foundry-agent-service') {
        setSelectedPathState(saved)
      }
    } catch (error) {
      console.warn('Failed to load path from sessionStorage:', error)
    }
  }, [])

  const setSelectedPath = (path: PathType) => {
    setSelectedPathState(path)
    try {
      if (path) {
        sessionStorage.setItem('selectedPath', path)
      } else {
        sessionStorage.removeItem('selectedPath')
      }
    } catch (error) {
      console.warn('Failed to save path to sessionStorage:', error)
    }
  }

  return (
    <PathContext.Provider value={{ selectedPath, setSelectedPath }}>
      {children}
    </PathContext.Provider>
  )
}

export function usePath() {
  const context = useContext(PathContext)
  if (context === undefined) {
    throw new Error('usePath must be used within a PathProvider')
  }
  return context
}