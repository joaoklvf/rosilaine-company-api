import { OffsetTakeFilter } from "./take-skip-filter";

export interface DescriptionFilter extends OffsetTakeFilter {
  description: string;
}