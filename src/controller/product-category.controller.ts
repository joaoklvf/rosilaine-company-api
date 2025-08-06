import { Hono } from 'hono'
import { Context } from 'hono'
import { ProductCategoryEntity } from '../database/entities/product/product-category.entity'
import { IProductCategoryService } from '../interfaces/product-category-service'

export const productCategoryController = (productCategoryService: IProductCategoryService) => {
  const router = new Hono()

  router.get('/', async (c: Context) => {
    try {
      const query = c.req.query()
      const data = await productCategoryService.index(query)
      return c.json(data, 200)
    } catch (error) {
      return c.json({ msg: error }, 500)
    }
  })

  router.post('/', async (c: Context) => {
    const body = await c.req.json<ProductCategoryEntity>()
    const newCategory = await productCategoryService.create(body)
    return c.json(newCategory)
  })

  router.put('/:id', async (c: Context) => {
    const id = c.req.param('id')
    const body = await c.req.json<ProductCategoryEntity>()
    const updated = await productCategoryService.update(body, id)
    return c.json(updated)
  })

  router.delete('/:id', async (c: Context) => {
    const id = c.req.param('id')
    const result = await productCategoryService.delete(id)
    return c.json(result)
  })

  router.delete('/safe-delete/:id', async (c: Context) => {
    const id = c.req.param('id')
    const result = await productCategoryService.safeDelete(id)
    return c.json(result)
  })

  return router
}
