import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const parsedBaseURL = new URL(baseURL);
const webServerHost = parsedBaseURL.hostname;
const webServerPort =
  parsedBaseURL.port || (parsedBaseURL.protocol === "https:" ? "443" : "80");
const browserChannel = process.env.CI
  ? process.env.PLAYWRIGHT_CHROMIUM_CHANNEL
  : (process.env.PLAYWRIGHT_CHROMIUM_CHANNEL ?? "chrome");

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer:
    process.env.PLAYWRIGHT_START_SERVER === "1"
      ? {
          command: `npm --workspace @ai-data-analysis/web run dev -- --hostname ${webServerHost} --port ${webServerPort}`,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          url: baseURL,
        }
      : undefined,
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...(browserChannel ? { channel: browserChannel } : {}),
      },
    },
  ],
});
