const { chromium } = require("playwright");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const base =
    process.env.CALLBACK_TEST_URL || "http://127.0.0.1:8000/missed-call-demo/";
  await page.goto(base);
  await page.screenshot({
    path: "/tmp/callback-desktop.png",
    fullPage: true,
    animations: "disabled",
  });
  assert.equal(
    await page.title(),
    "CallBack AI — Every missed call. A new opportunity.",
  );
  assert.equal(await page.locator("#monthly-estimate").textContent(), "€3,248");
  await page.locator("#business-name").fill("Emerald Plumbing");
  await page.locator("#caller-number").fill("+353 87 555 0199");
  await page.locator("#quote-link").fill("https://example.com/booking");
  await page.locator("#simulate-button").click();
  assert.equal(await page.locator("#simulate-button").isDisabled(), true);
  assert.equal(await page.locator("#metric-calls").textContent(), "1");
  await page.waitForFunction(
    () => !document.querySelector("#simulate-button").disabled,
  );
  assert.match(
    await page.locator(".text-bubble").textContent(),
    /Emerald Plumbing/,
  );
  assert.equal(
    await page.locator(".text-bubble a").getAttribute("href"),
    "https://example.com/booking",
  );
  assert.equal(await page.locator("#metric-texts").textContent(), "1");
  await page.locator("#reply-button").click();
  assert.equal(await page.locator("#metric-leads").textContent(), "1");
  assert.equal(await page.locator("#metric-value").textContent(), "€250");
  assert.equal(await page.locator(".customer-bubble").count(), 1);
  assert.equal(await page.locator("#reply-button").isDisabled(), true);
  await page.locator("#job-value").fill("500");
  assert.equal(await page.locator("#metric-value").textContent(), "€500");
  await page.locator("#reply-rate").fill("150");
  assert.equal(
    await page.locator("#monthly-estimate").textContent(),
    "€25,980",
  );
  await page.locator("#missed-calls").fill("-10");
  assert.equal(await page.locator("#monthly-estimate").textContent(), "€0");
  await page.locator("#quote-link").fill("javascript:alert(1)");
  await page.locator("#business-name").fill("<img src=x onerror=alert(1)>");
  await page.locator("#simulate-button").click();
  await page.waitForFunction(
    () => !document.querySelector("#simulate-button").disabled,
  );
  assert.equal(await page.locator(".text-bubble a").count(), 0);
  assert.equal(await page.locator(".text-bubble img").count(), 0);
  assert.match(
    await page.locator(".text-bubble").textContent(),
    /javascript:alert\(1\)/,
  );
  assert.match(await page.locator(".text-bubble").textContent(), /<img/);
  // Speed up only the simulation timer to exercise the retained 20-item cap.
  await page.evaluate(() => {
    const original = window.setTimeout;
    window.setTimeout = (fn, ms, ...args) =>
      original(fn, ms === 2000 ? 1 : ms, ...args);
  });
  for (let i = 0; i < 20; i++) {
    await page.locator("#simulate-button").click();
    await page.waitForFunction(
      () => !document.querySelector("#simulate-button").disabled,
    );
  }
  assert.equal(await page.locator(".activity-entry").count(), 20);
  assert.equal(await page.locator("#metric-calls").textContent(), "22");
  assert.equal(await page.locator("#metric-texts").textContent(), "22");
  assert.equal(await page.locator("#activity-count").textContent(), "20 / 20");
  await page.reload();
  assert.equal(await page.locator("#metric-calls").textContent(), "0");
  await page.keyboard.press("Tab");
  assert.equal(
    await page.evaluate(() => document.activeElement.className),
    "skip-link",
  );
  await page.keyboard.press("Enter");
  assert.equal(new URL(page.url()).hash, "#workspace");
  for (const width of [320, 375, 390, 430, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      `overflow at ${width}`,
    );
    const broken = await page
      .locator('a[href^="#"]')
      .evaluateAll((links) =>
        links
          .filter((a) => a.hash && !document.getElementById(a.hash.slice(1)))
          .map((a) => a.hash),
      );
    assert.deepEqual(broken, []);
    if (width === 390) {
      await page.locator("#simulate-button").click();
      await page.waitForFunction(
        () => !document.querySelector("#simulate-button").disabled,
      );
      await page.locator("#reply-button").click();
      await page.screenshot({
        path: "/tmp/callback-mobile.png",
        fullPage: true,
        animations: "disabled",
      });
    }
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(
    await page
      .locator(".core")
      .evaluate((el) => getComputedStyle(el).animationName),
    "none",
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: simulation, delivery, reply, metrics, calculator, unsafe input, 20-entry cap, reload, keyboard, anchors, reduced motion, and six responsive widths. No browser errors.",
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
