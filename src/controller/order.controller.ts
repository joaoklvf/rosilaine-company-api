import { Router, Response, Request } from "express";
import { OrderEntity } from "../database/entities/order/order.entity";
import { OrderService } from "../services/order.service"; // import service

export class OrderController {
  public router: Router;
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService(); // Create a new instance of PostController
    this.router = Router();
    this.routes();
  }

  public index = async (req: Request, res: Response) => {
    await this.orderService.index().then((data) => {
      return res.status(200).json(data);
    }).catch((error) => {
      return res.status(500).json({ msg: error });
    });
  }

  public create = async (req: Request, res: Response) => {
    const order = req['body'] as OrderEntity;
    const newCustomer = await this.orderService.create(order);
    res.send(newCustomer);
  }

  public update = async (req: Request, res: Response) => {
    const order = req['body'] as OrderEntity;
    const id = req['params']['id'];

    res.send(this.orderService.update(order, Number(id)));
  }

  public delete = async (req: Request, res: Response) => {
    const id = req['params']['id'];
    res.send(this.orderService.delete(Number(id)));
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