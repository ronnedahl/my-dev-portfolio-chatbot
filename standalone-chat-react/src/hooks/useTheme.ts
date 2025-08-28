/**
 * Theme management hook
 * @author Peter Boden
 * @version 1.0
 */

import React from 'react'
import type { ThemeMode } from '../types'

interface UseThemeReturn {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
}

const THEME_STORAGE_KEY = 'peterbot-theme'

export const useTheme = (): UseThemeReturn => {
  const [theme, setThemeState] = React.useState<ThemeMode>(() => {
    // Get theme from localStorage or default to system
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        return stored
      }
    }
    return 'system'
  })

  // Get the effective theme (resolving 'system' to actual theme)
  const getEffectiveTheme = React.useCallback((themeMode: ThemeMode): 'light' | 'dark' => {
    if (themeMode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return themeMode
  }, [])

  // Apply theme to document
  const applyTheme = React.useCallback((themeMode: ThemeMode) => {
    const effectiveTheme = getEffectiveTheme(themeMode)
    const root = document.documentElement
    
    if (effectiveTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [getEffectiveTheme])

  // Set theme and persist to localStorage
  const setTheme = React.useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme)
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    applyTheme(newTheme)
  }, [applyTheme])

  // Toggle between light and dark (skipping system)
  const toggleTheme = React.useCallback(() => {
    const effectiveTheme = getEffectiveTheme(theme)
    setTheme(effectiveTheme === 'dark' ? 'light' : 'dark')
  }, [theme, getEffectiveTheme, setTheme])

  // Listen for system theme changes
  React.useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = () => {
        applyTheme('system')
      }
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme, applyTheme])

  // Apply theme on mount and theme changes
  React.useEffect(() => {
    applyTheme(theme)
  }, [theme, applyTheme])

  return {
    theme,
    setTheme,
    toggleTheme,
  }
}