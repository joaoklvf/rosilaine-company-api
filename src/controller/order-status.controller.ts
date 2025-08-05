import { Hono } from 'hono'
import { Context } from 'hono'
import { OrderStatusEntity } from '../database/entities/order/order-status.entity'
import { IOrderStatusService } from '../interfaces/order-status-service'

export const orderStatusController = (orderStatusService: IOrderStatusService) => {
  const router = new Hono()

  router.get('/', async (c: Context) => {
    try {
      const query = c.req.query()
      const data = await orderStatusService.index(query)
      return c.json(data, 200)
    } catch (error) {
      return c.json({ msg: error }, 500)
    }
  })

  router.post('/', async (c: Context) => {
    const body = await c.req.json<OrderStatusEntity>()
    const newStatus = await orderStatusService.create(body)
    return c.json(newStatus)
  })

  router.put('/:id', async (c: Context) => {
    const id = c.req.param('id')
    const body = await c.req.json<OrderStatusEntity>()
    const updated = await orderStatusService.update(body, id)
    return c.json(updated)
  })

  router.delete('/:id', async (c: Context) => {
    const id = c.req.param('id')
    const result = await orderStatusService.delete(id)
    return c.json(result)
  })

  router.delete('/safe-delete/:id', async (c: Context) => {
    const id = c.req.param('id')
    const result = await orderStatusService.safeDelete(id)
    return c.json(result)
  })

  return router
}
