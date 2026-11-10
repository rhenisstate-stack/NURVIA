import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
console.log("fallback present:", await page.getByTestId("hero-background-fallback").count());
console.log("video absent:", await page.getByTestId("hero-background-video").count());
await browser.close();
