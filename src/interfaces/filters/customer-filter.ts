import { TakeSkipFilter } from "./take-skip-filter";

export interface CustomerSearchFilter extends TakeSkipFilter {
  name?: string;
}