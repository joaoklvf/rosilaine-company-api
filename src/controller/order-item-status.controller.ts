import { Hono } from 'hono'
import { Context } from 'hono'
import { OrderItemStatusEntity } from '../database/entities/order/order-item/order-item-status.entity'
import { IOrderItemStatusService } from '../interfaces/order-item-status-service'

export const orderItemStatusController = (orderItemStatusService: IOrderItemStatusService) => {
  const router = new Hono()

  router.get('/', async (c: Context) => {
    try {
      const query = c.req.query()
      const data = await orderItemStatusService.index(query)
      return c.json(data, 200)
    } catch (error) {
      return c.json({ msg: error }, 500)
    }
  })

  router.post('/', async (c: Context) => {
    const body = await c.req.json<OrderItemStatusEntity>()
    const newStatus = await orderItemStatusService.create(body)
    return c.json(newStatus)
  })

  router.put('/:id', async (c: Context) => {
    const id = c.req.param('id')
    const body = await c.req.json<OrderItemStatusEntity>()
    const updated = await orderItemStatusService.update(body, id)
    return c.json(updated)
  })

  router.delete('/:id', async (c: Context) => {
    const id = c.req.param('id')
    const result = await orderItemStatusService.delete(id)
    return c.json(result)
  })

  router.delete('/safe-delete/:id', async (c: Context) => {
    const id = c.req.param('id')
    const result = await orderItemStatusService.safeDelete(id)
    return c.json(result)
  })

  return router
}
