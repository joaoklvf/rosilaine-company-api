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
  entities: [CustomerEntity],
  url: process.env.DATABASE_URL
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