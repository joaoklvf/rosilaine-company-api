import { HomeResponse } from "./models/home-response";

export interface IHomeService {
  index(params?: any): Promise<[HomeResponse[], number]>;
}