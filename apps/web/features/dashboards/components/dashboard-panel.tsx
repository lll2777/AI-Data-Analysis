"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, LayoutDashboard, Link2, Loader2, Save, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import {
  type DashboardSummary,
  createDashboardShareLink,
  listDashboards,
  revokeDashboardShareLink,
  saveDashboard,
} from "@/features/datasets/dataset-api";

type DashboardPanelProps = {
  datasetId: string | undefined;
  datasetName: string | undefined;
};

export function DashboardPanel({
  datasetId,
  datasetName,
}: DashboardPanelProps) {
  const queryClient = useQueryClient();
  const { getAccessToken, session } = useAuth();
  const [title, setTitle] = useState("");

  const defaultTitle = useMemo(
    () => `${datasetName ?? "数据集"} 仪表盘`,
    [datasetName],
  );

  const dashboardsQuery = useQuery({
    queryKey: ["dataset-dashboards", datasetId, session?.user.id],
    queryFn: async () =>
      listDashboards({
        accessToken: await requireAccessToken(getAccessToken),
        datasetId: datasetId ?? "",
      }),
    enabled: Boolean(session?.user.id && datasetId),
  });

  const saveMutation = useMutation({
    mutationFn: async () =>
      saveDashboard({
        accessToken: await requireAccessToken(getAccessToken),
        datasetId: datasetId ?? "",
        title: title.trim() || defaultTitle,
      }),
    onSuccess: async () => {
      toast.success("仪表盘已保存。");
      setTitle("");
      await queryClient.invalidateQueries({
        queryKey: ["dataset-dashboards", datasetId],
      });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "仪表盘保存失败。");
    },
  });

  if (!datasetId) {
    return null;
  }

  const dashboards = dashboardsQuery.data?.dashboards ?? [];
  const isBusy = dashboardsQuery.isLoading || saveMutation.isPending;

  return (
    <section className="mt-6 border-t border-white/10 pt-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-100">仪表盘</p>
          <p className="mt-1 text-xs text-zinc-500">
            将图表和洞察保存为可复用的分析快照。
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <LayoutDashboard
            className="h-5 w-5 text-zinc-300"
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          仪表盘标题
        </label>
        <input
          className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-white/25"
          maxLength={160}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={defaultTitle}
          value={title}
        />
        <Button
          className="mt-3 w-full"
          disabled={saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
          type="button"
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="h-4 w-4" aria-hidden="true" />
          )}
          保存仪表盘
        </Button>
      </div>

      {isBusy ? (
        <div className="mt-4 space-y-2">
          <div className="h-16 rounded-3xl bg-white/[0.04]" />
          <div className="h-16 rounded-3xl bg-white/[0.04]" />
        </div>
      ) : dashboards.length ? (
        <div className="mt-4 space-y-2">
          {dashboards.slice(0, 4).map((dashboard) => (
            <DashboardRow dashboard={dashboard} key={dashboard.id} />
          ))}
        </div>
      ) : (
        <div className="mt-4 flex min-h-36 flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-white/[0.03] px-4 text-center">
          <LayoutDashboard
            className="h-6 w-6 text-zinc-400"
            aria-hidden="true"
          />
          <p className="mt-3 text-sm font-medium text-zinc-200">
            还没有保存仪表盘。
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            生成图表或洞察后，可以保存仪表盘快照。
          </p>
        </div>
      )}
    </section>
  );
}

function DashboardRow({ dashboard }: { dashboard: DashboardSummary }) {
  const { getAccessToken } = useAuth();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  async function handleShare() {
    setIsSharing(true);
    try {
      const response = await createDashboardShareLink({
        accessToken: await requireAccessToken(getAccessToken),
        dashboardId: dashboard.id,
      });
      setShareUrl(response.url);
      await copyShareUrl(response.url);
      toast.success("分享链接已生成并复制。");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "分享链接生成失败。",
      );
    } finally {
      setIsSharing(false);
    }
  }

  async function handleRevoke() {
    setIsRevoking(true);
    try {
      await revokeDashboardShareLink({
        accessToken: await requireAccessToken(getAccessToken),
        dashboardId: dashboard.id,
      });
      setShareUrl(null);
      toast.success("分享链接已撤销。");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "分享链接撤销失败。",
      );
    } finally {
      setIsRevoking(false);
    }
  }

  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium text-zinc-100">
            {dashboard.title}
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            {dashboard.chart_count} 个图表，{dashboard.insight_count} 条洞察
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-zinc-500">
          {dashboardStatusLabel(dashboard.status)}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          className="h-8 px-3 text-xs"
          disabled={isSharing}
          onClick={() => void handleShare()}
          type="button"
          variant="outline"
        >
          {isSharing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : shareUrl ? (
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {shareUrl ? "复制链接" : "分享"}
        </Button>
        {shareUrl ? (
          <Button
            className="h-8 px-3 text-xs"
            disabled={isRevoking}
            onClick={() => void handleRevoke()}
            type="button"
            variant="outline"
          >
            {isRevoking ? (
              <Loader2
                className="h-3.5 w-3.5 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            撤销
          </Button>
        ) : null}
      </div>
      {shareUrl ? (
        <p className="mt-3 break-all rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-2 text-xs leading-5 text-emerald-100">
          {shareUrl}
        </p>
      ) : null}
    </article>
  );
}

async function copyShareUrl(url: string) {
  if (!navigator.clipboard) {
    return;
  }
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    toast.info("分享链接已生成，可手动复制。");
  }
}

function dashboardStatusLabel(status: string) {
  const labels: Record<string, string> = {
    draft: "草稿",
    active: "可用",
    archived: "已归档",
  };

  return labels[status] ?? status;
}

async function requireAccessToken(
  getAccessToken: () => Promise<string | null>,
) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error("请先登录，再保存仪表盘。");
  }
  return accessToken;
}
