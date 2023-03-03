import { Router, Response, Request } from "express";
import { CustomerEntity } from "../database/entities/customer/customer.entity";
import { CustomerService } from "../services/customer.service"; // import service

export class CustomerController {
  public router: Router;
  private customerService: CustomerService;

  constructor() {
    this.customerService = new CustomerService(); // Create a new instance of PostController
    this.router = Router();
    this.routes();
  }

  public index = async (req: Request, res: Response) => {
    await this.customerService.index().then((data) => {
      return res.status(200).json(data);
    }).catch((error) => {
      return res.status(500).json({ msg: error });
    });
  }

  public create = async (req: Request, res: Response) => {
    const customer = req['body'] as CustomerEntity;
    const newCustomer = await this.customerService.create(customer);
    res.send(newCustomer);
  }

  public update = async (req: Request, res: Response) => {
    const customer = req['body'] as CustomerEntity;
    const id = req['params']['id'];

    res.send(this.customerService.update(customer, Number(id)));
  }

  public delete = async (req: Request, res: Response) => {
    const id = req['params']['id'];
    res.send(this.customerService.delete(Number(id)));
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