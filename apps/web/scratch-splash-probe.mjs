// Temporary diagnostic probe (scratch; not part of the app). Usage: node scratch-splash-probe.mjs <label>
import { chromium } from "playwright";

const base = process.env.PROBE_BASE || "http://localhost:3000";
const out = process.env.PROBE_OUT;
const label = process.argv[2] || "probe";
const routes = (process.env.PROBE_ROUTES || "/,/sign-in,/sign-up").split(",");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const consoleLines = [];
page.on("console", (m) => consoleLines.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => consoleLines.push(`[pageerror] ${e.message}`));
page.on("requestfailed", (r) => consoleLines.push(`[requestfailed] ${r.url()} ${r.failure()?.errorText}`));
page.on("response", (r) => { if (r.url().includes("/api/")) consoleLines.push(`[api] ${r.status()} ${r.url()}`); });

for (const route of routes) {
  consoleLines.length = 0;
  const t0 = Date.now();
  await page.goto(base + route, { waitUntil: "load" });
  await page.waitForTimeout(8000);
  const state = await page.evaluate(() => ({
    url: location.href,
    loaderOverlay: !!document.querySelector("div.fixed.inset-0.z-50"),
    loaderText: document.querySelector("div.fixed.inset-0.z-50")?.innerText?.replace(/\s+/g, " ").slice(0, 80) ?? null,
    h1: [...document.querySelectorAll("h1")].map((h) => h.innerText.trim()).slice(0, 3),
    hasForm: !!document.querySelector("form"),
    mainChildren: document.querySelector("main")?.children.length ?? 0,
  }));
  const name = `${label}${route.replace(/\//g, "_") || "_root"}`;
  if (out) await page.screenshot({ path: `${out}/${name}.png` });
  console.log(JSON.stringify({ route, elapsedMs: Date.now() - t0, ...state }));
  for (const l of consoleLines) console.log("   ", l);
}
await browser.close();
