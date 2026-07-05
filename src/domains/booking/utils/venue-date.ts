const VENUE_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseVenueDateInput(dateInput: string): Date {
  const match = VENUE_DATE_PATTERN.exec(dateInput.trim());

  if (!match) {
    throw new Error("Invalid venue date input.");
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  return new Date(Date.UTC(year, month - 1, day));
}

export function formatVenueDateInput(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
