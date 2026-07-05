import { BrowserNotificationSettings } from "@/components/settings/browser-notification-settings";
import { GorProfileForm } from "@/components/settings/gor-profile-form";
import { WhatsAppNotificationSettings } from "@/components/settings/whatsapp-notification-settings";
import { createPageMetadata } from "@/config/page-metadata";
import { getGorProfileService } from "@/domains/owner/actions/get-gor-profile-service";
import { OwnerNotFoundError } from "@/domains/owner/errors";
import { getPushService } from "@/domains/push/actions/get-push-service";
import { getWhatsAppService } from "@/domains/whatsapp/actions/get-whatsapp-service";
import { requireOwnerId } from "@/lib/auth/get-owner-id";
import { requireOwnerSession } from "@/lib/auth/require-owner-session";
import { layout } from "@/lib/design-system";
import { notFound } from "next/navigation";

export const metadata = createPageMetadata(
  "Pengaturan",
  "Kelola profil GOR, branding, dan informasi venue.",
);

export default async function DashboardSettingsPage() {
  const session = await requireOwnerSession();

  let initialProfile = null;
  let initialWhatsAppSettings = {
    enabled: true,
    notifyBooking: true,
    notifyPayment: true,
    notifyReminder: true,
    notifySubscription: true,
  };

  let initialBrowserNotificationSettings = {
    enabled: true,
    notifyBooking: true,
    notifyPayment: true,
    notifyReminder: true,
    notifySubscription: true,
  };

  try {
    initialProfile = await getGorProfileService().getForUser(session.user.id);
    const ownerId = await requireOwnerId(session.user.id);
    initialWhatsAppSettings =
      await getWhatsAppService().getSettingsForOwner(ownerId);
    initialBrowserNotificationSettings =
      await getPushService().getSettingsForOwner(ownerId);
  } catch (error) {
    if (error instanceof OwnerNotFoundError) {
      notFound();
    }

    throw error;
  }

  return (
    <div className={layout.page}>
      <GorProfileForm initialProfile={initialProfile} />
      <BrowserNotificationSettings
        initialSettings={initialBrowserNotificationSettings}
      />
      <WhatsAppNotificationSettings initialSettings={initialWhatsAppSettings} />
    </div>
  );
}
