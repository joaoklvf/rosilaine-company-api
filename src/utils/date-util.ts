export function getNextMonthDate(date: Date) {
  const currentMonth = date.getMonth();
  if (currentMonth === 11) {
    date.setMonth(0)
    date.setFullYear(date.getFullYear() + 1);
  }
  else {
    date.setMonth(currentMonth + +1)
  }
  return new Date(date);
}
