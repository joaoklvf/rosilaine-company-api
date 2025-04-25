import { Router, Response, Request } from "express";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../types/inversify-types";
import { OrderItemStatusEntity } from "../database/entities/order/order-item/order-item-status.entity";
import { IOrderItemStatusService } from "../interfaces/order-item-status-service";

@injectable()
export class OrderItemStatusController {
  public router: Router;

  constructor(
    @inject(INJECTABLE_TYPES.OrderItemStatusService) private orderItemStatusService: IOrderItemStatusService
  ) {
    this.router = Router();
    this.routes();
  }

  public index = async (req: Request, res: Response) => {
    await this.orderItemStatusService.index().then((data) => {
      return res.status(200).json(data);
    }).catch((error) => {
      return res.status(500).json({ msg: error });
    });
  }

  public create = async (req: Request, res: Response) => {
    const orderItemStatus = req['body'] as OrderItemStatusEntity;
    const newOrderItemStatus = await this.orderItemStatusService.create(orderItemStatus);
    res.send(newOrderItemStatus);
  }

  public update = async (req: Request, res: Response) => {
    const orderItemStatus = req['body'] as OrderItemStatusEntity;
    const id = req['params']['id'];

    res.send(await this.orderItemStatusService.update(orderItemStatus, id));
  }

  public delete = async (req: Request, res: Response) => {
    const id = req['params']['id'];
    res.send(await this.orderItemStatusService.delete(id));
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