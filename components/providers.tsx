"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { Language } from "@/lib/i18n"
import { t, type DictKey } from "@/lib/i18n"
import { Toaster } from "sonner"

type LanguageContextType = {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: DictKey) => string
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "th",
  setLang: () => {},
  t: (key) => key,
})

export function useLanguage() {
  return useContext(LanguageContext)
}

export function Providers({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("th")

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang)
  }, [])

  const translate = useCallback(
    (key: DictKey) => t(key, lang),
    [lang]
  )

  return (
    <LanguageContext value={{ lang, setLang, t: translate }}>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#FAFAF7",
            border: "1px solid #DDD8D1",
            color: "#1A1A1A",
          },
        }}
      />
    </LanguageContext>
  )
}
