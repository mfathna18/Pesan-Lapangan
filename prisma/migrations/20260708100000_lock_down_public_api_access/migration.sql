-- Sprint 25: Lock down PostgREST exposure for Prisma-only application tables.
-- Enables RLS without policies (deny-by-default for anon/authenticated).
-- Prisma connects as postgres (BYPASSRLS) and is unaffected.

-- Auth & identity
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "verification" ENABLE ROW LEVEL SECURITY;

-- Owner & subscription
ALTER TABLE "owner" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscription_payment" ENABLE ROW LEVEL SECURITY;

-- Venue & catalog
ALTER TABLE "gor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "court" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "price_rule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "operating_hours" ENABLE ROW LEVEL SECURITY;

-- Booking & payments
ALTER TABLE "booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "booking_contact" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payment_confirmation_audit_log" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invoice" ENABLE ROW LEVEL SECURITY;

-- Notifications & messaging
ALTER TABLE "owner_notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "owner_whatsapp_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "whatsapp_message_log" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "owner_browser_notification_settings" ENABLE ROW LEVEL SECURITY;

-- Revoke API role access (belt-and-suspenders alongside RLS deny-by-default)
REVOKE ALL ON TABLE "user" FROM anon, authenticated;
REVOKE ALL ON TABLE "session" FROM anon, authenticated;
REVOKE ALL ON TABLE "account" FROM anon, authenticated;
REVOKE ALL ON TABLE "verification" FROM anon, authenticated;
REVOKE ALL ON TABLE "owner" FROM anon, authenticated;
REVOKE ALL ON TABLE "subscription" FROM anon, authenticated;
REVOKE ALL ON TABLE "subscription_payment" FROM anon, authenticated;
REVOKE ALL ON TABLE "gor" FROM anon, authenticated;
REVOKE ALL ON TABLE "court" FROM anon, authenticated;
REVOKE ALL ON TABLE "price_rule" FROM anon, authenticated;
REVOKE ALL ON TABLE "operating_hours" FROM anon, authenticated;
REVOKE ALL ON TABLE "booking" FROM anon, authenticated;
REVOKE ALL ON TABLE "booking_contact" FROM anon, authenticated;
REVOKE ALL ON TABLE "payment" FROM anon, authenticated;
REVOKE ALL ON TABLE "payment_confirmation_audit_log" FROM anon, authenticated;
REVOKE ALL ON TABLE "invoice" FROM anon, authenticated;
REVOKE ALL ON TABLE "owner_notification" FROM anon, authenticated;
REVOKE ALL ON TABLE "owner_whatsapp_settings" FROM anon, authenticated;
REVOKE ALL ON TABLE "whatsapp_message_log" FROM anon, authenticated;
REVOKE ALL ON TABLE "owner_browser_notification_settings" FROM anon, authenticated;

-- Prisma migration history (if exposed via default grants)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = '_prisma_migrations'
      AND c.relkind = 'r'
  ) THEN
    EXECUTE 'ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY';
    EXECUTE 'REVOKE ALL ON TABLE public._prisma_migrations FROM anon, authenticated';
  END IF;
END $$;
