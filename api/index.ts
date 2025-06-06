import dotenv from 'dotenv';
import express from "express";
import { DataSource } from 'typeorm';

dotenv.config();

const app = express();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [`${__dirname}/src/database/entities/**/*.entity.{js,ts}`],
  synchronize: true,
  name: process.env.DATABASE_NAME
});

app.get("/", (req: any, res: any) => res.send("Express on Vercel"));

const port = process.env.APP_PORT;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;