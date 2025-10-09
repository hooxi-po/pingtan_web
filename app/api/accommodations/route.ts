import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import type { Accommodation } from "@/lib/schema"

const data: Accommodation[] = [
  {
    id: 1,
    name: "平潭海景度假酒店",
    type: "酒店",
    location: "龙凤头海滨浴场",
    rating: 4.8,
    reviews: 328,
    price: 688,
    originalPrice: 888,
    image: "/luxury-beach-hotel-ocean-view.jpg",
    tags: ["海景房", "免费WiFi", "含早餐", "免费停车"],
    distance: "距海滩 50米",
  },
  {
    id: 2,
    name: "石头厝特色民宿",
    type: "民宿",
    location: "北港村",
    rating: 4.9,
    reviews: 256,
    price: 468,
    originalPrice: 568,
    image: "/traditional-stone-house-guesthouse.jpg",
    tags: ["特色建筑", "免费WiFi", "管家服务"],
    distance: "距景区 200米",
  },
  {
    id: 3,
    name: "蓝眼泪海景别墅",
    type: "别墅",
    location: "坛南湾",
    rating: 5.0,
    reviews: 189,
    price: 1288,
    originalPrice: 1588,
    image: "/modern-beach-villa-sunset.jpg",
    tags: ["独栋别墅", "私人泳池", "海景房", "含早餐"],
    distance: "距海滩 100米",
  },
  {
    id: 4,
    name: "海坛古城精品客栈",
    type: "客栈",
    location: "海坛古城",
    rating: 4.7,
    reviews: 412,
    price: 388,
    originalPrice: 488,
    image: "/traditional-chinese-inn-courtyard.jpg",
    tags: ["古城内", "免费WiFi", "特色装修"],
    distance: "古城中心",
  },
  {
    id: 5,
    name: "平潭湾度假公寓",
    type: "公寓",
    location: "龙凤头海滨浴场",
    rating: 4.6,
    reviews: 298,
    price: 528,
    originalPrice: 628,
    image: "/modern-apartment-sea-view-balcony.jpg",
    tags: ["海景房", "厨房", "免费停车", "洗衣机"],
    distance: "距海滩 150米",
  },
  {
    id: 6,
    name: "石牌洋观景度假村",
    type: "度假村",
    location: "石牌洋景区",
    rating: 4.8,
    reviews: 367,
    price: 888,
    originalPrice: 1088,
    image: "/resort-hotel-tropical-beach.jpg",
    tags: ["度假村", "含早餐", "游泳池", "健身房"],
    distance: "景区内",
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
  let items: Accommodation[] = []

  if (db) {
    try {
      const res = await db.query<Accommodation>(
        `SELECT id, name, type, location, rating, reviews, price, original_price AS "originalPrice", image, tags, distance, address, phone FROM accommodations`
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
    case "price_asc":
      items.sort((a, b) => a.price - b.price)
      break
    case "price_desc":
      items.sort((a, b) => b.price - a.price)
      break
  }

  // Apply pagination if limit provided
  if (limit > 0) {
    const start = (page - 1) * limit
    items = items.slice(start, start + limit)
  }

  return NextResponse.json(items)
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
    location,
    rating,
    reviews,
    price,
    originalPrice,
    image,
    tags,
    distance,
  } = body

  if (!name || !type) {
    return NextResponse.json({ error: "Missing required fields: name, type" }, { status: 400 })
  }

  try {
    const res = await db.query<Accommodation>(
      `INSERT INTO accommodations (name, type, location, rating, reviews, price, original_price, image, tags, distance)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, name, type, location, rating, reviews, price, original_price AS "originalPrice", image, tags, distance`,
      [
        String(name),
        String(type),
        location ? String(location) : null,
        rating != null ? Number(rating) : null,
        reviews != null ? Number(reviews) : null,
        price != null ? Number(price) : null,
        originalPrice != null ? Number(originalPrice) : null,
        image ? String(image) : null,
        Array.isArray(tags) ? tags : [],
        distance ? String(distance) : null,
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
    const res = await db.query(`DELETE FROM accommodations WHERE id = $1`, [id])
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}