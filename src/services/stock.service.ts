import { StockEntity } from '../database/entities/stock/stock.entity';
import { StockRepository } from '../repository/stock.repository';
import { AppDataSource } from '..';
import { IStockService } from '../interfaces/stock-service';

export class StockService implements IStockService {
  private stockRepository: StockRepository;

  constructor() {
    this.stockRepository = AppDataSource.getRepository(StockEntity);
  }

  public index = async () => {
    const stocks = await this.stockRepository.find()
    return stocks;
  }

  public create = async (stock: StockEntity) => {
    const newStock = await this.stockRepository.save(stock);
    return newStock;
  }

  public update = async (stock: StockEntity, id: number) => {
    const updatedStock = await this.stockRepository.update(id, stock);
    return updatedStock.affected ? stock : null;
  }

  public delete = async (id: number) => {
    const deletedStock = await this.stockRepository.delete(id);
    return deletedStock;
  }
}