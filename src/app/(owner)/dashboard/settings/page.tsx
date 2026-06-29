import { GorProfileForm } from "@/components/settings/gor-profile-form";
import { getGorProfileService } from "@/domains/owner/actions/get-gor-profile-service";
import { OwnerNotFoundError } from "@/domains/owner/errors";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Settings",
};

export default async function DashboardSettingsPage() {
  const session = await requireOwnerSession();

  let initialProfile = null;

  try {
    initialProfile = await getGorProfileService().getForUser(session.user.id);
  } catch (error) {
    if (error instanceof OwnerNotFoundError) {
      notFound();
    }

    throw error;
  }

  return (
    <div className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
      <GorProfileForm initialProfile={initialProfile} />
    </div>
  );
}
