import { ConnectionOptions } from "typeorm";

export const databaseConfig: ConnectionOptions = {
  type: "postgres",
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: "rosilaine-company",
  entities: ["build/database/entities/**/*.js"],
  synchronize: true,
  name: process.env.DATABASE_NAME
}