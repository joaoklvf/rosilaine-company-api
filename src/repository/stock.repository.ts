import { EntityRepository, Repository } from "typeorm";
import { StockEntity } from "../database/entities/stock/stock.entity";

@EntityRepository(StockEntity)

export class StockRepository extends Repository<StockEntity> {

}