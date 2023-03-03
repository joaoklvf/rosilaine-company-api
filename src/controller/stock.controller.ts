import { Router, Response, Request } from "express";
import { StockEntity } from "../database/entities/stock/stock.entity";
import { StockService } from "../services/stock.service"; // import service

export class StockController {
  public router: Router;
  private stockService: StockService;

  constructor() {
    this.stockService = new StockService(); // Create a new instance of PostController
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

    res.send(this.stockService.update(stock, Number(id)));
  }

  public delete = async (req: Request, res: Response) => {
    const id = req['params']['id'];
    res.send(this.stockService.delete(Number(id)));
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