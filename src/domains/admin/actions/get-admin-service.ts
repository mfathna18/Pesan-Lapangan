import { AdminService } from "@/domains/admin/services/admin-service";
import { prisma } from "@/lib/db/prisma";

let adminService: AdminService | null = null;

export function getAdminService(): AdminService {
  if (!adminService) {
    adminService = new AdminService(prisma);
  }

  return adminService;
}
