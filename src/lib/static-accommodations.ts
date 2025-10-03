export interface StaticAccommodation {
  id: string;
  name: string;
  type: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  images: string[];
  description: string;
  amenities: string[];
  features: string[];
  popular: boolean;
}

export const staticAccommodations: StaticAccommodation[] = [
  {
    id: "1",
    name: "平潭海景度假酒店",
    type: "度假酒店",
    location: "平潭岛",
    price: 588,
    rating: 4.8,
    reviews: 298,
    image: "/accommodations/resort-hotel-1.jpg",
    images: [
      "/accommodations/resort-hotel-1.jpg",
      "/hotels/Gemini_Generated_Image_1.png",
      "/hotels/Gemini_Generated_Image_2.png"
    ],
    description: "坐落在平潭岛最美海岸线上的豪华度假酒店，拥有无敌海景和完善的度假设施。",
    amenities: ["免费WiFi", "海景房", "游泳池", "健身房", "餐厅", "停车场"],
    features: ["海景", "豪华", "度假"],
    popular: true
  },
  {
    id: "2",
    name: "石头厝精品民宿",
    type: "民宿",
    location: "北港村",
    price: 288,
    rating: 4.6,
    reviews: 156,
    image: "/accommodations/stone-house-1.jpg",
    images: [
      "/accommodations/stone-house-1.jpg",
      "/stone-houses/Gemini_Generated_Image_ny81yuny81yuny81.png",
      "/stone-houses/Gemini_Generated_Image_uqfq0euqfq0euqfq.png"
    ],
    description: "传统石头厝改造的精品民宿，体验地道的平潭文化和建筑特色。",
    amenities: ["免费WiFi", "传统建筑", "文化体验", "早餐", "停车场"],
    features: ["文化", "传统", "特色"],
    popular: true
  },
  {
    id: "3",
    name: "海岸别墅度假村",
    type: "别墅",
    location: "龙凤头海滨",
    price: 888,
    rating: 4.9,
    reviews: 89,
    image: "/accommodations/villa-1.jpg",
    images: [
      "/accommodations/villa-1.jpg",
      "/hotels/Gemini_Generated_Image_3.png",
      "/hotels/Gemini_Generated_Image_4.png"
    ],
    description: "私人海岸别墅，享受独立空间和私密海滩，适合家庭度假。",
    amenities: ["私人海滩", "独立别墅", "厨房", "花园", "BBQ设施", "停车场"],
    features: ["私密", "豪华", "家庭"],
    popular: false
  },
  {
    id: "4",
    name: "渔家乐客栈",
    type: "客栈",
    location: "流水镇",
    price: 168,
    rating: 4.3,
    reviews: 234,
    image: "/accommodations/guesthouse-1.jpg",
    images: [
      "/accommodations/guesthouse-1.jpg",
      "/hotels/Gemini_Generated_Image_5.png"
    ],
    description: "体验渔民生活的特色客栈，可参与出海捕鱼和品尝新鲜海鲜。",
    amenities: ["渔家体验", "海鲜餐厅", "出海活动", "免费WiFi", "停车场"],
    features: ["体验", "海鲜", "渔家"],
    popular: false
  },
  {
    id: "5",
    name: "温馨家庭旅馆",
    type: "家庭旅馆",
    location: "平潭县城",
    price: 128,
    rating: 4.2,
    reviews: 167,
    image: "/accommodations/homestay-1.jpg",
    images: [
      "/accommodations/homestay-1.jpg",
      "/hotels/Gemini_Generated_Image_6.png"
    ],
    description: "位于县城中心的温馨家庭旅馆，交通便利，性价比高。",
    amenities: ["免费WiFi", "24小时前台", "洗衣服务", "行李寄存", "停车场"],
    features: ["便利", "经济", "舒适"],
    popular: false
  },
  {
    id: "6",
    name: "海景精品酒店",
    type: "精品酒店",
    location: "坛南湾",
    price: 458,
    rating: 4.7,
    reviews: 203,
    image: "/accommodations/boutique-hotel-1.jpg",
    images: [
      "/accommodations/boutique-hotel-1.jpg",
      "/coastal-road/Gemini_Generated_Image_csemzicsemzicsem.png"
    ],
    description: "现代设计的海景精品酒店，融合当地文化元素，提供高品质住宿体验。",
    amenities: ["海景房", "设计酒店", "SPA", "餐厅", "会议室", "停车场"],
    features: ["设计", "现代", "海景"],
    popular: true
  }
];

// 获取所有住宿数据
export const getAllAccommodations = (): StaticAccommodation[] => {
  return staticAccommodations;
};

// 根据ID获取单个住宿
export const getAccommodationById = (id: string): StaticAccommodation | undefined => {
  return staticAccommodations.find(acc => acc.id === id);
};

// 根据类型筛选住宿
export const getAccommodationsByType = (type: string): StaticAccommodation[] => {
  return staticAccommodations.filter(acc => acc.type === type);
};

// 根据价格范围筛选住宿
export const getAccommodationsByPriceRange = (minPrice: number, maxPrice: number): StaticAccommodation[] => {
  return staticAccommodations.filter(acc => acc.price >= minPrice && acc.price <= maxPrice);
};

// 获取热门住宿
export const getPopularAccommodations = (): StaticAccommodation[] => {
  return staticAccommodations.filter(acc => acc.popular);
};