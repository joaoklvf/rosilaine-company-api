import { Hono } from 'hono'
import { Context } from 'hono'
import { EndCustomerEntity } from '../database/entities/customer/end-customer/end-customer.entity'
import { IEndCustomerService } from '../interfaces/end-customer-service'

export const endCustomerController = (endCustomerService: IEndCustomerService) => {
  const router = new Hono()

  router.get('/', async (c: Context) => {
    try {
      const data = await endCustomerService.index(c.req.query())
      return c.json(data, 200)
    } catch (error) {
      return c.json({ msg: error }, 500)
    }
  })

  router.get('/:id', async (c: Context) => {
    try {
      const id = c.req.param('id')
      const data = await endCustomerService.get(id)
      return c.json(data, 200)
    } catch (error) {
      return c.json({ msg: error }, 500)
    }
  })

  router.post('/', async (c: Context) => {
    const customer = await c.req.json<EndCustomerEntity>()
    const newEndCustomer = await endCustomerService.create(customer)
    return c.json(newEndCustomer)
  })

  router.put('/:id', async (c: Context) => {
    const customer = await c.req.json<EndCustomerEntity>()
    const id = c.req.param('id')
    const updated = await endCustomerService.update(customer, id)
    return c.json(updated)
  })

  router.delete('/:id', async (c: Context) => {
    const id = c.req.param('id')
    const result = await endCustomerService.delete(id)
    return c.json(result)
  })

  router.delete('/safe-delete/:id', async (c: Context) => {
    const id = c.req.param('id')
    const result = await endCustomerService.safeDelete(id)
    return c.json(result)
  })

  return router
}
