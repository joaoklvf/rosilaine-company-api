import { Router, Response, Request } from "express";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../types/inversify-types";
import { CustomerTagEntity } from "../database/entities/customer/customer-tag.entity";
import { ICustomerTagService } from "../interfaces/customer-tag-service";

@injectable()
export class CustomerTagController {
  public router: Router;

  constructor(
    @inject(INJECTABLE_TYPES.CustomerTagService) private customerTagService: ICustomerTagService
  ) {
    this.router = Router();
    this.routes();
  }

  public index = async (req: Request, res: Response) => {
    await this.customerTagService.index(req.query).then((data) => {
      return res.status(200).json(data);
    }).catch((error) => {
      return res.status(500).json({ msg: error });
    });
  }

  public create = async (req: Request, res: Response) => {
    const customerTag = req['body'] as CustomerTagEntity;
    const newCustomerTag = await this.customerTagService.create(customerTag);
    res.send(newCustomerTag);
  }

  public update = async (req: Request, res: Response) => {
    const customerTag = req['body'] as CustomerTagEntity;
    const id = req['params']['id'];

    res.send(await this.customerTagService.update(customerTag, id));
  }

  public delete = async (req: Request, res: Response) => {
    const id = req['params']['id'];
    res.send(await this.customerTagService.delete(id));
  }

  public safeDelete = async (req: Request, res: Response) => {
    const id = req['params']['id'];
    res.send(await this.customerTagService.safeDelete(id));
  }

  /**
   * Configure the routes of controller
   */
  public routes() {
    this.router.get('/', this.index);
    this.router.post('/', this.create);
    this.router.put('/:id', this.update);
    this.router.delete('/:id', this.delete);
    this.router.delete('/safe-delete/:id', this.safeDelete);
  }
}