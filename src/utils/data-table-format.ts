import { DataTableColumnProp, FormatValueOptions, getValue } from "../interfaces/data-table";
import { getAmountStr, getBrCurrencyStr, getBrDateStr } from "./text-format";

export const TableFormatMap = {
  [FormatValueOptions.Amount]: (value: string) => getAmountStr(value),
  [FormatValueOptions.Currency]: (value: string) => getBrCurrencyStr(value),
  [FormatValueOptions.Date]: (value: string) => getBrDateStr(value),
  [FormatValueOptions.String]: (value: string) => value,
}

function getCellFormattedValue<T>(value: T[keyof T], formatLabel: FormatValueOptions = FormatValueOptions.String) {
  return TableFormatMap[formatLabel](String(value));
}

export function getCellValue<T>(value: T, columnProp: DataTableColumnProp<T>) {
  return getCellFormattedValue(getValue(value, columnProp.fieldName), columnProp.formatValue)
}
