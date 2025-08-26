import { Hono, Context } from 'hono'
import { IHomeService } from '../interfaces/home-service'

export const homeController = (homeService: IHomeService) => {
  const router = new Hono()

  router.get('/installments/next', async (c: Context) => {
    try {
      const query = c.req.query() ?? {}
      const data = await homeService.nextInstallments(query)
      return c.json(data, 200)
    } catch (error) {
      return c.json({ msg: error }, 500)
    }
  })

  router.get('/installments/overdue', async (c: Context) => {
    try {
      const query = c.req.query() ?? {}
      const data = await homeService.overdueInstallments(query)
      return c.json(data, 200)
    } catch (error) {
      return c.json({ msg: error }, 500)
    }
  })

  router.get('/installments/balance', async (c: Context) => {
    try {
      const query = c.req.query() ?? {}
      const data = await homeService.installmentsBalance(query)
      return c.json(data, 200)
    } catch (error) {
      return c.json({ msg: error }, 500)
    }
  })

  return router
}
