import path from "node:path";

import { expect, test } from "@playwright/test";

import { getE2ECredentials, loginWithCredentials } from "./support/auth";

const credentials = getE2ECredentials();

test.describe("authenticated dataset workflow", () => {
  test.skip(
    !credentials,
    "Set E2E_USER_EMAIL and E2E_USER_PASSWORD to run the authenticated E2E workflow.",
  );

  test("uploads a sample dataset and exercises analysis tools", async ({
    page,
  }) => {
    if (!credentials) {
      return;
    }

    await loginWithCredentials(page, credentials);

    await expect(page.getByText(`已登录：${credentials.email}`)).toBeVisible({
      timeout: 15_000,
    });

    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByText("选择数据文件").click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(
      path.join(process.cwd(), "samples", "sales-demo.csv"),
    );

    await expect(page.getByText("sales-demo.csv")).toBeVisible();
    await page.getByRole("button", { name: "上传数据集" }).click();

    await expect(page.getByText(/已解析完成|已就绪/)).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByText("解析预览")).toBeVisible();

    await page.getByRole("button", { name: "生成图表" }).click();
    await expect(page.getByText("图表已生成。")).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByText("系统推荐").first()).toBeVisible({
      timeout: 30_000,
    });

    await page
      .getByPlaceholder("询问收入趋势、缺失值、异常点，或这些图表说明了什么...")
      .fill("请用中文总结这个数据集的收入趋势。");
    await page.getByRole("button", { name: "向 AI 提问" }).click();
    await expect(page.getByText("回答已生成。")).toBeVisible({
      timeout: 90_000,
    });
    await expect(page.locator("text=<tool_call>")).toHaveCount(0);

    await page.getByRole("button", { name: "运行智能体" }).click();
    await expect(page.getByText("智能体工作流已完成。")).toBeVisible({
      timeout: 90_000,
    });
    await expect(page.getByText("准备仪表盘").first()).toBeVisible();
    await expect(page.getByText("成功").first()).toBeVisible();
  });
});
