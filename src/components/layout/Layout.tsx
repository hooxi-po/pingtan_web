'use client'

import { ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'
import Header from './Header'
import Footer from './Footer'
import { LocaleProvider, useLocale } from '../providers/LocaleProvider'

interface LayoutContentProps {
  children: ReactNode
}

function LayoutContent({ children }: LayoutContentProps) {
  const { locale, setLocale } = useLocale()

  return (
    <div className="min-h-screen flex flex-col">
      <Header locale={locale} setLocale={setLocale} />
      <main className="flex-1">
        {children}
      </main>
      <Footer locale={locale} />
    </div>
  )
}

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <SessionProvider>
      <LocaleProvider>
        <LayoutContent>{children}</LayoutContent>
      </LocaleProvider>
    </SessionProvider>
  )
}