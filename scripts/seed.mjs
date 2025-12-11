import { Pool } from "pg"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const url = process.env.DATABASE_URL
if (!url) {
  console.error("DATABASE_URL missing in .env.local")
  process.exit(1)
}

const pool = new Pool({ connectionString: url })

async function createTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS accommodations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      location TEXT NOT NULL,
      rating REAL NOT NULL,
      reviews INTEGER NOT NULL,
      price INTEGER NOT NULL,
      original_price INTEGER NOT NULL,
      image TEXT NOT NULL,
      tags JSONB NOT NULL,
      distance TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_accommodations_name ON accommodations (name);
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS attractions (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      image TEXT NOT NULL,
      rating REAL NOT NULL,
      reviews INTEGER NOT NULL,
      price TEXT NOT NULL,
      duration TEXT NOT NULL,
      distance TEXT NOT NULL,
      tags JSONB NOT NULL,
      description TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_attractions_name ON attractions (name);
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS restaurants (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      image TEXT NOT NULL,
      rating REAL NOT NULL,
      reviews INTEGER NOT NULL,
      avg_price TEXT NOT NULL,
      distance TEXT NOT NULL,
      tags JSONB NOT NULL,
      description TEXT NOT NULL,
      specialty TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_restaurants_name ON restaurants (name);
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMP NOT NULL
    );
  `)
  // Ensure address and phone columns exist for accommodations and restaurants
  await pool.query(`
    ALTER TABLE accommodations ADD COLUMN IF NOT EXISTS address TEXT;
    ALTER TABLE accommodations ADD COLUMN IF NOT EXISTS phone TEXT;
  `)
  await pool.query(`
    ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS address TEXT;
    ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS phone TEXT;
  `)
}

// Helpers to generate random phone numbers and street addresses
function randomPhone(prefix = "0591") {
  const num = Math.floor(10000000 + Math.random() * 90000000) // 8 digits
  return `${prefix}-${num}`
}

function randomStreetAddress() {
  const roads = [
    "海坛街道中心大道",
    "龙凤头海滨路",
    "北港文化路",
    "坛南湾海景路",
    "石牌洋景区路",
    "海坛古城南街",
  ]
  const road = roads[Math.floor(Math.random() * roads.length)]
  const num = Math.floor(10 + Math.random() * 190)
  return `平潭县${road}${num}号`
}

const accommodations = [
  {
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

const attractions = [
  {
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

const restaurants = [
  {
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

async function seed() {
  await createTables()

  for (const a of accommodations) {
    await pool.query(
      `INSERT INTO accommodations (name, type, location, rating, reviews, price, original_price, image, tags, distance, address, phone)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11,$12)
       ON CONFLICT (name) DO NOTHING`,
      [
        a.name,
        a.type,
        a.location,
        a.rating,
        a.reviews,
        a.price,
        a.originalPrice,
        a.image,
        JSON.stringify(a.tags),
        a.distance,
        randomStreetAddress(),
        randomPhone(),
      ]
    )
  }

  for (const t of attractions) {
    await pool.query(
      `INSERT INTO attractions (name, type, image, rating, reviews, price, duration, distance, tags, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10)
       ON CONFLICT (name) DO NOTHING`,
      [
        t.name,
        t.type,
        t.image,
        t.rating,
        t.reviews,
        t.price,
        t.duration,
        t.distance,
        JSON.stringify(t.tags),
        t.description,
      ]
    )
  }

  for (const r of restaurants) {
    await pool.query(
      `INSERT INTO restaurants (name, category, image, rating, reviews, avg_price, distance, tags, description, specialty, address, phone)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10,$11,$12)
       ON CONFLICT (name) DO NOTHING`,
      [
        r.name,
        r.category,
        r.image,
        r.rating,
        r.reviews,
        r.avgPrice,
        r.distance,
        JSON.stringify(r.tags),
        r.description,
        r.specialty,
        randomStreetAddress(),
        randomPhone(),
      ]
    )
  }
}

seed()
  .then(async () => {
    console.log("Seed completed.")
    await pool.end()
    process.exit(0)
  })
  .catch(async (e) => {
    console.error(e)
    await pool.end()
    process.exit(1)
  })