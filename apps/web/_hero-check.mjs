import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });

await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
const qp = page.getByRole("region", { name: "Quick Practice" });

// 1. No rationale visible before selection
const rationaleBefore = await qp.getByText(/Clinical Reasoning & Rationale/).count();
console.log("rationale before selection:", rationaleBefore);

// 2. Select option B -> rationale appears; timer keeps format m:ss
await qp.getByRole("radio", { name: /To monitor the time it takes/ }).click();
await page.waitForTimeout(300);
console.log("rationale after selection:", await qp.getByText(/Clinical Reasoning & Rationale/).count());
await page.screenshot({ path: "C:/Users/gitau/AppData/Local/Temp/opencode/hero-shots/desktop-selected.png" });

// 3. Keep Going advances; Back returns
await qp.getByRole("button", { name: /Keep Going/ }).click();
console.log("after Keep Going:", await qp.getByText(/Question 2 of 3/).count());
await qp.getByRole("button", { name: "Back" }).click();
console.log("after Back:", await qp.getByText(/Question 1 of 3/).count());

// 4. Keyboard: "2" selects second option (no input focused); then typing in search input must NOT hijack
await page.keyboard.press("2");
await page.waitForTimeout(200);
console.log("keyboard digit select (B challenge):", await qp.getByText(/Clinical Reasoning & Rationale/).count());

const search = page.getByRole("searchbox");
await page.locator('input[placeholder*="Find Pharmacology"]').scrollIntoViewIfNeeded();
await page.locator('input[placeholder*="Find Pharmacology"]').click();
await page.keyboard.type("abc");
await page.waitForTimeout(300);
const q1 = await qp.getByText(/Question 1 of 3/).count();
console.log("still on question 1 while typing in search (input guard ok):", q1);
console.log("search value is 'abc':", await page.locator('input[placeholder*="Find Pharmacology"]').inputValue() === "abc");

// 5. CTA hrefs
console.log("primary href:", await page.getByRole("link", { name: /Try a Practice Set/ }).first().getAttribute("href"));
console.log("secondary href:", await page.getByRole("main").getByRole("link", { name: "Explore the Exam Library" }).getAttribute("href"));

// 6. Dark mode hero (theme toggle)
await page.locator("header").evaluate(() => undefined);
const toggle = page.getByRole("button", { name: /toggle|theme/i }).first();
if (await toggle.count()) {
  await page.evaluate(() => { document.documentElement.classList.add("dark"); document.documentElement.style.colorScheme = "dark"; });
  await page.waitForTimeout(400);
  await page.screenshot({ path: "C:/Users/gitau/AppData/Local/Temp/opencode/hero-shots/desktop-dark.png" });
  await page.evaluate(() => { document.documentElement.classList.remove("dark"); });
}

console.log("page errors:", errors.length ? errors : "none");
await browser.close();
