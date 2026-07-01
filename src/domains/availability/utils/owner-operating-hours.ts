import {
  OPERATING_HOURS_DEFAULT_END_MINUTE,
  OPERATING_HOURS_DEFAULT_START_MINUTE,
  OPERATING_HOURS_WEEKDAYS,
} from "@/domains/availability/constants";
import { OperatingHoursValidationError } from "@/domains/availability/errors";
import type {
  OperatingHoursRecord,
  OwnerOperatingHoursSchedule,
  SaveOwnerOperatingHoursDayInput,
} from "@/domains/availability/types";
import { intervalsOverlap } from "@/domains/availability/utils/time-interval";
import {
  minuteOfDayToTimeValue,
  parseTimeValueToMinute,
} from "@/domains/availability/utils/time-input";

type ValidatedOperatingHoursWindow = {
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
  isActive: boolean;
};

export function buildOwnerOperatingHoursSchedule(
  courtId: string,
  records: OperatingHoursRecord[],
): OwnerOperatingHoursSchedule {
  const recordsByDay = new Map<number, OperatingHoursRecord[]>();

  for (const record of records) {
    const existing = recordsByDay.get(record.dayOfWeek) ?? [];
    existing.push(record);
    recordsByDay.set(record.dayOfWeek, existing);
  }

  const days = OPERATING_HOURS_WEEKDAYS.map(({ dayOfWeek, label }) => {
    const dayRecords = recordsByDay.get(dayOfWeek) ?? [];
    const activeRecord = dayRecords.find((record) => record.isActive);
    const fallbackRecord = dayRecords[0];

    if (!activeRecord && !fallbackRecord) {
      return {
        dayOfWeek,
        label,
        enabled: false,
        startTime: minuteOfDayToTimeValue(OPERATING_HOURS_DEFAULT_START_MINUTE),
        endTime: minuteOfDayToTimeValue(OPERATING_HOURS_DEFAULT_END_MINUTE),
      };
    }

    const source = activeRecord ?? fallbackRecord;

    if (!source) {
      return {
        dayOfWeek,
        label,
        enabled: false,
        startTime: minuteOfDayToTimeValue(OPERATING_HOURS_DEFAULT_START_MINUTE),
        endTime: minuteOfDayToTimeValue(OPERATING_HOURS_DEFAULT_END_MINUTE),
      };
    }

    return {
      dayOfWeek,
      label,
      enabled: Boolean(activeRecord),
      startTime: minuteOfDayToTimeValue(source.startMinute),
      endTime: minuteOfDayToTimeValue(source.endMinute),
    };
  });

  return {
    courtId,
    days,
  };
}

export function validateOwnerOperatingHoursInput(
  days: SaveOwnerOperatingHoursDayInput[],
): ValidatedOperatingHoursWindow[] {
  const validatedDays: ValidatedOperatingHoursWindow[] = [];

  for (const day of days) {
    const weekday = OPERATING_HOURS_WEEKDAYS.find(
      (entry) => entry.dayOfWeek === day.dayOfWeek,
    );

    if (!weekday) {
      throw new OperatingHoursValidationError("Invalid day of week.");
    }

    if (!day.enabled) {
      validatedDays.push({
        dayOfWeek: day.dayOfWeek,
        startMinute: OPERATING_HOURS_DEFAULT_START_MINUTE,
        endMinute: OPERATING_HOURS_DEFAULT_END_MINUTE,
        isActive: false,
      });
      continue;
    }

    const startMinute = parseTimeValueToMinute(day.startTime);
    const endMinute = parseTimeValueToMinute(day.endTime);

    if (startMinute === null || endMinute === null) {
      throw new OperatingHoursValidationError(
        `${weekday.label}: opening and closing times must use HH:MM format.`,
      );
    }

    if (startMinute >= endMinute) {
      throw new OperatingHoursValidationError(
        `${weekday.label}: opening time must be earlier than closing time.`,
      );
    }

    validatedDays.push({
      dayOfWeek: day.dayOfWeek,
      startMinute,
      endMinute,
      isActive: true,
    });
  }

  const activeWindows = validatedDays.filter((day) => day.isActive);

  for (let index = 0; index < activeWindows.length; index += 1) {
    for (
      let compareIndex = index + 1;
      compareIndex < activeWindows.length;
      compareIndex += 1
    ) {
      const left = activeWindows[index];
      const right = activeWindows[compareIndex];

      if (
        left &&
        right &&
        left.dayOfWeek === right.dayOfWeek &&
        intervalsOverlap(left, right)
      ) {
        throw new OperatingHoursValidationError(
          `${OPERATING_HOURS_WEEKDAYS.find((entry) => entry.dayOfWeek === left.dayOfWeek)?.label ?? "Hari"}: jam operasional tidak boleh tumpang tindih.`,
        );
      }
    }
  }

  return validatedDays;
}
