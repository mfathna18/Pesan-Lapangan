import type {
  BiRecommendation,
  RecommendationContext,
} from "./analytics-types";

type RecommendationRule = {
  id: string;
  priority: BiRecommendation["priority"];
  matches: (context: RecommendationContext) => boolean;
  buildMessage: (context: RecommendationContext) => string;
};

const RECOMMENDATION_RULES: RecommendationRule[] = [
  {
    id: "low-occupancy-weekday-promo",
    priority: "high",
    matches: (context) => context.occupancyPercent < 40,
    buildMessage: () =>
      "Banyak slot kosong minggu ini. Pertimbangkan membuat promo weekday.",
  },
  {
    id: "high-saturday-demand",
    priority: "high",
    matches: (context) => context.saturdayOccupancyPercent > 90,
    buildMessage: () =>
      "Permintaan Sabtu sangat tinggi. Pertimbangkan menaikkan harga atau menambah jam operasional.",
  },
  {
    id: "low-court-utilization",
    priority: "medium",
    matches: (context) =>
      context.lowestCourtUtilization > 0 && context.lowestCourtUtilization < 20,
    buildMessage: (context) =>
      `Lapangan ${context.lowestCourtName} jarang dipesan. Evaluasi harga, foto, atau promosi.`,
  },
  {
    id: "pending-payments",
    priority: "high",
    matches: (context) => context.pendingBookings > 5,
    buildMessage: () =>
      "Terdapat beberapa pembayaran yang belum selesai. Tindaklanjuti booking pending segera.",
  },
  {
    id: "revenue-increase",
    priority: "low",
    matches: (context) => context.revenueIncreased,
    buildMessage: () =>
      "Selamat! Pendapatan meningkat dibanding periode sebelumnya.",
  },
];

export function buildRecommendations(
  context: RecommendationContext,
): BiRecommendation[] {
  return RECOMMENDATION_RULES.filter((rule) => rule.matches(context)).map(
    (rule) => ({
      id: rule.id,
      ruleId: rule.id,
      priority: rule.priority,
      message: rule.buildMessage(context),
    }),
  );
}

export { RECOMMENDATION_RULES };
