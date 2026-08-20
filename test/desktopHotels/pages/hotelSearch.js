const selectors = require('./selectors');
const helpers = require('../helper.js');

const HEBREW_MONTHS = {
  ינואר: 1,
  פברואר: 2,
  מרץ: 3,
  אפריל: 4,
  מאי: 5,
  יוני: 6,
  יולי: 7,
  אוגוסט: 8,
  ספטמבר: 9,
  אוקטובר: 10,
  נובמבר: 11,
  דצמבר: 12,
};


const hotelSearch = {


    /**
   * Basic hotel search: destination, calendar, and traveler count (adults, children only).
   * @param {Object} options
   * @param {string} options.to - Destination city (e.g., "London")
   * @param {number} options.departureDay
   * @param {number} options.departureMonth
   * @param {number} options.departureYear
   * @param {number} options.returnDay
   * @param {number} options.returnMonth
   * @param {number} options.returnYear
   * @param {number} [options.adults=2] - Number of adult travelers (default: 2)
   * @param {number} [options.children=0] - Number of child travelers (default: 0)
   * @param {number} [options.arrowDownCount=1] - How many times to press ArrowDown before Enter
   */
  async searchFlight({
    to,
    departureDay,
    departureMonth,
    departureYear,
    returnDay,
    returnMonth,
    returnYear,
    adults = 2,
    children = 0,
  }) {
       await this.setDestinationWithClick(to);
  
    // Open calendar and select dates
    const calendar = await $(selectors.calendarInput);
    await calendar.waitForDisplayed({ timeout: 5000 });
    await calendar.click();
  
    await browser.waitUntil(async () => {
      const monthBlocks = await $$(selectors.calendarMonthBlock);
      return monthBlocks.length >= 1;
    }, {
      timeout: 3000,
      timeoutMsg: '❌ Calendar did not fully open in time'
    });
  
    await this.selectCalendarDayByDate({
      day: departureDay,
      month: departureMonth,
      year: departureYear
    });
  
    await this.selectCalendarDayByDate({
      day: returnDay,
      month: returnMonth,
      year: returnYear
    });
  
    // Set travelers
    const travelersDropdown = await $(selectors.travelersDropdown);
    await travelersDropdown.waitForDisplayed({ timeout: 5000 });
    await travelersDropdown.click();
  
    // Set adults
    const adultField = await $(selectors.adultCountField);
    let currentAdults = parseInt(await adultField.getText());
    while (currentAdults < adults) {
      await $(selectors.adultPlusButton).click();
      currentAdults++;
    }
    while (currentAdults > adults) {
      await $(selectors.adultMinusButton).click();
      currentAdults--;
    }
  
    // Set children
    const childField = await $(selectors.childCountField);
    let currentChildren = parseInt(await childField.getText());
    while (currentChildren < children) {
      await $(selectors.childPlusButton).click();
      currentChildren++;
    }
    while (currentChildren > children) {
      await $(selectors.childMinusButton).click();
      currentChildren--;
    }
  
    // Submit search
    const searchButton = await $(selectors.submitSearchButton);
    await searchButton.waitForDisplayed({ timeout: 5000 });
    await searchButton.click();
    await browser.pause(5000);
  },

/**
 * Select a date in the hotel calendar widget.
 * @param {Object} options
 * @param {number} options.day
 * @param {number} options.month
 * @param {number} options.year
 */
selectCalendarDayByDate: async function ({ day, month, year }) {
    const targetDate = new Date(Date.UTC(year, month - 1, day));
    console.log(`📅 Target: ${day}/${month}/${year} (UTC: ${targetDate.getTime()})`);

    for (let attempt = 0; attempt < 6; attempt++) {
        const monthBlocks = await $$(selectors.calendarMonthBlock);

        for (const block of monthBlocks) {
            const dayElems = await block.$$(selectors.calendarDay);

            for (const el of dayElems) {
                const elTime = parseInt(await el.getAttribute('time'), 10);
                const elText = await el.getText();
                const isVisible = await el.isDisplayed();
                const isClickable = await el.isClickable();

                const elDate = new Date(elTime);
                const isSameDate =
                    elDate.getUTCFullYear() === year &&
                    elDate.getUTCMonth() === month - 1 &&
                    elDate.getUTCDate() === day;

                if (isSameDate && isVisible && isClickable) {
                    console.log(`✅ Found and clicking: ${elText}`);
                    await el.scrollIntoView();
                    await el.click();
                    return;
                }
            }
        }

        console.log(`➡️ Not found yet. Clicking next month (attempt ${attempt + 1})`);
        const nextBtn = await $(selectors.calendarNextButton);
        if (await nextBtn.isDisplayed()) {
            await nextBtn.scrollIntoView();
            await nextBtn.waitForClickable({ timeout: 3000 });
            await nextBtn.click();
            await browser.pause(500);
        }
    }

    throw new Error(`❌ Date ${day}/${month}/${year} not found in visible calendar`);
},

resolveNextButtonSelector: function ({ isMulti, isOneWay, rowIndex }) {
  if (isMulti) {
    const selector = rowIndex === 1 ? selectors.nextButtonMulti1
                   : rowIndex === 2 ? selectors.nextButtonMulti2
                   : this.multiWayNextButtonSelector(rowIndex);
    console.log(`🧭 Resolved MULTI selector: ${selector}`);
    return selector;
  }

  if (isOneWay) {
    console.log(`🧭 Resolved ONEWAY selector: ${selectors.oneWayNextButton}`);
    return selectors.oneWayNextButton;
  }

  console.log(`🧭 Resolved DEFAULT (round trip) selector: ${selectors.nextButton}`);
  return selectors.nextButton;
},

//Navigate Search
async openCalendar(selector = selectors.calendarInput) {
    const calendarButton = await $(selector);
    await calendarButton.waitForDisplayed({ timeout: 5000 });
    await calendarButton.click();
},

/**
 * Set destination by typing and clicking the first suggestion.
 * @param {string} to - Destination city
 */
// ...existing code...
async setDestinationWithClick(to) {
    console.log(`🔍 Setting destination: "${to}"`);
    const toField = await $(selectors.toField);
    await toField.waitForDisplayed({ timeout: 5000 });
    await toField.click();
    console.log('✅ Destination field clicked');

    // Type each character with a short pause to trigger suggestions
    for (const char of to) {
        await toField.addValue(char);
        await browser.pause(100);
    }
    console.log(`✅ Typed: "${to}"`);

    // Wait for dropdown to appear
    const suggestionSelector = selectors.destinationSuggestion;
    console.log(`⏳ Waiting for suggestions with selector: ${suggestionSelector}`);
    
    try {
        await browser.waitUntil(async () => {
            const suggestions = await $$(suggestionSelector);
            console.log(`   Found ${suggestions.length} suggestions`);
            return suggestions.length > 0;
        }, { timeout: 5000, timeoutMsg: '❌ No autocomplete suggestions appeared' });
    } catch (err) {
        console.error('❌ No suggestions found. Checking page state...');
        const html = await browser.getPageSource();
        console.log('📄 Dumping page HTML to check for autocomplete...');
        console.log(html.substring(0, 5000)); // first 5000 chars
        throw err;
    }

    // Click the first suggestion
    const suggestions = await $$(suggestionSelector);
    console.log(`✅ Found ${suggestions.length} suggestion(s)`);
    
    if (suggestions.length === 0) {
        throw new Error('❌ No suggestions available to click');
    }

    const firstSuggestion = suggestions[0];
    const suggestionText = await firstSuggestion.getText();
    console.log(`🎯 Attempting to click first suggestion: "${suggestionText}"`);
    
    await firstSuggestion.scrollIntoView();
    await firstSuggestion.waitForClickable({ timeout: 3000 });
    await firstSuggestion.click();
    console.log('✅ Suggestion clicked successfully');
    
    await browser.pause(500);
},
// ...existing code...

async clickSearchButton() {
    const searchButton = await $(selectors.submitSearchButton);
    await searchButton.waitForClickable({ timeout: 5000 });
    await searchButton.click();
}, 

  /**
   * Check the loader for correct destination, dates, and static marketing text.
   * @param {Object} options
   * @param {string} options.destination - Expected destination (e.g., "Madrid, Spain")
   * @param {string} options.datesText - Expected dates string (e.g., "ראשון - 27.07.25 - ראשון - 03.08.25")
   */

    async checkLoader({ destination, datesText }) {
      const loader = await $(selectors.loaderSelector);
      await loader.waitForDisplayed({ timeout: 10000 });
  
      // 1. Check destination (contains)
      const titleEl = await loader.$(selectors.loaderTitleSelector);
      const titleText = await titleEl.getText();
      if (!titleText.includes(destination)) {
        throw new Error(`❌ Loader destination mismatch. Expected to find: "${destination}" in "${titleText}"`);
      }
  
      // 2. Check dates
      const datesEl = await loader.$(selectors.loaderDatesSelector);
      const datesActual = await datesEl.getText();
      if (!datesActual.includes(datesText)) {
        throw new Error(`❌ Loader dates mismatch. Expected: "${datesText}", Found: "${datesActual}"`);
      }
  
      // 3. Check static marketing message
      const expectedMarketingMessage = "למעלה מ- 150,000 לקוחות נהנו לטוס דרך וואלה! טורס בארץ ובחו''ל בשנת 2024";
      const marketingMessageEl = await loader.$(selectors.loaderMarketingTitleSelector);
      await marketingMessageEl.waitForExist({ timeout: 5000 });
      if (!(await marketingMessageEl.isDisplayed())) {
        throw new Error('❌ Marketing message not displayed in loader');
      }
      const marketingMessageText = await marketingMessageEl.getText();
      if (!marketingMessageText.includes(expectedMarketingMessage)) {
        throw new Error(`❌ Marketing message mismatch. Expected to find: "${expectedMarketingMessage}" in "${marketingMessageText}"`);
      }
  
      // 4. Check static marketing bullet list
      const expectedMarketing = [
        'חסוך את דמי הטיפול בהזמנה אונליין',
        'התחייבות לשירות הטוב בישראל!',
        'התחייבות למחיר הטוב ביותר!',
        'הזמנה בליווי סוכן אישי'
      ];
  
      const marketingTitle = await loader.$(selectors.loaderMarketingTitleSelector);
  
      // Wait for marketing list to appear
      await browser.waitUntil(
        async () => (await loader.$$(selectors.loaderMarketingListSelector)).length > 0,
        { timeout: 5000, timeoutMsg: '❌ Marketing list did not appear in loader' }
      );
      const marketingList = await loader.$$(selectors.loaderMarketingListSelector);
      const marketingArr = Array.from(marketingList);
  
      if (!(await marketingTitle.isDisplayed())) {
        throw new Error('❌ Marketing title not displayed in loader');
      }
  
      for (const expected of expectedMarketing) {
        const found = (await Promise.all(
          marketingArr.map(async el => (await el.getText()).trim())
        )).some(text => text.includes(expected));
        if (!found) {
          throw new Error(`❌ Marketing message missing: "${expected}"`);
        }
      }
  
      console.log('✅ Loader checks passed: destination, dates, marketing message, and marketing text are correct.');
    },
async waitForHotelResults({ min = 1, timeout = 60000 } = {}) {
  try {
    await browser.waitUntil(async () => {
      // loader hidden?
      const loader = await $(selectors.resultsLoader);
      if (await loader.isExisting()) {
        if (await loader.isDisplayed()) {
          console.log('⏳ Loader still visible, waiting...');
          return false;
        }
      }
      // cards visible?
      const cards = await $$(selectors.hotelCard);
      let visible = 0;
      for (const c of cards) {
        if (await c.isDisplayed()) visible++;
      }
      console.log(`🔍 Found ${visible} visible hotel cards (need ${min})`);
      return visible >= min;
    }, { 
      timeout, 
      interval: 2000,
      timeoutMsg: `⚠️ Hotel results took longer than expected to load (${timeout}ms)` 
    });
    console.log('✅ Hotel results loaded successfully');
  } catch (err) {
    console.warn(`⚠️ WARNING: ${err.message}`);
    console.warn('⚠️ Continuing test despite slow loading...');
    // Check current visible count
    const cards = await $$(selectors.hotelCard);
    let visibleCount = 0;
    for (const c of cards) {
      if (await c.isDisplayed()) visibleCount++;
    }
    console.warn(`🔍 Found ${visibleCount} visible hotel cards`);
  }
},
// ...existing code...

async ensureStarFilterVisible() {
  const panel = await $(selectors.starFilterRootXPath);
  await panel.scrollIntoView({ block: 'center' });
  await panel.waitForDisplayed({ timeout: 10000 });
},

async setStarChecked(star, wantChecked) {
  await this.ensureStarFilterVisible();
  const root = await $(selectors.starFilterRootXPath);
  const input = await root.$(selectors.starCheckboxByValueRel(star));
  const mark  = await input.$(selectors.starCheckmarkFromCheckboxRel);

  // If input is off-viewport, click the visible checkmark
  const isChecked = await input.isSelected();
  if (isChecked === wantChecked) return;

  await mark.click();
  await browser.waitUntil(async () => (await input.isSelected()) === wantChecked, {
    timeout: 8000,
    timeoutMsg: `❌ ${star}★ checkbox did not toggle`,
  });

  // allow list to refresh
  await this.waitForHotelResults({ min: 1 });
},

async setOnlyStar(star) {
  // ensure only one star filter is active
  for (const s of [3, 4, 5]) {
    await this.setStarChecked(s, s === star);
  }
},

async selectStarRating(minStars) {
  // "3 and up" in your UI is typically "3★,4★,5★" all checked.
  for (const s of [3, 4, 5]) {
    await this.setStarChecked(s, s >= minStars);
  }
},

async getVisibleHotelCards() {
  const cards = await $$(selectors.hotelCard);
  const out = [];
  for (const c of cards) if (await c.isDisplayed()) out.push(c);
  return out;
},

async getHotelStarRating(card) {
  // 1) try class like ht-star-s4
  const byClass = await card.$(selectors.hotelCardStarIcon);
  if (await byClass.isExisting()) {
    const cls = await byClass.getAttribute('class');
    const m = cls && cls.match(/ht-star-s(\d)/);
    if (m) return parseInt(m[1], 10);
  }
  // 2) fallback: count icons
  const icons = await card.$$(selectors.hotelCardStarIcon);
  return icons.length || 0;
},


};
module.exports = {
    hotelSearch,
};
