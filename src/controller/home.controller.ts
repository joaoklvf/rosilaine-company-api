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

  public index = async (req: Request, res: Response) => {
    await this.homeService.index(req.query).then((data) => {
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
  }
}