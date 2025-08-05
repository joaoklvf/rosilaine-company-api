import { Hono } from 'hono'
import { Context } from 'hono'
import { ICustomerInstallmentsService } from '../interfaces/customer-installments-service'

export const customerInstallmentsController = (customerInstallmentsService: ICustomerInstallmentsService) => {
  const router = new Hono()

  router.get('/next', async (c: Context) => {
    try {
      const data = await customerInstallmentsService.nextInstallments(c.req.query())
      return c.json(data, 200)
    } catch (error) {
      return c.json({ msg: error }, 500)
    }
  })

  router.get('/overdue', async (c: Context) => {
    try {
      const data = await customerInstallmentsService.overdueInstallments(c.req.query())
      return c.json(data, 200)
    } catch (error) {
      return c.json({ msg: error }, 500)
    }
  })

  router.get('/balance', async (c: Context) => {
    try {
      const data = await customerInstallmentsService.installmentsBalance(c.req.query())
      return c.json(data, 200)
    } catch (error) {
      return c.json({ msg: error }, 500)
    }
  })

  router.get('/monthly', async (c: Context) => {
    try {
      const data = await customerInstallmentsService.customerMonthInstallments(c.req.query())
      return c.json(data, 200)
    } catch (error) {
      return c.json({ msg: error }, 500)
    }
  })

  return router
}
