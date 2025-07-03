import { Request, Response, Router } from "express";
import { inject, injectable } from "inversify";
import { IHomeService } from "../interfaces/home-service";
import { INJECTABLE_TYPES } from "../types/inversify-types";

@injectable()
export class HomeController {
  public router: Router;

  constructor(
    @inject(INJECTABLE_TYPES.HomeService) private homeService: IHomeService
  ) {
    this.router = Router();
    this.routes();
  }

  public nextInstallments = async (req: Request, res: Response) => {
    await this.homeService.nextInstallments(req.query).then((data) => {
      return res.status(200).json(data);
    }).catch((error) => {
      return res.status(500).json({ msg: error });
    });
  }

  public overdueInstallments = async (req: Request, res: Response) => {
    await this.homeService.overdueInstallments(req.query).then((data) => {
      return res.status(200).json(data);
    }).catch((error) => {
      return res.status(500).json({ msg: error });
    });
  }

  public installmentsBalance = async (req: Request, res: Response) => {
    await this.homeService.installmentsBalance(req.query).then((data) => {
      return res.status(200).json(data);
    }).catch((error) => {
      return res.status(500).json({ msg: error });
    });
  }

  /**
   * Configure the routes of controller
   */
  public routes() {
    this.router.get('/installments/next', this.nextInstallments);
    this.router.get('/installments/overdue', this.overdueInstallments);
    this.router.get('/installments/balance', this.installmentsBalance);
  }
}