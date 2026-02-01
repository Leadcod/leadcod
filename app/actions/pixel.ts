'use server';

import { prisma } from '@/lib/prisma';

export type PixelProvider = 'facebook' | 'tiktok' | 'snapchat' | 'google';

export interface TrackingPixelRecord {
  id: string;
  provider: string;
  name: string | null;
  pixelId: string;
  hasConversionApiToken: boolean;
  hasTestToken: boolean;
  createdAt: string;
  updatedAt: string;
}

function toRecord(p: {
  id: string;
  provider: string;
  name: string | null;
  pixelId: string;
  conversionApiToken: string | null;
  testToken: string | null;
  createdAt: Date;
  updatedAt: Date;
}): TrackingPixelRecord {
  return {
    id: p.id,
    provider: p.provider,
    name: p.name,
    pixelId: p.pixelId,
    hasConversionApiToken: !!p.conversionApiToken,
    hasTestToken: !!p.testToken,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

export async function getPixels(shopUrl: string): Promise<{
  success: boolean;
  data?: TrackingPixelRecord[];
  error?: string;
}> {
  try {
    const shop = await prisma.shop.findFirst({ where: { url: shopUrl } });
    if (!shop) {
      return { success: false, error: 'Shop not found' };
    }
    const pixels = await prisma.trackingPixel.findMany({
      where: { shopId: shop.id },
      orderBy: { createdAt: 'asc' },
    });
    return {
      success: true,
      data: pixels.map(toRecord),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load pixels',
    };
  }
}

export async function createPixel(
  shopUrl: string,
  payload: {
    provider: PixelProvider;
    name?: string;
    pixelId: string;
    conversionApiToken?: string;
    testToken?: string;
  }
): Promise<{ success: boolean; data?: TrackingPixelRecord; error?: string }> {
  try {
    const shop = await prisma.shop.findFirst({ where: { url: shopUrl } });
    if (!shop) {
      return { success: false, error: 'Shop not found' };
    }
    const { provider, name, pixelId, conversionApiToken, testToken } = payload;
    if (!pixelId) {
      return { success: false, error: 'pixelId is required' };
    }
    const pixel = await prisma.trackingPixel.create({
      data: {
        shopId: shop.id,
        provider,
        name: name ?? null,
        pixelId,
        conversionApiToken: conversionApiToken ?? null,
        testToken: testToken ?? null,
      },
    });
    return {
      success: true,
      data: toRecord(pixel),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create pixel',
    };
  }
}

export async function updatePixel(
  shopUrl: string,
  id: string,
  payload: {
    name?: string;
    pixelId?: string;
    conversionApiToken?: string;
    testToken?: string;
  }
): Promise<{ success: boolean; data?: TrackingPixelRecord; error?: string }> {
  try {
    const shop = await prisma.shop.findFirst({ where: { url: shopUrl } });
    if (!shop) {
      return { success: false, error: 'Shop not found' };
    }
    const existing = await prisma.trackingPixel.findFirst({
      where: { id, shopId: shop.id },
    });
    if (!existing) {
      return { success: false, error: 'Pixel not found' };
    }
    const updateData: {
      name?: string;
      pixelId?: string;
      conversionApiToken?: string;
      testToken?: string;
    } = {};
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.pixelId !== undefined) updateData.pixelId = payload.pixelId;
    if (payload.conversionApiToken !== undefined)
      updateData.conversionApiToken = payload.conversionApiToken;
    if (payload.testToken !== undefined) updateData.testToken = payload.testToken;
    const pixel = await prisma.trackingPixel.update({
      where: { id },
      data: updateData,
    });
    return {
      success: true,
      data: toRecord(pixel),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update pixel',
    };
  }
}

export async function deletePixel(
  shopUrl: string,
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const shop = await prisma.shop.findFirst({ where: { url: shopUrl } });
    if (!shop) {
      return { success: false, error: 'Shop not found' };
    }
    const existing = await prisma.trackingPixel.findFirst({
      where: { id, shopId: shop.id },
    });
    if (!existing) {
      return { success: false, error: 'Pixel not found' };
    }
    await prisma.trackingPixel.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete pixel',
    };
  }
}
