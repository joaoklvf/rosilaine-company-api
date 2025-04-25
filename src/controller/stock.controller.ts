import { Router, Response, Request } from "express";
import { StockEntity } from "../database/entities/stock/stock.entity";
import { IStockService } from "../interfaces/stock-service";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../types/inversify-types";

@injectable()
export class StockController {
  public router: Router;

  constructor(
    @inject(INJECTABLE_TYPES.StockService) private stockService: IStockService
  ) {
    this.router = Router();
    this.routes();
  }

  public index = async (req: Request, res: Response) => {
    await this.stockService.index().then((data) => {
      return res.status(200).json(data);
    }).catch((error) => {
      return res.status(500).json({ msg: error });
    });
  }

  public create = async (req: Request, res: Response) => {
    const stock = req['body'] as StockEntity;
    const newStock = await this.stockService.create(stock);
    res.send(newStock);
  }

  public update = async (req: Request, res: Response) => {
    const stock = req['body'] as StockEntity;
    const id = req['params']['id'];

    res.send(await this.stockService.update(stock, id));
  }

  public delete = async (req: Request, res: Response) => {
    const id = req['params']['id'];
    res.send(await this.stockService.delete(id));
  }

  /**
   * Configure the routes of controller
   */
  public routes() {
    this.router.get('/', this.index);
    this.router.post('/', this.create);
    this.router.put('/:id', this.update);
    this.router.delete('/:id', this.delete);
  }
}