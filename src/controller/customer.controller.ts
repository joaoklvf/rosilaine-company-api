import { Hono } from 'hono'
import { Context } from 'hono'
import { CustomerEntity } from '../database/entities/customer/customer.entity'
import { ICustomerService } from '../interfaces/customer-service'

export const customerController = (customerService: ICustomerService) => {
  const router = new Hono()

  router.get('/', async (c: Context) => {
    try {
      const data = await customerService.index(c.req.query())
      return c.json(data, 200)
    } catch (error) {
      return c.json({ msg: error }, 500)
    }
  })

  router.get('/:id', async (c: Context) => {
    const id = c.req.param('id')
    try {
      const data = await customerService.get(id)
      return c.json(data, 200)
    } catch (error) {
      return c.json({ msg: error }, 500)
    }
  })

  router.post('/', async (c: Context) => {
    const customer = await c.req.json<CustomerEntity>()
    const newCustomer = await customerService.create(customer)
    return c.json(newCustomer)
  })

  router.put('/:id', async (c: Context) => {
    const customer = await c.req.json<CustomerEntity>()
    const id = c.req.param('id')
    const updated = await customerService.update(customer, id)
    return c.json(updated)
  })

  router.delete('/:id', async (c: Context) => {
    const id = c.req.param('id')
    const result = await customerService.delete(id)
    return c.json(result)
  })

  router.delete('/safe-delete/:id', async (c: Context) => {
    const id = c.req.param('id')
    const result = await customerService.safeDelete(id)
    return c.json(result)
  })

  return router
}
