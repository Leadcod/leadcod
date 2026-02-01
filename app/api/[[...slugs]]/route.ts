import { Elysia } from 'elysia'
import cors from '@elysiajs/cors'
import { FormController } from '../controllers/FormController'
import { LocationController } from '../controllers/LocationController'
import { OrderController } from '../controllers/OrderController'
import { OnboardingController } from '../controllers/OnboardingController'
import { BillingController } from '../controllers/BillingController'
import { PixelController } from '../controllers/PixelController'
import {
  handleAppUninstalled,
  handleAppSubscriptionsUpdate,
} from '../controllers/WebhookController'

const app = new Elysia({ prefix: '/api' })
  .use(cors({
    origin: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Shopify-Hmac-SHA256', 'X-Shopify-Topic'],
    credentials: true
  }))
  .use(
    new Elysia({ prefix: '/webhooks' })
      .onParse(({ request }, contentType) => {
        if (contentType?.toLowerCase?.().includes('application/json')) {
          return request.text()
        }
      })
      .post('/app/uninstalled', async (context) => {
        const rawBody = typeof context.body === 'string' ? context.body : ''
        const hmac = context.request.headers.get('x-shopify-hmac-sha256')
        return handleAppUninstalled(rawBody, hmac)
      })
      .post('/app_subscriptions/update', async (context) => {
        const rawBody = typeof context.body === 'string' ? context.body : ''
        const hmac = context.request.headers.get('x-shopify-hmac-sha256')
        return handleAppSubscriptionsUpdate(rawBody, hmac)
      }),
  )
  .get('/form', FormController.getForm, FormController.getFormSchema)
  .get('/states', LocationController.getStates, LocationController.getStatesSchema)
  .get('/cities', LocationController.getCities, LocationController.getCitiesSchema)
  .get('/shipping-fees', LocationController.getShippingFees, LocationController.getShippingFeesSchema)
  .get('/onboarding', OnboardingController.getProgress, OnboardingController.getProgressSchema)
  .post('/onboarding', async (context) => {
    return OnboardingController.markStepComplete({
      body: context.body as any
    });
  }, OnboardingController.markStepCompleteSchema)
  .post('/orders', async (context) => {
    return OrderController.createOrder({
      body: context.body as any,
      request: context.request
    });
  }, OrderController.createOrderSchema)
  .get('/billing/confirm', async (context) => {
    return BillingController.confirm({
      query: context.query as any,
      request: context.request
    });
  }, BillingController.confirmSchema)
  .get('/pixels', PixelController.list, PixelController.listSchema)
  .post('/pixels', async (context) => {
    return PixelController.create({ body: context.body as any });
  }, PixelController.createSchema)
  .patch('/pixels', async (context) => {
    return PixelController.update({ body: context.body as any });
  }, PixelController.updateSchema)
  .delete('/pixels', PixelController.delete, PixelController.deleteSchema)

export const GET = app.fetch
export const POST = app.fetch
export const OPTIONS = app.fetch
export const PATCH = app.fetch
export const DELETE = app.fetch 