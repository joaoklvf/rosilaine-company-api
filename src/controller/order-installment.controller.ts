import { Router, Response, Request } from "express";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../types/inversify-types";
import { OrderInstallmentEntity } from "../database/entities/order/order-installment.entity";
import { IOrderInstallmentService } from "../interfaces/order-installment-service";

@injectable()
export class OrderInstallmentController {
  public router: Router;

  constructor(
    @inject(INJECTABLE_TYPES.OrderInstallmentService) private orderInstallmentService: IOrderInstallmentService
  ) {
    this.router = Router();
    this.routes();
  }

  public index = async (req: Request, res: Response) => {
    await this.orderInstallmentService.index(req.query).then((data) => {
      return res.status(200).json(data);
    }).catch((error) => {
      return res.status(500).json({ msg: error });
    });
  }

  public create = async (req: Request, res: Response) => {
    const orderInstallment = req['body'] as OrderInstallmentEntity;
    const newOrderInstallment = await this.orderInstallmentService.create(orderInstallment);
    res.send(newOrderInstallment);
  }

  public update = async (req: Request, res: Response) => {
    const orderInstallment = req['body'] as OrderInstallmentEntity;
    const id = req['params']['id'];

    this.orderInstallmentService.update(orderInstallment, id).then(orderInstallment => {
      return res.send(orderInstallment);
    }).catch(error => {
      return res.send(error);
    })
  }

  public updateMany = async (req: Request, res: Response) => {
    const orderInstallments = req['body'] as OrderInstallmentEntity[];

    this.orderInstallmentService.updateMany(orderInstallments).then(orderInstallments => {
      return res.send(orderInstallments);
    }).catch(error => {
      return res.send(error);
    })
  }

  public delete = async (req: Request, res: Response) => {
    const id = req['params']['id'];
    res.send(await this.orderInstallmentService.delete(id));
  }

  public get = async (req: Request, res: Response) => {
    const id = req['params']['id'];
    await this.orderInstallmentService.get(id).then((data) => {
      return res.status(200).json(data);
    }).catch((error) => {
      return res.status(500).json({ msg: error });
    });
  }

  /**
   * Configure the routes of controller
   */
  public routes() {
    this.router.get('/', this.index);
    this.router.get('/:id', this.get);
    this.router.post('/', this.create);
    this.router.put('/:id', this.update);
    this.router.put('/', this.updateMany);
    this.router.delete('/:id', this.delete);
  }
}