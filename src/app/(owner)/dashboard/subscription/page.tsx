import { SubscriptionDashboard } from "@/components/subscription/subscription-dashboard";
import { getSubscriptionService } from "@/domains/subscription/actions/get-subscription-service";
import { OwnerSubscriptionNotFoundError } from "@/domains/subscription/errors";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Subscription",
};

export default async function DashboardSubscriptionPage() {
  const session = await requireOwnerSession();

  try {
    const subscription = await getSubscriptionService().getCurrentSubscription(
      session.user.id,
    );

    return (
      <div className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
        <SubscriptionDashboard subscription={subscription} />
      </div>
    );
  } catch (error) {
    if (error instanceof OwnerSubscriptionNotFoundError) {
      notFound();
    }

    throw error;
  }
}
