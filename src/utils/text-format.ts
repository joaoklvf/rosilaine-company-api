export const getBrCurrencyStr = (value: number | string) =>
  Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const getBrDateStr = (value: Date | string) =>
  new Date(value).toLocaleDateString('pt-BR');

export const getAmountStr = (value: string) =>
  value.padStart(2, "0");

export const getDateFromStr = (value: string | Date) => {
  const dataNascimentoSplitted = String(value).split('/').map(x => Number(x));
  return new Date(dataNascimentoSplitted[2], dataNascimentoSplitted[1] - 1, dataNascimentoSplitted[0])
}
