import { chromium } from "playwright";

const base = "http://localhost:3000";
const out = "C:/Users/gitau/Documents/NURVIA/docs/evidence/clinical-precision";
const stamp = Date.now();
const email = `cpsweep.${stamp}@nurviatest.example`;
const password = "Precision-2026-Secure";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

await page.goto(base + "/sign-up", { waitUntil: "networkidle" });
await page.fill("#name", "CP Sweep Learner");
await page.fill("#email", email);
await page.fill("#password", password);
const nameInput = page.locator("input[name='name']");
if ((await nameInput.count()) === 0) {
  // fallback: try common selectors if #name missing
  await page.locator("input").first().fill("CP Sweep Learner");
}
await page.click("button[type='submit']");
await page.waitForTimeout(4000);
console.log("after sign-up:", page.url());

const targets = [
  ["/learner", "learner-dashboard-auth-1440"],
  ["/learner/exams", "learner-exams-auth-1440"],
  ["/learner/performance", "learner-performance-auth-1440"],
  ["/admin", "admin-auth-1440"],
];
for (const [path, name] of targets) {
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}/${name}.png` });
  console.log(name, "->", page.url());
}
await browser.close();
