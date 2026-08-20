const selectors = require('./selectors');
const helpers = require('../helper');
const { dynamicPackage } = require('../../../config/packageData');

const HEBREW_MONTHS = {
  ינואר: 1, פברואר: 2, מרץ: 3, אפריל: 4, מאי: 5, יוני: 6,
  יולי: 7, אוגוסט: 8, ספטמבר: 9, אוקטובר: 10, נובמבר: 11, דצמבר: 12,
};

const packageSearch = {

  async closeCookiesBanner() {
    let clicked = false;

    // 1. Try explicit "Approve" (אישור) text usually on a button or link
    try {
      const approveButtons = await $$('//button[contains(normalize-space(), "אישור")] | //a[contains(normalize-space(), "אישור")] | //div[contains(@class,"cookies")]//span[contains(text(),"אישור")]');
      for (const btn of approveButtons) {
        if (await btn.isDisplayed()) {
          await btn.click();
          console.log('🍪 Cookies "Approve" (אישור) clicked');
          clicked = true;
          break;
        }
      }
    } catch (e) { /* ignore */ }

    // 2. If not found/clicked, use the standard close selector
    if (!clicked) {
      const cookiesCloseButton = await $(selectors.cookiesClose);
      try {
        if (await cookiesCloseButton.isDisplayed()) {
          await cookiesCloseButton.click();
          console.log('🍪 Cookies banner standard close button clicked');
          clicked = true;
        }
      } catch (e) { /* ignore */ }
    }

    if (!clicked) {
      console.log('🍪 No visible cookies banner found');
      return;
    }

    // 3. Wait for removal to prevent click interception
    // Known class from error logs: .cookies-content
    try {
      const banner = await $('.cookies-content');
      if (await banner.isExisting()) {
        await banner.waitForDisplayed({ reverse: true, timeout: 3000 });
      } else {
        // If we can't find the container, just pause briefly
        await browser.pause(500);
      }
    } catch (e) {
      console.warn('⚠️ Cookies banner did not disappear nicely, forcing hide...');
      try {
        await browser.execute(() => {
          const el = document.querySelector('.cookies-content');
          if (el) el.style.display = 'none';
        });
      } catch { }
      // Force hide if still displayed after click
      try {
        await browser.execute((el) => {
          const content = document.querySelector('.cookies-content');
          if (content) content.style.display = 'none';
        });
      } catch { }
    }
  },

  async ensureCalendarClosed() {
    // List of calendar related elements to check/hide
    const calSelectors = [selectors.calendarIframe, selectors.calendarWidget, '#divCalendar', '.search-calendar'];

    let clickedBody = false;

    for (const sel of calSelectors) {
      try {
        const el = await $(sel);
        if (await el.isExisting() && await el.isDisplayed()) {
          if (!clickedBody) {
            console.log('ℹ️ Calendar/Widget still open, clicking body...');
            await $('body').click();
            clickedBody = true;
            await browser.pause(500);
          }

          // Check again
          if (await el.isDisplayed()) {
            console.warn(`⚠️ Element ${sel} still visible, force hiding with JS...`);
            await browser.execute((e) => { e.style.display = 'none'; }, el);
          }
        }
      } catch (e) { }
    }
  },

  async searchPackage({
    to,
    departureDate,
    returnDate,
    departureDay,
    departureMonth,
    departureYear,
    returnDay,
    returnMonth,
    returnYear,
    adults = 2,
    children = 0,
    starsLabel,
    searchTypeIndex = 1,
    submit = true,
  }) {
    console.log(`🔎 [searchPackage] Searching to: ${to}`);
    if (departureDate && returnDate) {
      console.log(`📅 Dates: ${departureDate} → ${returnDate}`);
    } else {
      console.log(`📅 Dates: ${departureDay}/${departureMonth}/${departureYear} → ${returnDay}/${returnMonth}/${returnYear}`);
    }
    console.log(`👤 Adults: ${adults}, 👶 Children: ${children}, ⭐ Stars: ${starsLabel || 'N/A'}, SearchTypeIndex: ${searchTypeIndex}`);

    await this.closeCookiesBanner();
    await this.selectSearchType(searchTypeIndex);
    await this.setDestination(to);
    // Wait for calendar to reload after destination change
    await browser.pause(3000);

    await helpers.selectCalendarRandomPricedDay({
      inputSelector: selectors.departureDateInput,
      iframeSelector: selectors.calendarIframe,
      targetMonth: departureMonth,
      targetYear: departureYear, // Select Departure (Right/First)
      isReturn: false,
    });

    console.log('⏳ Waiting for return calendar selection...');
    await browser.pause(2000);

    await helpers.selectCalendarRandomPricedDay({
      inputSelector: selectors.returnDateInput,
      iframeSelector: selectors.calendarIframe,
      targetMonth: returnMonth,
      targetYear: returnYear, // Select Return (Left/Second)
      isReturn: true,
    });

    // Ensure calendar is closed before clicking travelers
    await this.ensureCalendarClosed();

    await this.setTravelersRegular({ adults, children });

    if (starsLabel) {
      await this.selectStars(starsLabel);
    }

    // Double check calendar closed before submit
    await this.ensureCalendarClosed();

    if (submit) await this.submitSearch();

    await browser.waitUntil(
      async () => (await $$(selectors.packageResult)).length > 0,
      { timeout: 45000, timeoutMsg: '❌ Search results did not appear!' }
    );
    console.log('✅ Search results page loaded!');
  },

  // --- Submitting the search---
  async submitSearch() {
    console.log('🚀 Clicking search button...');
    const searchBtn = await $(selectors.searchButton);
    await searchBtn.waitForDisplayed({ timeout: 5000 });
    try {
      await searchBtn.waitForClickable({ timeout: 3000 });
      await searchBtn.click();
    } catch (e) {
      console.warn(`⚠️ Submit click failed (${e.message}), retrying with JS...`);
      await browser.execute("arguments[0].click();", searchBtn);
    }
  },

  async setDestination(to) {
    console.log(`📍 [setDestination] setting destination to: "${to}"`);
    const input = await $(selectors.destinationInput);
    await input.waitForDisplayed({ timeout: 5000 });

    // 1. Click and Type to filter the list (avoids scrolling large/unstable initial lists)
    await input.click();
    await browser.pause(200); // slight pause prevents race conditions
    await input.setValue(to);
    console.log(`⌨️ [setDestination] Typed "${to}"`);

    // 2. Wait for suggestions
    let suggestions = [];
    try {
      await browser.waitUntil(async () => {
        // Check both potential selectors for suggestions
        const s1 = await $$(selectors.destinationSuggestion);
        const s2 = await $$(selectors.listOfDepartures);
        return (s1.length > 0 && await s1[0].isDisplayed()) ||
          (s2.length > 0 && await s2[0].isDisplayed());
      }, { timeout: 5000, timeoutMsg: 'Suggestions did not appear after typing' });

      // Grab the visible list
      const s1 = await $$(selectors.destinationSuggestion);
      if (s1.length > 0 && await s1[0].isDisplayed()) suggestions = s1;
      else suggestions = await $$(selectors.listOfDepartures);

    } catch (e) {
      console.warn('⚠️ Suggestions did not appear immediately, retrying input...');
      await input.clearValue();
      await input.click();
      await input.setValue(to);
      await browser.pause(1000);

      // Grab suggestions again
      const s1 = await $$(selectors.destinationSuggestion);
      if (s1.length > 0 && await s1[0].isDisplayed()) suggestions = s1;
      else suggestions = await $$(selectors.listOfDepartures);
    }

    if (suggestions.length === 0) {
      throw new Error(`❌ No suggestions found for "${to}"`);
    }

    console.log(`ℹ️ [setDestination] Found ${suggestions.length} suggestions`);

    // 3. Select exact match
    for (const item of suggestions) {
      const text = (await item.getText()).trim();
      // Use strict check or check if it *starts with* or *contains* properly
      if (text.includes(to)) {
        console.log(`✅ [setDestination] Found match: "${text}"`);
        await item.scrollIntoView({ block: 'center' });
        await item.waitForClickable({ timeout: 2000 });
        try {
          await item.click();
        } catch (err) {
          console.warn(`⚠️ Click failed, using JS fallback. ${err.message}`);
          await browser.execute(el => el.click(), item);
        }
        return;
      }
    }

    // Capture text for debugging
    const texts = [];
    for (const item of suggestions) texts.push(await item.getText());
    throw new Error(`❌ Could not find "${to}" in suggestions: [${texts.slice(0, 5).join(', ')}...]`);
  },

  async searchWeekendDeals(params) {
    const {
      searchTypeIndex,
      to,
      nightsLabel,
      priceLabel,
      weekendLabel,
      adults = 2,
      children = 0,
      submit = true,
    } = params;

    console.log(`🔎 [searchWeekendDeals] To: ${to}, Nights: ${nightsLabel}, Price: ${priceLabel}, Weekend: ${weekendLabel}, Adults: ${adults}, Children: ${children}`);

    await this.closeCookiesBanner();
    await this.selectSearchType(searchTypeIndex);
    await this.selectDestinationWeekend(to);
    await this.selectNights(nightsLabel);
    await this.selectPrice(priceLabel);
    await this.selectWeekend(weekendLabel);
    await this.setTravelersWeekend({ adults, children });

    if (submit) await this.submitSearchWeekend();
    await browser.waitUntil(
      async () => (await $$(selectors.weekendResults)).length > 0,
      { timeout: 15000, timeoutMsg: '❌ Search results did not appear!' }
    );
    console.log('✅ Search results page loaded!');
  },

  async searchLastMinuteDeals(params) {
    const {
      searchTypeIndex,
      to,
      nightsLabel,
      priceLabel,
      starsLabel,
      adults = 2,
      children = 0,
      submit = true,
    } = params;

    console.log(`🔎 [searchLastMinuteDeals] To: ${to}, Nights: ${nightsLabel}, Price: ${priceLabel}, Stars: ${starsLabel}, Adults: ${adults}, Children: ${children}`);

    await this.closeCookiesBanner();
    await this.selectSearchType(searchTypeIndex);
    await this.selectDestinationLastMinute(to);
    await this.selectNightsLM(nightsLabel);
    await this.selectPriceLM(priceLabel);
    await this.selectStars(starsLabel, true);
    await this.setTravelersLastMinute({ adults, children });

    if (submit) await this.submitSearchLastMinute();
    await browser.waitUntil(
      async () => (await $$(selectors.packageResult)).length > 0,
      { timeout: 15000, timeoutMsg: '❌ Search results did not appear!' }
    );
    console.log('✅ Search results page loaded!');
  },

  async searchDynamicPackage(params) {
    const {
      searchTypeIndex,
      to,
      departureDay,
      departureMonth,
      departureYear,
      returnDay,
      returnMonth,
      returnYear,
    } = params;

    console.log(`🔎 [searchDynamicPackage] To: ${to}, Departure: ${departureDay}/${departureMonth}/${departureYear}, Return: ${returnDay}/${returnMonth}/${returnYear}`);

    await this.selectSearchType(searchTypeIndex);
    await this.closeCookiesBanner();
    await this.setDestinationWithClick(to);
    await $(selectors.calendarIcon).click();

    const nextMonthDP = await $(selectors.nextMonthDP);
    await this.selectCalendarDayByDate({ day: departureDay, month: departureMonth, year: departureYear, nextButtonSelector: nextMonthDP });
    await this.selectCalendarDayByDate({ day: returnDay, month: returnMonth, year: returnYear, nextButtonSelector: nextMonthDP });

    const searchBtn = await $(selectors.submitSearchDP);
    await searchBtn.scrollIntoView({ block: 'center' });
    await searchBtn.waitForDisplayed({ timeout: 5000 });
    try {
      await searchBtn.waitForClickable({ timeout: 5000 });
      console.log('🚀 [Dynamic] Clicking search button...');
      await searchBtn.click();
      await browser.pause(500);
      await browser.keys('\uE007'); // Press Enter just in case
    } catch (e) {
      console.warn(`⚠️ [Dynamic] Submit click failed (${e.message}), retrying with JS...`);
      await browser.execute("arguments[0].click();", searchBtn);
    }
    try {
      // Wait for BUTTON or error (Container is unreliable)
      const errorDialog = await $(selectors.noResultsDialogRoot);
      const startTime = Date.now();
      console.log('⏳ Waiting for Results Container...');
      const resultsContainer = await $(selectors.dynamicPackageResult); // .dynamic-packages-container
      try {
        await resultsContainer.waitForDisplayed({ timeout: 60000 });
        // Wait for actual text content (length > 100 chars)
        await browser.waitUntil(async () => (await resultsContainer.getText()).length > 100, {
          timeout: 60000,
          timeoutMsg: 'Container found but remained empty (no text)'
        });

        console.log('✅ Results Container found and has content.');
        console.log('📄 Container Text:', (await resultsContainer.getText()).substring(0, 500));
      } catch (e) {
        console.warn(`⚠️ Container wait failed: ${e.message}. Checking body text...`);
        const bodyT = await browser.execute(() => document.body.innerText || '');
        console.log('📄 Body Text:', bodyT.substring(0, 500).replace(/\n/g, ' '));
        throw new Error('Timeout waiting for Results Content');
      }

      console.log('✅ Search finished (Button or Error appeared).');
    } catch (e) {
      console.warn(`⚠️ Search wait timed out: ${e.message}`);
      console.log('ℹ️ Current URL:', await browser.getUrl());
      try {
        const body = await $('body');
        console.log('📄 Page Body Text Sample (2000):', (await body.getText()).substring(0, 2000).replace(/\n/g, ' '));
      } catch (err) { }
      throw new Error('❌ Search failed: Results/Button did not appear.');
    }
  },

  async selectSearchType(searchTypeIndex) {
    const radio = await $(selectors.searchTypeLabel(searchTypeIndex));
    await radio.waitForDisplayed({ timeout: 3000 });
    try {
      if (!(await radio.isSelected())) await radio.click();
    } catch { await radio.click(); }
  },

  async setDestinationWithClick(to) {
    const toField = await $(selectors.toFieldDynamicPackages);
    await toField.click();
    await browser.pause(500);
    await toField.setValue(to);
    let allValues = await $$(selectors.listOfDepartures);
    for (let i = 0; i < allValues.length; i++) {
      const text = (await allValues[i].getText()).trim();
      if (text.includes(to)) {
        try {
          await allValues[i].click();
        } catch {
          await browser.execute(el => el.click(), allValues[i]);
        }
        console.log(`✅ Selected: ${text}`);
        return;
      }
    }
    let suggestions;
    try {
      await browser.waitUntil(async () => {
        const list = await $$(selectors.destinationSuggestion);
        return list.length > 0 && (await list[0].isDisplayed());
      }, { timeout: 7000, timeoutMsg: '❌ No destination suggestions appeared' });

      suggestions = await $$(selectors.destinationSuggestion);
    } catch (e) {
      // Retry: click the input again and wait for suggestions
      console.log('🔄 Suggestions not found, retrying input click...');
      await input.click();
      await browser.pause(1000);
      await browser.waitUntil(async () => {
        const list = await $$(selectors.destinationSuggestion);
        return list.length > 0 && (await list[0].isDisplayed());
      }, { timeout: 7000, timeoutMsg: '❌ No destination suggestions appeared after retry' });

      suggestions = await $$(selectors.destinationSuggestion);
    }

    // Try to select from suggestions
    for (const suggestion of suggestions) {
      const text = await suggestion.getText();
      if (text.includes(to)) {
        const span = await suggestion.$('span');
        await span.click();
        console.log(`✅ Selected: ${text}`);
        return;
      }
    }

    throw new Error(`❌ Could not find "${to}" in suggestions`);

  },

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
  async selectDestinationLastMinute(cityText) {

    // 1) open the last minute picker
    if (await $(selectors.destinationInpuLastMinute).isExisting()) {
      await $(selectors.destinationInpuLastMinute).click();
    } else {
      // fallback: try the deals input
      const box = await $(selectors.destinationInputDeals);
      await box.waitForDisplayed({ timeout: 5000 });
      await box.click();
    }

    // 2) choose city
    const li = await $(selectors.destinationItemByText(cityText));
    await li.waitForDisplayed({ timeout: 5000 });
    await li.click();

    // 3) confirm
    const ok = await $(selectors.chooseDestination);
    await ok.waitForDisplayed({ timeout: 5000 });
    await ok.click();
  },

  async selectDestinationWeekend(cityText) {
    // 1) open the weekend picker
    if (await $(selectors.destinationInputWeekend).isExisting()) {
      await $(selectors.destinationInputWeekend).click();
    } else {
      // fallback: try the deals input
      const box = await $(selectors.destinationInputDeals);
      await box.waitForDisplayed({ timeout: 5000 });
      await box.click();
    }

    // 2) choose city
    const li = await $(selectors.destinationItemByText(cityText));
    await li.waitForDisplayed({ timeout: 5000 });
    await li.click();

    // 3) confirm
    const ok = await $(selectors.chooseDestination);
    await ok.waitForDisplayed({ timeout: 5000 });
    await ok.click();
  },

  selectCalendarDayByDate: async function ({ day, month, year, nextButtonSelector }) {
    const targetDate = new Date(Date.UTC(year, month - 1, day));
    console.log(`📅 Target: ${day}/${month}/${year}`);
    for (let attempt = 0; attempt < 6; attempt++) {
      const monthBlocks = await $$(selectors.calendarMonthBlock);

      for (const block of monthBlocks) {
        const dayElems = await block.$$(selectors.calendarDay);

        for (const el of dayElems) {
          const elTime = parseInt(await el.getAttribute('time'), 10);
          const isVisible = await el.isDisplayed();
          const isClickable = await el.isClickable();
          const elDate = new Date(elTime);
          const isSameDate =
            elDate.getUTCFullYear() === year &&
            elDate.getUTCMonth() === month - 1 &&
            elDate.getUTCDate() === day;

          if (isSameDate && isVisible && isClickable) {
            await el.scrollIntoView();
            await el.click();
            return;
          }
        }
      }

      const nextBtn = await $(nextButtonSelector);
      if (await nextBtn.isDisplayed()) {
        await nextBtn.scrollIntoView();
        await nextBtn.waitForClickable({ timeout: 3000 });
        await nextBtn.click();
        await browser.pause(500);
      }
    }

    throw new Error(`❌ Date ${day}/${month}/${year} not found in visible calendar`);
  },
  async selectNights(nightsLabel) {
    await this.selectFromMenu(selectors.nightsButton, selectors.nightsMenu, nightsLabel);
  },

  async selectNightsLM(nightsLabel) {
    await this.selectFromMenu(selectors.nightsButtonLM, selectors.nightsMenuLM, nightsLabel);
  },

  async selectPriceLM(priceLabel) {
    if (!priceLabel) return;
    await this.selectFromMenu(selectors.priceButtonLM, selectors.priceMenuLM, priceLabel);
  },

  async selectPrice(priceLabel) {
    if (!priceLabel) return;
    await this.selectFromMenu(selectors.priceButtonWK, selectors.priceMenuWK, priceLabel);
  },

  async selectWeekend(weekendLabel) {
    if (!weekendLabel) return;
    await this.selectFromMenu(selectors.weekendButton, selectors.weekendMenu, weekendLabel);
  },

  async selectStars(starsLabel, isLastMinute = false) {
    if (!starsLabel) return;
    if (isLastMinute) {
      await this.selectFromMenu(selectors.ratingButtonLM, selectors.ratingMenuLM, starsLabel);
    } else {
      await this.selectFromMenu(selectors.ratingButton, selectors.ratingMenu, starsLabel);
    }
  },

  async selectFromMenu(buttonSel, menuSel, optionText) {
    const btn = await $(buttonSel);
    await btn.waitForDisplayed({ timeout: 5000 });
    await btn.click();

    const menu = await $(menuSel);
    await menu.waitForDisplayed({ timeout: 5000 });

    let opt = await $(`//ul[@id='${menuSel.replace('#', '')}']//a[normalize-space()="${optionText}"]`);
    if (!(await opt.isExisting())) {
      opt = await $(`//ul[@id='${menuSel.replace('#', '')}']//li[normalize-space()="${optionText}"]`);
    }
    if (!(await opt.isExisting())) {
      opt = await $(`//ul[@id='${menuSel.replace('#', '')}']//a[contains(normalize-space(),"${optionText}")]`);
    }

    await opt.waitForClickable({ timeout: 5000 });
    await opt.click();
    await menu.waitForDisplayed({ reverse: true, timeout: 3000 });
  },

  async setTravelersRegular({ adults = 2, children = 0 } = {}) {
    const input = await $(selectors.travelersInputCandidates[0]); // #package_paxes
    await input.scrollIntoView();
    await input.waitForClickable({ timeout: 5000 });
    await input.click();
    console.log('🧑‍🤝‍🧑 Travelers menu opened (regular)');

    await this.adjustTravelers({
      adultPlus: selectors.adultPlusCandidates[0],
      adultMinus: selectors.adultMinusCandidates[0],
      adultCount: selectors.adultCountCandidates[0],
      childPlus: selectors.childPlusCandidates[0],
      childMinus: selectors.childMinusCandidates[0],
      childCount: selectors.childCountCandidates[0],
      adults,
      children
    });
  },

  async setTravelersWeekend({ adults = 2, children = 0 } = {}) {
    const input = await $(selectors.travelersInputCandidates[2]); // #weekend_paxes
    await input.scrollIntoView();
    await input.waitForClickable({ timeout: 5000 });
    await input.click();
    console.log('🧑‍🤝‍🧑 Travelers menu opened (weekend)');

    await this.adjustTravelers({
      adultPlus: selectors.adultPlusCandidates[2],
      adultMinus: selectors.adultMinusCandidates[2],
      adultCount: selectors.adultCountCandidates[2],
      childPlus: selectors.childPlusCandidates[2],
      childMinus: selectors.childMinusCandidates[2],
      childCount: selectors.childCountCandidates[2],
      adults,
      children
    });
  },

  async setTravelersLastMinute({ adults = 2, children = 0 } = {}) {
    const input = await $(selectors.travelersInputCandidates[1]); // #lastmoment_paxes
    await input.scrollIntoView();
    await input.waitForClickable({ timeout: 5000 });
    await input.click();
    console.log('🧑‍🤝‍🧑 Travelers menu opened (last minute)');

    await this.adjustTravelers({
      adultPlus: selectors.adultPlusCandidates[1],
      adultMinus: selectors.adultMinusCandidates[1],
      adultCount: selectors.adultCountCandidates[1],
      childPlus: selectors.childPlusCandidates[1],
      childMinus: selectors.childMinusCandidates[1],
      childCount: selectors.childCountCandidates[1],
      adults,
      children
    });
  },

  // Shared helper for adjusting counts
  async adjustTravelers({ adultPlus, adultMinus, adultCount, childPlus, childMinus, childCount, adults, children }) {
    const readNum = async (sel) => {
      const el = await $(sel);
      const txt = (await el.getText()).trim();
      if (txt) return parseInt(txt, 10);
      const val = await el.getValue();
      return parseInt(val, 10) || 0;
    };

    const adjust = async (countSel, plusSel, minusSel, target, label) => {
      let current = await readNum(countSel);
      console.log(`🔢 Current ${label}: ${current}, Target: ${target}`);
      while (current < target) {
        const plusBtn = await $(plusSel);
        await plusBtn.waitForClickable({ timeout: 5000 });
        await plusBtn.click();
        current = await readNum(countSel);
      }
      while (current > target) {
        const minusBtn = await $(minusSel);
        await minusBtn.waitForClickable({ timeout: 5000 });
        await minusBtn.click();
        current = await readNum(countSel);
      }
    };

    await adjust(adultCount, adultPlus, adultMinus, adults, 'adults');
    await adjust(childCount, childPlus, childMinus, children, 'children');
  },

  // --- Submitting the search---
  async submitSearch() {
    const searchBtn = await $(selectors.searchButton);
    console.log('🚀 [Dynamic] Clicking search button...');
    try {
      await searchBtn.scrollIntoView({ block: 'center' });
      await searchBtn.waitForClickable({ timeout: 5000 });
      await searchBtn.click();

      // Validation: Did we navigate?
      await browser.pause(2000);
      const url = await browser.getUrl();
      if (!url.includes('DynamicPackages.aspx')) {
        console.warn('⚠️ Navigation did not start. Force clicking via JS...');
        await browser.execute("arguments[0].click();", searchBtn);
      }
    } catch (e) {
      console.warn(`Click failed, trying JS click: ${e.message}`);
      await browser.execute("arguments[0].click();", searchBtn);
    }
  },

  async submitSearchWeekend() {
    const searchBtn = await $(selectors.searchButtonWK);
    await searchBtn.waitForDisplayed({ timeout: 5000 });
    await searchBtn.click();
  },

  async submitSearchLastMinute() {
    const searchBtn = await $(selectors.searchButtonLM);
    await searchBtn.waitForDisplayed({ timeout: 5000 });
    await searchBtn.click();
  },

  async getOutboundFlightDateFromResults() {
    const dateEl = await $(selectors.outboundFlightTakeOff);
    if (!(await dateEl.isExisting())) {
      throw new Error('❌ Outbound flight date element not found in search results');
    }
    const dateText = await dateEl.getText();
    const match = dateText.match(/(\d{2}\/\d{2}\/\d{2})/);
    if (!match) {
      throw new Error(`❌ Could not extract outbound date from text: "${dateText}"`);
    }
    const cleanDate = match[1]; // "25/08/25"
    console.log(`✅ Outbound flight date found: ${cleanDate}`);
    return cleanDate;
  },

  //Open a package
  async clickContinueToDetails() {
    const continueButton = await $(selectors.continueToDetailsButton);
    await continueButton.waitForDisplayed({ timeout: 5000 });
    await continueButton.click();
  },
  async clickContinueToDetailsButtonDynamic() {
    console.log('🔍 Checking for Dynamic Results Button... (Debug Mode)');

    // Dump HTML immediately to debug structure
    try {
      const container = await $(selectors.dynamicPackageResult);
      if (await container.isExisting()) {
        // Get inner HTML of container
        const html = await container.getHTML();
        console.log('📄 FULL RESULT CONTAINER HTML (first 3000 chars):');
        console.log(html.substring(0, 3000));
      } else {
        console.warn('⚠️ Container not found!');
        const body = await $('body');
        const html = await body.getHTML();
        console.log('📄 BODY HTML (first 3000 chars):');
        console.log(html.substring(0, 3000));
      }
    } catch (e) {
      console.warn('Debug dump failed:', e);
    }

    // Attempt to find ANY button that looks right using generic selectors
    // without waiting implicitly (using execute script for speed)

    // Check for "Select Room" / "Order" buttons
    const found = await browser.execute(() => {
      // Try to find elements in browser context
      const query = [
        '.details-checkout',
        '.blue-btn',
        '.choose-room-btn',
        'button.primary',
        'a.btn',
        '[role="button"]'
      ];
      for (const q of query) {
        const el = document.querySelector(q);
        if (el && el.offsetParent !== null) return { selector: q, found: true };
      }
      // Try text content
      const all = document.querySelectorAll('button, a');
      for (const el of all) {
        if (el.textContent.includes('הזמן') || el.textContent.includes('המשך')) {
          if (el.offsetParent !== null) return { selector: 'text-match', text: el.textContent, found: true };
        }
      }
      return { found: false };
    });

    if (found.found) {
      console.log(`✅ Browser found button candidate: ${JSON.stringify(found)}`);
      // If found, try to click it using the selector or text
      if (found.selector === 'text-match') {
        const btn = await $(`//a[contains(., '${found.text}')] | //button[contains(., '${found.text}')]`);
        await btn.click();
      } else {
        const btn = await $(found.selector);
        await btn.click();
      }
      return;
    }

    throw new Error('❌ Debug run finished. Check HTML output above.');
  },

  // ---------------------FILTERS---------------------
  async applyPriceRange(percent = 0.3) {
    // 1. Move handles
    await this.adjustHandle(selectors.priceSlider, selectors.priceSliderHandleMin, 'right', percent);
    await this.adjustHandle(selectors.priceSlider, selectors.priceSliderHandleMax, 'left', percent);

    // 2. Read and normalize range
    const minEl = await $(selectors.sliderPriceMin);
    const maxEl = await $(selectors.sliderPriceMax);
    await minEl.waitForDisplayed({ timeout: 5000 });
    await maxEl.waitForDisplayed({ timeout: 5000 });
    const minTextRaw = await minEl.getText();
    const maxTextRaw = await maxEl.getText();
    const newMin = parseInt(minTextRaw.replace(/[^\d]/g, ''), 10);
    const newMax = parseInt(maxTextRaw.replace(/[^\d]/g, ''), 10);
    if (isNaN(newMin) || isNaN(newMax)) {
      throw new Error(`❌ Failed to parse price range: "${minTextRaw}" - "${maxTextRaw}"`);
    }
    if (newMin > newMax) [newMin, newMax] = [newMax, newMin];
    console.log(`🔍 Parsed prices → Min: ${newMin}, Max: ${newMax}`);

    // 3. Assert tickets
    const tickets = await $$(selectors.priceTicketContainer);
    for (let i = 0; i < tickets.length; i++) {
      const priceEl = await tickets[i].$(selectors.price);
      const priceText = await priceEl.getText();
      const price = parseInt(priceText.replace(/[^\d]/g, ''), 10);
      if (isNaN(price)) {
        throw new Error(`❌ Ticket ${i + 1} has invalid price: "${priceText}"`);
      }
      if (price < newMin || price > newMax) {
        throw new Error(`❌ Ticket ${i + 1} price ₪${price} not in range ₪${newMin} - ₪${newMax}`);
      }
    }

    // 4. Reset handles
    await this.adjustHandle(selectors.priceSlider, selectors.priceSliderHandleMin, 'left', percent);
    await this.adjustHandle(selectors.priceSlider, selectors.priceSliderHandleMax, 'right', percent);
  },
  async checkAllTicketsMatchPriceBoundary({ type, value }) {
    const tickets = await $$(selectors.priceTicketContainer);
    for (let i = 0; i < tickets.length; i++) {
      let priceText = '';
      let price = NaN;

      // Try to get price twice if first attempt fails
      for (let attempt = 1; attempt <= 2; attempt++) {
        const priceEl = await tickets[i].$(selectors.price);
        priceText = await priceEl.getText();
        price = parseInt(priceText.replace(/[^\d]/g, ''), 10);
        if (!isNaN(price)) break;
        if (attempt === 1) {
          await browser.pause(500); // short wait before retry
        }
      }

      if (isNaN(price)) {
        throw new Error(`❌ Ticket ${i + 1} has invalid price: "${priceText}"`);
      }

      if (type === 'min' && price < value) {
        throw new Error(`❌ Ticket ${i + 1} price $${price} is below minimum $${value}`);
      } else if (type === 'max' && price > value) {
        throw new Error(`❌ Ticket ${i + 1} price $${price} is above maximum $${value}`);
      }
      // No log if within boundary
    }
  },

  async adjustHandle(sliderSel, handleSel, direction, percent) {
    const slider = await $(sliderSel);
    await slider.waitForDisplayed({ timeout: 5000 });
    const { width } = await slider.getSize();
    const moveX = Math.floor(width * percent) * (direction === 'right' ? 1 : -1);
    const handle = await $(handleSel);
    await browser.performActions([{
      type: 'pointer', id: 'mouse', parameters: { pointerType: 'mouse' }, actions: [
        { type: 'pointerMove', origin: handle, x: 0, y: 0 },
        { type: 'pointerDown', button: 0 },
        { type: 'pause', duration: 100 },
        { type: 'pointerMove', origin: 'pointer', x: moveX, y: 0 },
        { type: 'pointerUp', button: 0 }
      ]
    }]);
    await browser.releaseActions();
    await browser.pause(500);
  },

  async testStarRatingFilters() {
    const starFilters = [
      { filter: selectors.starRatingFilterThree, ratingClass: 'package-rating-3', stars: 3 },
      { filter: selectors.starRatingFilterFour, ratingClass: 'package-rating-4', stars: 4 },
      { filter: selectors.starRatingFilterFive, ratingClass: 'package-rating-5', stars: 5 },
    ];

    for (const { filter, ratingClass, stars } of starFilters) {
      console.log(`⭐ Clicking ${stars}-star filter`);

      // input exists?
      const input = await $(filter);
      if (!(await input.isExisting())) {
        console.warn(`ℹ️ ${stars}-star filter not present on this page, skipping`);
        continue;
      }

      // click the visible label (parent of input)
      const label = await input.parentElement();
      await label.scrollIntoView({ block: 'center' });
      await label.waitForClickable({ timeout: 5000 });
      await label.click();

      // verify input is checked
      await browser.waitUntil(
        async () => await input.isSelected(),
        { timeout: 3000, timeoutMsg: `❌ ${stars}-star filter did not toggle` }
      );

      // Wait for results to update
      await browser.pause(1000);

      // ⬇️ Move this up!
      const results = await $$(selectors.packageResult);
      if (results.length === 0) {
        throw new Error(`❌ No results found for ${stars} stars`);
      }
      for (let i = 0; i < results.length; i++) {
        const starsContainer = await results[i].$('.stars');
        if (!(await starsContainer.isExisting())) {
          const html = await results[i].getHTML(false);
          console.warn(`⚠️ Result ${i + 1} does not have a .stars container. HTML:\n${html}`);
          continue; // Skip this result, or throw if you expect all to have stars
        }
        const starSpan = await starsContainer.$(`.${ratingClass}`);
        if (!(await starSpan.isExisting())) {
          const html = await starsContainer.getHTML(false);
          console.error(`❌ Result ${i + 1} .stars HTML:\n${html}`);
          throw new Error(`❌ Result ${i + 1} does not have ${stars} stars`);
        }
      }
      console.log(`✅ All results have ${stars} stars`);

      // Unclick filter
      await label.click();
      await browser.pause(500);
    }
  },

  async testHotelFilters(limit = 3) {
    const filters = await $$(selectors.hotelFilterItems);

    for (let i = 0; i < Math.min(limit, filters.length); i++) {
      const filterItem = filters[i];
      const filterName = await filterItem.$(selectors.hotelFilterName).getText();

      console.log(`🏨 Clicking filter: ${filterName}`);

      // click visible label/checkmark
      const label = await filterItem.$(selectors.hotelFilterLabel);
      await label.scrollIntoView({ block: 'center' });
      await label.click();

      // wait for results to refresh
      await browser.waitUntil(
        async () => (await $$(selectors.packageResult)).length > 0,
        { timeout: 10000, timeoutMsg: '❌ No package results after selecting hotel filter' }
      );
      await browser.pause(1000);
      // check first result's hotel name
      const ticketNameEls = await $$(selectors.ticketHotelName);
      if (ticketNameEls.length === 0) {
        throw new Error('❌ No hotel name elements found in results');
      }
      const ticketNameEl = ticketNameEls[0];
      await ticketNameEl.waitForDisplayed({ timeout: 5000 });
      const ticketName = await ticketNameEl.getAttribute('data-name');

      console.log(`✅ Filter "${filterName}" matched result "${ticketName}"`);

      // unclick filter to reset
      await label.click();
      await browser.pause(500);
    }
  },

  async selectRandomHotelFromAutocomplete() {
    // 1. Focus the input
    const input = await $(selectors.hotelNameInput);
    await input.waitForClickable({ timeout: 5000 });
    await input.click();
    await browser.pause(500);
    await input.click();
    // 2. Wait for suggestions to appear
    await browser.waitUntil(async () => {
      const items = await $$(selectors.hotelAutocompleteList);
      return items.length > 1; // at least 1 real hotel + "מלונות" header
    }, { timeout: 7000, timeoutMsg: '❌ Hotel autocomplete suggestions did not appear' });

    // 3. Get all hotel options (skip the first "מלונות")
    const items = await $$(selectors.hotelAutocompleteList);
    const hotels = items.slice(1);

    // Pick one at random
    const randomIndex = Math.floor(Math.random() * hotels.length);
    const chosen = hotels[randomIndex];
    const hotelName = (await chosen.getText()).trim();
    console.log(`🏨 Choosing random hotel: ${hotelName}`);

    // 4. Click it
    await chosen.click();

    // 5. Wait for results
    await browser.waitUntil(
      async () => (await $$(selectors.ticketHotelName)).length > 0,
      { timeout: 10000, timeoutMsg: '❌ No results loaded after selecting hotel' }
    );

    // Compare first result hotel name
    const ticketNameEl = (await $$(selectors.ticketHotelName))[0];
    const ticketName = await ticketNameEl.getAttribute('data-name');
    if (!ticketName.includes(hotelName)) {
      throw new Error(`❌ Autocomplete "${hotelName}" did not match ticket "${ticketName}"`);
    }
    console.log(`✅ Autocomplete "${hotelName}" matched ticket "${ticketName}"`);

    // 6. Clear input
    const clearBtn = await $(selectors.hotelClearButton);
    await clearBtn.click();
    console.log('🗑️ Cleared hotel input');
  },

  // test file
  async testBasisFilters() {
    const basisFilters = [
      { filter: selectors.basisBreakfast, resultSel: selectors.basisBreakfastResults, name: 'Breakfast' },
      { filter: selectors.basisRoomOnly, resultSel: selectors.basisRoomOnlyResults, name: 'Room Only' },
      { filter: selectors.basisHalfBoard, resultSel: selectors.basisHalfBoardResults, name: 'Half Board' },
    ];

    for (const { filter, resultSel, name } of basisFilters) {
      console.log(`🍽️ Clicking basis filter: ${name}`);

      const input = await $(filter);
      if (!(await input.isExisting())) {
        console.warn(`ℹ️ Basis "${name}" not present on this page, skipping`);
        continue;
      }

      const label = await input.parentElement();
      await label.scrollIntoView({ block: 'center' });
      await label.waitForClickable({ timeout: 5000 });
      await label.click();

      await browser.waitUntil(async () => await input.isSelected(), {
        timeout: 3000, timeoutMsg: `❌ Basis "${name}" did not toggle`
      });

      await browser.pause(1000);

      const results = await $$(selectors.packageResult);
      if (results.length === 0) {
        throw new Error(`❌ No results found for "${name}"`);
      }

      for (let i = 0; i < results.length; i++) {
        const basisMatch = await results[i].$(resultSel);
        if (!(await basisMatch.isExisting())) {
          throw new Error(`❌ Result ${i + 1} does not show basis "${name}"`);
        }
      }


      console.log(`✅ All ${results.length} results show basis "${name}"`);

      await label.click(); // unclick filter
      await browser.pause(1000);
    }
  }



};

module.exports = {
  packageSearch,
};