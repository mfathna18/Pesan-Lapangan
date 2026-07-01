import { OPERATING_HOURS_WEEKDAYS } from "@/domains/availability/constants";
import type { OperatingHoursRecord } from "@/domains/availability/types";
import {
  isIntervalFullyContained,
  intervalsOverlap,
} from "@/domains/availability/utils/time-interval";
import { parseTimeValueToMinute } from "@/domains/availability/utils/time-input";
import { PriceRuleValidationError } from "@/domains/booking/errors";
import type { OwnerPriceRuleRecord } from "@/domains/booking/repositories/price-rule-repository";
import type { SaveOwnerPriceRuleInput } from "@/domains/booking/types";

type ValidatedPriceRuleWindow = {
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
  price: number;
  isActive: boolean;
};

function getWeekdayLabel(dayOfWeek: number): string {
  return (
    OPERATING_HOURS_WEEKDAYS.find((day) => day.dayOfWeek === dayOfWeek)
      ?.label ?? "Day"
  );
}

export function validateOwnerPriceRuleInput(
  input: SaveOwnerPriceRuleInput,
  existingRules: OwnerPriceRuleRecord[],
  operatingHours: OperatingHoursRecord[],
  excludeRuleId?: string,
): ValidatedPriceRuleWindow {
  const weekday = OPERATING_HOURS_WEEKDAYS.find(
    (day) => day.dayOfWeek === input.dayOfWeek,
  );

  if (!weekday) {
    throw new PriceRuleValidationError("Invalid day of week.");
  }

  const startMinute = parseTimeValueToMinute(input.startTime);
  const endMinute = parseTimeValueToMinute(input.endTime);

  if (startMinute === null || endMinute === null) {
    throw new PriceRuleValidationError(
      `${weekday.label}: start and end times must use HH:MM format.`,
    );
  }

  if (startMinute >= endMinute) {
    throw new PriceRuleValidationError(
      `${weekday.label}: end time must be later than start time.`,
    );
  }

  if (input.price <= 0) {
    throw new PriceRuleValidationError("Price must be greater than zero.");
  }

  const candidate = {
    dayOfWeek: input.dayOfWeek,
    startMinute,
    endMinute,
  };

  const sameDayRules = existingRules.filter(
    (rule) => rule.dayOfWeek === input.dayOfWeek && rule.id !== excludeRuleId,
  );

  for (const rule of sameDayRules) {
    if (
      intervalsOverlap(candidate, {
        startMinute: rule.startMinute,
        endMinute: rule.endMinute,
      })
    ) {
      throw new PriceRuleValidationError(
        `${weekday.label}: pricing rules cannot overlap on the same day.`,
      );
    }
  }

  if (input.isActive) {
    const dayOperatingHours = operatingHours.filter(
      (window) => window.dayOfWeek === input.dayOfWeek && window.isActive,
    );

    if (dayOperatingHours.length === 0) {
      throw new PriceRuleValidationError(
        `${weekday.label}: set operating hours for this day before adding active pricing.`,
      );
    }

    const isWithinOperatingHours = dayOperatingHours.some((window) =>
      isIntervalFullyContained(candidate, window),
    );

    if (!isWithinOperatingHours) {
      throw new PriceRuleValidationError(
        `${weekday.label}: pricing must stay within the court's operating hours.`,
      );
    }
  }

  return {
    dayOfWeek: input.dayOfWeek,
    startMinute,
    endMinute,
    price: input.price,
    isActive: input.isActive,
  };
}

export function getWeekdayLabelForPriceRule(dayOfWeek: number): string {
  return getWeekdayLabel(dayOfWeek);
}
