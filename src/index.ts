import express from 'express';
import { DataSource } from "typeorm";
import cors from 'cors';
import { CustomerController } from './controller/customer.controller';
import { ProductController } from './controller/product.controller';
import dotenv from 'dotenv'
import { OrderController } from './controller/order.controller';
import { OrderStatusController } from './controller/order-status.controller';
import { ProductCategoryController } from './controller/product-category.controller';
import { StockController } from './controller/stock.controller';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
dotenv.config();

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: ["build/database/entities/**/*.js"],
  synchronize: true,
  name: process.env.DATABASE_NAME
});

const startApp = async () => {
  await AppDataSource.initialize().catch(error => console.log(`Erro bolado: ${JSON.stringify(error)}`));

  const customerController = new CustomerController();
  const productController = new ProductController();
  const orderController = new OrderController();
  const orderStatusController = new OrderStatusController();
  const productCategoryController = new ProductCategoryController();
  const stockController = new StockController();

  app.use(`/api/customers/`, customerController.router);
  app.use('/api/products/', productController.router);
  app.use('/api/orders/', orderController.router);
  app.use(`/api/order-status/`, orderStatusController.router);
  app.use('/api/product-categories/', productCategoryController.router);
  app.use('/api/stocks/', stockController.router);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startApp();