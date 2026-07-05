import {
  createWhatsAppLogRepository,
  createWhatsAppSettingsRepository,
} from "@/domains/whatsapp/repositories/whatsapp-repository";
import {
  createWhatsAppEmitter,
  createWhatsAppService,
} from "@/domains/whatsapp/whatsapp-service";
import { prisma } from "@/lib/db/prisma";

export function getWhatsAppService() {
  return createWhatsAppService({
    logRepository: createWhatsAppLogRepository(prisma),
    settingsRepository: createWhatsAppSettingsRepository(prisma),
  });
}

export function getWhatsAppEmitter() {
  return createWhatsAppEmitter(getWhatsAppService(), prisma);
}
