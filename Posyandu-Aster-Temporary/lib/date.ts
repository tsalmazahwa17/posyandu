export const APP_TIME_ZONE = "Asia/Jakarta";
const APP_UTC_OFFSET = "+07:00";

interface DateParts {
  year: number;
  month: number;
  day: number;
}

function getDateParts(date: Date, timeZone = APP_TIME_ZONE): DateParts {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)])
  );

  return {
    year: values.year,
    month: values.month,
    day: values.day,
  };
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function getTodayDateRange(now = new Date()): { start: Date; end: Date } {
  const { year, month, day } = getDateParts(now);
  // Kolom Prisma @db.Date direpresentasikan sebagai UTC tengah malam.
  const start = new Date(Date.UTC(year, month - 1, day));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

export function createJakartaDate(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0
): Date {
  return new Date(
    `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00${APP_UTC_OFFSET}`
  );
}

export function nextMonthlyJakartaDate(day: number, hour: number, now = new Date()): Date {
  const current = getDateParts(now);
  let year = current.year;
  let month = current.month;
  let candidate = createJakartaDate(year, month, day, hour);

  if (candidate <= now) {
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
    candidate = createJakartaDate(year, month, day, hour);
  }

  return candidate;
}
