import { QuickStartDashboard } from "@/components/quick-start/quick-start-dashboard";
import { createPageMetadata } from "@/config/page-metadata";
import { getQuickStartService } from "@/domains/quick-start/actions/get-quick-start-service";
import { getGorProfileService } from "@/domains/owner/actions/get-gor-profile-service";
import { OwnerNotFoundError } from "@/domains/owner/errors";
import { requireOwnerId } from "@/lib/auth/get-owner-id";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";
import { notFound } from "next/navigation";

export const metadata = createPageMetadata(
  "Panduan Cepat",
  "Checklist interaktif untuk menyiapkan GOR Anda menerima booking online.",
);

export default async function QuickStartPage() {
  const session = await requireOwnerSession();

  try {
    const ownerId = await requireOwnerId(session.user.id);
    const profile = await getGorProfileService().getForUser(session.user.id);
    const progress = await getQuickStartService().getProgressForOwner(
      ownerId,
      profile,
    );

    return <QuickStartDashboard progress={progress} />;
  } catch (error) {
    if (error instanceof OwnerNotFoundError) {
      notFound();
    }

    throw error;
  }
}
