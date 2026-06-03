import { apiFetch } from "@/lib/api/client";

import type { PublicShareResponse } from "@/features/datasets/dataset-api";

export async function getPublicShare(token: string) {
  return apiFetch<PublicShareResponse>(`/api/v1/share/${token}`);
}
