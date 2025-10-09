import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import type { Restaurant } from "@/lib/schema"

const data: Restaurant[] = [
  {
    id: 1,
    name: "海鲜大排档",
    category: "海鲜",
    image: "/food/seafood-restaurant-fresh-catch.svg",
    rating: 4.8,
    reviews: 3245,
    avgPrice: "¥120",
    distance: "距市中心 3km",
    tags: ["新鲜海鲜", "本地特色", "海景餐厅"],
    description:
      "每日新鲜海鲜直供，品种丰富，价格实惠，是品尝平潭海鲜的首选",
    specialty: "清蒸石斑鱼、爆炒花蛤、海鲜粥",
  },
  {
    id: 2,
    name: "老字号海蛎煎",
    category: "闽南小吃",
    image: "/food/oyster-omelette-traditional.svg",
    rating: 4.9,
    reviews: 2876,
    avgPrice: "¥35",
    distance: "距市中心 1km",
    tags: ["传统小吃", "老字号", "人气美食"],
    description:
      "传承三代的老字号，海蛎煎外酥里嫩，配上特制酱料，回味无穷",
    specialty: "海蛎煎、虾仁煎、鱿鱼煎",
  },
  {
    id: 3,
    name: "渔家乐海鲜楼",
    category: "海鲜",
    image: "/food/fisherman-restaurant-dining.svg",
    rating: 4.7,
    reviews: 1987,
    avgPrice: "¥150",
    distance: "距市中心 5km",
    tags: ["海景餐厅", "包厢雅座", "家庭聚餐"],
    description:
      "坐拥无敌海景，环境优雅，海鲜新鲜，适合家庭聚餐和商务宴请",
    specialty: "龙虾刺身、鲍鱼捞饭、海鲜火锅",
  },
  {
    id: 4,
    name: "平潭时来运转",
    category: "闽南菜",
    image: "/food/minnan-cuisine-restaurant.svg",
    rating: 4.6,
    reviews: 1654,
    avgPrice: "¥80",
    distance: "距市中心 2km",
    tags: ["本地特色", "闽南风味", "性价比高"],
    description:
      "地道的闽南菜馆，菜品丰富，口味正宗，深受本地人喜爱",
    specialty: "佛跳墙、炒米粉、卤面",
  },
  {
    id: 5,
    name: "海边烧烤吧",
    category: "烧烤",
    image: "/food/beachside-bbq-grill.svg",
    rating: 4.7,
    reviews: 2134,
    avgPrice: "¥90",
    distance: "距市中心 6km",
    tags: ["海鲜烧烤", "夜宵", "朋友聚会"],
    description:
      "海边露天烧烤，新鲜海鲜现烤现吃，配上啤酒，享受海岛夜生活",
    specialty: "烤生蚝、烤扇贝、烤鱿鱼",
  },
  {
    id: 6,
    name: "石头厝私房菜",
    category: "闽南菜",
    image: "/food/stone-house-private-kitchen.svg",
    rating: 4.8,
    reviews: 1432,
    avgPrice: "¥180",
    distance: "距市中心 10km",
    tags: ["私房菜", "环境优雅", "情侣约会"],
    description:
      "石头厝改造的私房菜馆，环境古朴雅致，菜品精致，适合约会聚餐",
    specialty: "红糟鸡、芋泥、姜母鸭",
  },
  {
    id: 7,
    name: "海坛古城美食街",
    category: "美食街",
    image: "/food/ancient-city-food-street.svg",
    rating: 4.5,
    reviews: 3567,
    avgPrice: "¥60",
    distance: "距市中心 3km",
    tags: ["美食街", "小吃聚集", "夜市"],
    description:
      "汇集各类平潭小吃和特色美食，是品尝多种美食的好去处",
    specialty: "各类小吃、海鲜、烧烤",
  },
  {
    id: 8,
    name: "甜蜜时光甜品店",
    category: "甜品",
    image: "/food/dessert-cafe-sweet.svg",
    rating: 4.6,
    reviews: 1876,
    avgPrice: "¥45",
    distance: "距市中心 2km",
    tags: ["甜品饮品", "下午茶", "文艺小清新"],
    description: "精致的甜品店，环境温馨，甜品美味，是下午茶的好选择",
    specialty: "芋泥波波、仙草冻、水果茶",
  },
  {
    id: 9,
    name: "渔港码头海鲜市场",
    category: "海鲜",
    image: "/food/fishing-port-seafood-market.svg",
    rating: 4.9,
    reviews: 2543,
    avgPrice: "¥100",
    distance: "距市中心 7km",
    tags: ["海鲜市场", "现买现做", "新鲜实惠"],
    description:
      "渔港直供海鲜市场，可以自选海鲜现场加工，新鲜又实惠",
    specialty: "各类新鲜海鲜、现场加工",
  },
]

export async function GET(request: Request) {
  const url = new URL(request.url)
  const category = url.searchParams.get("category")
  const pageParam = url.searchParams.get("page")
  const limitParam = url.searchParams.get("limit")
  const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1
  const limit = limitParam ? Math.max(1, parseInt(limitParam, 10)) : 0
  const sort = url.searchParams.get("sort")
  const db = getDb()
  let items: Restaurant[] = []

  if (db) {
    try {
      const res = await db.query<Restaurant>(
        `SELECT id, name, category, image, rating, reviews, avg_price AS "avgPrice", distance, tags, description, specialty, address, phone FROM restaurants`
      )
      items = res.rows
    } catch (e) {
      items = [...data]
    }
  } else {
    items = [...data]
  }

  // Filter by category if provided
  if (category) {
    items = items.filter((item) => item.category === category)
  }

  switch (sort) {
    case "rating_desc":
      items.sort((a, b) => b.rating - a.rating)
      break
    case "reviews_desc":
      items.sort((a, b) => b.reviews - a.reviews)
      break
    case "price_asc":
      items.sort((a, b) => parseInt(a.avgPrice.replace("¥", "")) - parseInt(b.avgPrice.replace("¥", "")))
      break
    case "price_desc":
      items.sort((a, b) => parseInt(b.avgPrice.replace("¥", "")) - parseInt(a.avgPrice.replace("¥", "")))
      break
  }

  // Apply pagination if limit provided
  if (limit > 0) {
    const start = (page - 1) * limit
    items = items.slice(start, start + limit)
  }

  return NextResponse.json(items, {
    headers: {
      // Cache list for 5 minutes on client and edge/CDN to reduce server work
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
    category,
    image,
    rating,
    reviews,
    avgPrice,
    distance,
    tags,
    description,
    specialty,
  } = body

  if (!name || !category) {
    return NextResponse.json({ error: "Missing required fields: name, category" }, { status: 400 })
  }

  try {
    const res = await db.query<Restaurant>(
      `INSERT INTO restaurants (name, category, image, rating, reviews, avg_price, distance, tags, description, specialty)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, name, category, image, rating, reviews, avg_price AS "avgPrice", distance, tags, description, specialty`,
      [
        String(name),
        String(category),
        image ? String(image) : null,
        rating != null ? Number(rating) : null,
        reviews != null ? Number(reviews) : null,
        avgPrice ? String(avgPrice) : null,
        distance ? String(distance) : null,
        Array.isArray(tags) ? tags : [],
        description ? String(description) : null,
        specialty ? String(specialty) : null,
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
    await db.query(`DELETE FROM restaurants WHERE id = $1`, [id])
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}