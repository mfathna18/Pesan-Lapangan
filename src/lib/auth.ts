import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { getAuthTrustedOrigins } from "@/config/auth-urls";
import { env } from "@/config/env";
import { OWNER_ROLE } from "@/domains/owner/constants";
import { provisionOwnerAfterUserSignUp } from "@/domains/owner/services/owner-provisioning-service";
import { prisma } from "@/lib/db/prisma";

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: getAuthTrustedOrigins(),
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await provisionOwnerAfterUserSignUp(user);
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  advanced: {
    cookiePrefix: "pesan-lapangan",
    useSecureCookies: env.NODE_ENV === "production",
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: OWNER_ROLE,
        input: false,
      },
    },
  },
  plugins: [nextCookies()],
});
