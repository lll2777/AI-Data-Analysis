import { BarChart3, Lightbulb, Share2 } from "lucide-react";
import type { ReactNode } from "react";

import { ChartCard } from "@/features/charts/components/chart-card";
import { getPublicShare } from "@/features/share/public-share-api";

type SharePageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params;
  const share = await loadShare(token);

  if (!share) {
    return (
      <main className="min-h-screen bg-[#08090a] px-6 py-10 text-white">
        <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center text-center">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <Share2 className="h-8 w-8 text-zinc-300" aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-normal">
            分享链接不可用
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
            这个仪表盘分享可能不存在，或者已经被所有者撤销。
          </p>
        </section>
      </main>
    );
  }

  const { dashboard } = share;

  return (
    <main className="min-h-screen bg-[#08090a] text-white">
      <section className="mx-auto w-full max-w-7xl px-6 py-8">
        <header className="border-b border-white/10 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm text-zinc-400">AI 数据分析 · 公开分享</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-normal sm:text-4xl">
                {dashboard.title}
              </h1>
              {dashboard.description ? (
                <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500">
                  {dashboard.description}
                </p>
              ) : null}
            </div>
            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-100">
              只读仪表盘
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <MetricCard
              icon={<BarChart3 className="h-5 w-5" aria-hidden="true" />}
              label="图表"
              value={dashboard.charts.length}
            />
            <MetricCard
              icon={<Lightbulb className="h-5 w-5" aria-hidden="true" />}
              label="洞察"
              value={dashboard.insights.length}
            />
          </div>
        </header>

        <section className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold tracking-normal">图表</h2>
          </div>
          {dashboard.charts.length ? (
            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              {dashboard.charts.map((chart) => (
                <ChartCard chart={chart} key={chart.id} />
              ))}
            </div>
          ) : (
            <EmptyPanel text="这个分享仪表盘暂时没有图表。" />
          )}
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold tracking-normal">洞察</h2>
          {dashboard.insights.length ? (
            <div className="mt-4 grid gap-3">
              {dashboard.insights.map((insight) => (
                <article
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-4"
                  key={insight.id}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-zinc-100">
                        {insight.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-zinc-400">
                        {insight.summary}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
                      {insightSeverityLabel(insight.severity)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyPanel text="这个分享仪表盘暂时没有洞察。" />
          )}
        </section>
      </section>
    </main>
  );
}

async function loadShare(token: string) {
  try {
    return await getPublicShare(token);
  } catch {
    return null;
  }
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center justify-between text-zinc-400">
        <p className="text-sm">{label}</p>
        {icon}
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-normal">{value}</p>
    </div>
  );
}

function EmptyPanel({ text }: { text: string }) {
  return (
    <div className="mt-4 flex min-h-36 items-center justify-center rounded-3xl border border-dashed border-white/15 bg-white/[0.03] px-4 text-center text-sm text-zinc-500">
      {text}
    </div>
  );
}

function insightSeverityLabel(severity: string) {
  const labels: Record<string, string> = {
    high: "高优先级",
    info: "信息",
    low: "低优先级",
    medium: "中优先级",
  };

  return labels[severity] ?? severity;
}
