const selectors = require('./selectors');

const detailsAndCheckout = {
    
//==================================== Opening details ==========================================

async getDetailsPageInfo() {
    const hotelName = await (await $(selectors.detailsHotelName)).getText();
    const city = await (await $(selectors.detailsHotelCity)).getText();
    const priceText = await (await $(selectors.detailsHotelPrice)).getText();
    const price = parseInt(priceText.replace(/[^\d]/g, ''), 10);
    const meal = await (await $(selectors.detailsHotelMeal)).getText();
    const roomType = await (await $(selectors.detailsHotelRoomType)).getText();
    const roomComp = await (await $(selectors.detailsHotelRoomComposition)).getText();
    const totalPriceText = await (await $(selectors.detailsHotelTotalPrice)).getText();
    const totalPrice = parseInt(totalPriceText.replace(/[^\d]/g, ''), 10);

    return {
        hotelName,
        city,
        price,
        meal,
        roomType,
        roomComp,
        totalPrice
    };
},

getSummaryHotelInfo: async function () {
  // Wait for the modal to be visible
  const modal = await $(selectors.summaryModal);
  await modal.waitForDisplayed({ timeout: 5000 });

  // Extract hotel name
  const hotelName = await $(selectors.summaryHotelName).getText();

  // Extract nights and dates (e.g. "7 לילות, 16/10/25 - 09/10/25")
  const nightsAndDates = await $(selectors.summaryNightsAndDates).getText();
  const nightsMatch = nightsAndDates.match(/(\d+)\s*לילות/);
  const nights = nightsMatch ? nightsMatch[1] : '';
  const datesMatch = nightsAndDates.match(/(\d{2}\/\d{2}\/\d{2})\s*-\s*(\d{2}\/\d{2}\/\d{2})/);
  const startDate = datesMatch ? datesMatch[2] : '';
  const endDate = datesMatch ? datesMatch[1] : '';

  // Extract room type, meal, and adults
  const featureBlocks = await $$(selectors.summaryFeatureBlocks);
  let roomType = '', meal = '', adults = '';
  for (const block of featureBlocks) {
    const label = await block.$(selectors.summaryFeatureLabel).getText();
    const value = await block.$(selectors.summaryFeatureValue).getText();
    if (label.includes('סוג החדר')) roomType = value;
    if (label.includes('בסיס אירוח')) meal = value;
    if (label.includes('מבוגרים')) adults = value;
  }

  // Extract total price (USD)
  const totalPriceText = await $(selectors.summaryTotalPrice).getText();
  const totalPrice = parseInt(totalPriceText.replace(/[^\d]/g, ''), 10);

  return {
    hotelName,
    nights,
    startDate,
    endDate,
    roomType,
    meal,
    adults,
    totalPrice
  };
},

openSummaryPopup: async function () {
      // If modal is already open, skip clicking
      const modal = await $(selectors.summaryModal);
      if (await modal.isDisplayed().catch(() => false)) {
          console.log('ℹ️ Summary popup modal already open');
          return;
      }
  
      // Try up to 3 times to click the link (re-query each time)
      let clicked = false;
      for (let attempt = 0; attempt < 3 && !clicked; attempt++) {
          const link = await $(selectors.orderDetailsLink);
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
          console.warn(`🐞 BUG: Summary popup modal (${selectors.summaryModal}) did not appear.`);
      }
  },
  
  async closeSummaryPopup() {
      try {
          const closeBtn = await $(selectors.detailsPopupCloseButton);
          if (!(await closeBtn.isExisting())) {
              console.warn(`🐞 BUG: Summary popup close button (${selectors.detailsPopupCloseButton}) not found.`);
              return;
          }
          await closeBtn.waitForDisplayed({ timeout: 5000 });
          await closeBtn.click();
          // Optionally wait until the modal disappears
          const modal = await $(selectors.summaryModal);
          await browser.waitUntil(async () => !(await modal.isDisplayed()), {
              timeout: 5000,
              timeoutMsg: '❌ Summary popup did not close as expected',
          });
          console.log('✅ Summary popup closed');
         } catch (err) {
        console.warn('⚠️ Could not close summary popup:', err.message);
    }
},

compareFlightSummaryWithDetails: async function () {
  // 1. Extract details from the details page first
  const detailsInfo = await this.getDetailsPageInfo();

  // 2. Press continue to user details
  await this.clickContinueToUserDetails();

  // 3. Open the summary popup
  await this.openSummaryPopup();

  // 4. Check header
  const headerText = await $(selectors.summaryHeader).getText();
  if (!headerText.includes('סיכום הזמנה')) {
    throw new Error(`❌ Summary header incorrect: "${headerText}"`);
  }
  console.log('✅ Summary header verified');

  // 5. Extract summary info from the popup
  const summaryInfo = await this.getSummaryHotelInfo();

  // 6. Compare fields
  if (summaryInfo.hotelName !== detailsInfo.hotelName) {
    throw new Error(`❌ Hotel name mismatch: "${summaryInfo.hotelName}" !== "${detailsInfo.hotelName}"`);
  }
  if (summaryInfo.roomType && detailsInfo.roomType && summaryInfo.roomType !== detailsInfo.roomType) {
    throw new Error(`❌ Room type mismatch: "${summaryInfo.roomType}" !== "${detailsInfo.roomType}"`);
  }
  if (summaryInfo.meal && detailsInfo.meal && summaryInfo.meal !== detailsInfo.meal) {
    throw new Error(`❌ Meal mismatch: "${summaryInfo.meal}" !== "${detailsInfo.meal}"`);
  }
  if (summaryInfo.totalPrice !== detailsInfo.totalPrice) {
    throw new Error(`❌ Price mismatch. Summary: $${summaryInfo.totalPrice}, Details: $${detailsInfo.totalPrice}`);
  }

  console.log('✅ Hotel info and price match between summary and details.');

  // 7. Close the summary popup
  await this.closeSummaryPopup();
},

async clickContinueToUserDetails() {
    const nextButton = await $(selectors.continueButtonToUser); 
        await nextButton.click();
},

async fillCustomerInfo({ firstName, lastName, email, phoneNumber }) {
    console.log('🧾 Filling in customer information...');
  
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
  const root = await $(selectors.paxForm1);

  const firstNameField = await root.$(selectors.paxFirstName);
  await firstNameField.waitForDisplayed({ timeout: 10000 });
  await firstNameField.scrollIntoView();
  await browser.pause(300);

  const genderSelector = gender === 'm' ? selectors.paxGenderMale1 : selectors.paxGenderFemale1;
  const genderLabel = await root.$(genderSelector);
  await genderLabel.waitForClickable({ timeout: 5000 });
  await genderLabel.click();

  await firstNameField.setValue(String(firstName));
  await (await root.$(selectors.paxLastName)).setValue(String(lastName));

  // Using visible text per your structure; if it’s flaky, switch to selectByAttribute('value', ...)
  await (await root.$(selectors.paxYear)).selectByVisibleText(String(year));
  await (await root.$(selectors.paxMonth)).selectByVisibleText(String(month));
  await (await root.$(selectors.paxDay)).selectByVisibleText(String(day));
},

// === Adult 2 (same structure, scoped to form #2) ===
async fillPassengerDetails2({ firstName, lastName, gender, year, month, day }) {
  const root = await $(selectors.paxForm2);

  const firstNameField = await root.$(selectors.paxFirstName);
  await firstNameField.waitForDisplayed({ timeout: 10000 });
  await firstNameField.scrollIntoView();
  await browser.pause(300);

  const genderSelector = gender === 'm' ? selectors.paxGenderMale2 : selectors.paxGenderFemale2;
  const genderLabel = await root.$(genderSelector);
  await genderLabel.waitForClickable({ timeout: 5000 });
  await genderLabel.click();

  await firstNameField.setValue(String(firstName));
  await (await root.$(selectors.paxLastName)).setValue(String(lastName));

  await (await root.$(selectors.paxYear)).selectByVisibleText(String(year));
  await (await root.$(selectors.paxMonth)).selectByVisibleText(String(month));
  await (await root.$(selectors.paxDay)).selectByVisibleText(String(day));
},

// === Continue (as you had) ===
async continueAfterPassenger() {
  const contBtn = await $(selectors.continueAfterPassenger);
  await contBtn.waitForClickable({ timeout: 10000 });
  await contBtn.click();
  await browser.pause(1000);
},

async selectPatternsByIndex(patterns) {
    // Wait for pattern blocks to appear
    let blocks = [];
    try {
        await browser.waitUntil(
            async () => {
                blocks = await $$(selectors.patternBlocks);
                return blocks.length > 0;
            },
            {
                timeout: 5000,
                timeoutMsg: '❌ Pattern blocks did not load at all.',
            }
        );
    } catch (err) {
        console.error('❌ Pattern blocks did not appear:', err.message);
        // Try to continue anyway
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

            // JS fallback
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

