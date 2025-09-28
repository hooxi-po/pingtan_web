import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // 管理员路由保护
    if (req.nextUrl.pathname.startsWith("/admin") && req.nextauth.token?.role !== "ADMIN") {
      return NextResponse.rewrite(new URL("/auth/signin", req.url))
    }

    // 商家路由保护
    if (req.nextUrl.pathname.startsWith("/merchant") && 
        !["MERCHANT", "ADMIN"].includes(req.nextauth.token?.role as string)) {
      return NextResponse.rewrite(new URL("/auth/signin", req.url))
    }

    // 用户路由保护
    if (req.nextUrl.pathname.startsWith("/profile") && !req.nextauth.token) {
      return NextResponse.rewrite(new URL("/auth/signin", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // 公开路由
        const publicPaths = ["/", "/attractions", "/accommodations", "/restaurants", "/auth"]
        const isPublicPath = publicPaths.some(path => req.nextUrl.pathname.startsWith(path))
        
        if (isPublicPath) return true
        
        // 需要认证的路由
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    "/admin/:path*",
    "/merchant/:path*", 
    "/profile/:path*",
    "/api/admin/:path*",
    "/api/merchant/:path*",
    "/api/user/:path*"
  ]
}