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
  handleComplianceWebhook,
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
      .post('/app/uninstalled', (ctx) => handleAppUninstalled(ctx))
      .post('/app_subscriptions/update', (ctx) => handleAppSubscriptionsUpdate(ctx))
      .post('/compliance', (ctx) => handleComplianceWebhook(ctx)),
  )
  .get('/form', FormController.getForm, FormController.getFormSchema)
  .get('/states', LocationController.getStates, LocationController.getStatesSchema)
  .get('/cities', LocationController.getCities, LocationController.getCitiesSchema)
  .get('/shipping-fees', LocationController.getShippingFees, LocationController.getShippingFeesSchema)
  .get('/onboarding', OnboardingController.getProgress, OnboardingController.getProgressSchema)
  .post('/onboarding', (ctx) => OnboardingController.markStepComplete(ctx), OnboardingController.markStepCompleteSchema)
  .post('/orders', (ctx) => OrderController.createOrder(ctx), OrderController.createOrderSchema)
  .get('/billing/confirm', (ctx) => BillingController.confirm(ctx), BillingController.confirmSchema)
  .get('/pixels', (ctx) => PixelController.list(ctx), PixelController.listSchema)
  .post('/pixels', (ctx) => PixelController.create(ctx), PixelController.createSchema)
  .patch('/pixels', (ctx) => PixelController.update(ctx), PixelController.updateSchema)
  .delete('/pixels', (ctx) => PixelController.delete(ctx), PixelController.deleteSchema)

export const GET = app.fetch
export const POST = app.fetch
export const OPTIONS = app.fetch
export const PATCH = app.fetch
export const DELETE = app.fetch 