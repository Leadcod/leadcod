import { Elysia } from 'elysia'
import cors from '@elysiajs/cors'
import { FormController } from '../controllers/FormController'
import { LocationController } from '../controllers/LocationController'
import { OrderController } from '../controllers/OrderController'
import { OnboardingController } from '../controllers/OnboardingController'
import { BillingController } from '../controllers/BillingController'

const app = new Elysia({ prefix: '/api' })
  .use(cors({
    origin: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }))
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

export const GET = app.fetch 
export const POST = app.fetch
export const OPTIONS = app.fetch 