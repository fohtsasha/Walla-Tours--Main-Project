const { environment } = require('./environment');
const path = require('path');
const fs = require('fs');

// Ensure log dir exists
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

async function bypassChromeHttpWarningIfNeeded() {
  if (environment !== 'test') return;

  const timestamp = Date.now();
  const logPrefix = `[HTTP BYPASS ${timestamp}]`;

  try {
    // Only log if warning is detected
    const advancedBtn = await $('#details-button');
    if (await advancedBtn.isDisplayed()) {
      console.log(`${logPrefix} ⚠️ Chrome warning detected — clicking "Advanced"`);
      await advancedBtn.click();
      await browser.pause(500);
    }

    const proceedBtn = await $('#proceed-link, #proceed-button');
    if (await proceedBtn.isDisplayed()) {
      console.log(`${logPrefix} ⚠️ Clicking "Proceed to site"`);
      await browser.execute(el => el.click(), proceedBtn);
      await browser.pause(1500);
    }

    const urlAfter = await browser.getUrl();

    // ✅ Redirect Detection: Fail fast if not the real site
    if (!urlAfter.includes('wallatours.co.il')) {
      const redirectShot = path.join(logDir, `redirect_detected_${timestamp}.png`);
      await browser.saveScreenshot(redirectShot);
      console.log(`${logPrefix} ❌ Unexpected redirect — screenshot saved: ${redirectShot}`);
      throw new Error(`${logPrefix} ❌ Redirected to non-WallaTours page: ${urlAfter}`);
    }
  } catch (err) {
    const errorShot = path.join(logDir, `http_bypass_error_${Date.now()}.png`);
    await browser.saveScreenshot(errorShot);
    console.log(`${logPrefix} ❌ Error during HTTP bypass — screenshot saved: ${errorShot}`);
    throw err; // re-throw so the test fails
  }

  // Wait for valid URL (confirm we're not on chrome-error page)
  try {
    await browser.waitUntil(async () => {
      const url = await browser.getUrl();
      return url.includes('flights/form_query') || url.includes('wallatours');
    }, {
      timeout: 10000,
      timeoutMsg: `${logPrefix} ❌ Page did not load after bypassing Chrome warning`,
    });
  } catch (e) {
    const finalFailShot = path.join(logDir, `http_bypass_waitUntil_fail_${timestamp}.png`);
    await browser.saveScreenshot(finalFailShot);
    console.log(`${logPrefix} ❌ waitUntil failed — screenshot: ${finalFailShot}`);
  }
}

module.exports = { bypassChromeHttpWarningIfNeeded };
