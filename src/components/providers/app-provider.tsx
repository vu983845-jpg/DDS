'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { Language, Dictionary, dictionaries } from '@/lib/i18n'

type DateRangeType = 'Yesterday' | 'Today' | '24h' | '7days' | 'Custom'
type ModeType = 'DDS' | 'Standard'

interface AppContextType {
    isTvMode: boolean
    toggleTvMode: () => void
    dateRange: DateRangeType
    setDateRange: (range: DateRangeType) => void
    mode: ModeType
    setMode: (mode: ModeType) => void
    lang: Language
    setLang: (lang: Language) => void
    t: Dictionary
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
    const [isTvMode, setIsTvMode] = useState(false)
    const [dateRange, setDateRange] = useState<DateRangeType>('Yesterday')
    const [mode, setMode] = useState<ModeType>('DDS')

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
                setDateRange,
                mode,
                setMode,
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
