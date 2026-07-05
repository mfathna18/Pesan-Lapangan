import { env } from "@/config/env";
import type {
  WhatsAppProvider,
  WhatsAppProviderName,
  WhatsAppProviderSendInput,
  WhatsAppProviderSendResult,
} from "@/domains/whatsapp/whatsapp-types";
import { WHATSAPP_PROVIDER_NAME } from "@/domains/whatsapp/whatsapp-types";

type HttpProviderConfig = {
  name: WhatsAppProviderName;
  apiUrl: string;
  token: string;
  buildBody: (input: WhatsAppProviderSendInput) => Record<string, unknown>;
  buildHeaders: (token: string) => Record<string, string>;
  parseResponse: (status: number, body: string) => WhatsAppProviderSendResult;
};

function createHttpWhatsAppProvider(
  config: HttpProviderConfig,
): WhatsAppProvider {
  return {
    name: config.name,
    async send(input) {
      try {
        const response = await fetch(config.apiUrl, {
          method: "POST",
          headers: config.buildHeaders(config.token),
          body: JSON.stringify(config.buildBody(input)),
        });

        const rawResponse = await response.text();

        return config.parseResponse(response.status, rawResponse);
      } catch (error) {
        return {
          success: false,
          errorMessage:
            error instanceof Error ? error.message : "Unknown provider error",
        };
      }
    },
  };
}

function createFonnteProvider(token: string): WhatsAppProvider {
  return createHttpWhatsAppProvider({
    name: WHATSAPP_PROVIDER_NAME.FONNTE,
    apiUrl: "https://api.fonnte.com/send",
    token,
    buildHeaders: (value) => ({
      Authorization: value,
      "Content-Type": "application/json",
    }),
    buildBody: (input) => ({
      target: input.to,
      message: input.message,
    }),
    parseResponse: (status, body) => {
      if (status >= 200 && status < 300) {
        return {
          success: true,
          rawResponse: body,
        };
      }

      return {
        success: false,
        rawResponse: body,
        errorMessage: `Fonnte API error (${status})`,
      };
    },
  });
}

function createWablasProvider(token: string, apiUrl: string): WhatsAppProvider {
  return createHttpWhatsAppProvider({
    name: WHATSAPP_PROVIDER_NAME.WABLAS,
    apiUrl,
    token,
    buildHeaders: (value) => ({
      Authorization: value,
      "Content-Type": "application/json",
    }),
    buildBody: (input) => ({
      phone: input.to,
      message: input.message,
    }),
    parseResponse: (status, body) => {
      if (status >= 200 && status < 300) {
        return {
          success: true,
          rawResponse: body,
        };
      }

      return {
        success: false,
        rawResponse: body,
        errorMessage: `Wablas API error (${status})`,
      };
    },
  });
}

function createWaGatewayProvider(
  token: string,
  apiUrl: string,
): WhatsAppProvider {
  return createHttpWhatsAppProvider({
    name: WHATSAPP_PROVIDER_NAME.WA_GATEWAY,
    apiUrl,
    token,
    buildHeaders: (value) => ({
      Authorization: `Bearer ${value}`,
      "Content-Type": "application/json",
    }),
    buildBody: (input) => ({
      phone: input.to,
      message: input.message,
    }),
    parseResponse: (status, body) => {
      if (status >= 200 && status < 300) {
        return {
          success: true,
          rawResponse: body,
        };
      }

      return {
        success: false,
        rawResponse: body,
        errorMessage: `WA Gateway API error (${status})`,
      };
    },
  });
}

function createMetaProvider(
  token: string,
  phoneNumberId: string,
): WhatsAppProvider {
  return createHttpWhatsAppProvider({
    name: WHATSAPP_PROVIDER_NAME.META,
    apiUrl: `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
    token,
    buildHeaders: (value) => ({
      Authorization: `Bearer ${value}`,
      "Content-Type": "application/json",
    }),
    buildBody: (input) => ({
      messaging_product: "whatsapp",
      to: input.to,
      type: "text",
      text: {
        body: input.message,
      },
    }),
    parseResponse: (status, body) => {
      if (status >= 200 && status < 300) {
        return {
          success: true,
          rawResponse: body,
        };
      }

      return {
        success: false,
        rawResponse: body,
        errorMessage: `Meta WhatsApp API error (${status})`,
      };
    },
  });
}

function createNoopProvider(): WhatsAppProvider {
  return {
    name: WHATSAPP_PROVIDER_NAME.NOOP,
    async send(input) {
      return {
        success: true,
        providerMessageId: "noop",
        rawResponse: JSON.stringify({
          skipped: true,
          to: input.to,
        }),
      };
    },
  };
}

export function createWhatsAppProvider(): WhatsAppProvider {
  if (!env.WHATSAPP_ENABLED) {
    return createNoopProvider();
  }

  const provider = env.WHATSAPP_PROVIDER;
  const token = env.WHATSAPP_API_TOKEN;

  switch (provider) {
    case WHATSAPP_PROVIDER_NAME.FONNTE:
      if (!token) {
        return createNoopProvider();
      }

      return createFonnteProvider(token);
    case WHATSAPP_PROVIDER_NAME.WABLAS:
      if (!token || !env.WHATSAPP_API_URL) {
        return createNoopProvider();
      }

      return createWablasProvider(token, env.WHATSAPP_API_URL);
    case WHATSAPP_PROVIDER_NAME.WA_GATEWAY:
      if (!token || !env.WHATSAPP_API_URL) {
        return createNoopProvider();
      }

      return createWaGatewayProvider(token, env.WHATSAPP_API_URL);
    case WHATSAPP_PROVIDER_NAME.META:
      if (!token || !env.WHATSAPP_PHONE_NUMBER_ID) {
        return createNoopProvider();
      }

      return createMetaProvider(token, env.WHATSAPP_PHONE_NUMBER_ID);
    case WHATSAPP_PROVIDER_NAME.NOOP:
    default:
      return createNoopProvider();
  }
}
