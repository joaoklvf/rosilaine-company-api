import 'reflect-metadata'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import dotenv from 'dotenv'
import { DataSource } from 'typeorm'

// Importação dos controllers (funções que recebem o service e retornam o router)
import { customerController } from '../src/controller/customer.controller'
import { productController } from '../src/controller/product.controller'
import { orderController } from '../src/controller/order.controller'
import { orderStatusController } from '../src/controller/order-status.controller'
import { productCategoryController } from '../src/controller/product-category.controller'
import { stockController } from '../src/controller/stock.controller'
import { customerTagController } from '../src/controller/customer-tag.controller'
import { orderItemStatusController } from '../src/controller/order-item-status.controller'
import { orderItemController } from '../src/controller/order-item.controller'
import { orderInstallmentController } from '../src/controller/order-installment.controller'
import { homeController } from '../src/controller/home.controller'
import { endCustomerController } from '../src/controller/end-customer.controller'
import { customerInstallmentsController } from '../src/controller/customer-installments.controller'
import { CustomerInstallmentsService } from '../src/services/customer-installments.service'
import { CustomerTagService } from '../src/services/customer-tag.service'
import { CustomerService } from '../src/services/customer.service'
import { EndCustomerService } from '../src/services/end-customer.service'
import { HomeService } from '../src/services/home.service'
import { OrderInstallmentService } from '../src/services/order-installment.service'
import { OrderItemStatusService } from '../src/services/order-item-status.service'
import { OrderItemService } from '../src/services/order-item.service'
import { OrderStatusService } from '../src/services/order-status.service'
import { OrderService } from '../src/services/order.service'
import { ProductCategoryService } from '../src/services/product-category.service'
import { ProductService } from '../src/services/product.service'
import { StockService } from '../src/services/stock.service'

dotenv.config()

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [`${__dirname}/../**/*.entity.{js,ts}`],
  synchronize: true,
  name: process.env.DATABASE_NAME
})

const app = new Hono()

// Middleware CORS para todas as rotas
app.use('*', cors())

const startApp = async () => {
  try {
    await AppDataSource.initialize()

    // Instanciar os serviços (crie e ajuste conforme dependências reais)
    const orderStatusService = new OrderStatusService()
    const productCategoryService = new ProductCategoryService()
    const stockService = new StockService()
    const customerTagService = new CustomerTagService()
    const orderItemStatusService = new OrderItemStatusService()
    const orderItemService = new OrderItemService()
    const orderInstallmentService = new OrderInstallmentService()
    const homeService = new HomeService()
    const endCustomerService = new EndCustomerService()
    const customerInstallmentsService = new CustomerInstallmentsService()
    const customerService = new CustomerService(customerTagService)
    const productService = new ProductService(productCategoryService)
    const orderService = new OrderService(orderItemService, orderInstallmentService)

    // Criar routers dos controllers passando os services
    const customerRouter = customerController(customerService)
    const productRouter = productController(productService)
    const orderRouter = orderController(orderService)
    const orderStatusRouter = orderStatusController(orderStatusService)
    const productCategoryRouter = productCategoryController(productCategoryService)
    const stockRouter = stockController(stockService)
    const customerTagRouter = customerTagController(customerTagService)
    const orderItemStatusRouter = orderItemStatusController(orderItemStatusService)
    const orderItemRouter = orderItemController(orderItemService)
    const orderInstallmentRouter = orderInstallmentController(orderInstallmentService)
    const homeRouter = homeController(homeService)
    const endCustomerRouter = endCustomerController(endCustomerService)
    const customerInstallmentsRouter = customerInstallmentsController(customerInstallmentsService)

    // Montar as rotas principais
    app.route('/api/customers', customerRouter)
    app.route('/api/customers/:customerId/end-customers', endCustomerRouter)
    app.route('/api/customers/:customerId/installments', customerInstallmentsRouter)
    app.route('/api/customer-tags', customerTagRouter)
    app.route('/api/products', productRouter)
    app.route('/api/orders', orderRouter)
    app.route('/api/order-status', orderStatusRouter)
    app.route('/api/order-item-status', orderItemStatusRouter)
    app.route('/api/product-categories', productCategoryRouter)
    app.route('/api/stocks', stockRouter)
    app.route('/api/order-items', orderItemRouter)
    app.route('/api/order-installments', orderInstallmentRouter)
    app.route('/api/home', homeRouter)

    const port = Number(process.env.APP_PORT) || 3000
    serve({ fetch: app.fetch, port }, () => {
      console.log(`✅ Server running on http://localhost:${port}`)
    })
  } catch (error) {
    console.error('Error starting server:', error)
  }
}

startApp()
