import { expect, type Page } from "@playwright/test";

export type E2ECredentials = {
  email: string;
  password: string;
};

export function getE2ECredentials(): E2ECredentials | null {
  const email = process.env.E2E_USER_EMAIL?.trim();
  const password = process.env.E2E_USER_PASSWORD;

  if (!email || !password) {
    return null;
  }

  return { email, password };
}

export async function loginWithCredentials(
  page: Page,
  credentials: E2ECredentials,
  options: { timeoutMs?: number } = {},
) {
  const timeoutMs = options.timeoutMs ?? 20_000;
  const passwordInput = page.getByLabel("密码");

  await page.goto("/login");
  await page.getByLabel("邮箱").fill(credentials.email);
  await passwordInput.fill(credentials.password);
  await page.getByRole("button", { name: "登录" }).click();
  await passwordInput.fill("");

  await expect(page).toHaveURL(/\/$/, { timeout: timeoutMs });
  await expect(page.getByText(`已登录：${credentials.email}`)).toBeVisible({
    timeout: timeoutMs,
  });
}
