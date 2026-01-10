import { Elysia } from 'elysia'
import cors from '@elysiajs/cors'
import { FormController } from '../controllers/FormController'
import { LocationController } from '../controllers/LocationController'

const app = new Elysia({ prefix: '/api' })
  .use(cors())
  .get('/form', FormController.getForm, FormController.getFormSchema)
  .get('/states', LocationController.getStates, LocationController.getStatesSchema)
  .get('/cities', LocationController.getCities, LocationController.getCitiesSchema)
  .get('/shipping-fees', LocationController.getShippingFees, LocationController.getShippingFeesSchema)

export const GET = app.fetch 
export const POST = app.fetch 