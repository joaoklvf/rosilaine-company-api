import { Hono, Context } from 'hono'
import { OrderEntity } from '../database/entities/order/order.entity'
import { IOrderService } from '../interfaces/order-service'
import { OrderRequest } from '../interfaces/models/order/order-request'
import { OrderInstallmentEntity } from '../database/entities/order/order-installment.entity'
import { IOrderInstallmentService } from '../interfaces/order-installment-service'

export const orderController = (orderService: IOrderService, orderInstallmentService: IOrderInstallmentService) => {
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

  router.post('/:id/recreate-installments', async (c: Context) => {
    const id = c.req.param('id')
    const body = await c.req.json<OrderRequest>()
    const newOrder = await orderService.recreateInstallments(body, id)
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

  router.put('/:id/update-installments', async (c: Context) => {
    try {
      const body = await c.req.json<OrderInstallmentEntity[]>()
      const updated = await orderInstallmentService.updateMany(body)
      return c.json(updated, 200)
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
