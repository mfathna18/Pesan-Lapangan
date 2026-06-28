import type {
  OperatingHoursWindow,
  PriceRuleWindow,
} from "@/domains/availability/types";
import { mergeIntervals } from "@/domains/availability/utils/time-interval";

type PriceRuleLike = {
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
  price: number;
  isActive: boolean;
};

export function deriveOperatingHoursFromPriceRules(
  priceRules: PriceRuleLike[],
  dayOfWeek: number,
): OperatingHoursWindow[] {
  const activeDayRules = priceRules.filter(
    (rule) => rule.isActive && rule.dayOfWeek === dayOfWeek,
  );

  return mergeIntervals(
    activeDayRules.map((rule) => ({
      startMinute: rule.startMinute,
      endMinute: rule.endMinute,
    })),
  );
}

export function mapActivePriceRulesForDay(
  priceRules: PriceRuleLike[],
  dayOfWeek: number,
): PriceRuleWindow[] {
  return priceRules
    .filter((rule) => rule.isActive && rule.dayOfWeek === dayOfWeek)
    .map((rule) => ({
      startMinute: rule.startMinute,
      endMinute: rule.endMinute,
      price: rule.price,
    }))
    .sort((left, right) => left.startMinute - right.startMinute);
}

export function resolveSlotPrice(
  slot: { startMinute: number; endMinute: number },
  priceRules: PriceRuleWindow[],
): number | null {
  const matchingRule = priceRules.find((rule) =>
    isSlotWithinPriceRule(slot, rule),
  );

  return matchingRule?.price ?? null;
}

function isSlotWithinPriceRule(
  slot: { startMinute: number; endMinute: number },
  rule: PriceRuleWindow,
): boolean {
  return (
    slot.startMinute >= rule.startMinute && slot.endMinute <= rule.endMinute
  );
}
