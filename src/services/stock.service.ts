import { StockEntity } from '../database/entities/stock/stock.entity';
import { StockRepository } from '../database/repository/stock.repository';
import { AppDataSource } from '../../api';
import { IStockService } from '../interfaces/stock-service';
import { injectable } from 'inversify';
import { ILike } from 'typeorm';
import { DescriptionFilter } from '../interfaces/filters/product-filter';

@injectable()
export class StockService implements IStockService {
  private stockRepository: StockRepository;

  constructor() {
    this.stockRepository = AppDataSource.getRepository(StockEntity);
  }

  public index = async ({ description, offset, take }: DescriptionFilter) => {
    let skip = 0;
    if (take && offset)
      skip = take * offset;

    const stocks = await this.stockRepository.findAndCount({
      where: {
        description: ILike(`%${description ?? ''}%`),
        isDeleted: false
      },
      order: {
        description: 'ASC'
      },
      take,
      skip
    });

    return stocks;
  }

  public create = async (stock: StockEntity) => {
    const newStock = await this.stockRepository.save(stock);
    return newStock;
  }

  public update = async (stock: StockEntity, id: string) => {
    const updatedStock = await this.stockRepository.update(id, stock);
    return updatedStock.affected ? stock : null;
  }

  public delete = async (id: string) => {
    const deletedStock = await this.stockRepository.delete(id);
    return deletedStock;
  }

  public safeDelete = async (id: string) => {
    const deletedStock = await this.stockRepository
      .createQueryBuilder()
      .from(StockEntity, 'stock')
      .update({ isDeleted: true })
      .where('id = :id', { id })
      .execute();

    return deletedStock;
  }

  public get = async (id: string) => {
    const stock = await this.stockRepository.findOne({
      where: {
        id
      }
    });

    return stock;
  }
}