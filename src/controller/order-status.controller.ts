import { Router, Response, Request } from "express";
import { OrderStatusEntity } from "../database/entities/order/order-status.entity";
import { IOrderStatusService } from "../interfaces/order-status-service";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../types/inversify-types";

@injectable()
export class OrderStatusController {
  public router: Router;

  constructor(
    @inject(INJECTABLE_TYPES.OrderStatusService) private orderStatusService: IOrderStatusService
  ) {
    this.router = Router();
    this.routes();
  }

  public index = async (req: Request, res: Response) => {
    await this.orderStatusService.index(req.query).then((data) => {
      return res.status(200).json(data);
    }).catch((error) => {
      return res.status(500).json({ msg: error });
    });
  }

  public create = async (req: Request, res: Response) => {
    const orderStatus = req['body'] as OrderStatusEntity;
    const newOrderStatus = await this.orderStatusService.create(orderStatus);
    res.send(newOrderStatus);
  }

  public update = async (req: Request, res: Response) => {
    const orderStatus = req['body'] as OrderStatusEntity;
    const id = req['params']['id'];

    res.send(await this.orderStatusService.update(orderStatus, id));
  }

  public delete = async (req: Request, res: Response) => {
    const id = req['params']['id'];
    res.send(await this.orderStatusService.delete(id));
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