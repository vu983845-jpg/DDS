'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

type DateRangeType = 'Yesterday' | 'Today' | 'Custom'
type ModeType = 'DDS' | 'Standard'

interface AppContextType {
    isTvMode: boolean
    toggleTvMode: () => void
    dateRange: DateRangeType
    setDateRange: (range: DateRangeType) => void
    mode: ModeType
    setMode: (mode: ModeType) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
    const [isTvMode, setIsTvMode] = useState(false)
    const [dateRange, setDateRange] = useState<DateRangeType>('Yesterday')
    const [mode, setMode] = useState<ModeType>('DDS')

    const toggleTvMode = () => setIsTvMode((prev) => !prev)

    return (
        <AppContext.Provider
            value={{
                isTvMode,
                toggleTvMode,
                dateRange,
                setDateRange,
                mode,
                setMode,
            }}
        >
            {children}
        </AppContext.Provider>
    )
}

export function useAppContext() {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider')
    }
    return context
}
