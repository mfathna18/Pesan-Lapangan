import { SubscriptionDashboard } from "@/components/subscription/subscription-dashboard";
import { createPageMetadata } from "@/config/page-metadata";
import { getSubscriptionService } from "@/domains/subscription/actions/get-subscription-service";
import { OwnerSubscriptionNotFoundError } from "@/domains/subscription/errors";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";
import { notFound } from "next/navigation";

export const metadata = createPageMetadata(
  "Langganan",
  "Kelola paket langganan dan status akses venue Anda.",
);

export default async function DashboardSubscriptionPage() {
  const session = await requireOwnerSession();

  try {
    const subscription = await getSubscriptionService().getCurrentSubscription(
      session.user.id,
    );

    return <SubscriptionDashboard subscription={subscription} />;
  } catch (error) {
    if (error instanceof OwnerSubscriptionNotFoundError) {
      notFound();
    }

    throw error;
  }
}
