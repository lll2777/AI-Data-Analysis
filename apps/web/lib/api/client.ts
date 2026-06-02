import { getPublicEnv } from "@/lib/env";

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const { apiUrl } = getPublicEnv();
  const url = `${apiUrl}${path}`;
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch (error) {
    throw new Error(describeNetworkError({ apiUrl, error }));
  }

  if (!response.ok) {
    const detail = await readErrorDetail(response);
    const message = statusMessage(response.status);
    throw new Error(detail ? `${message}：${detail}` : message);
  }

  return response.json() as Promise<T>;
}

export function describeNetworkError({
  apiUrl,
  error,
}: {
  apiUrl: string;
  error: unknown;
}) {
  const detail = error instanceof Error ? error.message : String(error);
  const localApi = apiUrl.includes("localhost") || apiUrl.includes("127.0.0.1");
  if (localApi) {
    return [
      "无法连接本地后端服务。",
      "请确认 FastAPI 已启动，并检查前端地址与后端 CORS 配置是否匹配。",
      `API: ${apiUrl}`,
      `错误: ${detail}`,
    ].join(" ");
  }
  return [
    "网络请求失败。",
    "请检查网络连接、API 地址或服务端跨域配置。",
    `API: ${apiUrl}`,
    `错误: ${detail}`,
  ].join(" ");
}

function statusMessage(status: number) {
  const messages: Record<number, string> = {
    400: "请求参数不正确",
    401: "登录状态已失效，请重新登录",
    403: "当前账号没有访问权限",
    404: "请求的资源不存在",
    409: "当前资源状态不允许执行该操作",
    413: "文件超过上传大小限制",
    422: "提交的数据格式不正确",
    500: "服务器内部错误",
    503: "后端服务暂时不可用",
  };

  return messages[status] ?? `请求失败（${status}）`;
}

async function readErrorDetail(response: Response) {
  try {
    const payload = (await response.json()) as { detail?: unknown };
    if (typeof payload.detail === "string") {
      return payload.detail;
    }
    if (Array.isArray(payload.detail)) {
      return payload.detail
        .map((item) =>
          typeof item === "object" && item && "msg" in item
            ? String(item.msg)
            : String(item),
        )
        .join("; ");
    }
    return undefined;
  } catch {
    return undefined;
  }
}
