import { expect, test } from "@playwright/test";

test("public shell exposes auth routes and upload workspace", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "分析工作台" })).toBeVisible();
  await expect(page.getByRole("link", { name: "登录" })).toBeVisible();
  await expect(page.getByRole("link", { name: "创建账号" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "上传 CSV 或 Excel" }),
  ).toBeVisible();
  await expect(
    page.getByText("登录后才能把数据集上传到你的工作区。"),
  ).toBeVisible();

  await page.getByRole("link", { name: "登录" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "登录" })).toBeVisible();
  await expect(page.getByLabel("邮箱")).toBeVisible();
  await expect(page.getByLabel("密码")).toBeVisible();

  await page.getByRole("link", { name: "创建账号" }).click();
  await expect(page).toHaveURL(/\/register$/);
  await expect(page.getByRole("heading", { name: "创建账号" })).toBeVisible();
});

test("login form keeps user input after invalid credentials", async ({
  page,
}) => {
  await page.goto("/login");

  await page.getByLabel("邮箱").fill("not-a-real-user@example.com");
  await page.getByLabel("密码").fill("not-a-real-password");
  await page.getByRole("button", { name: "登录" }).click();

  await expect(page.getByLabel("邮箱")).toHaveValue(
    "not-a-real-user@example.com",
  );
  await expect(page.getByLabel("密码")).toHaveValue("not-a-real-password");
});
