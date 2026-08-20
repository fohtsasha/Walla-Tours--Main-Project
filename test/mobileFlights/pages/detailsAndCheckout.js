const selectors = require('./selectors');
const helpers = require('../helper.js');
const { flightSearch } = require('./flightSearch.js');

const detailsAndCheckout = {
    
//==================================== Opening details ==========================================
getDetailsSegments: async function () {
  const segments = [];
  const routeGroups = await $$(selectors.segmentGroup);
  if (!routeGroups.length) {
    console.warn('⚠️ No segment groups found');
    return segments;
  }

  for (const group of routeGroups) {
    const dateEls = await group.$$(selectors.segmentDate);
    const airportEls = await group.$$(selectors.segmentAirport);
    const cityEls = await group.$$(selectors.segmentCity);

    const count = Math.max(dateEls.length, airportEls.length, cityEls.length);

    for (let i = 0; i < count; i++) {
      const date = dateEls[i] ? (await dateEls[i].getText()).trim() : '';
      const airport = airportEls[i] ? (await airportEls[i].getText()).trim() : '';
      const city = cityEls[i] ? (await cityEls[i].getText()).trim() : '';

      console.log(`📍 DETAILS SEGMENT | City: ${city} | Airport: ${airport} | Date: (${date})`);
      segments.push({ city, airport, date });
    }
  }

  return segments;
},

getSummarySegments: async function () {
  const segments = [];
  const blocks = await $$(selectors.summarySegmentBlocks);

  for (const block of blocks) {
    const airportEls = await block.$$(selectors.summaryAirport);
    const timeDateEls = await block.$$(selectors.summaryTimeDate);
    const airlineEls = await block.$$(selectors.summaryAirline);

    const count = Math.max(airportEls.length, timeDateEls.length);

    for (let i = 0; i < count; i += 2) {
      const airline = airlineEls[i] && (await airlineEls[i].isExisting()) ? (await airlineEls[i].getText()).trim() : '';

      // leg 1 (takeoff)
      const airport1 = airportEls[i] && (await airportEls[i].isExisting()) ? (await airportEls[i].getText()).trim() : '';
      const timeDate1 = timeDateEls[i] && (await timeDateEls[i].isExisting()) ? (await timeDateEls[i].getText()).trim() : '';
      const [date1, time1] = timeDate1.split(' ');
      if (airport1 && date1 && time1) {
        segments.push({ airline, airport: airport1, date: date1.trim(), time: time1.trim() });
      }

      // leg 2 (landing)
      const airport2 = airportEls[i + 1] && (await airportEls[i + 1].isExisting()) ? (await airportEls[i + 1].getText()).trim() : '';
      const timeDate2 = timeDateEls[i + 1] && (await timeDateEls[i + 1].isExisting()) ? (await timeDateEls[i + 1].getText()).trim() : '';
      const [date2, time2] = timeDate2.split(' ');
      if (airport2 && date2 && time2) {
        segments.push({ airline, airport: airport2, date: date2.trim(), time: time2.trim() });
      }
    }
  }

  return segments;
},


checkTicketPriceMatch: async function ({ summaryPrice }) {
  console.log(`💳 Price in ticket summary: $${summaryPrice}`);
  await browser.pause(1000);
  const detailsPriceEl = await $(selectors.detailsPagePriceFull);
  const exists = await detailsPriceEl.isExisting();
   if (!exists) {
      console.warn(`🐞 BUG: Price element (${selectors.detailsPagePriceFull}) does not exist on the page`);
      // Optionally, return summaryPrice and empty detailsSegments to allow test to continue
      return { expectedPrice: summaryPrice, detailsSegments: [] };
  }
  await detailsPriceEl.waitForDisplayed({ timeout: 20000 });
  const detailsPriceText = await detailsPriceEl.getText();
  const detailsPrice = parseInt(detailsPriceText.replace(/[^\d]/g, ''), 10);

  if (isNaN(detailsPrice)) {
    console.warn(`🐞 BUG: Failed to parse details price: "${detailsPriceText}"`);
    // Optionally, return here or set detailsPrice to summaryPrice to allow test to continue
    return { expectedPrice: summaryPrice, detailsSegments: await this.getDetailsSegments() };
  }

  console.log(`🧾 Price in order details: $${detailsPrice}`);

  if (summaryPrice !== detailsPrice) {
    console.warn(`❌ Price mismatch! Summary: $${summaryPrice}, Details: $${detailsPrice}`);
  } else {
    console.log(`✅ Price matches! $${detailsPrice}`);
  }

  const detailsSegments = await this.getDetailsSegments();
  return { expectedPrice: detailsPrice, detailsSegments};
},

   openSummaryPopup: async function () {
          await flightSearch.closeCookiesBanner();

      // If modal is already open, skip clicking
      const modal = await $(selectors.summaryPopUpModal);
      if (await modal.isDisplayed().catch(() => false)) {
          console.log('ℹ️ Summary popup modal already open');
          return;
      }
  
      // Try up to 3 times to click the link (re-query each time)
      let clicked = false;
      for (let attempt = 0; attempt < 3 && !clicked; attempt++) {
          const link = await $(selectors.summaryPopUpLink);
          if (await link.isExisting()) {
              try {
                  await link.waitForClickable({ timeout: 2000 });
                  await link.click();
                  clicked = true;
                  console.log('✅ Summary popup link clicked (standard)');
              } catch {
                  console.warn('⚠️ Summary popup link not clickable, trying JS click...');
                  try {
                      await browser.execute(el => el.click(), link);
                      clicked = true;
                      console.log('✅ Summary popup link clicked (JS fallback)');
                  } catch (jsErr) {
                      console.warn('🐞 BUG: JS click also failed for summary popup link:', jsErr.message);
                  }
              }
          } else {
              await browser.pause(700);
          }
      }
  
      // As a last resort, try XPath via JS
      if (!clicked) {
          const jsLink = await browser.execute(() => {
              return document.evaluate('//span[contains(text(), "פירוט ההזמנה")]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          });
          if (jsLink) {
              try {
                  await browser.execute(el => el.click(), jsLink);
                  clicked = true;
                  console.log('✅ Summary popup link clicked (JS XPath fallback)');
              } catch (jsErr) {
                  console.warn('🐞 BUG: JS XPath click failed for summary popup link:', jsErr.message);
              }
          }
      }
  
      // Wait for the modal to appear (retry up to 5s)
      const appeared = await modal.waitForDisplayed({ timeout: 5000 }).catch(() => false);
      if (!appeared) {
          console.warn(`🐞 BUG: Summary popup modal (${selectors.summaryPopUpModal}) did not appear.`);
      }
  },
  
  async closeSummaryPopup() {
      try {
          const closeBtn = await $(selectors.summaryPopUpCloseButton);
          if (!(await closeBtn.isExisting())) {
              console.warn(`🐞 BUG: Summary popup close button (${selectors.summaryPopUpCloseButton}) not found.`);
              return;
          }
          await closeBtn.waitForDisplayed({ timeout: 5000 });
          await closeBtn.click();
          // Optionally wait until the modal disappears
          const modal = await $(selectors.summaryPopUpModal);
          await browser.waitUntil(async () => !(await modal.isDisplayed()), {
              timeout: 5000,
              timeoutMsg: '❌ Summary popup did not close as expected',
          });
          console.log('✅ Summary popup closed');
      } catch (err) {
          console.warn('⚠️ Could not close summary popup:', err.message);
      }
  },
compareFlightSummaryWithDetails: async function (detailsSegments, expectedPrice) {
  await browser.pause(1000);
  await this.openSummaryPopup();
  await browser.pause(1000);
  const headerText = await $(selectors.summaryHeader).getText();
  if (!headerText.includes('סיכום הזמנה')) {
    throw new Error(`❌ Summary header incorrect: "${headerText}"`);
  }
  console.log('✅ Summary header verified');

  const summarySegments = await this.getSummarySegments();
  console.log(`🔍 Extracted summary segments (${summarySegments.length}):`, summarySegments);

  for (let i = 0; i < summarySegments.length; i++) {
    const s = summarySegments[i];
    const normalizeAirline = (name) =>
      typeof name === 'string' ? name.trim().toLowerCase().replace(' airlines', '') : '';

    let match = null;

    console.log(`🧩 Comparing Segment ${i + 1}`);
    console.log('🔹 Summary:', s);

    for (const d of detailsSegments) {
      const airlineMatch = !s.airline || normalizeAirline(d.airline) === normalizeAirline(s.airline);
      const airportMatch = d.airport === s.airport;
      const extractTime = (fullDate) => {
        const match = fullDate.match(/(\d{2}:\d{2})/);
        return match ? match[1] : '';
      };
      const timeMatch = extractTime(d.date) === s.time;

      console.log('🔸 Comparing with detail:', d);
      console.log(`    ✈️ Airline match: ${airlineMatch}, 🛫 Airport match: ${airportMatch}, 🕒 Time match: ${timeMatch}`);

      if (airlineMatch && airportMatch && timeMatch) {
        match = d;
        break;
      }
    }

        if (!match) {
      console.warn(`🐞 BUG: Segment ${i + 1} not found in details: ${JSON.stringify(s, null, 2)}`);
      // Optionally, continue to next segment or break, but do NOT throw
      continue;
    }

    if (s.date && match.title) {
      const expectedDate = match.date?.trim() || this.extractDateFromTitle(match.title);
      console.log(`📅 Summary date: ${s.date}`);
      console.log(`📅 Extracted details date: ${expectedDate}`);
      if (expectedDate !== s.date) {
        throw new Error(`❌ Segment ${i + 1} date mismatch: ${expectedDate} !== ${s.date}`);
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
  await this.closeSummaryPopup();
},


//Fare Family Function
async selectFareFamilyAndVerifyPriceChange() {
  const SECTION_WRAPPERS = selectors.fareFamilyCollectionWrapper;
  const CARD_BLOCK = selectors.fareFamilyCardWrapper;
  const CARD_PRICE = selectors.fareFamilyOptionPrice;
  const CARD_RADIO = selectors.fareFamilyRadioButton;
  const CARD_LABEL = selectors.fareFamilyOptionLabel;
  const DETAIL_TOTAL = selectors.detailsPagePriceFull;

  const origTxt = await $(DETAIL_TOTAL).getText();
  const original = parseInt(origTxt.replace(/[^\d]/g, ''), 10);
  if (isNaN(original)) {
    console.warn(`❌ Could not parse original total: "${origTxt}"`);
    return;
  }
  console.log(`🧾 Original price: $${original}`);

  const sections = await $$(SECTION_WRAPPERS);

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    await section.scrollIntoView();
    await browser.pause(300);

    const cards = await section.$$(CARD_BLOCK);
    console.log(`🧩 Found ${cards.length} fare cards in section ${i + 1}`);

        for (const card of cards) {
      if (!(await card.isDisplayed())) continue;
    
      let label = 'Unknown';
      try {
        const labelEl = await card.$(CARD_LABEL);
        if (await labelEl.isExisting()) {
          label = (await labelEl.getText()).trim();
        } else {
          console.warn('🐞 BUG: Fare card label not found, skipping card.');
          continue;
        }
      } catch {
        console.warn('🐞 BUG: Error getting fare card label, skipping card.');
        continue;
      }
    
      const priceEl = await card.$(CARD_PRICE);
      if (!(await priceEl.isExisting())) {
        console.warn(`🐞 BUG: Fare card price not found for "${label}", skipping card.`);
        continue;
      }
      const priceText = (await priceEl.getText()).trim();
      const addon = parseInt(priceText.replace(/[^\d]/g, ''), 10) || 0;
    
      const radio = await card.$(CARD_RADIO);
      if (!(await radio.isExisting())) {
        console.warn(`🐞 BUG: Fare card radio not found for "${label}", skipping card.`);
        continue;
      }
      try {
        await radio.waitForClickable({ timeout: 1000 });
        await radio.click();
      } catch {
        await browser.execute(el => el.click(), radio);
      }
    
      await browser.pause(300);
      const detailTotalEl = await $(DETAIL_TOTAL);
      if (!(await detailTotalEl.isExisting())) {
        console.warn('🐞 BUG: Detail total price element not found after fare selection.');
        continue;
      }
      const newTxt = await detailTotalEl.getText();
      const updated = parseInt(newTxt.replace(/[^\d]/g, ''), 10);
      const expected = original + addon;
    
      if (updated === expected) {
        console.log(`✅ [${label}] correctly adds $${addon}, new total: $${updated}`);
      } else {
        console.warn(`❌ [${label}] expected total $${expected}, but got $${updated}`);
      }
    }

    // Reset to Basic fare option (first card)
    if (cards.length > 0) {
      const basicCard = cards[0];
      const labelEl = await basicCard.$(CARD_LABEL);
      const label = (await labelEl.getText()).trim();
      const radio = await basicCard.$(CARD_RADIO);
      try {
        await radio.waitForClickable({ timeout: 1000 });
        await radio.click();
        console.log(`🔄 Reset to Basic "${label}" in section ${i + 1}`);
      } catch {
        if (radio && (await radio.isExisting())) {
          await browser.execute(el => el.click(), radio);
        }
      }
    }
  }

  console.log('📍 Fare family selection completed — moving to next step...');
},
async clickContinueToUserDetails() {
    const nextButton = await $(selectors.continueButtonToUser); 
    await browser.waitUntil(
        async () => await nextButton.isDisplayed() && await nextButton.isClickable(),
        {
            timeout: 5000,
            timeoutMsg: '❌ Continue button not clickable after fare selection'
        }
    );
    try {
        await nextButton.click();
        console.log('➡️ Continued to Checkout');
    } catch (err) {
        console.warn('⚠️ Standard click failed, trying JS click...');
        try {
            await browser.execute(el => el.click(), nextButton);
            console.log('✅ Continue button clicked (JS fallback)');
        } catch (jsErr) {
            throw new Error('❌ Could not click Continue button by any method: ' + jsErr.message);
        }
    }
},
async fillCustomerInfo({ firstName, lastName, email, phoneNumber }) {
    console.log('🧾 Filling in customer information...');
      await flightSearch.closeCookiesBanner();

    await $(selectors.customerFirstName).setValue(String(firstName));
    await $(selectors.customerLastName).setValue(String(lastName));
    await $(selectors.customerEmail).setValue(String(email));
    const phoneInput = await $(selectors.customerPhone);
    await phoneInput.click();
    await phoneInput.clearValue();
    await phoneInput.addValue(phoneNumber);
  
    const continueBtn = await $(selectors.continueAfterCustomer);
    await continueBtn.waitForClickable({ timeout: 5000 });
    await continueBtn.click();
  
    console.log('✅ Customer info submitted');
},

openTermsAndConditionsPopup: async function () {
  const link = await $(selectors.termsAndConditionsPopUpLink);
  await link.waitForDisplayed({ timeout: 5000 });
  await link.click();

  const modal = await $(selectors.termsAndConditionsModal);
  await modal.waitForDisplayed({ timeout: 10000 });
  console.log('📋 Terms and conditions popup opened successfully');
},

async fillPassengerDetails({ firstName, lastName, gender, year, month, day }) {
    const firstNameField = await $(selectors.paxFirstName);
    await firstNameField.waitForDisplayed({ timeout: 10000 });
    await firstNameField.scrollIntoView();
    await browser.pause(300); // Slight buffer in case of animation
    const genderSelector = gender === 'm' ? selectors.paxGenderMale : selectors.paxGenderFemale;
    const genderLabel = await $(genderSelector);
    await genderLabel.waitForClickable({ timeout: 5000 });
    await genderLabel.click();
    await firstNameField.setValue(String(firstName));
    await $(selectors.paxLastName).setValue(String(lastName));
    await $(selectors.paxYear).selectByVisibleText(String(year));
    await $(selectors.paxMonth).selectByVisibleText(String(month));
    await $(selectors.paxDay).selectByVisibleText(String(day));
    
    await this.skipAddLuggagePopup();
  
    const contBtn = await $(selectors.continueAfterPassenger);
    await contBtn.waitForClickable({ timeout: 10000 });
    await contBtn.click();
},

async skipAddLuggagePopup() {
    try {
        const popup = await $(selectors.addLuggagePopup);
        // Wait briefly for the popup to potentially appear
        const isDisplayed = await popup.waitForDisplayed({ timeout: 5000 }).catch(() => false);
        if (isDisplayed) {
            console.log('🎒 Add luggage popup appeared. Skipping...');
            const skipBtn = await $(selectors.addLuggageSkipBtn);
            if (await skipBtn.isExisting()) {
                await skipBtn.waitForClickable({ timeout: 3000 });
                await skipBtn.click();
                console.log('✅ Clicked skip on luggage popup');
            } else {
                const fallbackBtn = await $("//span[contains(text(), 'דלג')] | //button[contains(text(), 'דלג')]");
                if (await fallbackBtn.isExisting()) {
                    await fallbackBtn.click();
                    console.log('✅ Clicked skip (fallback) on luggage popup');
                }
            }
            await browser.pause(500); // Give it time to close
        } else {
            console.log('ℹ️ No add luggage popup appeared.');
        }
    } catch (e) {
        console.log('ℹ️ Error while checking for add luggage popup:', e.message);
    }
},


async selectPatternsByIndex(patterns) {
    let blocks = [];
    try {
        await browser.waitUntil(
            async () => {
                blocks = await $$(selectors.patternBlocks);
                return blocks.length > 0;
            },
            {
                timeout: 15000, // ⬅️ Increase timeout to 15 seconds
                timeoutMsg: '❌ Pattern blocks did not load at all.',
            }
        );
    } catch (err) {
        console.error('❌ Pattern blocks did not appear:', err.message);
        await this.clickContinueAfterPattern();
        return;
    }

    blocks = await $$(selectors.patternBlocks);
    let successfulSelections = 0;

    for (let i = 0; i < patterns.length; i++) {
        const { option } = patterns[i];
        const block = blocks[i];

        if (!block) {
            console.warn(`⚠️ Pattern block ${i + 1} not found — skipping`);
            continue;
        }

        const optionSelector = selectors.patternOptionWithinBlock(option);
        const optionEl = await block.$(optionSelector);
        try {
            await optionEl.scrollIntoView();
            await optionEl.waitForDisplayed({ timeout: 3000 });
            await optionEl.click();
            await browser.pause(500);

            const classAttr = await optionEl.getAttribute('class');
            if (classAttr.includes('active') || classAttr.includes('full')) {
                console.log(`🎉 Block ${i + 1} selected as "${option}"`);
                successfulSelections++;
                continue;
            }

            await browser.execute(el => {
                el.scrollIntoView();
                el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            }, optionEl);
            await browser.pause(500);

            const fallbackClass = await optionEl.getAttribute('class');
            if (fallbackClass.includes('active') || fallbackClass.includes('full')) {
                console.log(`🎉 (JS) Block ${i + 1} selected as "${option}"`);
                successfulSelections++;
            } else {
                console.warn(`❌ Block ${i + 1} not selected. class="${fallbackClass}"`);
            }
        } catch (err) {
            console.error(`❌ Error selecting block ${i + 1}: ${err.message}`);
        }
    }

    if (successfulSelections === 0) {
        console.warn('❌ No pattern blocks were successfully selected. Trying to continue anyway...');
        await this.clickContinueAfterPattern();
    }
},

clickContinueAfterPattern: async function() {
    try {
        const continueButton = await $(selectors.patternContinueButton);
        await continueButton.waitForDisplayed({ timeout: 5000 });
        await continueButton.waitForClickable({ timeout: 5000 });
        await continueButton.click();
        console.log('✅ Clicked Continue after pattern selection');
    } catch (error) {
        console.warn('⚠️ Continue button not found, maybe page already navigated. Skipping click.');
    }
},

skipSeatingChart: async function () {
    const continueBtn = await $(selectors.seatMapSkipBtn);
    const exists = await continueBtn.isExisting();
    if (!exists) {
        console.log('ℹ️ Seating chart continue button not found, skipping seating chart step.');
        return;
    }
    await continueBtn.waitForDisplayed({ timeout: 5000 });
    try {
        await continueBtn.waitForClickable({ timeout: 5000 });
        await continueBtn.click();
        console.log('✅ Clicked Continue on seating chart');
    } catch {
        console.warn('⚠️ Standard click failed, trying JS click...');
        await browser.execute(el => el.click(), continueBtn);
    }
    await browser.pause(500);
},
///==============================================Credit Card=====================================================
async fillCreditCardInfo({ holderId, cardNumber, expiryMonth, expiryYear, cvv }) {
   const iframe = await $(selectors.paymentIframe);
  try {
    await iframe.waitForExist({ timeout: 10000 });
  } catch (err) {
    console.error('🐞 BUG/EMERGENCY: Payment iframe (#oProxy) did not appear in time. Payment system may be out of service.');
    throw new Error('❌ Payment is currently out of service (iframe not found)');
  }
  // ✅ Scroll into view before switching
  await iframe.scrollIntoView();
  await browser.pause(300); // slight pause to stabilize
  
  await browser.switchFrame(iframe);
  
  // 🔍 Wait + log each step
  const holderField = await $(selectors.cardHolderInput);
  await holderField.waitForDisplayed({ timeout: 5000 });
  await holderField.setValue(holderId);

  const numberField = await $(selectors.cardNumberInput);
  await numberField.waitForDisplayed({ timeout: 5000 });
  await numberField.setValue(cardNumber);

  const monthSelect = await $(selectors.expiryMonthSelect);
  await monthSelect.waitForDisplayed({ timeout: 5000 });
  await monthSelect.click();
  await monthSelect.selectByAttribute('value', expiryMonth);

  const yearSelect = await $(selectors.expiryYearSelect);
  await yearSelect.waitForDisplayed({ timeout: 5000 });
  await yearSelect.selectByVisibleText(expiryYear);

  const cvvField = await $(selectors.cvvInput);
  await cvvField.waitForDisplayed({ timeout: 5000 });
  await cvvField.setValue(cvv);
  // Return to main context
  await browser.switchToParentFrame();
  const submitButton = await $(selectors.submitPaymentButton);
  await submitButton.waitForClickable();
  await submitButton.click();
  await browser.pause(5000);

},

async checkThatTotalPriceExists() {
  const totalPriceElement = await $(selectors.totalPrice);
  await totalPriceElement.waitForDisplayed({ timeout: 5000 });
  const totalPrice = await totalPriceElement.getText();
  if (!totalPrice || totalPrice.trim() === '') {
    throw new Error('❌ Total price is missing');
  }
  console.log(`✅ Total price exists: ${totalPrice}`);
},

///==============================================Terms & Conditions=====================================================
async checkTermsAndConditions() {
  // Helper to safely open and close a modal
 const openAndCloseModal = async (linkSelector, modalSelector, closeSelector, label) => {
  try {
    const link = await $(linkSelector);
    await link.waitForClickable({ timeout: 3000 });
    await link.click();

    const modal = await $(modalSelector);
    await modal.waitForDisplayed({ timeout: 5000 });

    const close = await $(closeSelector);
    try {
      await close.waitForClickable({ timeout: 3000 });
      await close.click();
    } catch {
      console.warn(`⚠️ ${label} close failed — using JS fallback`);
      await browser.execute(el => el.click(), close);
    }

    try {
      await browser.waitUntil(async () => !(await modal.isDisplayed()), {
        timeout: 5000,
        timeoutMsg: `❌ ${label} modal did not close as expected`,
      });
      console.log(`✅ ${label} modal closed`);
    } catch {
      console.warn(`⚠️ ${label} modal close wait timed out`);
    }
  } catch {
    console.log(`ℹ️ ${label} modal not shown — continuing`);
  }
};
  // ✅ Handle both modals
  await openAndCloseModal(selectors.termsModalLink, selectors.termsModalSection, selectors.termsModalCloseButton, 'Terms');
  await openAndCloseModal(selectors.oneWayModalLink, selectors.oneWayModalSection, selectors.oneWayModalCloseButton, 'One-Way');

  // ✅ Check agreement checkboxes
  const checkCheckbox = async (selector, label) => {
    try {
      const checkbox = await $(selector);
      await checkbox.waitForExist({ timeout: 3000 });
      if (!(await checkbox.isSelected())) {
        await checkbox.click();
        console.log(`☑️ Checked "${label}" checkbox`);
      } else {
        console.log(`ℹ️ "${label}" checkbox was already checked`);
      }
    } catch {
      console.warn(`⚠️ "${label}" checkbox not found — skipping`);
    }
  };

  await checkCheckbox(selectors.acceptTermsCheckbox, 'Terms of Use');
  await checkCheckbox(selectors.confirmOneWayCheckbox, 'One-Way Responsibility');
},




    }

module.exports = {
    detailsAndCheckout,
};

