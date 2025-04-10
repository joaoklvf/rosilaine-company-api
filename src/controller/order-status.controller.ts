import { Router, Response, Request } from "express";
import { OrderStatusEntity } from "../database/entities/order/order-status.entity";
import { IOrderStatusService } from "../interfaces/order-status-service";
import { orderStatusServiceId } from "../inversify.config";
import { inject, injectable } from "inversify";

@injectable()
export class OrderStatusController {
  public router: Router;

  constructor(
    @inject(orderStatusServiceId) private orderStatusService: IOrderStatusService
  ) {
    this.router = Router();
    this.routes();
  }

  public index = async (req: Request, res: Response) => {
    await this.orderStatusService.index().then((data) => {
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

    res.send(this.orderStatusService.update(orderStatus, Number(id)));
  }

  public delete = async (req: Request, res: Response) => {
    const id = req['params']['id'];
    res.send(this.orderStatusService.delete(Number(id)));
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