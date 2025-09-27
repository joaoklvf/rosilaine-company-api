import { Hono, Context } from 'hono'
import { OrderItemEntity } from '../database/entities/order/order-item/order-item.entity'
import { GetByStatusRequestParams, IOrderItemService } from '../interfaces/order-item-service'

export const orderItemController = (orderItemService: IOrderItemService) => {
  const router = new Hono()

  router.get('/', async (c: Context) => {
    try {
      const query = c.req.query()
      const data = await orderItemService.index(query)
      return c.json(data, 200)
    } catch (error) {
      return c.json({ msg: error }, 500)
    }
  })

  router.get('/:id', async (c: Context) => {
    try {
      const param = c.req.param('id')
      const query = c.req.query();

      if (param === 'items-by-status') {
        const data = await orderItemService.getByStatus(query as unknown as GetByStatusRequestParams)
        return c.json(data, 200)
      }

      if (param === 'items-by-customer') {
        const data = await orderItemService.getByStatusAndCustomer(query as unknown as GetByStatusRequestParams)
        return c.json(data, 200)
      }

      const data = await orderItemService.get(param)
      return c.json(data, 200);
    } catch (error) {
      return c.json({ msg: error }, 500)
    }
  })

  router.post('/', async (c: Context) => {
    const body = await c.req.json<OrderItemEntity>()
    const newOrderItem = await orderItemService.create(body)
    return c.json(newOrderItem)
  })

  router.put('/:id', async (c: Context) => {
    try {
      if (c.req.path.includes('/many-status-change')) {
        const body = await c.req.json()
        return c.json(await orderItemService.changeManyStatus(body))
      }
      if (c.req.path.includes('/product-status-change')) {
        const body = await c.req.json()
        return c.json(await orderItemService.changeStatusByProduct(body))
      }
      const id = c.req.param('id')
      const body = await c.req.json()
      return c.json(await orderItemService.update(body, id));
    } catch (error) {
      return c.json({ msg: error }, 500)
    }
  })

  router.delete('/:id', async (c: Context) => {
    const id = c.req.param('id')
    const result = await orderItemService.delete(id)
    return c.json(result)
  })

  router.delete('/safe-delete/:id', async (c: Context) => {
    const id = c.req.param('id')
    const result = await orderItemService.safeDelete(id)
    return c.json(result)
  })

  return router
}
