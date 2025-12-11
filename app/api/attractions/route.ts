import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import type { Attraction } from "@/lib/schema"

const data: Attraction[] = [
  {
    id: 1,
    name: "蓝眼泪观赏点",
    type: "自然景观",
    image: "/blue-tears-beach-night-glow.jpg",
    rating: 4.9,
    reviews: 2856,
    price: "免费",
    duration: "2-3小时",
    distance: "距市中心 8km",
    tags: ["适合拍照", "夜间观赏", "自然奇观"],
    description:
      "每年4-8月，海滩上出现的梦幻蓝色荧光现象，是平潭最著名的自然奇观",
  },
  {
    id: 2,
    name: "石头厝古村",
    type: "人文景观",
    image: "/stone-house-village-traditional.jpg",
    rating: 4.7,
    reviews: 1523,
    price: "免费",
    duration: "1-2小时",
    distance: "距市中心 12km",
    tags: ["历史文化", "适合拍照", "古建筑"],
    description: "独特的石头建筑群，展现平潭传统建筑艺术和海岛文化",
  },
  {
    id: 3,
    name: "龙凤头海滨浴场",
    type: "海滩沙滩",
    image: "/longfengtou-beach-resort.jpg",
    rating: 4.6,
    reviews: 3421,
    price: "免费",
    duration: "3-5小时",
    distance: "距市中心 5km",
    tags: ["海滩度假", "水上运动", "亲子游玩"],
    description: "平潭最大的天然海滨浴场，沙质细软，海水清澈，是夏季避暑胜地",
  },
  {
    id: 4,
    name: "海坛古城",
    type: "人文景观",
    image: "/haitan-ancient-city-architecture.jpg",
    rating: 4.5,
    reviews: 2134,
    price: "免费",
    duration: "2-4小时",
    distance: "距市中心 3km",
    tags: ["历史文化", "美食街", "夜景"],
    description: "以闽南文化为主题的仿古建筑群，集观光、美食、购物于一体",
  },
  {
    id: 5,
    name: "仙人井景区",
    type: "自然景观",
    image: "/xianrenjing-sea-erosion-landscape.jpg",
    rating: 4.8,
    reviews: 1876,
    price: "¥50",
    duration: "2-3小时",
    distance: "距市中心 15km",
    tags: ["海蚀地貌", "适合拍照", "自然奇观"],
    description: "壮观的海蚀地貌景观，巨大的天然海蚀竖井令人叹为观止",
  },
  {
    id: 6,
    name: "东海仙境",
    type: "自然景观",
    image: "/donghai-fairyland-coastal-cliffs.jpg",
    rating: 4.7,
    reviews: 2245,
    price: "¥60",
    duration: "2-3小时",
    distance: "距市中心 18km",
    tags: ["海蚀地貌", "悬崖峭壁", "适合拍照"],
    description: "奇特的海蚀地貌和悬崖景观，被誉为东海仙境",
  },
  {
    id: 7,
    name: "北港文创村",
    type: "人文景观",
    image: "/beigang-creative-village-art.jpg",
    rating: 4.6,
    reviews: 1654,
    price: "免费",
    duration: "1-2小时",
    distance: "距市中心 10km",
    tags: ["文艺小清新", "适合拍照", "民宿聚集"],
    description: "石头厝改造的文创村落，充满艺术气息和文艺范儿",
  },
  {
    id: 8,
    name: "坛南湾",
    type: "海滩沙滩",
    image: "/tannanwan-beach-sunset.jpg",
    rating: 4.8,
    reviews: 1987,
    price: "免费",
    duration: "2-4小时",
    distance: "距市中心 20km",
    tags: ["海滩度假", "日落观赏", "情侣约会"],
    description: "平潭最美的海湾之一，以绝美的日落景色而闻名",
  },
  {
    id: 9,
    name: "将军山",
    type: "自然景观",
    image: "/jiangjunshan-mountain-view.jpg",
    rating: 4.5,
    reviews: 1432,
    price: "免费",
    duration: "2-3小时",
    distance: "距市中心 7km",
    tags: ["登山徒步", "观景台", "日出观赏"],
    description: "平潭最高峰，登顶可俯瞰整个平潭岛和海峡风光",
  },
]

export async function GET(request: Request) {
  const url = new URL(request.url)
  const type = url.searchParams.get("type")
  const pageParam = url.searchParams.get("page")
  const limitParam = url.searchParams.get("limit")
  const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1
  const limit = limitParam ? Math.max(1, parseInt(limitParam, 10)) : 0
  const sort = url.searchParams.get("sort")
  const db = getDb()
  let items: Attraction[] = []

  if (db) {
    try {
      const res = await db.query<Attraction>(
        `SELECT id, name, type, image, rating, reviews, price, duration, distance, tags, description FROM attractions`
      )
      items = res.rows
    } catch (e) {
      items = [...data]
    }
  } else {
    items = [...data]
  }

  // Filter by type if provided
  if (type) {
    items = items.filter((item) => item.type === type)
  }

  switch (sort) {
    case "rating_desc":
      items.sort((a, b) => b.rating - a.rating)
      break
    case "reviews_desc":
      items.sort((a, b) => b.reviews - a.reviews)
      break
  }

  // Apply pagination if limit provided
  if (limit > 0) {
    const start = (page - 1) * limit
    items = items.slice(start, start + limit)
  }

  return NextResponse.json(items, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  })
}

export async function POST(request: Request) {
  const db = getDb()
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const {
    name,
    type,
    image,
    rating,
    reviews,
    price,
    duration,
    distance,
    tags,
    description,
  } = body

  if (!name || !type) {
    return NextResponse.json({ error: "Missing required fields: name, type" }, { status: 400 })
  }

  try {
    const res = await db.query<Attraction>(
      `INSERT INTO attractions (name, type, image, rating, reviews, price, duration, distance, tags, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10)
       RETURNING id, name, type, image, rating, reviews, price, duration, distance, tags, description`,
      [
        String(name),
        String(type),
        image ? String(image) : null,
        rating != null ? Number(rating) : null,
        reviews != null ? Number(reviews) : null,
        price ? String(price) : null,
        duration ? String(duration) : null,
        distance ? String(distance) : null,
        JSON.stringify(Array.isArray(tags) ? tags : []),
        description ? String(description) : null,
      ]
    )
    return NextResponse.json(res.rows[0], { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: "Insert failed" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const db = getDb()
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 })
  }

  const url = new URL(request.url)
  const idParam = url.searchParams.get("id")
  const id = idParam ? parseInt(idParam, 10) : NaN
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  try {
    await db.query(`DELETE FROM attractions WHERE id = $1`, [id])
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}