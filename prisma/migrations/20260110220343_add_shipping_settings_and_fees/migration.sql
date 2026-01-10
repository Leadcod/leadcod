-- CreateTable
CREATE TABLE "ShippingSettings" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "stopDeskEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingFee" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "cashOnDelivery" DECIMAL(65,30),
    "stopDesk" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingFee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShippingSettings_shopId_key" ON "ShippingSettings"("shopId");

-- CreateIndex
CREATE INDEX "ShippingFee_shopId_idx" ON "ShippingFee"("shopId");

-- CreateIndex
CREATE INDEX "ShippingFee_stateId_idx" ON "ShippingFee"("stateId");

-- CreateIndex
CREATE UNIQUE INDEX "ShippingFee_shopId_stateId_key" ON "ShippingFee"("shopId", "stateId");

-- AddForeignKey
ALTER TABLE "ShippingSettings" ADD CONSTRAINT "ShippingSettings_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingFee" ADD CONSTRAINT "ShippingFee_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingFee" ADD CONSTRAINT "ShippingFee_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE CASCADE ON UPDATE CASCADE;
