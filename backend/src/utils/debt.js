function toMonthIndex(dateInput) {
  const d = new Date(dateInput);
  return d.getUTCFullYear() * 12 + d.getUTCMonth();
}

export function monthsOccupied(startDate, endDate = null) {
  if (!startDate) return 0;

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0;

  return toMonthIndex(end) - toMonthIndex(start) + 1;
}

export function computeDebtForAllocation({ startDate, endDate, monthlyPrice, totalPaid }) {
  const months = monthsOccupied(startDate, endDate);
  const due = months * Number(monthlyPrice || 0);
  const paid = Number(totalPaid || 0);
  const debt = Math.max(due - paid, 0);

  return {
    months,
    total_due: due,
    total_paid: paid,
    current_debt: debt,
  };
}

export function isActiveAllocation(startDate, endDate, now = new Date()) {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;
  if (Number.isNaN(start.getTime())) return false;

  const day = new Date(now.toISOString().slice(0, 10));
  if (day < new Date(start.toISOString().slice(0, 10))) return false;
  if (end && day > new Date(end.toISOString().slice(0, 10))) return false;

  return true;
}
