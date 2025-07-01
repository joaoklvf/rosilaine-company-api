import { Router, Response, Request } from "express";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../types/inversify-types";
import { OrderItemEntity } from "../database/entities/order/order-item/order-item.entity";
import { GetByStatusRequestParams, IOrderItemService } from "../interfaces/order-item-service";

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
    var message;
    if (req.path === '/many-status-change') {
      await this.orderItemService.changeManyStatus(req['body']).then(requestBody => {
        message = (requestBody);
      }).catch(error => {
        message = (error);
      })
    }
    const requestBody = req['body'];
    const id = req.params.id;

    await this.orderItemService.update(requestBody, id).then(orderItemItem => {
      message = (orderItemItem);
    }).catch(error => {
      message = (error);
    })

    return res.send(message)
  }

  public delete = async (req: Request, res: Response) => {
    const id = req['params']['id'];
    res.send(await this.orderItemService.delete(id));
  }

  public get = async (req: Request, res: Response) => {
    if (typeof req.query === 'string') {
      await this.orderItemService.get(req.params.id).then((data) => {
        return res.status(200).json(data);
      }).catch((error) => {
        return res.status(500).json({ msg: error });
      });
    }
    await this.orderItemService.getByStatus(req.query as unknown as GetByStatusRequestParams).then((data) => {
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