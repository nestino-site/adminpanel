import { api } from "@/lib/api";
import type { AuditResult } from "@/types/api";

export async function auditPage(
  pageId: string,
  content?: string,
): Promise<AuditResult> {
  return api.post<AuditResult>(
    `/pages/${pageId}/audit`,
    content ? { content } : undefined,
  );
}
