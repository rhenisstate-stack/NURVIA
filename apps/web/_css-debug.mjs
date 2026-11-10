import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.on("response", (res) => {
  if (res.url().includes(".css")) console.log("CSS", res.status(), res.url());
});
page.on("requestfailed", (req) => console.log("FAILED", req.failure()?.errorText, req.url()));
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
const link = await page.evaluate(() =>
  Array.from(document.querySelectorAll("link[rel=stylesheet]")).map((l) => l.href)
);
console.log("STYLESHEET LINKS:", link);
console.log("BODY CLASS:", await page.evaluate(() => document.body.className));
await browser.close();
