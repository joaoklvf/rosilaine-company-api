import dotenv from 'dotenv';
import express from "express";
import { DataSource } from 'typeorm';
import { CustomerController } from '../src/controller/customer.controller';
import cors from 'cors';
import { container } from '../src/inversify.config';
import { CustomerEntity } from '../src/database/entities/customer/customer.entity';

dotenv.config();

const app = express();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [CustomerEntity],
  synchronize: true,
  name: process.env.DATABASE_NAME
});
app.use(cors());
app.use(express.json());
app.get("/", (req: any, res: any) => res.send("Express on Vercel"));
AppDataSource.initialize().catch(error => console.error(`Erro ao inicializar data source: ${JSON.stringify(error)}`));

const customerController = container.get(CustomerController);
app.use(`/api/customers/`, customerController.router);

const port = process.env.APP_PORT;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;