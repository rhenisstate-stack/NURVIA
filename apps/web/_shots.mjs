import { chromium } from "playwright";

const base = "http://localhost:3000";
const out = "C:/Users/gitau/Documents/NURVIA/docs/evidence/clinical-precision";
const shots = [
  ["", "home-hero-dark-1440"],
  ["/exams", "exam-library-dark-1440"],
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(base, { waitUntil: "networkidle" });
await page.evaluate(() => {
  localStorage.setItem("nurvia_theme", "dark");
  document.documentElement.classList.add("dark");
});
for (const [path, name] of shots) {
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}/${name}.png` });
  console.log("captured", name);
}
await browser.close();
