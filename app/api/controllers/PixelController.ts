import { t } from 'elysia'
import { prisma } from '@/lib/prisma'

export type PixelProvider = 'facebook' | 'tiktok' | 'snapchat' | 'google'

export interface TrackingPixelPayload {
  shop: string
  provider: PixelProvider
  name?: string
  pixelId: string
  conversionApiToken?: string
  testToken?: string
}

export interface UpdatePixelPayload extends Partial<Omit<TrackingPixelPayload, 'shop'>> {
  id: string
  shop: string
}

export class PixelController {
  static async list(ctx: { query?: Record<string, string> }) {
    const shopUrl = (ctx.query?.shop ?? '') as string
    if (!shopUrl) {
      return { success: false, error: 'shop parameter is required' }
    }
    try {
      const shop = await prisma.shop.findFirst({ where: { url: shopUrl } })
      if (!shop) {
        return { success: false, error: 'Shop not found' }
      }
      const pixels = await prisma.trackingPixel.findMany({
        where: { shopId: shop.id },
        orderBy: { createdAt: 'asc' },
      })
      return {
        success: true,
        data: pixels.map((p) => ({
          id: p.id,
          provider: p.provider,
          name: p.name,
          pixelId: p.pixelId,
          conversionApiToken: p.conversionApiToken != null ? '••••••••' : null,
          hasConversionApiToken: !!p.conversionApiToken,
          testToken: p.testToken != null ? '••••••••' : null,
          hasTestToken: !!p.testToken,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        })),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  static async create(ctx: { body?: unknown }) {
    const body = (ctx.body ?? {}) as TrackingPixelPayload
    const { shop: shopUrl, provider, name, pixelId, conversionApiToken, testToken } = body
    if (!shopUrl || !provider || !pixelId) {
      return {
        success: false,
        error: 'shop, provider and pixelId are required',
      }
    }
    try {
      const shop = await prisma.shop.findFirst({ where: { url: shopUrl } })
      if (!shop) {
        return { success: false, error: 'Shop not found' }
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
      })
      return {
        success: true,
        data: {
          id: pixel.id,
          provider: pixel.provider,
          name: pixel.name,
          pixelId: pixel.pixelId,
          hasConversionApiToken: !!pixel.conversionApiToken,
          hasTestToken: !!pixel.testToken,
          createdAt: pixel.createdAt,
          updatedAt: pixel.updatedAt,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  static async update(ctx: { body?: unknown }) {
    const body = (ctx.body ?? {}) as UpdatePixelPayload
    const { id, shop: shopUrl, name, pixelId, conversionApiToken, testToken } = body
    if (!id || !shopUrl) {
      return { success: false, error: 'id and shop are required' }
    }
    try {
      const shop = await prisma.shop.findFirst({ where: { url: shopUrl } })
      if (!shop) {
        return { success: false, error: 'Shop not found' }
      }
      const existing = await prisma.trackingPixel.findFirst({
        where: { id, shopId: shop.id },
      })
      if (!existing) {
        return { success: false, error: 'Pixel not found' }
      }
      const updateData: {
        name?: string
        pixelId?: string
        conversionApiToken?: string
        testToken?: string
      } = {}
      if (name !== undefined) updateData.name = name
      if (pixelId !== undefined) updateData.pixelId = pixelId
      if (conversionApiToken !== undefined) updateData.conversionApiToken = conversionApiToken
      if (testToken !== undefined) updateData.testToken = testToken
      const pixel = await prisma.trackingPixel.update({
        where: { id },
        data: updateData,
      })
      return {
        success: true,
        data: {
          id: pixel.id,
          provider: pixel.provider,
          name: pixel.name,
          pixelId: pixel.pixelId,
          hasConversionApiToken: !!pixel.conversionApiToken,
          hasTestToken: !!pixel.testToken,
          createdAt: pixel.createdAt,
          updatedAt: pixel.updatedAt,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  static async delete(ctx: { query?: Record<string, string> }) {
    const { id, shop: shopUrl } = (ctx.query ?? {}) as { id?: string; shop?: string }
    if (!id || !shopUrl) {
      return { success: false, error: 'id and shop are required' }
    }
    try {
      const shop = await prisma.shop.findFirst({ where: { url: shopUrl } })
      if (!shop) {
        return { success: false, error: 'Shop not found' }
      }
      const existing = await prisma.trackingPixel.findFirst({
        where: { id, shopId: shop.id },
      })
      if (!existing) {
        return { success: false, error: 'Pixel not found' }
      }
      await prisma.trackingPixel.delete({ where: { id } })
      return { success: true, data: { id } }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  static listSchema = {
    query: t.Object({
      shop: t.String(),
    }),
  }

  static createSchema = {
    body: t.Object({
      shop: t.String(),
      provider: t.String(),
      name: t.Optional(t.String()),
      pixelId: t.String(),
      conversionApiToken: t.Optional(t.String()),
      testToken: t.Optional(t.String()),
    }),
  }

  static updateSchema = {
    body: t.Object({
      id: t.String(),
      shop: t.String(),
      name: t.Optional(t.String()),
      pixelId: t.Optional(t.String()),
      conversionApiToken: t.Optional(t.String()),
      testToken: t.Optional(t.String()),
    }),
  }

  static deleteSchema = {
    query: t.Object({
      id: t.String(),
      shop: t.String(),
    }),
  }
}
