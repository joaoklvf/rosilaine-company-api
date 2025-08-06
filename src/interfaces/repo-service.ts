import { DeleteResult, UpdateResult } from "typeorm";

/**
 * @interface IRepoService<T>
 * @desc Responsável por manipular o repositório de T.
 **/
export interface IRepoService<T> {          // Exportado
  delete(id: string): Promise<DeleteResult | T>;
  safeDelete(id: string): Promise<UpdateResult>;
  index(params?: any): Promise<[T[], number]>;
  create(customer: T): Promise<T | null>;
  update(customer: T, id: string): Promise<T | null>;
  get(id: string): Promise<T | null>
}