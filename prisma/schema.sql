-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('USER', 'MERCHANT', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."AttractionCategory" AS ENUM ('BLUE_TEARS', 'STONE_HOUSE', 'COASTAL_ROAD', 'ISLAND_EXPERIENCE', 'VILLAGE', 'BEACH', 'MOUNTAIN', 'CULTURAL', 'ECOLOGICAL');

-- CreateEnum
CREATE TYPE "public"."AccommodationType" AS ENUM ('STONE_HOUSE_HOMESTAY', 'BOUTIQUE_HOTEL', 'GUESTHOUSE', 'RESORT', 'FARMSTAY');

-- CreateEnum
CREATE TYPE "public"."OrderType" AS ENUM ('ATTRACTION', 'ACCOMMODATION', 'RESTAURANT', 'PACKAGE', 'EXPERIENCE');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."OrderPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."UrgencyLevel" AS ENUM ('NORMAL', 'TIME_SENSITIVE', 'LAST_MINUTE', 'VIP');

-- CreateEnum
CREATE TYPE "public"."PostCategory" AS ENUM ('TRAVEL_GUIDE', 'PHOTO_SHARE', 'VIDEO_SHARE', 'EXPERIENCE', 'FOOD_REVIEW', 'ACCOMMODATION_REVIEW');

-- CreateEnum
CREATE TYPE "public"."EventCategory" AS ENUM ('FESTIVAL', 'CULTURAL', 'SPORTS', 'FOOD', 'WORKSHOP', 'TOUR');

-- CreateEnum
CREATE TYPE "public"."ProductCategory" AS ENUM ('SEAFOOD', 'NOODLES', 'SEAWEED', 'HANDICRAFT', 'SOUVENIR', 'LOCAL_SNACK');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "phone" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'USER',
    "language" TEXT NOT NULL DEFAULT 'zh',
    "points" INTEGER NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."attractions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "nameTw" TEXT,
    "description" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionTw" TEXT,
    "category" "public"."AttractionCategory" NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "images" TEXT[],
    "videos" TEXT[],
    "vrUrl" TEXT,
    "openTime" TEXT,
    "closeTime" TEXT,
    "ticketPrice" DOUBLE PRECISION,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tags" TEXT[],
    "features" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attractions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."accommodations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "nameTw" TEXT,
    "description" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionTw" TEXT,
    "type" "public"."AccommodationType" NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "images" TEXT[],
    "amenities" TEXT[],
    "roomTypes" JSONB[],
    "priceRange" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "checkInTime" TEXT,
    "checkOutTime" TEXT,
    "policies" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accommodations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rooms" (
    "id" TEXT NOT NULL,
    "accommodationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "nameTw" TEXT,
    "description" TEXT,
    "images" TEXT[],
    "maxGuests" INTEGER NOT NULL,
    "bedType" TEXT NOT NULL,
    "size" DOUBLE PRECISION,
    "price" DOUBLE PRECISION NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "amenities" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."restaurants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "nameTw" TEXT,
    "description" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionTw" TEXT,
    "cuisine" TEXT[],
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "images" TEXT[],
    "priceRange" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "contactPhone" TEXT,
    "openHours" TEXT,
    "specialties" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."orders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."OrderType" NOT NULL,
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING',
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT,
    "paymentStatus" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "bookingDate" TIMESTAMP(3),
    "checkInDate" TIMESTAMP(3),
    "checkOutDate" TIMESTAMP(3),
    "guestCount" INTEGER,
    "specialRequests" TEXT,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT,
    "priority" "public"."OrderPriority" NOT NULL DEFAULT 'LOW',
    "isPriority" BOOLEAN NOT NULL DEFAULT false,
    "urgencyLevel" "public"."UrgencyLevel" NOT NULL DEFAULT 'NORMAL',
    "priorityScore" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "attractionId" TEXT,
    "accommodationId" TEXT,
    "roomId" TEXT,
    "restaurantId" TEXT,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reviews" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "images" TEXT[],
    "isRecommended" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "attractionId" TEXT,
    "accommodationId" TEXT,
    "restaurantId" TEXT,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."favorites" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attractionId" TEXT,
    "accommodationId" TEXT,
    "restaurantId" TEXT,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."itineraries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "days" INTEGER NOT NULL,
    "budget" DOUBLE PRECISION,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itineraries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."itinerary_items" (
    "id" TEXT NOT NULL,
    "itineraryId" TEXT NOT NULL,
    "attractionId" TEXT,
    "day" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "itinerary_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."posts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "images" TEXT[],
    "videos" TEXT[],
    "tags" TEXT[],
    "category" "public"."PostCategory" NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."comments" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleEn" TEXT,
    "titleTw" TEXT,
    "description" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionTw" TEXT,
    "category" "public"."EventCategory" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "images" TEXT[],
    "price" DOUBLE PRECISION,
    "maxParticipants" INTEGER,
    "currentParticipants" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "contactInfo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "nameTw" TEXT,
    "description" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionTw" TEXT,
    "category" "public"."ProductCategory" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "images" TEXT[],
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "origin" TEXT,
    "specifications" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE INDEX "orders_userId_status_idx" ON "public"."orders"("userId", "status");

-- CreateIndex
CREATE INDEX "orders_priority_status_idx" ON "public"."orders"("priority", "status");

-- CreateIndex
CREATE INDEX "orders_isPriority_idx" ON "public"."orders"("isPriority");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_userId_attractionId_key" ON "public"."favorites"("userId", "attractionId");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_userId_accommodationId_key" ON "public"."favorites"("userId", "accommodationId");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_userId_restaurantId_key" ON "public"."favorites"("userId", "restaurantId");

-- AddForeignKey
ALTER TABLE "public"."rooms" ADD CONSTRAINT "rooms_accommodationId_fkey" FOREIGN KEY ("accommodationId") REFERENCES "public"."accommodations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_attractionId_fkey" FOREIGN KEY ("attractionId") REFERENCES "public"."attractions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_accommodationId_fkey" FOREIGN KEY ("accommodationId") REFERENCES "public"."accommodations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "public"."restaurants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_attractionId_fkey" FOREIGN KEY ("attractionId") REFERENCES "public"."attractions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_accommodationId_fkey" FOREIGN KEY ("accommodationId") REFERENCES "public"."accommodations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "public"."restaurants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."favorites" ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."favorites" ADD CONSTRAINT "favorites_attractionId_fkey" FOREIGN KEY ("attractionId") REFERENCES "public"."attractions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."favorites" ADD CONSTRAINT "favorites_accommodationId_fkey" FOREIGN KEY ("accommodationId") REFERENCES "public"."accommodations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."favorites" ADD CONSTRAINT "favorites_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "public"."restaurants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."itineraries" ADD CONSTRAINT "itineraries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."itinerary_items" ADD CONSTRAINT "itinerary_items_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "public"."itineraries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."itinerary_items" ADD CONSTRAINT "itinerary_items_attractionId_fkey" FOREIGN KEY ("attractionId") REFERENCES "public"."attractions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

