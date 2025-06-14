import { DeleteResult } from "typeorm";

/**
 * @interface IRepoService<T>
 * @desc Responsável por manipular o repositório de T.
 **/
export interface IRepoService<T> {          // Exportado
  delete(id: string): Promise<DeleteResult>;
  index(params?: any): Promise<[T[], number]>;
  create(customer: T): Promise<T | null>;
  update(customer: T, id: string): Promise<T | null>;
  get(id: string): Promise<T | null>
}