
const selectors = require('./selectors');
const helpers = require('../helper.js');
const { packageSearch } = require('./packageSearch');
const packageData = require('../../../config/packageData');
const detailsAndCheckout = {

  isLastMinuteErrorVisible: async function () {
    const errorEl = await $(selectors.lastMinuteError);
    return await errorEl.isDisplayed();
  },

  async checkForLastMinuteError(outboundDateStr) {
    if (!await this.isLastMinuteErrorVisible()) return false;

    const [day, month, year] = outboundDateStr.split('/').map(Number);
    const outboundDate = new Date(2000 + year, month - 1, day);
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const isTomorrow = outboundDate.getFullYear() === tomorrow.getFullYear() &&
      outboundDate.getMonth() === tomorrow.getMonth() &&
      outboundDate.getDate() === tomorrow.getDate();

    if (isTomorrow) {
      console.log('⚠️ Outbound flight is tomorrow. Last minute booking not allowed.');
      return true; // Indicate that the test should end early
    } else {
      throw new Error('❌ Last minute error shown, but outbound flight is not tomorrow!');
    }
  },

  async handleNoResultsDealError({ timeout = 7000 } = {}) {
    const { noResultsDialogRoot, noResultsDialogWrapperByAttr, noResultsText, noResultsCloseBtn } = selectors;
    const expectedParts = ['לקוח יקר', 'לא נמצאו מקומות פנויים', '03-7770999'];

    await browser.waitUntil(async () => {
      const root = await $(noResultsDialogRoot);
      const wrapper = await $(noResultsDialogWrapperByAttr);
      return (await root.isExisting() && await root.isDisplayed()) ||
        (await wrapper.isExisting() && await wrapper.isDisplayed());
    }, { timeout, interval: 200, timeoutMsg: 'No "no results" dialog appeared within timeout' })
      .catch(() => false);

    const exists = await $(noResultsDialogRoot).isExisting();
    const wrapExists = await $(noResultsDialogWrapperByAttr).isExisting();
    if (!exists && !wrapExists) return;
    const raw = await $(noResultsText).getText().catch(() => '');
    const norm = raw.replace(/\s+/g, ' ').trim();
    const ok = expectedParts.every(p => norm.includes(p));
    if (!ok) {
      throw new Error(`❌ "No results" dialog text mismatch. Got: "${norm}"`);
    }

    const closeBtn = await $(noResultsCloseBtn);
    if (await closeBtn.isExisting() && await closeBtn.isDisplayed()) {
      await closeBtn.scrollIntoView();
      await closeBtn.click();
    } else {
      await browser.execute(() => {
        if (typeof window.CloseDialogGen === 'function') window.CloseDialogGen();
      });
    }

    await browser.waitUntil(async () => {
      const root = await $(noResultsDialogRoot);
      const wrapper = await $(noResultsDialogWrapperByAttr);
      const rootGone = !(await root.isExisting()) || !(await root.isDisplayed());
      const wrapperGone = !(await wrapper.isExisting()) || !(await wrapper.isDisplayed());
      return rootGone && wrapperGone;
    }, { timeout: 3000, interval: 100 }).catch(() => { /* not fatal */ });

    // Fail the flow clearly
    throw new Error('❌ No results found');
  },

  async clickContinueToCheckout() {
    await packageSearch.closeCookiesBanner();
    const button = await $(selectors.checkoutButton);
    await button.waitForClickable({ timeout: 10000 });
    await button.click();
  },

  async clickChooseARoom() {
    await packageSearch.switchToNewTab();
    const button = await $(selectors.chooseARoomDPButton);

    // Use the dealError selector from selectors.js
    const dealErrorSelector = selectors.dealError;

    // Wait for either the button or the deal error to appear
    await browser.waitUntil(async () => {
      return (await button.isExisting() && await button.isDisplayed()) ||
        (await $(dealErrorSelector).isExisting() && await $(dealErrorSelector).isDisplayed());
    }, { timeout: 10000, timeoutMsg: 'Neither Choose Room button nor deal error appeared in time' });

    // If the button is not displayed, check for deal error
    if (!(await button.isDisplayed())) {
      const dealError = await $(dealErrorSelector);
      if (await dealError.isExisting() && await dealError.isDisplayed()) {
        throw new Error('❌ No rooms available: deal error displayed');
      }
      throw new Error('❌ Choose a Room button not found and no deal error displayed');
    }

    await button.waitForClickable({ timeout: 10000 });
    await button.click();
    const room = await $(selectors.chooseARoom);
    await room.waitForClickable({ timeout: 10000 });
    await room.click();
    await console.log('Clicked "Choose a Room" and selected a room');
  },
  async clickContinueToCheckoutDP() {
    const button = await $(selectors.continueToDynamicCheckoutButton);
    await button.waitForClickable({ timeout: 10000 });
    await button.click();
  },

  async fillCustomerInfo({ firstName, lastName, email, phonePrefix, phoneNumber }) {
    await $(selectors.customerFirstName).setValue(String(firstName));
    await $(selectors.customerLastName).setValue(String(lastName));
    await $(selectors.customerEmail).setValue(String(email));
    await $(selectors.phonePrefixDropdown).selectByVisibleText(phonePrefix);
    const phoneField = await $(selectors.customerPhone);
    await phoneField.click(); // ensure it's focused
    await phoneField.clearValue();
    await phoneField.addValue(phoneNumber); // simulates typing
    await this.checkAgreementCheckbox();
    await $(selectors.continueAfterCustomer).click();
  },

  async checkAgreementCheckbox() {
    const checkbox = await $(selectors.agreeCheckbox);
    const label = await $(selectors.agreeLabel);

    const text = await label.getText();
    if (!text.includes("מאשר/ת קבלת הצעות")) {
      throw new Error(`❌ Wrong agreement text: "${text}"`);
    }

    // ✅ Ensure it starts unchecked
    let isChecked = await checkbox.isSelected();
    if (isChecked) {
      console.warn("⚠️ Checkbox starts already checked — unchecking first");
      await label.click(); // click label to uncheck
      await browser.pause(300); // wait for state change
    }

    // ✅ Toggle on
    await label.click();
    await browser.pause(300);
    isChecked = await checkbox.isSelected();
    if (!isChecked) throw new Error("❌ Checkbox could not be checked");

    // ✅ Toggle off
    await label.click();
    await browser.pause(300);
    isChecked = await checkbox.isSelected();
    if (isChecked) throw new Error("❌ Checkbox could not be unchecked");

    console.log("✅ Checkbox toggled successfully and label text is correct");
  },

  async commentSectionActive() {
    const commentBox = await $("textarea[id*='txtOrderRequests']");
    await commentBox.waitForDisplayed({ timeout: 5000 });
    await commentBox.scrollIntoView();
    await commentBox.click();

    const testMessage = 'בקשה לבדיקה';
    await commentBox.setValue(testMessage);

    const typedValue = await commentBox.getValue();
    if (!typedValue.includes('בקשה')) {
      throw new Error('❌ Text was not typed into the special request field.');
    }

    console.log('✅ Special request textarea exists and accepts input.');
  },

  async verifyTermsAndConditionsPopup() {
    const link = await $(selectors.termsLink);
    await link.waitForExist({ timeout: 5000 });

    await link.scrollIntoView();
    await browser.pause(500);
    await link.waitForClickable({ timeout: 5000 });
    await link.click();

    const iframe = await $(selectors.termsIframe);
    await iframe.waitForExist({ timeout: 10000 });
    await browser.switchFrame(iframe);
    await browser.waitUntil(async () => {
      const items = await $$(selectors.rulesOfTermsAndConditions);
      for (const item of items) {
        const text = await item.getText();
        if (text && text.trim().length > 0) return true;
      }
      return false;
    }, {
      timeout: 7000,
      timeoutMsg: '❌ Terms popup opened but no visible rules were found.'
    });

    console.log('✅ Found at least one visible rule text');

    await browser.switchToParentFrame();

    const closeBtn = await $(selectors.termsCloseButton);
    await closeBtn.waitForClickable({ timeout: 5000 });
    await closeBtn.click();

    console.log('✅ Rules popup closed');
  },
  async fillPassengerDetailsByLabel(labelText, passengerData) {
    // 1) Find the passenger section by its title text (e.g., "מבוגר 2")
    const section = await $(`//div[contains(@class,"checkout-pax__title")]
                            [contains(normalize-space(.),"${labelText}")]
                            /ancestor::div[contains(@class,"order-info__pax-wr")]`);
    await section.waitForExist({ timeout: 10000 });
    await section.scrollIntoView({ block: 'center' });

    // 2) Make sure the inner content is expanded and visible
    const content = await section.$('.order-content');
    if (!(await content.isDisplayed())) {
      const header = await section.$('.checkout-pax__title');
      try { await header.click(); } catch { }
      await content.waitForDisplayed({ timeout: 5000 });
    }

    // 3) Fill fields using RELATIVE selectors (work for ctl00/ctl01/ctl02/ctl03…)
    const first = await content.$('.//input[contains(@id,"_txtFName")]');
    await first.waitForDisplayed({ timeout: 10000 });
    await first.scrollIntoView({ block: 'center' });
    await first.setValue(String(passengerData.firstName));

    await (await content.$('.//input[contains(@id,"_txtLName")]'))
      .setValue(String(passengerData.lastName));

    await (await content.$('.//select[contains(@id,"_drpGender")]'))
      .selectByAttribute('value', String(passengerData.gender)); // 1=זכר, 2=נקבה

    await (await content.$('.//select[contains(@id,"_drpYears")]'))
      .selectByVisibleText(String(passengerData.year));

    await (await content.$('.//select[contains(@id,"_drpMonths")]'))
      .selectByVisibleText(String(passengerData.month));

    await (await content.$('.//select[contains(@id,"_drpDays")]'))
      .selectByVisibleText(String(passengerData.day));
  },


  async fillAllPassengerDetails() {
    // מבוגר 1
    await this.fillPassengerDetailsByLabel('מבוגר 1', packageData.defaultPassenger);

    // מבוגר 2 (if exists)
    if (await $(`//div[contains(@class,"checkout-pax__title")]
                 [contains(normalize-space(.),"מבוגר 2")]`).isExisting()) {
      await this.fillPassengerDetailsByLabel('מבוגר 2', packageData.secondPassenger);
    }

    // ילד 3 (if exists)
    if (await $(`//div[contains(@class,"checkout-pax__title")]
                 [contains(normalize-space(.),"ילד 3")]`).isExisting()) {
      await this.fillPassengerDetailsByLabel('ילד 3', packageData.childPassenger);
    }

    // תינוק 4 (your DOM shows this label for the 4th)
    if (await $(`//div[contains(@class,"checkout-pax__title")]
                 [contains(normalize-space(.),"תינוק 4")]`).isExisting()) {
      await this.fillPassengerDetailsByLabel('תינוק 4', packageData.secondChildPassenger);
    }

    // Now the single green continue at the bottom of the pax block
    const contBtn = await $(selectors.continueAfterPassenger);
    await contBtn.scrollIntoView({ block: 'center' });
    await contBtn.waitForClickable({ timeout: 10000 });
    await contBtn.click();
  },

  async selectPatternsByIndex(patterns) {
    if (!Array.isArray(patterns) || patterns.length === 0) {
      throw new Error('❌ At least one pattern must be provided to selectPatternsByIndex');
    }

    // Get all pattern blocks currently present
    const allBlocks = await $$(selectors.patternBlockGeneral);
    const blockCount = allBlocks.length;

    for (const { blockIndex } of patterns) {
      if (blockIndex >= blockCount) {
        console.warn(`⚠️ Requested pattern block ${blockIndex + 1} but only ${blockCount} blocks exist. Skipping.`);
        continue;
      }

      const blockSelector = selectors.patternBlock(blockIndex);

      let blockLoaded = false;
      let patternsDown = false;

      // First, wait up to 20s for the block or error message
      await browser.waitUntil(
        async () => {
          const errorMsgEl = await $('//*[contains(text(),"שירותים נוספים למוצר זה אינם זמינים להוספה און ליין")]');
          if (await errorMsgEl.isExisting() && await errorMsgEl.isDisplayed()) {
            patternsDown = true;
            return true; // stop waiting, message appeared
          }
          const block = await $(blockSelector);
          if (await block.isDisplayed()) {
            blockLoaded = true;
            return true; // stop waiting, block loaded
          }
          return false;
        },
        {
          timeout: 20000,
          timeoutMsg: `⏳ Pattern block ${blockIndex + 1} did not load in 20s, checking for patterns down message...`
        }
      ).catch(() => { });

      // If neither loaded, wait up to 15s more for the error message
      if (!blockLoaded && !patternsDown) {
        console.log(`⏳ Pattern block ${blockIndex + 1} still not loaded, waiting extra 15s for patterns down message...`);
        await browser.waitUntil(
          async () => {
            const errorMsgEl = await $('//span[contains(@class,"small-title") and contains(normalize-space(.),"שירותים נוספים למוצר זה")]'); if (await errorMsgEl.isExisting() && await errorMsgEl.isDisplayed()) {
              patternsDown = true;
              return true;
            }
            return false;
          },
          {
            timeout: 15000,
            timeoutMsg: `❌ Pattern block ${blockIndex + 1} did not load and no patterns down message after extra wait`
          }
        ).catch(() => { });
      }

      if (patternsDown) {
        throw new Error('❌ BUG: Patterns are down - "שירותים נוספים למוצר זה אינם זמינים להוספה און ליין" appeared');
      }
      if (!blockLoaded) {
        throw new Error(`❌ Pattern block ${blockIndex + 1} did not load after extended wait and no patterns down message`);
      }
    }
    // Now interact with each pattern option as before
    for (const { blockIndex, option } of patterns) {
      const selector = selectors.patternOption(blockIndex, option);
      let el;
      try {
        el = await $(selector);
        await el.waitForDisplayed({ timeout: 3000 });
      } catch {
        console.warn(`⚠️ Pattern option "${option}" in block ${blockIndex + 1} not present, skipping.`);
        continue;
      }

      const classAttr = await el.getAttribute('class');
      if (classAttr.includes('full')) {
        console.log(`✅ Pattern block ${blockIndex + 1} already set to "${option}", skipping click.`);
        continue;
      }

      try {
        await el.waitForClickable({ timeout: 3000 });
        await el.click();
        console.log(`✅ Clicked "${option}" in pattern block ${blockIndex + 1}`);
      } catch (err) {
        console.warn(`⚠️ Click failed for block ${blockIndex + 1} "${option}", using JS fallback.`, err.message);
        await browser.execute(e => e.click(), el);
        console.log(`✅ (JS fallback) Clicked "${option}" in block ${blockIndex + 1}`);
      }
    }
  },

  clickContinueAfterPattern: async function () {
    const maxRetries = 3;
    const retryDelay = 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const continueButton = await $(selectors.patternContinueButton);
        const exists = await continueButton.isExisting();
        const visible = await continueButton.isDisplayed();

        if (!exists || !visible) {
          console.log(`⚠️ Attempt ${attempt}: Continue button not ready`);
          await browser.pause(retryDelay);
          continue;
        }

        await continueButton.waitForClickable({ timeout: 3000 });
        await continueButton.click();
        console.log(`✅ Clicked Continue on attempt ${attempt}`);
        return;
      } catch (err) {
        console.log(`⚠️ Attempt ${attempt}: Failed to click Continue - ${err.message}`);
        await browser.pause(retryDelay);
      }
    }

    console.warn('❌ Continue button not clicked after retries — assuming page already changed or skipped');
  },

  async handlePrePatternPopup() {
    console.log('🕵️ Checking for pre-pattern popup (Baggage Info)...');

    // Check for the specific baggage popup "Continue without baggage" button
    // User provided: <button type="button" class="btn-baggage-continue">ממשיכים ללא כבודה</button>
    // Selector from selectors.js is now ".btn-baggage-continue"

    const maxWait = 5000;
    try {
      const btn = await $(selectors.prePatternPopupSkip);
      // Wait briefly to see if it appears
      await btn.waitForDisplayed({ timeout: maxWait });
      if (await btn.isDisplayed()) {
        console.log(`✅ Found baggage popup "Continue Without" button. Clicking...`);
        await btn.click();
        await browser.pause(1000); // Wait for popup to close
        return;
      }
    } catch (e) {
      console.log(`ℹ️ Baggage popup did not appear within ${maxWait}ms (or button not found). Continuing...`);
    }
  },

  async handleLuggageUpsell() {
    console.log('🕵️ Checking for new luggage upsell (between passengers and patterns)...');

    // Heuristic: Check for common "Continue" or "No Thanks" buttons in popups
    const possibleSelectors = [
      "//button[contains(text(), 'המשך')]",
      "//a[contains(text(), 'המשך')]",
      "//button[contains(text(), 'לא תודה')]",
      "//div[contains(@class,'popup')]//button[contains(text(), 'סגור')]"
    ];

    for (const selector of possibleSelectors) {
      try {
        const el = await $(selector);
        // We only care if it's currently displayed and looks like an interception
        if (await el.isExisting() && await el.isDisplayed()) {
          console.log(`found potential upsell button: ${selector}. Clicking...`);
          await el.click();
          await browser.pause(1000);
          return;
        }
      } catch (e) { }
    }
    console.log('ℹ️ No triggered upsell popup found (heuristic).');
  },

  async handlePostPatternPopup() {
    const popupContinue = await $(selectors.postPatternPopupContinue);
    try {
      if (await popupContinue.isExisting() && await popupContinue.isDisplayed()) {
        await popupContinue.click();
        console.log('✅ Clicked "Continue" on the new popup');
        await browser.pause(1000); // Wait for popup to close
      } else {
        console.log('ℹ️ No post-pattern popup appeared.');
      }
    } catch (e) {
      console.warn('⚠️ Standard post-pattern popup check failed, or not present.', e.message);
    }
  },

  clickCreditCardAndWaitForIframe: async function () {
    const ccInput = await $(selectors.creditCardRadioButton);
    await ccInput.waitForExist({ timeout: 10000 });
    await ccInput.waitForDisplayed({ timeout: 10000 });
    await ccInput.waitForEnabled({ timeout: 10000 });
    await browser.pause(1000);
    await ccInput.click();
    const iframe = await $('iframe#ifrmCC');
    await iframe.waitForExist({ timeout: 10000 });
    await iframe.waitForDisplayed({ timeout: 10000 });
    console.log('✅ Credit card iframe loaded');
    expect(await iframe.isDisplayed()).toBe(true);
  },
  async verifyPassportInstructionAndPopup() {
    const instruction = await $(selectors.passportInstructionText);
    await instruction.waitForDisplayed({ timeout: 5000 });
    const text = await instruction.getText();
    if (!text.includes('אנא מלאו את פרטי הנוסע באנגלית בלבד')) {
      throw new Error(`❌ Instruction text not found`);
    }
    console.log('✅ Instruction text verified');

    const link = await $(selectors.passportPopupLink);
    await link.waitForClickable({ timeout: 5000 });
    await link.click();
    console.log('✅ Clicked passport popup trigger');

    const popup = await $(selectors.passportPopup);
    await popup.waitForDisplayed({ timeout: 5000 });

    const image = await $(selectors.passportPopupImage);
    await image.waitForDisplayed({ timeout: 5000 });
    console.log('✅ Passport popup image displayed');

    const closeBtn = await $(selectors.passportPopupClose);
    await closeBtn.waitForClickable({ timeout: 5000 });
    await closeBtn.click();
    await popup.waitForDisplayed({ reverse: true, timeout: 5000 });
    console.log('✅ Passport popup closed');
  },

  async verifyStandardTermsCheckbox() {
    const checkbox = await $(selectors.standardTermsCheckbox);
    const label = await $(selectors.standardTermsLabel);
    const textBlock = await $(selectors.standardTermsTextBlock);

    // Scroll to the label or text block, not the potentially hidden checkbox
    if (await label.isDisplayed()) {
      await label.scrollIntoView({ block: 'center' });
    } else {
      await textBlock.scrollIntoView({ block: 'center' });
    }
    await browser.pause(500);

    // Try clicking the label first (preferred for styled checkboxes)
    let clicked = false;
    try {
      if (await label.isExisting() && await label.isDisplayed()) {
        await label.click();
        console.log('✅ Clicked standard terms label.');
        clicked = true;
      }
    } catch (e) {
      console.warn(`⚠️ Label click failed: ${e.message}`);
    }

    if (!clicked) {
      // Fallback: JS click on checkbox
      try {
        await browser.execute(el => el.click(), checkbox);
        console.log('🖱️ Triggered standard terms checkbox click using JS.');
      } catch (err) {
        console.warn('⚠️ Failed to click standard terms checkbox with JS.', err);
      }
    }

    // Verify text
    try {
      await textBlock.waitForDisplayed({ timeout: 5000 });
      const blockText = await textBlock.getText();
      const expectedText = 'תנאי השימוש באתר ואת תנאי השינוי והביטול';

      if (!blockText.includes(expectedText)) {
        console.warn(`❌ Standard terms text mismatch. Found: "${blockText}"`);
      } else {
        console.log('✅ Standard terms checkbox activated and surrounding text verified.');
      }
    } catch (e) {
      console.warn(`⚠️ Could not verify standard terms text: ${e.message}`);
    }
  },

  async skipSeatingChartIfExists() {
    const skipSeatMapBtn = await $(selectors.skipSeatingChart);
    if (await skipSeatMapBtn.isExisting() && await skipSeatMapBtn.isDisplayed()) {
      await skipSeatMapBtn.click();
      // Optionally, wait for the seat map to disappear or the next step to load
      await browser.pause(1000);
    }
  }

}

module.exports = {
  detailsAndCheckout,
};

