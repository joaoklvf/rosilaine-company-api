import { TakeSkipFilter } from "./take-skip-filter";

export interface DescriptionFilter extends TakeSkipFilter {
  description: string;
}