-- CreateTable
CREATE TABLE "TrackingPixel" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "name" TEXT,
    "pixelId" TEXT NOT NULL,
    "conversionApiToken" TEXT,
    "testToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrackingPixel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrackingPixel_shopId_idx" ON "TrackingPixel"("shopId");

-- CreateIndex
CREATE INDEX "TrackingPixel_shopId_provider_idx" ON "TrackingPixel"("shopId", "provider");

-- AddForeignKey
ALTER TABLE "TrackingPixel" ADD CONSTRAINT "TrackingPixel_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
