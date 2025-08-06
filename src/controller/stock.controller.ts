import { Hono } from 'hono'
import { Context } from 'hono'
import { StockEntity } from '../database/entities/stock/stock.entity'
import { IStockService } from '../interfaces/stock-service'

export const stockController = (stockService: IStockService) => {
  const router = new Hono()

  router.get('/', async (c: Context) => {
    try {
      const query = c.req.query()
      const data = await stockService.index(query)
      return c.json(data, 200)
    } catch (error) {
      return c.json({ msg: error }, 500)
    }
  })

  router.post('/', async (c: Context) => {
    const body = await c.req.json<StockEntity>()
    const newStock = await stockService.create(body)
    return c.json(newStock)
  })

  router.put('/:id', async (c: Context) => {
    const id = c.req.param('id')
    const body = await c.req.json<StockEntity>()
    const updated = await stockService.update(body, id)
    return c.json(updated)
  })

  router.delete('/:id', async (c: Context) => {
    const id = c.req.param('id')
    const result = await stockService.delete(id)
    return c.json(result)
  })

  router.delete('/safe-delete/:id', async (c: Context) => {
    const id = c.req.param('id')
    const result = await stockService.safeDelete(id)
    return c.json(result)
  })

  return router
}
