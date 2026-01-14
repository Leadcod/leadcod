import { Elysia } from 'elysia'
import cors from '@elysiajs/cors'
import { FormController } from '../controllers/FormController'
import { LocationController } from '../controllers/LocationController'
import { OrderController } from '../controllers/OrderController'

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
  .post('/orders', async (context) => {
    return OrderController.createOrder({ 
      body: context.body as any, 
      request: context.request 
    });
  }, OrderController.createOrderSchema)

export const GET = app.fetch 
export const POST = app.fetch
export const OPTIONS = app.fetch 