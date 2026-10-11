import dayjs from "dayjs";

export function minTimeoutAt() {
  return dayjs().add(1, "minute");
}

function rangeInts(end: number) {
  return Array.from({ length: end }, (_, i) => i);
}

export function isTimeoutDateDisabled(date: dayjs.Dayjs | null) {
  return date != null && date.endOf("day").isBefore(minTimeoutAt());
}

export function disabledTimeoutTime(date: dayjs.Dayjs | null) {
  const min = minTimeoutAt();
  if (date == null || !date.isSame(min, "day")) {
    return {};
  }

  const minHour = min.hour();
  const minMinute = min.minute();
  const minSecond = min.second();

  return {
    disabledHours: () => rangeInts(minHour),
    disabledMinutes: (hour: number) => {
      if (hour < minHour) return rangeInts(60);
      if (hour === minHour) return rangeInts(minMinute);
      return [];
    },
    disabledSeconds: (hour: number, minute: number) => {
      if (hour < minHour || (hour === minHour && minute < minMinute)) {
        return rangeInts(60);
      }
      if (hour === minHour && minute === minMinute) {
        return rangeInts(minSecond);
      }
      return [];
    },
  };
}

export function clampTimeout(value: dayjs.Dayjs | null) {
  if (value == null || !value.isValid()) return value;
  const min = minTimeoutAt();
  return value.isBefore(min) ? min : value;
}

export function maxViewsFromInput(value: unknown) {
  return typeof value === "number" ? value : null;
}
