import { chromium } from "playwright";

const stamp = Date.now();
const learner = {
  name: "Signout Probe",
  email: `signout.${stamp}@nurviatest.example`,
  password: "SignoutProbe-2026-Secure",
};

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

page.on("response", async (res) => {
  if (res.url().includes("/api/auth/")) {
    let body = "";
    try { body = (await res.text()).slice(0, 120); } catch {}
    console.log("<<", res.status(), res.request().method(), res.url().replace("http://localhost:5055", ""), body);
  }
});

// Register via API
const csrfRes = await context.request.get("http://localhost:5055/api/auth/csrf");
const csrf = (await csrfRes.json()).data;
await context.request.post("http://localhost:5055/api/auth/register", {
  data: learner, headers: { "X-CSRF-TOKEN": csrf },
});

// Sign in via UI (fresh page load)
await page.goto("http://localhost:3000/sign-in", { waitUntil: "domcontentloaded" });
await page.locator("#email").fill(learner.email);
await page.locator("#password").fill(learner.password);
const btn = page.locator("form").getByRole("button", { name: /Sign In/ });
for (let i = 0; i < 5; i++) {
  try { await btn.click({ timeout: 5000 }); break; }
  catch { if (page.url().match(/\/learner/)) break; }
}
await page.waitForURL(/\/learner$/, { timeout: 30000 });
console.log("signed in, at:", page.url());

// Full page load of /learner (like the e2e goto)
await page.goto("http://localhost:3000/learner");
await page.waitForURL(/\/learner$/, { timeout: 15000 }).catch(() => {});
await page.waitForTimeout(3000);
console.log("after goto /learner, url:", page.url());

// Click Sign Out
const signOutBtn = page.getByRole("button", { name: "Sign Out" }).first();
await signOutBtn.click({ timeout: 15000 });
await page.waitForTimeout(3000);
console.log("after Sign Out click, url:", page.url());

// Go back to /learner
await page.goto("http://localhost:3000/learner");
await page.waitForTimeout(5000);
console.log("final url:", page.url());
const h1 = await page.locator("h1").first().textContent().catch(() => "none");
console.log("h1:", h1);

await browser.close();
