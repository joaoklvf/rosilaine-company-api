import { Hono } from 'hono'
import { Context } from 'hono'
import { CustomerTagEntity } from '../database/entities/customer/customer-tag.entity'
import { ICustomerTagService } from '../interfaces/customer-tag-service'

export const customerTagController = (customerTagService: ICustomerTagService) => {
  const router = new Hono()

  router.get('/', async (c: Context) => {
    try {
      const data = await customerTagService.index(c.req.query())
      return c.json(data, 200)
    } catch (error) {
      return c.json({ msg: error }, 500)
    }
  })

  router.post('/', async (c: Context) => {
    const customerTag = await c.req.json<CustomerTagEntity>()
    const newCustomerTag = await customerTagService.create(customerTag)
    return c.json(newCustomerTag)
  })

  router.put('/:id', async (c: Context) => {
    const customerTag = await c.req.json<CustomerTagEntity>()
    const id = c.req.param('id')
    const updated = await customerTagService.update(customerTag, id)
    return c.json(updated)
  })

  router.delete('/:id', async (c: Context) => {
    const id = c.req.param('id')
    const result = await customerTagService.delete(id)
    return c.json(result)
  })

  router.delete('/safe-delete/:id', async (c: Context) => {
    const id = c.req.param('id')
    const result = await customerTagService.safeDelete(id)
    return c.json(result)
  })

  return router
}
