import { Hono } from 'hono'
import { Context } from 'hono'
import { OrderEntity } from '../database/entities/order/order.entity'
import { IOrderService } from '../interfaces/order-service'

export const orderController = (orderService: IOrderService) => {
  const router = new Hono()

  router.get('/', async (c: Context) => {
    try {
      const query = c.req.query()
      const data = await orderService.index(query)
      return c.json(data, 200)
    } catch (error) {
      return c.json({ msg: error }, 500)
    }
  })

  router.get('/:id', async (c: Context) => {
    try {
      const id = c.req.param('id')
      const data = await orderService.get(id)
      return c.json(data, 200)
    } catch (error) {
      return c.json({ msg: error }, 500)
    }
  })

  router.post('/', async (c: Context) => {
    const body = await c.req.json<OrderEntity>()
    const newOrder = await orderService.create(body)
    return c.json(newOrder)
  })

  router.put('/:id', async (c: Context) => {
    try {
      const id = c.req.param('id')
      const body = await c.req.json<OrderEntity>()
      const updated = await orderService.update(body, id)
      return c.json(updated)
    } catch (error) {
      return c.json({ msg: error }, 500)
    }
  })

  router.delete('/:id', async (c: Context) => {
    const id = c.req.param('id')
    const result = await orderService.delete(id)
    return c.json(result)
  })

  router.delete('/safe-delete/:id', async (c: Context) => {
    const id = c.req.param('id')
    const result = await orderService.safeDelete(id)
    return c.json(result)
  })

  return router
}
