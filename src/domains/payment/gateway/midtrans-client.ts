import { Snap } from "midtrans-client";

import { env } from "@/config/env";

export function createMidtransSnapClient(): Snap {
  return new Snap({
    isProduction: env.MIDTRANS_IS_PRODUCTION,
    serverKey: env.MIDTRANS_SERVER_KEY,
    clientKey: env.MIDTRANS_CLIENT_KEY,
  });
}
