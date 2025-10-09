"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"

const navigation = [
  { name: "首页", href: "/" },
  { name: "景点", href: "/attractions" },
  { name: "住宿", href: "/accommodations" },
  { name: "美食", href: "/food" },
  { name: "攻略", href: "/guides" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggedIn] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ocean text-sand font-bold text-lg">
              平潭
            </div>
            <span className="hidden font-bold text-xl sm:inline-block text-foreground">平潭旅游</span>
          </Link>

          <div className="hidden md:flex md:gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-ocean",
                  pathname === item.href ? "text-ocean" : "text-muted-foreground",
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* 右侧用头像图标作为个人中心入口（取代登录/注册） */}
          <Link href="/profile" aria-label="个人中心" className="hidden md:inline-flex">
            <div className="h-8 w-8 overflow-hidden rounded-full ring-1 ring-border">
              <Image src="/placeholder-user.jpg" alt="个人中心" width={32} height={32} />
            </div>
          </Link>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium transition-colors",
                  pathname === item.href ? "bg-ocean/10 text-ocean" : "text-muted-foreground hover:bg-muted",
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 space-y-2">
              <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full bg-transparent gap-2">
                  <div className="h-5 w-5 overflow-hidden rounded-full">
                    <Image src="/placeholder-user.jpg" alt="个人中心" width={20} height={20} />
                  </div>
                  个人中心
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
