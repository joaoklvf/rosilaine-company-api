import { Repository } from "typeorm";
import { StockEntity } from "../database/entities/stock/stock.entity";

export class StockRepository extends Repository<StockEntity> {

}