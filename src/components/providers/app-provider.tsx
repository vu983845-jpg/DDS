'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { Language, Dictionary, dictionaries } from '@/lib/i18n'

type DateRangeType = 'Yesterday' | 'Today' | '7days' | '30days' | '60days' | '90days' | 'Custom'

interface AppContextType {
    isTvMode: boolean
    toggleTvMode: () => void
    dateRange: DateRangeType
    setDateRange: (range: DateRangeType) => void
    lang: Language
    setLang: (lang: Language) => void
    t: Dictionary
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
    const [isTvMode, setIsTvMode] = useState(false)
    const [dateRange, setDateRange] = useState<DateRangeType>('7days')

    // On mount, check if there's a saved DateRange
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedRange = localStorage.getItem('dds_dateRange') as DateRangeType
            if (savedRange) {
                setDateRange(savedRange)
            }
        }
    }, [])

    // Update DateRange and persist to local storage
    const handleSetDateRange = (range: DateRangeType) => {
        setDateRange(range)
        if (typeof window !== 'undefined') {
            localStorage.setItem('dds_dateRange', range)
        }
    }

    // Default language is Vietnamese
    const [lang, setLang] = useState<Language>('vi')
    const [t, setT] = useState<Dictionary>(dictionaries.vi)

    useEffect(() => {
        setT(dictionaries[lang])
    }, [lang])

    const toggleTvMode = () => setIsTvMode((prev) => !prev)

    return (
        <AppContext.Provider
            value={{
                isTvMode,
                toggleTvMode,
                dateRange,
                setDateRange: handleSetDateRange,
                lang,
                setLang,
                t
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
