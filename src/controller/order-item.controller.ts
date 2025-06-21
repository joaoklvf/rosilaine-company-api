import { Router, Response, Request } from "express";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../types/inversify-types";
import { OrderItemEntity } from "../database/entities/order/order-item/order-item.entity";
import { IOrderItemService } from "../interfaces/order-item-service";

@injectable()
export class OrderItemController {
  public router: Router;

  constructor(
    @inject(INJECTABLE_TYPES.OrderItemService) private orderItemService: IOrderItemService
  ) {
    this.router = Router();
    this.routes();
  }

  public index = async (req: Request, res: Response) => {
    await this.orderItemService.index(req.query).then((data) => {
      return res.status(200).json(data);
    }).catch((error) => {
      return res.status(500).json({ msg: error });
    });
  }

  public create = async (req: Request, res: Response) => {
    const orderItemItem = req['body'] as OrderItemEntity;
    const newOrderItem = await this.orderItemService.create(orderItemItem);
    res.send(newOrderItem);
  }

  public update = async (req: Request, res: Response) => {
    const orderItemItem = req['body'] as OrderItemEntity;
    const id = req['params']['id'];

    this.orderItemService.update(orderItemItem, id).then(orderItemItem => {
      return res.send(orderItemItem);
    }).catch(error => {
      return res.send(error);
    })
  }

  public delete = async (req: Request, res: Response) => {
    const id = req['params']['id'];
    res.send(await this.orderItemService.delete(id));
  }

  public get = async (req: Request, res: Response) => {
    const id = req['params']['id'];
    await this.orderItemService.get(id).then((data) => {
      return res.status(200).json(data);
    }).catch((error) => {
      return res.status(500).json({ msg: error });
    });
  }

  public safeDelete = async (req: Request, res: Response) => {
    const id = req['params']['id'];
    res.send(await this.orderItemService.safeDelete(id));
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