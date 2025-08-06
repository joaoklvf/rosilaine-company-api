import { Hono } from 'hono'
import { Context } from 'hono'
import { ProductEntity } from '../database/entities/product/product.entity'
import { IProductService } from '../interfaces/product-service'

export const productController = (productService: IProductService) => {
  const router = new Hono()

  router.get('/', async (c: Context) => {
    try {
      const query = c.req.query()
      const data = await productService.index(query)
      return c.json(data, 200)
    } catch (error) {
      return c.json({ msg: error }, 500)
    }
  })

  router.post('/', async (c: Context) => {
    const body = await c.req.json<ProductEntity>()
    const newProduct = await productService.create(body)
    return c.json(newProduct)
  })

  router.put('/:id', async (c: Context) => {
    const id = c.req.param('id')
    const body = await c.req.json<ProductEntity>()
    const updated = await productService.update(body, id)
    return c.json(updated)
  })

  router.delete('/:id', async (c: Context) => {
    const id = c.req.param('id')
    const result = await productService.delete(id)
    return c.json(result)
  })

  router.delete('/safe-delete/:id', async (c: Context) => {
    const id = c.req.param('id')
    const result = await productService.safeDelete(id)
    return c.json(result)
  })

  return router
}
