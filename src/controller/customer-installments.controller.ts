import { Request, Response, Router } from "express";
import { inject, injectable } from "inversify";
import { INJECTABLE_TYPES } from "../types/inversify-types";
import { ICustomerInstallmentsService } from "../interfaces/customer-installments-service";

@injectable()
export class CustomerInstallmentsController {
  public router: Router;

  constructor(
    @inject(INJECTABLE_TYPES.CustomerInstallmentsService) private customerInstallmentsService: ICustomerInstallmentsService
  ) {
    this.router = Router();
    this.routes();
  }

  public nextInstallments = async (req: Request, res: Response) => {
    await this.customerInstallmentsService.nextInstallments(req.query).then((data) => {
      return res.status(200).json(data);
    }).catch((error) => {
      return res.status(500).json({ msg: error });
    });
  }

  public overdueInstallments = async (req: Request, res: Response) => {
    await this.customerInstallmentsService.overdueInstallments(req.query).then((data) => {
      return res.status(200).json(data);
    }).catch((error) => {
      return res.status(500).json({ msg: error });
    });
  }

  public installmentsBalance = async (req: Request, res: Response) => {
    await this.customerInstallmentsService.installmentsBalance(req.query).then((data) => {
      return res.status(200).json(data);
    }).catch((error) => {
      return res.status(500).json({ msg: error });
    });
  }

  /**
   * Configure the routes of controller
   */
  public routes() {
    this.router.get('/next', this.nextInstallments);
    this.router.get('/overdue', this.overdueInstallments);
    this.router.get('/balance', this.installmentsBalance);
  }
}