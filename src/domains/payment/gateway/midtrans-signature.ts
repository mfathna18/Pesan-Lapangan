import { createHash } from "crypto";

import { env } from "@/config/env";

type MidtransSignaturePayload = {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
};

export function verifyMidtransSignature(
  payload: MidtransSignaturePayload,
): boolean {
  const signatureInput =
    payload.order_id +
    payload.status_code +
    payload.gross_amount +
    env.MIDTRANS_SERVER_KEY;

  const expectedSignature = createHash("sha512")
    .update(signatureInput)
    .digest("hex");

  return expectedSignature === payload.signature_key;
}
