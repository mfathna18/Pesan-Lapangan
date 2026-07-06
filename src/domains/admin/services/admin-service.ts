import { AdminRepository } from "@/domains/admin/repositories/admin-repository";
import type {
  AdminDashboardData,
  AdminOwnersListInput,
  AdminOwnersListResult,
  AdminSystemStatus,
  AdminSubscriptionPaymentRow,
  AdminBookingPaymentRow,
  AdminSubscriptionRow,
  AdminVenueRow,
} from "@/domains/admin/types";
import type { PrismaClient } from "@/generated/prisma/client";

export class AdminService {
  private readonly repository: AdminRepository;

  constructor(db: PrismaClient) {
    this.repository = new AdminRepository(db);
  }

  getDashboard(): Promise<AdminDashboardData> {
    return this.repository.getDashboardData();
  }

  listOwners(input: AdminOwnersListInput): Promise<AdminOwnersListResult> {
    return this.repository.listOwners(input);
  }

  listVenues(): Promise<AdminVenueRow[]> {
    return this.repository.listVenues();
  }

  listSubscriptions(): Promise<AdminSubscriptionRow[]> {
    return this.repository.listSubscriptions();
  }

  listSubscriptionPayments(): Promise<AdminSubscriptionPaymentRow[]> {
    return this.repository.listSubscriptionPayments();
  }

  listBookingPayments(): Promise<AdminBookingPaymentRow[]> {
    return this.repository.listBookingPayments();
  }

  getSystemStatus(
    version: string,
    environment: string,
  ): Promise<AdminSystemStatus> {
    return this.repository.getSystemStatus(version, environment);
  }
}
