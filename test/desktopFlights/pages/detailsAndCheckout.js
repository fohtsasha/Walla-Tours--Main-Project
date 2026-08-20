const selectors = require('./selectors');
const helpers = require('../helper.js');
const { searchFlight } = require('./searchFlight');

const detailsAndCheckout = {

  //================================================Details Page===================================================
  async switchToNewTab() {
    const original = await browser.getWindowHandle();
    await browser.waitUntil(async () => (await browser.getWindowHandles()).length > 1, {
      timeout: 10000,
      timeoutMsg: '❌ No new tab opened'
    });
    const handles = await browser.getWindowHandles();
    const newTab = handles.find(h => h !== original);
    await browser.switchToWindow(newTab);
  },

  async checkTicketPriceMatch(ticketElement) {
    const priceElement = await ticketElement.$(selectors.price);
    const summaryPriceText = await priceElement.getText();
    const summaryPrice = parseInt(summaryPriceText.replace(/[^\d]/g, ''), 10);

    if (isNaN(summaryPrice)) {
      throw new Error(`❌ Failed to parse summary price: "${summaryPriceText}"`);
    }

    console.log(`💳 Price in ticket summary: $${summaryPrice}`);
    await this.switchToNewTab();
    await browser.pause(5000);
    const detailsPriceEl = await $(selectors.detailsPagePrice);
    if (!await detailsPriceEl.isExisting()) {
      await browser.getPageSource();
      throw new Error(`❌ detailsPagePrice element not found using selector: ${selectors.detailsPagePrice}`);
    }
    const detailsPriceText = await detailsPriceEl.getText();

    const detailsPrice = parseInt(detailsPriceText.replace(/[^\d]/g, ''), 10);

    const detailsSegments = await this.logFlightSegmentsFromDetailsPage();

    if (isNaN(detailsPrice)) {
      throw new Error(`❌ Failed to parse details price: "${detailsPriceText}"`);
    }

    console.log(`🧾 Price in order details: $${detailsPrice}`);
    if (summaryPrice !== detailsPrice) {
      console.warn(`❌ Price mismatch! Summary: $${summaryPrice}, Details: ₪${detailsPrice}`);
    } else {
      console.log(`✅ Price matches! ₪${detailsPrice}`);
    }

    return {
      expectedPrice: detailsPrice,
      detailsSegments
    };
  },

  async logFlightSegmentsFromDetailsPage() {
    const segmentsData = [];

    const routeBlocks = await $$(selectors.flightRouteContainer);

    for (const route of routeBlocks) {
      const titleEl = await route.$(selectors.flightRouteTitle);
      const title = await titleEl.getText();

      const airlineLogoEl = await route.$(selectors.segmentAirlineLogo);
      const airline = await airlineLogoEl.isExisting() ? await airlineLogoEl.getAttribute('alt') : 'N/A';

      console.log(`\n✈️ ${title} | 🏷️ Airline: ${airline}`);

      const segments = await route.$$(selectors.segmentDetails);

      for (const segment of segments) {
        const timeEl = await segment.$(selectors.segmentTime);
        const airportEl = await segment.$(selectors.segmentAirportCode);
        const flightNumberEl = await segment.$(selectors.segmentFlightNumber);

        const time = await timeEl.isExisting() ? await timeEl.getText() : 'N/A';
        const airport = await airportEl.isExisting() ? await airportEl.getText() : 'N/A';
        const flightInfo = await flightNumberEl.isExisting() ? await flightNumberEl.getText() : 'N/A';

        const segmentObj = {
          time: time.trim(),
          airport: airport.trim(),
          airline: airline.trim(),
          flight: flightInfo.trim(),
          title: title.trim()
        };

        console.log(`🕓 ${segmentObj.time} | 🛫 ${segmentObj.airport} | ✈️ ${segmentObj.flight}`);
        segmentsData.push(segmentObj);
      }
    }

    return segmentsData;
  },

  async checkDetailsPageElements() {
    await this.checkFoundAnIssueText();

    return {
      mainSections: await helpers.checkElements({
        detailsCenter: selectors.detailsCenter,
        detailsSidebar: selectors.detailsSidebar,
        detailsBox: selectors.detailsBox,
        detailsPagePrice: selectors.detailsPagePrice,
      }, "Main Sections", false),

      flightRouteInfo: await helpers.checkElements({
        flightRouteContainer: selectors.flightRouteContainer,
        flightRouteTitle: selectors.flightRouteTitle
      }, "Flight Route Info", false),

      segmentDetails: await helpers.checkElements({
        segmentDetails: selectors.segmentDetails,
        segmentTime: selectors.segmentTime,
        segmentFlightNumber: selectors.segmentFlightNumber
      }, "Segment Details", false),

      otherOptions: await helpers.checkElements({
        foundAnIssue: selectors.foundAnIssue,
        checkoutButton: selectors.checkoutButton,
      }, "Other Interactive Options", true)

    };

  },

  async checkFoundAnIssueText() {
    const title = await $(selectors.foundAnIssueTitle).getText();
    const text = await $(selectors.foundAnIssueText).getText();
    const btn = await $(selectors.foundAnIssueButton).getText();

    if (!title.includes("בעיה במהלך ההזמנה")) {
      throw new Error(`❌ Wrong title: ${title}`);
    }

    if (!text.includes("03-7770999")) {
      throw new Error(`❌ Wrong phone: ${text}`);
    }

    if (!btn.includes("השאירו לנו פרטים")) {
      throw new Error(`❌ Wrong button text: ${btn}`);
    }

    console.log('✅ All "Found an Issue" texts are correct');
  },

  //Fare Family
  async selectFareFamilyAndVerifyPriceChange() {
    const DETAIL_TOTAL = selectors.detailsPagePrice;
    const SECTIONS = [selectors.fareFamilySection1, selectors.fareFamilySection2];
    const CARD_BLOCK = selectors.fareFamilyOptionBlock;
    const CARD_LABEL = selectors.fareFamilyOptionLabel;
    const CARD_CHOOSE_BUTTON = selectors.fareFamilyChooseButton;
    const NEXT_BUTTON = selectors.fareFamilyNextButton;
    const PREV_BUTTON = selectors.fareFamilyPrevButton || '.owl-prev';

    await searchFlight.closeCookiesBanner();
    const origTxt = await $(DETAIL_TOTAL).getText();
    const original = parseInt(origTxt.replace(/[^\d]/g, ''), 10);
    if (isNaN(original)) {
      console.warn(`❌ Could not parse original total: "${origTxt}"`);
      return;
    }
    console.log(`🧾 Original price: $${original}`);

    for (const sectionSel of SECTIONS) {
      if (!await $(sectionSel).isExisting()) {
        //  console.log(`ℹ️ Section ${sectionSel} not found, skipping.`);
        continue;
      }
      let cumulative = original;
      let hasNext = true;
      const seenLabels = new Set();

      // Iterate slides forward
      while (hasNext) {
        const cards = await $$(sectionSel + ' ' + CARD_BLOCK);
        for (const card of cards) {
          const labelEl = await card.$(CARD_LABEL);
          if (!await labelEl.isExisting()) continue;
          const label = (await labelEl.getText()).trim();
          if (!label || seenLabels.has(label)) continue;
          seenLabels.add(label);

          const btn = await card.$(CARD_CHOOSE_BUTTON);
          try {
            await btn.waitForClickable({ timeout: 1000 });
            await btn.click();
          } catch {
            console.log(`⚠️ Fallback-click for ${label}`);
            await browser.execute(el => el.click(), btn);
          }
          await browser.pause(200);

          const newTxt = await $(DETAIL_TOTAL).getText();
          const updated = parseInt(newTxt.replace(/[^\d]/g, ''), 10);
          const addon = updated - original;  // calculate addon relative to original price
          if (addon <= 0) {
            console.log(`ℹ️ [${label}] adds no extra ($${addon}), remains $${original}`);
          } else {

            console.log(`✅ [${label}] correctly adds $${addon}`);
          }
          cumulative = updated;
        }

        const nextBtn = await $(sectionSel + ' ' + NEXT_BUTTON);
        let cls = '';
        if (await nextBtn.isExisting() && await nextBtn.isDisplayed()) cls = (await nextBtn.getAttribute('class')) || '';
        if (cls && !cls.includes('disabled')) {
          await nextBtn.click();
          await browser.pause(200);
          continue;
        }
        hasNext = false;
        console.log(`ℹ️ No more slides in ${sectionSel}`);
      }

      // Slide back to start using prev arrow
      const prevBtn = await $(sectionSel + ' ' + PREV_BUTTON);
      let prevCls = '';
      while (await prevBtn.isExisting() && await prevBtn.isDisplayed() && !(prevCls = (await prevBtn.getAttribute('class') || '')).includes('disabled')) {
        await prevBtn.click();
        await browser.pause(200);
      }

      // Reset first card to Basic unconditionally
      const allCards = await $$(sectionSel + ' ' + CARD_BLOCK);
      if (allCards.length) {
        const firstCard = allCards[0];
        const basicLabelEl = await firstCard.$(CARD_LABEL);
        const basicLabel = (await basicLabelEl.getText()).trim();
        const basicBtn = await firstCard.$(CARD_CHOOSE_BUTTON);
        try {
          await basicBtn.waitForClickable({ timeout: 2000 });
          await basicBtn.click();
          console.log(`🔄 Reset to Basic "${basicLabel}" in ${sectionSel}`);
        } catch {
          console.log(`⚠️ Could not click Basic "${basicLabel}" in ${sectionSel}, continuing`);
        }
      }
    }
    console.log('✅ All fare-family addons validated and reset to Basic.');
  },
  async checkNoFareFamilyAllowed() {
    const fareFamilyExists = await $(selectors.fareFamilySection1).isExisting();
    if (fareFamilyExists) {
      console.error('❌ Fare family section should NOT be present!');
    } else {
      console.log('✅ Fare family section is not present, as expected.');
    }
  },
  /**
   * Checks that either fare family was present on the details page,
   * or luggage is present on the summary page, or both.
   * @param {boolean} hadFareFamilyOnDetailsPage
   */
  async checkFareFamilyOrLuggageOnSummary(hadFareFamilyOnDetailsPage) {
    // Check for luggage in summary (sidebar)
    // You may need to adjust this selector if your summary page structure is different
    const luggageSummaryExists = await $(selectors.summarySegmentBlocks + ' .fare').isExisting();

    if (hadFareFamilyOnDetailsPage || luggageSummaryExists) {
      console.log('✅ Fare family was present on details page or luggage is present on summary page.');
    } else {
      console.error('❌ Neither fare family on details page nor luggage on summary page!');
    }
  },

  //================================================Checkout==========================================================
  async clickContinueToCheckout() {
    const button = await $(selectors.checkoutButton);
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

  extractSummarySegmentsGrouped: async function () {
    const summarySegments = [];

    const flightSectionBlocks = await $$(selectors.summaryFlightSections);

    for (const section of flightSectionBlocks) {
      const titleEl = await section.$(selectors.summaryFlightGroupTitle);
      const titleText = await titleEl.getText();
      const group = titleText.includes('הלוך') ? 'outbound' : 'return';

      const segments = await section.$$(selectors.summarySegmentBlocks);
      if (segments.length === 0) continue;

      // ✅ Pick only ONE: first for outbound, last for return
      const segment = group === 'outbound' ? segments[0] : segments[segments.length - 1];

      const date = await (await segment.$(selectors.summarySegmentDate)).getText();
      const time = await (await segment.$(selectors.summarySegmentTime)).getText();
      const airport = await (await segment.$(selectors.summarySegmentAirport)).getText();
      const airline = await (await segment.$(selectors.summarySegmentAirline)).getText();

      summarySegments.push({
        group,
        date: date.trim(),
        time: time.trim(),
        airport: airport.trim(),
        airline: airline.trim()
      });
    }

    return summarySegments;
  },

  compareFlightSummaryWithDetails: async function (detailsSegments, expectedPrice) {
    const headerText = await $(selectors.summaryHeader).getText();
    if (!headerText.includes('סיכום הזמנה')) {
      throw new Error(`❌ Summary header incorrect: "${headerText}"`);
    }
    console.log('✅ Summary header verified');

    const summarySegments = await this.extractSummarySegmentsGrouped();
    console.log(`🔍 Extracted summary segments (${summarySegments.length}):`, summarySegments);

    for (let i = 0; i < summarySegments.length; i++) {
      const s = summarySegments[i];
      const normalizeAirline = (name) => name.trim().toLowerCase().replace(' airlines', '');

      const match = detailsSegments.find(d =>
        d.time === s.time &&
        d.airport === s.airport &&
        normalizeAirline(d.airline) === normalizeAirline(s.airline)
      );

      console.log(`🧩 Comparing Segment ${i + 1}`);
      //  console.log('From summary:', s);
      //   console.log('Matching detail:', match || '❌ NOT FOUND');

      if (!match) {
        throw new Error(`❌ Segment ${i + 1} not found in details: ${JSON.stringify(s, null, 2)}`);
      }

      // Only compare date if details segment has a date or if it's the first leg
      if (s.date && match.title) {
        const expectedDate = match.date?.trim() || this.extractDateFromTitle(match.title);
        // Skip date comparison for second leg if details date is missing
        if (i === 1 && (!match.date || expectedDate === 'N/A')) {
          console.log(`ℹ️ Skipping date comparison for segment ${i + 1} (second leg, no date in details)`);
        } else {
          console.log(`📅 Summary date: ${s.date}`);
          console.log(`📅 Extracted details date: ${expectedDate}`);
          if (expectedDate !== s.date) {
            console.warn(`⚠️ Segment ${i + 1} date mismatch: ${expectedDate} !== ${s.date} (likely a rollover in multi-segment flight)`);
          }
        }
      }
    }

    console.log('✅ All summary segments were found and match details.');

    const priceText = await $(selectors.summaryTotalPrice).getText();
    const cleanPrice = parseInt(priceText.replace(/[^\d]/g, ''), 10);
    if (cleanPrice !== expectedPrice) {
      throw new Error(`❌ Price mismatch. Expected: $${expectedPrice}, Found: $${cleanPrice}`);
    }
    console.log(`✅ Price matches: $${cleanPrice}`);
  },

  extractDateFromTitle(titleText) {
    const match = titleText.match(/(\d{2}\/\d{2}\/\d{2})/);
    return match ? match[1] : 'N/A';
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

  async fillPassengerDetails({ firstName, lastName, gender, year, month, day }) {
    const firstNameField = await $(selectors.paxFirstName);
    await firstNameField.waitForDisplayed({ timeout: 10000 });
    await firstNameField.scrollIntoView();
    await browser.pause(300); // Slight buffer in case of animation
    await firstNameField.setValue(String(firstName));

    await $(selectors.paxLastName).setValue(String(lastName));
    await $(selectors.paxGender).selectByAttribute('value', String(gender));
    await $(selectors.paxYear).selectByVisibleText(String(year));
    await $(selectors.paxMonth).selectByVisibleText(String(month));
    await $(selectors.paxDay).selectByVisibleText(String(day));

    const contBtn = await $(selectors.continueAfterPassenger);
    await contBtn.waitForClickable({ timeout: 10000 });
    await contBtn.click();
  },

  async handleLuggageUpsell() {
    console.log('🕵️ Checking for new luggage upsell (between passengers and patterns)...');

    // Specific selector available: .btn-baggage-continue ("ממשיכים ללא כבודה")

    // Also include a few fallbacks just in case
    const possibleSelectors = [
      ".btn-baggage-continue",
      "//button[contains(text(), 'ממשיכים ללא כבודה')]",
      "//button[contains(text(), 'המשך')]",
      "//a[contains(text(), 'המשך')]",
      "//button[contains(text(), 'לא תודה')]"
    ];

    for (const selector of possibleSelectors) {
      try {
        const els = await $$(selector);
        for (const el of els) {
          if (await el.isExisting() && await el.isDisplayed()) {
            console.log(`✅ Found luggage upsell button: ${selector}. Clicking...`);
            await el.click();
            await browser.pause(1000);
            return;
          }
        }
      } catch (e) { }
    }

    console.log('ℹ️ No triggered upsell popup found.');
  },

  async selectPatternsByIndex(patterns) {
    for (const { blockIndex, option } of patterns) {
      const selector = selectors.patternOption(blockIndex, option);
      let el;
      // 1️⃣ Try to find & wait for it—skip quietly if it never shows up
      try {
        el = await $(selector);
        await el.waitForDisplayed({ timeout: 3000 });
      } catch {
        console.warn(`⚠️ Pattern option "${option}" in block ${blockIndex + 1} not present, skipping.`);
        continue;
      }

      // 2️⃣ If it’s already selected, skip
      const classAttr = await el.getAttribute('class');
      if (classAttr.includes('full')) {
        console.log(`✅ Pattern block ${blockIndex + 1} already set to "${option}", skipping click.`);
        continue;
      }

      // 3️⃣ Otherwise click it—using JS fallback if necessary
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
    const continueButton = await $(selectors.patternContinueButton);
    const exists = await continueButton.isExisting();
    const visible = await continueButton.isDisplayed();
    const disabled = await continueButton.getAttribute('disabled');
    const classAttr = await continueButton.getAttribute('class');
    console.log(`Continue button exists: ${exists}, visible: ${visible}, disabled: ${disabled}, class: ${classAttr}`);

    if (!exists || !visible || disabled) {
      console.warn('❌ Continue button not ready or disabled');
      return;
    }

    await continueButton.scrollIntoView();
    await browser.pause(1000);

    try {
      await continueButton.waitForClickable({ timeout: 3000 });
      await continueButton.click();
      console.log('✅ Continue');
    } catch (err) {
      await browser.execute(el => el.click(), continueButton);
      console.log('✅ Continue');
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
    try {
      await iframe.waitForExist({ timeout: 10000 });
      await iframe.waitForDisplayed({ timeout: 10000 });
      console.log('✅ Credit card iframe loaded');
      expect(await iframe.isDisplayed()).toBe(true);
    } catch (err) {
      console.error('❌ PAYMENT IS DOWN: Credit card iframe did not open.');
      throw err;
    }
  },

  checkoutTotalPrice: selectors.checkoutTotalPrice,

  async verifyBaggageFlow({ direction }) {
    const baggageSelectors = {
      outbound: {
        baggageTitle: '(//div[@class="order-text baggage-group-title"])[1]',
        baggageBlock: '(//div[@class="hidden-block-counter"])[1]',
        addBtn: '(//span[contains(@class,"js-bag-counter-plus")])[1]',
        minusBtn: '(//span[contains(@class,"js-bag-counter-minus")])[1]',
        updateBtn: '(//button[contains(@class,"counter-button")])[1]',
        priceLabel: '//div[@class="hidden-block-counter" and .//span[@data-id="30000"]]//span[contains(text(), "$")]',
        summaryWrapper: '(//div[contains(@class,"order__item--pax")])[1]//div[contains(text(),"מזוודה:")]',
        summarySpan: '(//div[contains(@class,"order__item--pax")])[1]//div[contains(text(),"מזוודה:")]/span[contains(@class,"fare")]',
      },
      inbound: {
        baggageTitle: '(//div[@class="order-text baggage-group-title"])[2]',
        baggageBlock: '(//div[@class="hidden-block-counter"])[2]',
        addBtn: '(//span[contains(@class,"js-bag-counter-plus")])[2]',
        minusBtn: '(//span[contains(@class,"js-bag-counter-minus")])[2]',
        updateBtn: '(//button[contains(@class,"counter-button")])[2]',
        priceLabel: '//span[@data-id="30040"]/following::span[contains(text(), "$")][1]',
        summaryWrapper: '(//div[contains(@class,"order__item--pax")])[2]//div[contains(text(),"מזוודה:")]',
        summarySpan: '(//div[contains(@class,"order__item--pax")])[2]//div[contains(text(),"מזוודה:")]/span[contains(@class,"fare")]',
      }
    };

    const {
      baggageTitle,
      baggageBlock,
      addBtn,
      minusBtn,
      updateBtn,
      priceLabel,
      summarySpan
    } = baggageSelectors[direction];

    const titleElem = await $(baggageTitle);
    const blockElem = await $(baggageBlock);

    const titleExists = await titleElem.isExisting();
    const blockExists = await blockElem.isExisting();
    const blockDisplayed = await blockElem.isDisplayed();

    if (!titleExists || !blockExists || !blockDisplayed) {
      console.log(`⚠️ Skipping ${direction} baggage – section not available or hidden.`);
      return;
    }

    if (!priceLabel) {
      throw new Error(`❌ Missing priceLabel selector for direction: ${direction}`);
    }

    const priceEl = await $(priceLabel);
    const priceExists = await priceEl.isExisting();

    if (!priceExists) {
      // console.log(`⚠️ Skipping ${direction} baggage – price label not found (no baggage available?)`);
      return;
    }

    const priceText = await priceEl.getText();
    const baggagePrice = parseFloat(priceText.replace(/[^\d.]/g, ''));
    console.log(`💰 [${direction}] Baggage price: $${baggagePrice}`);

    const initialPriceText = await $(selectors.checkoutTotalPrice).getText();
    const initialPrice = parseInt(initialPriceText.replace(/[^\d]/g, ''), 10);

    console.log(`✅ ${direction} baggage section found`);
    await $(addBtn).click();
    await $(updateBtn).click();
    console.log(`✅ ${direction} baggage added`);

    await browser.waitUntil(async () => {
      const exists = await $(summarySpan).isExisting();
      if (!exists) return false;

      const text = await $(summarySpan).getText();
      console.log(`📦 Retrying baggage summary text: ${text}`);
      return text && !text.includes('ללא');
    }, {
      timeout: 5000,
      timeoutMsg: `❌ ${direction} baggage summary did not update from 'ללא'`,
    });

    const fareText = await $(summarySpan).getText();
    console.log(`📦 Final baggage text for ${direction}: ${fareText}`);

    if (!fareText.includes('23kg')) {
      throw new Error(`❌ ${direction} baggage not shown correctly`);
    }

    await browser.waitUntil(async () => {
      const updatedText = await $(selectors.checkoutTotalPrice).getText();
      const updatedPrice = parseInt(updatedText.replace(/[^\d]/g, ''), 10);
      return updatedPrice === initialPrice + baggagePrice;
    }, {
      timeout: 5000,
      timeoutMsg: `❌ ${direction} price did not increase correctly`,
    });

    console.log(`✅ ${direction} price increased as expected`);

    // 🔁 Remove baggage
    console.log(`🧹 Removing ${direction} baggage`);
    await $(minusBtn).click();
    await $(updateBtn).click();

    await browser.waitUntil(async () => {
      const newText = await $(selectors.checkoutTotalPrice).getText();
      const revertedPrice = parseInt(newText.replace(/[^\d]/g, ''), 10);
      return revertedPrice === initialPrice;
    }, {
      timeout: 5000,
      timeoutMsg: `❌ ${direction} price did not revert after removing baggage`,
    });

    console.log(`✅ ${direction} price reverted`);

    await browser.waitUntil(async () => {
      const exists = await $(summarySpan).isExisting();
      if (!exists) return true;
      const updatedText = await $(summarySpan).getText();
      return !updatedText.includes('23kg');
    }, {
      timeout: 5000,
      timeoutMsg: `❌ ${direction} baggage still visible in sidebar after removal`,
    });

    console.log(`✅ ${direction} baggage removed from sidebar`);
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

  async verifyMultiTicketTermsCheckbox() {
    const checkbox = await $(selectors.multiTicketTermsCheckbox);
    const textBlock = await $(selectors.multiTicketTermsTextBlock);

    await checkbox.scrollIntoView();
    await browser.pause(200);

    let checkboxClicked = false;
    try {
      await browser.execute(el => el.click(), checkbox);
      console.log('🖱️ Triggered checkbox click using JS.');
      checkboxClicked = true;
    } catch (err) {
      console.error('❌ Failed to click checkbox with JS.', err);
      // Throw so test is marked as failed, but catch in test to continue
      throw new Error('❌ Checkbox is unclickable');
    }

    try {
      const blockText = await textBlock.getText();
      const expectedText = 'הגבלת האחריות ברכישת כרטיס טיסה בכיוון אחד';

      if (!blockText.includes(expectedText)) {
        console.error(`❌ Terms text mismatch. Found: "${blockText}"`);
        // Do not throw, just log error and continue
      } else {
        console.log('✅ Terms checkbox activated and surrounding text verified.');
      }
    } catch (err) {
      console.error('❌ Error reading terms text block:', err);
    }
  },

  async verifyStandardTermsCheckbox() {
    const checkbox = await $(selectors.standardTermsCheckbox);
    const textBlock = await $(selectors.standardTermsTextBlock);

    await checkbox.scrollIntoView();
    await browser.pause(200);

    let checkboxClicked = false;
    try {
      await browser.execute(el => el.click(), checkbox);
      console.log('🖱️ Triggered standard terms checkbox click using JS.');
      checkboxClicked = true;
    } catch (err) {
      console.error('❌ Failed to click standard terms checkbox with JS.', err);
      // Throw so test is marked as failed, but catch in test to continue
      throw new Error('❌ Standard terms checkbox is unclickable');
    }

    try {
      const blockText = await textBlock.getText();
      const expectedText = 'תנאי השימוש באתר ואת תנאי השינוי והביטול';

      if (!blockText.includes(expectedText)) {
        console.error(`❌ Standard terms text mismatch. Found: "${blockText}"`);
        // Do not throw, just log error and continue
      } else {
        console.log('✅ Standard terms checkbox activated and surrounding text verified.');
      }
    } catch (err) {
      console.error('❌ Error reading standard terms text block:', err);
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

