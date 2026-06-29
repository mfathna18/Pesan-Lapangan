import { redirect } from "next/navigation";

type LegacyBookingCheckoutRedirectProps = {
  params: Promise<{
    slug: string;
    courtId: string;
  }>;
  searchParams: Promise<{
    bookingId?: string;
  }>;
};

export default async function LegacyBookingCheckoutRedirect({
  params,
  searchParams,
}: LegacyBookingCheckoutRedirectProps) {
  const { slug } = await params;
  const { bookingId } = await searchParams;

  if (!bookingId) {
    redirect(`/gor/${slug}`);
  }

  redirect(`/gor/${slug}/checkout/${bookingId}`);
}
