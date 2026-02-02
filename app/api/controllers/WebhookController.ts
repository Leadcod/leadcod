import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { CANCELLED_STATUSES, SubscriptionStatus } from '@/lib/constants/subscription'

const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET || ''

/**
 * Verify Shopify webhook HMAC using raw body and X-Shopify-Hmac-SHA256 header.
 */
function verifyShopifyHmac(rawBody: string, hmacHeader: string | null): boolean {
  if (!SHOPIFY_API_SECRET || !hmacHeader) return false
  const generated = crypto
    .createHmac('sha256', SHOPIFY_API_SECRET)
    .update(rawBody, 'utf8')
    .digest('base64')
  return crypto.timingSafeEqual(Buffer.from(generated, 'base64'), Buffer.from(hmacHeader, 'base64'))
}

/** Uninstall webhook payload – shop object when app is uninstalled */
interface UninstallPayload {
  id: number
  name?: string
  email?: string
  domain?: string | null
  myshopify_domain?: string | null
  [key: string]: unknown
}

/** app_subscriptions/update webhook payload */
interface AppSubscriptionPayload {
  app_subscription: {
    admin_graphql_api_id: string
    admin_graphql_api_shop_id: string
    name: string
    status: string
    created_at: string
    updated_at: string
    currency?: string
    capped_amount?: string
    price?: string
    interval?: string
    plan_handle?: string
    [key: string]: unknown
  }
}

export interface WebhookContext {
  request?: Request
  body?: unknown
}

/**
 * Handle app/uninstalled webhook.
 * Revokes access by clearing accessToken so the app cannot access the shop anymore.
 */
export async function handleAppUninstalled(ctx: WebhookContext): Promise<Response> {
  const rawBody = typeof ctx.body === 'string' ? ctx.body : ''
  const hmacHeader = ctx.request?.headers.get('x-shopify-hmac-sha256') ?? null
  if (!verifyShopifyHmac(rawBody, hmacHeader)) {
    return new Response(JSON.stringify({ error: 'HMAC verification failed' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let data: UninstallPayload
  try {
    data = JSON.parse(rawBody) as UninstallPayload
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const shopId = data.id != null ? String(data.id) : null
  const myshopifyDomain = data.myshopify_domain ?? null
  const domain = data.domain ?? null

  try {
    const shop = await (async () => {
      if (shopId) {
        const byShopifyId = await prisma.shop.findFirst({
          where: { shopifyShopId: shopId },
        })
        if (byShopifyId) return byShopifyId
      }
      const url = myshopifyDomain || domain
      if (url) {
        const normalized = url.replace(/^https?:\/\//, '').replace(/\/$/, '')
        return prisma.shop.findFirst({
          where: { url: normalized },
        })
      }
      return null
    })()

    if (!shop) {
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const now = new Date()

    await prisma.$transaction([
      prisma.shop.update({
        where: { id: shop.id },
        data: {
          accessToken: null,
          uninstalledAt: now,
        },
      }),
      prisma.subscription.updateMany({
        where: { shopId: shop.id },
        data: {
          status: SubscriptionStatus.CANCELLED,
          cancelledAt: now,
        },
      }),
    ])

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Uninstall webhook failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
}

/**
 * Handle app_subscriptions/update webhook.
 * Syncs subscription status and data in the subscriptions table only.
 */
export async function handleAppSubscriptionsUpdate(ctx: WebhookContext): Promise<Response> {
  const rawBody = typeof ctx.body === 'string' ? ctx.body : ''
  const hmacHeader = ctx.request?.headers.get('x-shopify-hmac-sha256') ?? null
  if (!verifyShopifyHmac(rawBody, hmacHeader)) {
    return new Response(JSON.stringify({ error: 'HMAC verification failed' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let data: AppSubscriptionPayload
  try {
    data = JSON.parse(rawBody) as AppSubscriptionPayload
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const sub = data.app_subscription
  if (!sub || !sub.admin_graphql_api_shop_id) {
    return new Response(JSON.stringify({ error: 'Missing app_subscription or shop id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const shopifyShopId = sub.admin_graphql_api_shop_id.replace(/^gid:\/\/shopify\/Shop\//i, '')
  const subscriptionGid = sub.admin_graphql_api_id
  const shopifyChargeId = subscriptionGid.replace(/^gid:\/\/shopify\/AppSubscription\//i, '') || subscriptionGid
  const statusUpper = (sub.status || '').toUpperCase()
  const price = sub.price != null ? parseFloat(sub.price) : null
  const currencyCode = sub.currency || 'USD'
  const interval = sub.interval || null
  const startedAt = sub.created_at ? new Date(sub.created_at) : new Date()
  const updatedAt = sub.updated_at ? new Date(sub.updated_at) : new Date()

  try {
    const shop = await prisma.shop.findFirst({
      where: { shopifyShopId },
    })

    if (!shop) {
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const isCancelled = (CANCELLED_STATUSES as string[]).includes(statusUpper)

    const existing = await prisma.subscription.findFirst({
      where: {
        shopId: shop.id,
        OR: [
          { shopifyChargeId },
          { shopifyChargeId: subscriptionGid },
        ],
      },
    })

    const subscriptionData = {
      status: statusUpper,
      startedAt,
      price,
      currencyCode,
      billingCycle: interval,
      ...(isCancelled ? { cancelledAt: new Date() } : { cancelledAt: null }),
    }

    if (existing) {
      await prisma.subscription.update({
        where: { id: existing.id },
        data: subscriptionData,
      })
    } else {
      await prisma.subscription.create({
        data: {
          shopId: shop.id,
          shopifyChargeId,
          ...subscriptionData,
        },
      })
    }

    return new Response(JSON.stringify({ success: true, status: sub.status }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Subscription update webhook failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
}

// --- GDPR/CPRA compliance webhooks ---

/** customers/data_request payload */
interface CustomersDataRequestPayload {
  shop_id: number
  shop_domain: string
  orders_requested?: number[]
  customer: { id: number; email?: string; phone?: string }
  data_request: { id: number }
}

/** customers/redact payload */
interface CustomersRedactPayload {
  shop_id: number
  shop_domain: string
  customer: { id: number; email?: string; phone?: string }
  orders_to_redact?: number[]
}

/** shop/redact payload */
interface ShopRedactPayload {
  shop_id: number
  shop_domain: string
}

/**
 * Handle customers/data_request – provide stored customer data to store owner.
 * This app does not store customer data locally; orders are created directly in Shopify.
 */
export async function handleCustomersDataRequest(ctx: WebhookContext): Promise<Response> {
  const rawBody = typeof ctx.body === 'string' ? ctx.body : ''
  const hmacHeader = ctx.request?.headers.get('x-shopify-hmac-sha256') ?? null
  if (!verifyShopifyHmac(rawBody, hmacHeader)) {
    return new Response(JSON.stringify({ error: 'HMAC verification failed' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const _data = JSON.parse(rawBody) as CustomersDataRequestPayload
    // This app does not store customer/order data locally.
    // Orders are created via Shopify API; data lives in Shopify.
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

/**
 * Handle customers/redact – delete/redact customer data.
 * This app does not store customer data locally.
 */
export async function handleCustomersRedact(ctx: WebhookContext): Promise<Response> {
  const rawBody = typeof ctx.body === 'string' ? ctx.body : ''
  const hmacHeader = ctx.request?.headers.get('x-shopify-hmac-sha256') ?? null
  if (!verifyShopifyHmac(rawBody, hmacHeader)) {
    return new Response(JSON.stringify({ error: 'HMAC verification failed' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const _data = JSON.parse(rawBody) as CustomersRedactPayload
    // This app does not store customer/order data locally.
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

/**
 * Handle shop/redact – delete all shop data (sent 48h after uninstall).
 */
export async function handleShopRedact(ctx: WebhookContext): Promise<Response> {
  const rawBody = typeof ctx.body === 'string' ? ctx.body : ''
  const hmacHeader = ctx.request?.headers.get('x-shopify-hmac-sha256') ?? null
  if (!verifyShopifyHmac(rawBody, hmacHeader)) {
    return new Response(JSON.stringify({ error: 'HMAC verification failed' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let data: ShopRedactPayload
  try {
    data = JSON.parse(rawBody) as ShopRedactPayload
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const shopifyShopId = String(data.shop_id)
  const shopDomain = (data.shop_domain || '').replace(/^https?:\/\//, '').replace(/\/$/, '')

  try {
    const shop = await prisma.shop.findFirst({
      where: {
        OR: [
          { shopifyShopId },
          { url: shopDomain },
        ],
      },
    })

    if (shop) {
      await prisma.$transaction([
        prisma.form.deleteMany({ where: { shopId: shop.id } }),
        prisma.shippingFee.deleteMany({ where: { shopId: shop.id } }),
        prisma.shippingSettings.deleteMany({ where: { shopId: shop.id } }),
        prisma.onboardingProgress.deleteMany({ where: { shopId: shop.id } }),
        prisma.subscription.deleteMany({ where: { shopId: shop.id } }),
        prisma.trackingPixel.deleteMany({ where: { shopId: shop.id } }),
        prisma.shop.delete({ where: { id: shop.id } }),
      ])
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Shop redact webhook failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
}

/**
 * Route compliance webhooks by X-Shopify-Topic header.
 */
export async function handleComplianceWebhook(ctx: WebhookContext): Promise<Response> {
  const topic = ctx.request?.headers.get('x-shopify-topic') ?? null
  switch (topic) {
    case 'customers/data_request':
      return handleCustomersDataRequest(ctx)
    case 'customers/redact':
      return handleCustomersRedact(ctx)
    case 'shop/redact':
      return handleShopRedact(ctx)
    default:
      return new Response(JSON.stringify({ error: 'Unknown compliance topic' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
  }
}
