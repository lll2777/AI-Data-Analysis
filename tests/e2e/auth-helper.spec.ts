import { expect, test } from "@playwright/test";

import { loginWithCredentials } from "./support/auth";

test("login helper clears password before waiting for authenticated state", async ({
  page,
}) => {
  await expect(
    loginWithCredentials(
      page,
      {
        email: "not-a-real-user@example.com",
        password: "secret-password-that-should-not-stay-in-the-dom",
      },
      { timeoutMs: 500 },
    ),
  ).rejects.toThrow();

  await expect(page.getByLabel("邮箱")).toHaveValue(
    "not-a-real-user@example.com",
  );
  await expect(page.getByLabel("密码")).toHaveValue("");
});
