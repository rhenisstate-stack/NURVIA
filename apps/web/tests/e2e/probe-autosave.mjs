import { chromium } from "playwright";

const API = "http://localhost:5055";
const stamp = Date.now();
const learner = {
  name: "Autosave Probe",
  email: `autosave.${stamp}@nurviatest.example`,
  password: "AutosaveProbe-2026-Secure",
};

async function getCsrf(request) {
  const res = await request.get(`${API}/api/auth/csrf`);
  return (await res.json()).data;
}
async function apiRegister(request) {
  const res = await request.post(`${API}/api/auth/register`, {
    data: learner,
    headers: { "X-CSRF-TOKEN": await getCsrf(request) },
  });
  console.log("register:", res.status());
}
async function apiSignIn(request) {
  const res = await request.post(`${API}/api/auth/login`, {
    data: { email: learner.email, password: learner.password },
    headers: { "X-CSRF-TOKEN": await getCsrf(request) },
  });
  console.log("login:", res.status(), (await res.json()).data?.role);
}

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

// Network log for autosave PUTs and start
page.on("request", (req) => {
  if (req.url().includes("/api/attempts")) {
    console.log(">>", req.method(), req.url().replace(API, ""), (req.postData() || "").slice(0, 120));
  }
});
page.on("response", async (res) => {
  if (res.url().includes("/api/attempts") && res.request().method() !== "GET") {
    console.log("<<", res.status(), res.request().method(), res.url().replace(API, ""));
  }
});

// Register + sign in via API to establish cookies in the browser context
const apiCtx = context.request;
await apiRegister(apiCtx);
await apiSignIn(apiCtx);

// Sign in through the UI to establish the web session
// Establish web session: the API session cookie may auto-redirect us.
await page.goto("http://localhost:3000/sign-in", { waitUntil: "domcontentloaded" });
if (await page.locator("#email").count() > 0) {
  await page.locator("#email").fill(learner.email);
  await page.locator("#password").fill(learner.password);
  const signInBtn = page.locator("form").getByRole("button", { name: /Sign In/ });
  for (let i = 0; i < 5; i++) {
    try {
      await signInBtn.click({ timeout: 5000 });
      break;
    } catch {
      if (page.url().match(/\/learner/)) break;
    }
  }
}
await page.waitForURL(/\/learner$/, { timeout: 30000 });

// Go to exams and start the exam
await page.goto("http://localhost:3000/learner/exams");
await page.locator(`div:has(h2:text-is("ATI Comprehensive Pharmacology Practice Exam")) a:has-text("Start this exam")`).first().click();
await page.waitForURL(/\/exam-session/, { timeout: 30000 });
console.log("URL:", page.url());
await page.getByText("Item 1 of 2").waitFor({ timeout: 15000 });

// THE FAST SEQUENCE: click option then IMMEDIATELY click Next Item
await page.getByRole("button", { name: /Auscultate the apical pulse rate for one full minute/ }).click();
const preCls = await page.getByRole("button", { name: /Auscultate the apical pulse rate for one full minute/ }).getAttribute("class");
console.log("Q1 class immediately after click:", preCls?.includes("ring-brand-teal") ? "HIGHLIGHTED" : "NOT highlighted");

// Wait past the debounce window to see if a debounced PUT fires
await page.waitForTimeout(2000);
console.log("--- after 2s wait; any Q1 PUT above? ---");

await page.getByRole("button", { name: /Next Item/ }).click();
await page.getByText("Item 2 of 2").waitFor({ timeout: 15000 });

// Answer Q2 so a "Saved" state occurs
await page.getByRole("button", { name: /Nausea, vomiting, and diarrhea/ }).click();
await page.getByRole("button", { name: /Fine hand tremors becoming coarse/ }).click();
await page.getByRole("button", { name: /Slurred speech and muscle weakness/ }).click();
await page.getByText("Saved", { exact: true }).waitFor({ timeout: 15000 });

// Reload and inspect item 1 restore
await page.reload();
await page.getByText("Item 1 of 2").waitFor({ timeout: 15000 });
const btn = page.getByRole("button", { name: /Auscultate the apical pulse rate for one full minute/ });
const cls = await btn.getAttribute("class");
console.log("Q1 button class after reload:", cls?.includes("ring-brand-teal") || cls?.includes("border-brand-teal") ? "HIGHLIGHTED" : "NOT highlighted");

await browser.close();
