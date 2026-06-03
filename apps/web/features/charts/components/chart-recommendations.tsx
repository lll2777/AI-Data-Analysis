"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import { ChartCard } from "@/features/charts/components/chart-card";
import { listCharts, recommendCharts } from "@/features/datasets/dataset-api";

type ChartRecommendationsProps = {
  datasetId: string | undefined;
};

export function ChartRecommendations({ datasetId }: ChartRecommendationsProps) {
  const queryClient = useQueryClient();
  const { getAccessToken, session } = useAuth();

  const chartsQuery = useQuery({
    queryKey: ["dataset-charts", datasetId, session?.user.id],
    queryFn: async () =>
      listCharts({
        accessToken: await requireAccessToken(getAccessToken),
        datasetId: datasetId ?? "",
      }),
    enabled: Boolean(session?.user.id && datasetId),
  });

  const recommendMutation = useMutation({
    mutationFn: async () =>
      recommendCharts({
        accessToken: await requireAccessToken(getAccessToken),
        datasetId: datasetId ?? "",
      }),
    onSuccess: async () => {
      toast.success("图表已生成。");
      await queryClient.invalidateQueries({
        queryKey: ["dataset-charts", datasetId],
      });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "图表推荐失败。");
    },
  });

  if (!datasetId) {
    return null;
  }

  const charts = chartsQuery.data?.charts ?? [];
  const isBusy = chartsQuery.isLoading || recommendMutation.isPending;

  return (
    <section className="mt-6 border-t border-white/10 pt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-100">推荐图表</p>
          <p className="mt-1 text-xs text-zinc-500">
            基于字段类型、时间序列和分类聚合，生成多角度可解释图表。
          </p>
        </div>
        <Button
          disabled={recommendMutation.isPending}
          onClick={() => recommendMutation.mutate()}
          type="button"
          variant={charts.length ? "outline" : "default"}
        >
          {recommendMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          )}
          生成图表
        </Button>
      </div>

      {isBusy ? (
        <ChartSkeleton />
      ) : charts.length ? (
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {charts.map((chart) => (
            <ChartCard chart={chart} key={chart.id} />
          ))}
        </div>
      ) : (
        <div className="mt-4 flex min-h-44 flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-white/[0.03] px-4 text-center">
          <BarChart3 className="h-6 w-6 text-zinc-400" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-zinc-200">
            还没有图表建议。
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            数据画像完成后，可以生成候选图表。
          </p>
        </div>
      )}
    </section>
  );
}

function ChartSkeleton() {
  return (
    <div className="mt-4 grid gap-4 xl:grid-cols-2">
      <div className="h-80 rounded-3xl bg-white/[0.04]" />
      <div className="hidden h-80 rounded-3xl bg-white/[0.04] xl:block" />
    </div>
  );
}

async function requireAccessToken(
  getAccessToken: () => Promise<string | null>,
) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error("请先登录，再使用图表功能。");
  }
  return accessToken;
}
