import 'reflect-metadata';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { AppDataSource } from '../src/data-source';
import { customerInstallmentsController } from '../src/controller/customer-installments.controller';
import { customerTagController } from '../src/controller/customer-tag.controller';
import { customerController } from '../src/controller/customer.controller';
import { endCustomerController } from '../src/controller/end-customer.controller';
import { homeController } from '../src/controller/home.controller';
import { orderInstallmentController } from '../src/controller/order-installment.controller';
import { orderItemStatusController } from '../src/controller/order-item-status.controller';
import { orderItemController } from '../src/controller/order-item.controller';
import { orderStatusController } from '../src/controller/order-status.controller';
import { orderController } from '../src/controller/order.controller';
import { productCategoryController } from '../src/controller/product-category.controller';
import { productController } from '../src/controller/product.controller';
import { stockController } from '../src/controller/stock.controller';
import { CustomerInstallmentsService } from '../src/services/customer-installments.service';
import { CustomerTagService } from '../src/services/customer-tag.service';
import { CustomerService } from '../src/services/customer.service';
import { EndCustomerService } from '../src/services/end-customer.service';
import { HomeService } from '../src/services/home.service';
import { OrderInstallmentService } from '../src/services/order-installment.service';
import { OrderItemStatusService } from '../src/services/order-item-status.service';
import { OrderItemService } from '../src/services/order-item.service';
import { OrderStatusService } from '../src/services/order-status.service';
import { OrderService } from '../src/services/order.service';
import { ProductCategoryService } from '../src/services/product-category.service';
import { ProductService } from '../src/services/product.service';
import { StockService } from '../src/services/stock.service';
import { serve } from '@hono/node-server';

const app = new Hono();
app.use('*', cors());

// Middleware para garantir que o banco esteja inicializado
app.use(async (_, next) => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize()
  }
  await next()
});

// Instanciar serviços e montar rotas
const orderStatusService = new OrderStatusService();
const productCategoryService = new ProductCategoryService();
const stockService = new StockService();
const customerTagService = new CustomerTagService();
const orderItemStatusService = new OrderItemStatusService();
const orderItemService = new OrderItemService();
const orderInstallmentService = new OrderInstallmentService();
const homeService = new HomeService();
const endCustomerService = new EndCustomerService();
const customerInstallmentsService = new CustomerInstallmentsService();
const customerService = new CustomerService(customerTagService);
const productService = new ProductService(productCategoryService);
const orderService = new OrderService(orderItemService, orderInstallmentService);

app.route('/api/customers', customerController(customerService));
app.route('/api/customers/:customerId/end-customers', endCustomerController(endCustomerService));
app.route('/api/customers/:customerId/installments', customerInstallmentsController(customerInstallmentsService));
app.route('/api/customer-tags', customerTagController(customerTagService));
app.route('/api/products', productController(productService));
app.route('/api/orders', orderController(orderService));
app.route('/api/order-status', orderStatusController(orderStatusService));
app.route('/api/order-item-status', orderItemStatusController(orderItemStatusService));
app.route('/api/product-categories', productCategoryController(productCategoryService));
app.route('/api/stocks', stockController(stockService));
app.route('/api/order-items', orderItemController(orderItemService));
app.route('/api/order-installments', orderInstallmentController(orderInstallmentService));
app.route('/api/home', homeController(homeService));

if (process.env.NODE_ENV === 'development') {
  const port = Number(process.env.APP_PORT) || 3000;

  serve({ fetch: app.fetch, port }, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
  });
}

export default app;
