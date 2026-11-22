export const parseDateOnly = (value: string): Date | null => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(value)) {
    return null;
  }
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const actualYear = date.getUTCFullYear();
  const actualMonth = date.getUTCMonth();
  const actualDay = date.getUTCDate();
  if (actualYear !== year || actualMonth !== month - 1 || actualDay !== day) {
    return null;
  }
  return date;
};
