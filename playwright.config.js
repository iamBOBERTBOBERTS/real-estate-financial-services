const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 30000,
  use: {
    baseURL: "http://127.0.0.1:4174",
    trace: "on-first-retry"
  },
  webServer: {
    command: "npm run start",
    url: "http://127.0.0.1:4174",
    reuseExistingServer: true,
    timeout: 15000
  },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium"
      }
    }
  ]
});
