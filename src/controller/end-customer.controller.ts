import { Router, Response, Request } from "express";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../types/inversify-types";
import { EndCustomerEntity } from "../database/entities/customer/end-customer/customer.entity";
import { IEndCustomerService } from "../interfaces/end-customer-service";

@injectable()
export class EndCustomerController {
  public router: Router;

  constructor(
    @inject(INJECTABLE_TYPES.EndCustomerService) private customerService: IEndCustomerService
  ) {
    this.router = Router();
    this.routes();
  }

  public index = async (req: Request, res: Response) => {
    await this.customerService.index(req.query).then((data) => {
      return res.status(200).json(data);
    }).catch((error) => {
      return res.status(500).json({ msg: error });
    });
  }

  public create = async (req: Request, res: Response) => {
    const customer = req['body'] as EndCustomerEntity;
    const newEndCustomer = await this.customerService.create(customer);
    res.send(newEndCustomer);
  }

  public update = async (req: Request, res: Response) => {
    const customer = req['body'] as EndCustomerEntity;
    const id = req['params']['id'];

    res.send(await this.customerService.update(customer, id));
  }

  public delete = async (req: Request, res: Response) => {
    const id = req['params']['id'];
    res.send(await this.customerService.delete(id));
  }

  public safeDelete = async (req: Request, res: Response) => {
    const id = req['params']['id'];
    res.send(await this.customerService.safeDelete(id));
  }

  public get = async (req: Request, res: Response) => {
    const id = req['params']['id'];
    await this.customerService.get(id).then((data) => {
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
    this.router.delete('/:id', this.delete);
    this.router.delete('/safe-delete/:id', this.safeDelete);
  }
}