import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { DataSource } from "typeorm";
import { container } from '../src/inversify.config';

// Importações dos controllers
import { CustomerController } from '../src/controller/customer.controller';
import { ProductController } from '../src/controller/product.controller';
import { OrderController } from '../src/controller/order.controller';
import { OrderStatusController } from '../src/controller/order-status.controller';
import { ProductCategoryController } from '../src/controller/product-category.controller';
import { StockController } from '../src/controller/stock.controller';
import { CustomerTagController } from '../src/controller/customer-tag.controller';
import { OrderItemStatusController } from '../src/controller/order-item-status.controller';
import { OrderItemController } from '../src/controller/order-item.controller';
import { OrderInstallmentController } from '../src/controller/order-installment.controller';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [`${__dirname}/../**/*.entity.{js,ts}`],
  synchronize: true,
  name: process.env.DATABASE_NAME
});

const startApp = async () => {
  try {
    await AppDataSource.initialize().catch(error => console.log(`Erro ao inicializar data source: ${JSON.stringify(error)}`));

    // Obtendo controllers do container com dependências injetadas
    const customerController = container.get(CustomerController);
    const customerTagController = container.get(CustomerTagController);
    const productController = container.get(ProductController);
    const orderController = container.get(OrderController);
    const orderStatusController = container.get(OrderStatusController);
    const orderItemStatusController = container.get(OrderItemStatusController);
    const productCategoryController = container.get(ProductCategoryController);
    const stockController = container.get(StockController);
    const orderItemController = container.get(OrderItemController);
    const orderInstallmentController = container.get(OrderInstallmentController);

    app.use(`/api/customers/`, customerController.router);
    app.use(`/api/customer-tags/`, customerTagController.router);
    app.use('/api/products/', productController.router);
    app.use('/api/orders/', orderController.router);
    app.use(`/api/order-status/`, orderStatusController.router);
    app.use(`/api/order-item-status/`, orderItemStatusController.router);
    app.use('/api/product-categories/', productCategoryController.router);
    app.use('/api/stocks/', stockController.router);
    app.use('/api/order-items/', orderItemController.router);
    app.use('/api/order-installments/', orderInstallmentController.router);

    const port = process.env.APP_PORT;

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  }
  catch (error) {
    console.log(error)
  }
};

startApp();
