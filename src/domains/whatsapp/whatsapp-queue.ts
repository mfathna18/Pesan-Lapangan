import type { WhatsAppQueueJob } from "@/domains/whatsapp/whatsapp-types";

export type WhatsAppQueueProcessor = (job: WhatsAppQueueJob) => Promise<void>;

export type WhatsAppQueue = {
  enqueue(job: WhatsAppQueueJob): void;
};

type AsyncWhatsAppQueueOptions = {
  processor: WhatsAppQueueProcessor;
};

export function createAsyncWhatsAppQueue({
  processor,
}: AsyncWhatsAppQueueOptions): WhatsAppQueue {
  return {
    enqueue(job) {
      void processor(job).catch(() => {
        // Processor handles persistence and logging.
      });
    },
  };
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function computeRetryDelayMs(attempt: number): number {
  return Math.min(1000 * 2 ** attempt, 8000);
}
