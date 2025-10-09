import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container mx-auto px-4 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ocean text-sand font-bold text-lg">
                平潭
              </div>
              <span className="font-bold text-lg text-foreground">平潭旅游</span>
            </div>
            <p className="text-sm text-muted-foreground text-pretty">探索平潭岛的美丽风光，体验独特的海岛文化</p>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-foreground">探索</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/attractions" className="text-muted-foreground hover:text-ocean transition-colors">
                  热门景点
                </Link>
              </li>
              <li>
                <Link href="/accommodations" className="text-muted-foreground hover:text-ocean transition-colors">
                  精选住宿
                </Link>
              </li>
              <li>
                <Link href="/food" className="text-muted-foreground hover:text-ocean transition-colors">
                  特色美食
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-muted-foreground hover:text-ocean transition-colors">
                  旅游攻略
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-foreground">服务</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-ocean transition-colors">
                  关于我们
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-ocean transition-colors">
                  联系我们
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-ocean transition-colors">
                  合作伙伴
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-ocean transition-colors">
                  帮助中心
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-foreground">关注我们</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-ocean transition-colors">
                  微信公众号
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-ocean transition-colors">
                  微博
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-ocean transition-colors">
                  抖音
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-ocean transition-colors">
                  小红书
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
          <p>© 2025 平潭旅游. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  )
}
