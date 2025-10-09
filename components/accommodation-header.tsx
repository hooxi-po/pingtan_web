import { Search, MapPin, Calendar, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function AccommodationHeader() {
  // 移除页面级导航与登录注册，避免与全局 SiteHeader 重复
  return (
    <section className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-6 lg:px-8">
        <div className="bg-background rounded-xl p-4 shadow-sm border border-border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-card rounded-lg border border-border">
              <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-1">目的地</div>
                <Input placeholder="平潭岛" className="border-0 p-0 h-auto text-sm font-medium focus-visible:ring-0" />
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-2 bg-card rounded-lg border border-border">
              <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-1">入住日期</div>
                <Input type="date" className="border-0 p-0 h-auto text-sm font-medium focus-visible:ring-0" />
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-2 bg-card rounded-lg border border-border">
              <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-1">退房日期</div>
                <Input type="date" className="border-0 p-0 h-auto text-sm font-medium focus-visible:ring-0" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 px-4 py-2 bg-card rounded-lg border border-border flex-1">
                <Users className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-1">人数</div>
                  <Input
                    placeholder="2位客人"
                    className="border-0 p-0 h-auto text-sm font-medium focus-visible:ring-0"
                  />
                </div>
              </div>
              <Button className="h-full px-6">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
