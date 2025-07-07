import { Request, Response, Router } from "express";
import { inject, injectable } from "inversify";
import { OrderEntity } from "../database/entities/order/order.entity";
import { IOrderService } from "../interfaces/order-service";
import { INJECTABLE_TYPES } from "../types/inversify-types";

@injectable()
export class OrderController {
  public router: Router;

  constructor(
    @inject(INJECTABLE_TYPES.OrderService) private orderService: IOrderService
  ) {
    this.router = Router();
    this.routes();
  }

  public index = async (req: Request, res: Response) => {
    await this.orderService.index(req.query).then((data) => {
      return res.status(200).json(data);
    }).catch((error) => {
      return res.status(500).json({ msg: error });
    });
  }

  public create = async (req: Request, res: Response) => {
    const order = req['body'] as OrderEntity;
    const newOrder = await this.orderService.create(order);
    res.send(newOrder);
  }

  public update = async (req: Request, res: Response) => {
    const order = req['body'] as OrderEntity;
    const id = req['params']['id'];

    this.orderService.update(order, id).then(order => {
      return res.send(order);
    }).catch(error => {
      return res.send(error);
    })
  }

  public delete = async (req: Request, res: Response) => {
    const id = req['params']['id'];
    res.send(await this.orderService.delete(id));
  }

  public get = async (req: Request, res: Response) => {
    const id = req['params']['id'];
    await this.orderService.get(id).then((data) => {
      return res.status(200).json(data);
    }).catch((error) => {
      return res.status(500).json({ msg: error });
    });
  }

  public safeDelete = async (req: Request, res: Response) => {
    const id = req['params']['id'];
    res.send(await this.orderService.safeDelete(id));
  }

  /**
   * Configure the routes of controller
   */
  public routes() {
    this.router.get('/', this.index);
    this.router.get('/:id', this.get);
    this.router.post('/', this.create);
    this.router.put('/:id', this.update);
    this.router.delete('/:id', this.delete);
    this.router.delete('/safe-delete/:id', this.safeDelete);
  }
}
