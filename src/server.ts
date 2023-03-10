import express, { Request, Response } from 'express';
import { createConnection } from "typeorm";
import cors from 'cors';
import { CustomerController } from './controller/customer.controller';
import { ProductController } from './controller/product.controller';
import dotenv from 'dotenv'
import { OrderController } from './controller/order.controller';
import { databaseConfig } from './database/database-config';
import { OrderStatusController } from './controller/order-status.controller';
import { ProductCategoryController } from './controller/product-category.controller';
import { StockController } from './controller/stock.controller';

class Server {
  private customerController: CustomerController;
  private productController: ProductController;
  private orderController: OrderController;
  private orderStatusController: OrderStatusController;
  private productCategoryController: ProductCategoryController;
  private stockController: StockController;

  private app: express.Application;

  constructor() {
    this.app = express(); // init the application
    this.configuration();
    this.routes();
  }

  /**
   * Method to configure the server,
   * If we didn't configure the port into the environment 
   * variables it takes the default port 3000
   */
  public configuration() {
    this.app.set('port', process.env.PORT || 3001);
    this.app.use(cors());
    this.app.use(express.json());
    dotenv.config();
  }

  /**
   * Method to configure the routes
   */
  public async routes() {
    await createConnection({
      type: "postgres",
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: "rosilaine-company",
      entities: ["build/database/entities/**/*.js"],
      synchronize: true,
      name: "rosilaine-company"
    }).catch(error => console.log(`Create connection error:${error}`));

    this.customerController = new CustomerController();
    this.productController = new ProductController();
    this.orderController = new OrderController();
    this.orderStatusController = new OrderStatusController();
    this.productCategoryController = new ProductCategoryController();
    this.stockController = new StockController();

    this.app.get("/", (_: Request, res: Response) => {
      res.send("<h1>Hello world!</h1>");
    });

    this.app.use(`/api/customers/`, this.customerController.router);
    this.app.use('/api/products/', this.productController.router);
    this.app.use('/api/orders/', this.orderController.router);
    this.app.use(`/api/order-status/`, this.orderStatusController.router);
    this.app.use('/api/product-categories/', this.productCategoryController.router);
    this.app.use('/api/stocks/', this.stockController.router);
  }

  /**
   * Used to start the server
   */
  public start() {
    this.app.listen(this.app.get('port'), () => {
      console.log(`Server is listening ${this.app.get('port')} port.`);
    });
  }
}

const server = new Server(); // Create server instance
server.start(); // Execute the server
