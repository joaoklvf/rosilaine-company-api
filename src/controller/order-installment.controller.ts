import { Hono, Context } from 'hono'
import { OrderInstallmentEntity } from '../database/entities/order/order-installment.entity'
import { IOrderInstallmentService } from '../interfaces/order-installment-service'

export const orderInstallmentController = (orderInstallmentService: IOrderInstallmentService) => {
  const router = new Hono()

  router.get('/', async (c: Context) => {
    try {
      const query = c.req.query()
      const data = await orderInstallmentService.index(query)
      return c.json(data, 200)
    } catch (error) {
      return c.json({ msg: error }, 500)
    }
  })

  router.get('/:id', async (c: Context) => {
    try {
      const id = c.req.param('id')
      const data = await orderInstallmentService.get(id)
      return c.json(data, 200)
    } catch (error) {
      return c.json({ msg: error }, 500)
    }
  })

  router.post('/', async (c: Context) => {
    const body = await c.req.json<OrderInstallmentEntity>()
    const newOrderInstallment = await orderInstallmentService.create(body)
    return c.json(newOrderInstallment, 200)
  })

  router.put('/:id', async (c: Context) => {
    try {
      const id = c.req.param('id')
      const body = await c.req.json<OrderInstallmentEntity>()
      const updated = await orderInstallmentService.update(body, id)
      return c.json(updated, 200)
    } catch (error) {
      return c.json({ msg: error }, 500)
    }
  })

  router.delete('/:id', async (c: Context) => {
    const id = c.req.param('id')
    const result = await orderInstallmentService.delete(id)
    return c.json(result, 200)
  })

  router.delete('/safe-delete/:id', async (c: Context) => {
    const id = c.req.param('id')
    const result = await orderInstallmentService.safeDelete(id)
    return c.json(result, 200)
  })

  return router
}
