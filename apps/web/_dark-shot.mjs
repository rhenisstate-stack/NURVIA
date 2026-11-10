import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
// The nav has a moon/theme toggle button; clicking it uses the app's own theming
const moon = page.locator("header svg.lucide-moon").first();
await moon.click();
await page.waitForTimeout(800);
const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
console.log("dark applied:", isDark);
await page.locator("#hero-heading").scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
await page.screenshot({ path: "C:/Users/gitau/AppData/Local/Temp/opencode/hero-shots/desktop-dark.png" });
await browser.close();
