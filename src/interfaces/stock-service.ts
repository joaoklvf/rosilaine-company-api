import { StockEntity } from "../database/entities/stock/stock.entity";
import { IRepoService } from "./repo-service";

export interface IStockService extends IRepoService<StockEntity> { }
