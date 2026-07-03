import Link from "next/link";
import { MapPinOff } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { CUSTOMER_COPY } from "@/config/customer-copy";

export default function VenueNotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <EmptyState
          variant="plain"
          icon={MapPinOff}
          title={CUSTOMER_COPY.notFound.venueTitle}
          description={CUSTOMER_COPY.notFound.venueDescription}
          action={
            <Link href="/" className={buttonVariants({ size: "lg" })}>
              {CUSTOMER_COPY.notFound.backHome}
            </Link>
          }
        />
      </div>
    </main>
  );
}
