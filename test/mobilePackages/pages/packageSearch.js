const selectors = require('./selectors');

const flightSearch = {

// ========== Modal Interaction ==========

async searchFlight({ to, departureDay, departureMonth, departureYear, returnDay, returnMonth, returnYear,passengers }) {
          await flightSearch.closeCookiesBanner();

await flightSearch.setDestinationWithAutocomplete(to);
    await browser.pause(300);

    // DATE PICKER
    await flightSearch.selectDatesByObjects(
      { day: departureDay, month: departureMonth, year: departureYear },
      { day: returnDay, month: returnMonth, year: returnYear }
    );
await flightSearch.confirmDateSelection();
await flightSearch.setPassengerCount(passengers);
await flightSearch.clickSearchAndWaitForResults();

},

async setDestinationWithAutocomplete(to) {
    const input = await $(selectors.autocompleteInput);
    await input.waitForDisplayed({ timeout: 5000 });
    await input.click();
 
    let suggestions;
    try {
        await browser.waitUntil(async () => {
            const list = await $$(selectors.autocompleteSuggestion);
            return list.length > 0 && (await list[0].isDisplayed());
        }, { timeout: 7000, timeoutMsg: '❌ No destination suggestions appeared' });

        suggestions = await $$(selectors.autocompleteSuggestion);
    } catch (e) {
        // Retry: click the input again and wait for suggestions
        console.log('🔄 Suggestions not found, retrying input click...');
        await input.click();
        await browser.pause(1000);
        await browser.waitUntil(async () => {
            const list = await $$(selectors.autocompleteSuggestion);
            return list.length > 0 && (await list[0].isDisplayed());
        }, { timeout: 7000, timeoutMsg: '❌ No destination suggestions appeared after retry' });

        suggestions = await $$(selectors.autocompleteSuggestion);
    }

    // Try to select from suggestions
    for (const suggestion of suggestions) {
        const text = await suggestion.getText();
        if (text.includes(to)) {
            await suggestion.click();
            console.log(`✅ Selected: ${text}`);
            return;
        }
    }

    throw new Error(`❌ Could not find "${to}" in suggestions`);
},

async pressBackInModal() {
    const backBtn = await $(selectors.backButton);
    await browser.waitUntil(() => backBtn.isDisplayed() && backBtn.isClickable(), {
        timeout: 5000,
        timeoutMsg: '❌ Back button not clickable'
    });
    await backBtn.click();
},

    // ========== Calendar Interaction ==========
async selectDatesByObjects(departureDate, returnDate) {
    console.log("📅 Clicking date picker button...");
    const dateBtn = await $(selectors.calendarButton);
    await dateBtn.click();

    // Use the helper for departure and return dates
    await this.selectClosestAvailableDate(departureDate);

    if (returnDate) {
        await this.selectClosestAvailableDate(returnDate);
        console.log(`✅ Selected ${departureDate.day}/${departureDate.month} to ${returnDate.day}/${returnDate.month}`);
    } else {
        console.log(`✅ Selected ${departureDate.day}/${departureDate.month} (one-way)`);
    }
},

async selectClosestAvailableDate(targetDate) {
    const { day, month, year } = targetDate;
    const requestedSelector = selectors.dayCell(day, month, year);
    const requestedEl = await $(requestedSelector);

    // If requested date exists and is not disabled, click it
    if (await requestedEl.isExisting()) {
        const classAttr = await requestedEl.getAttribute('class');
        if (!classAttr.includes('disabled_date')) {
            await requestedEl.scrollIntoView();
            await requestedEl.click();
            console.log(`✅ Selected requested date: ${day}/${month}/${year}`);
            return;
        }
    }

    // If disabled, find all enabled dates in the same month/year
    const allDayEls = await $$(selectors.enabledDayCells);
    if (allDayEls.length === 0) {
        throw new Error('❌ No available dates found in calendar!');
    }

    // Find the closest enabled date by absolute day difference
    let closest = null;
    let minDiff = Infinity;
    for (const el of allDayEls) {
        const id = await el.getAttribute('id'); // e.g. d03-09-2025
        const match = id.match(/^d(\d{2})-(\d{2})-(\d{4})$/);
        if (!match) continue;
        const elDay = parseInt(match[1], 10);
        const elMonth = parseInt(match[2], 10);
        const elYear = parseInt(match[3], 10);
        if (elMonth !== month || elYear !== year) continue; // Only consider same month/year
        const diff = Math.abs(elDay - day);
        if (diff < minDiff) {
            minDiff = diff;
            closest = el;
        }
    }

    if (closest) {
        await closest.scrollIntoView();
        await closest.click();
        const id = await closest.getAttribute('id');
        console.log(`⚠️ Requested date ${day}/${month}/${year} disabled, selected closest available: ${id.replace(/^d/, '').replace(/-/g, '/')}`);
    } else {
        throw new Error(`❌ No available dates found in month ${month}/${year}`);
    }
},

confirmDateSelection: async function () {
    const doneBtn = await $(selectors.calendarDoneButtonActive);
    let attempts = 0;
    let clicked = false;
    while (attempts < 3 && !clicked) {
        try {
            await doneBtn.waitForClickable({ timeout: 2000 });
            await doneBtn.click();
            clicked = true;
        } catch (err) {
            attempts++;
            if (attempts >= 3) {
console.warn('🐞 BUG: Done button not ready after retries, trying JS click...');
                try {
                    await browser.execute(el => el.click(), doneBtn);
                    clicked = true;
                } catch (jsErr) {
                    console.error('❌ JS click also failed for Done button.');
                }
            } else {
                await browser.pause(700);
            }
        }
    }
    if (!clicked) {
console.warn('� BUG: Could not click Done button after retries.');
    }
},

openTravelerModal: async function () {
    const btn = await $(selectors.passengerCountButton);
    let attempts = 0;
    let clicked = false;
    while (attempts < 3 && !clicked) {
        try {
            await btn.waitForClickable({ timeout: 3000 });
            await btn.click();
            clicked = true;
        } catch (err) {
            attempts++;
            if (attempts >= 3) {
                console.warn('⚠️ Traveler modal button not clickable after retries, trying JS click...');
                try {
                    await browser.execute(el => el.click(), btn);
                    clicked = true;
                } catch (jsErr) {
                    console.error('❌ JS click also failed for traveler modal button.');
                }
            } else {
                await browser.pause(700);
            }
        }
    }
    if (!clicked) {
        console.warn('🐞 BUG: Could not open traveler modal after retries.');
    }
},

async setPassengerCount(count) {
    await this.openTravelerModal();
    await browser.pause(500);
    const input = await $(selectors.autocompleteInputPassengers);
    await input.waitForDisplayed({ timeout: 5000 });
    await input.click();
 
    let suggestions;
    try {
        await browser.waitUntil(async () => {
            const list = await $$(selectors.autocompleteSuggestion);
            return list.length > 0 && (await list[0].isDisplayed());
        }, { timeout: 7000, timeoutMsg: '❌ No passenger suggestions appeared' });

        suggestions = await $$(selectors.autocompleteSuggestion);
    } catch (e) {
        // Retry: click the input again and wait for suggestions
        console.log('🔄 Suggestions not found, retrying input click...');
        await input.click();
        await browser.pause(1000);
        await browser.waitUntil(async () => {
            const list = await $$(selectors.autocompleteSuggestion);
            return list.length > 0 && (await list[0].isDisplayed());
        }, { timeout: 7000, timeoutMsg: '❌ No passenger suggestions appeared after retry' });

        suggestions = await $$(selectors.autocompleteSuggestion);
    }    for (const suggestion of suggestions) {
        // Try to get the visible text from the deepest div
        let text = '';
        try {
            text = await browser.execute(el => {
                // Get all text nodes recursively
                function getTextNodes(node) {
                    let text = '';
                    for (const child of node.childNodes) {
                        if (child.nodeType === Node.TEXT_NODE) {
                            text += child.textContent;
                        } else if (child.nodeType === Node.ELEMENT_NODE) {
                            text += getTextNodes(child);
                        }
                    }
                    return text;
                }
                return getTextNodes(el).trim();
            }, suggestion);
        } catch (e) {
            text = (await suggestion.getText()).trim();
        }
    
        console.log('🔎 Passenger suggestion:', text);
    
        if (text.replace(/\s/g, '') === count.replace(/\s/g, '')) {
            await suggestion.click();
            console.log(`✅ Selected: ${text}`);
            return;
        }
    }
    throw new Error(`❌ Could not find "${count}" in suggestions`);
},

closePassengerModal: async function () {
    const backBtn = await $(selectors.passengerModalBackButton);
    await backBtn.scrollIntoView();
    await browser.pause(200);
    try {
        await backBtn.waitForClickable({ timeout: 5000 });
        await backBtn.click();
        console.log('✅ Closed passenger modal with back icon');
    } catch (err) {
        console.warn('⚠️ Normal click failed, trying JS click for passenger modal back icon');
        await browser.execute(el => el.click(), backBtn);
        console.log('✅ Closed passenger modal with back icon (JS click fallback)');
    }
},

async clickSearchAndWaitForResults() {
  const searchBtn = await $(selectors.searchButton);
  await browser.waitUntil(
    async () => await searchBtn.isDisplayed() && await searchBtn.isClickable(),
    {
      timeout: 5000,
      timeoutMsg: '❌ Search button not clickable',
    }
  );

  const startTime = Date.now(); 
  console.log('🚀 Clicking search button...');
  await searchBtn.click();
  await flightSearch.closeModalIfPresent();
  await this.waitForSearchResults(); 
  const totalTime = Date.now() - startTime;
  console.log(`💡 [PERF] Mobile search took ${totalTime} ms`);

  return totalTime; // 👈 Add this return!
},

async waitForSearchResults() {
    console.log('⏳ Waiting for search results to load...');
    const results = await $(selectors.searchResultsHeader);
    await results.waitForDisplayed({
        timeout: 10000,
        timeoutMsg: '❌ Search results did not appear in time'
    });
    console.log('✅ Search results loaded!');
},

waitForResultsLoaderToDisappear: async function () {
    await browser.waitUntil(async () => {
        const loader = await $(selectors.resultsLoader);
        const exists = await loader.isExisting();
        if (!exists) return true;
        try {
            return !(await loader.isDisplayed());
        } catch {
            // If isDisplayed throws (element removed), treat as disappeared
            return true;
        }
    }, {
        timeout: 20000,
        interval: 300,
        timeoutMsg: '❌ Loader did not disappear after waiting.'
    });
    console.log('✅ Loader disappeared, ready for search results.');
},

async closeModalIfPresent() {
    const closeBtn = await $(selectors.closeDealModalButton);
    await closeBtn.waitForDisplayed();
    await closeBtn.click();
    await browser.pause(300); // Give time for modal to close
    console.log('✅ Closed modal before checking results');

},

openMobileFlightFilters: async function () {
    await browser.pause(5000);
    const openBtn = await $(selectors.openMobileFilterButton);
    await openBtn.waitForClickable({ timeout: 7000 });
    await openBtn.click();
    console.log('✅ Mobile flight filters modal opened');
},

applyMobileFlightFilters: async function () {
    const applyBtn = await $(selectors.applyMobileFilterButton);
    try {
        await applyBtn.waitForClickable({ timeout: 5000 });
        await applyBtn.click();
        console.log('✅ Mobile filters applied (החל)');
        await browser.pause(1000);
    } catch (err) {
        // Check if any filter is selected
        const anyFilterSelected = await $$('input[type="checkbox"]:checked').length > 0;
        if (!anyFilterSelected) {
            console.warn('⚠️ No filter chosen, skipping apply.');
            return;
        }
        // Try JS click as fallback
        try {
            await browser.execute(el => el.click(), applyBtn);
            console.log('✅ Applied filters with JS click fallback');
            await browser.pause(1000);
        } catch (jsErr) {
            console.error('❌ Could not apply filters:', jsErr.message);
            throw jsErr;
        }
    }
},

/**
 * Dynamically clear selected filter sections in the mobile filter modal.
 * @param {Array<string>} sections - Array of filter section names to clear. 
 *    Supported: 'flightType', 'airlines', 'stops', 'timeOfDay', etc.
 *    If empty or not provided, clears all visible "בטל הכל" buttons.
 */
clearMobileFilters: async function (sections = []) {
    // Map section names to their "Clear All" button selectors
    const sectionSelectors = {
        flightType: selectors.clearFlightTypeFiltersButton,
        airlines: selectors.clearFlightairlines,
        stops: selectors.clearFlightstops,
        timeOfDay:selectors.clearFlighttimeOfDay,
    };

    let buttons = [];
    if (sections.length === 0) {
        // No sections specified: clear all visible "בטל הכל" buttons
        buttons = await $$('p.chooseCompany');
    }     else {
        // Collect buttons for specified sections
        for (const section of sections) {
            const sel = sectionSelectors[section];
            if (!sel) {
                console.warn(`⚠️ No selector mapped for section "${section}"`);
                continue;
            }
            const btns = await $$(sel);
            console.log(`🔎 Found ${btns.length} "Clear All" button(s) for section "${section}" using selector: ${sel}`);
            buttons.push(...btns);
        }
    }

    let clicked = 0;
    for (const btn of buttons) {
        if (await btn.isDisplayed()) {
            await btn.scrollIntoView();
            await browser.pause(200);
            try {
                if (await btn.isClickable()) {
                    await btn.click();
                } else {
                    // Try JS click if not clickable
                    await browser.execute(el => el.click(), btn);
                }
                clicked++;
            } catch (err) {
                // Always try JS click as a last resort
                try {
                    await browser.execute(el => el.click(), btn);
                    clicked++;
                } catch (e) {
                    console.warn(`⚠️ Could not click "Clear All" button: ${e.message}`);
                }
            }
        }
    }
    if (clicked > 0) {
        console.log(`🧹 Cleared filters for sections: ${sections.length ? sections.join(', ') : 'ALL'} (${clicked} clicks)`);
    } else {
        console.log('ℹ️ No "Clear All" buttons were clickable for the requested sections');
    }
},
// Utility: click a checkbox with fallback
async clickCheckbox(selector) {
  const el = await $(selector);
  await el.scrollIntoView({ block: 'center' });
  await el.waitForExist({ timeout: 3000 });
  try {
    await el.waitForClickable({ timeout: 2000 });
    await el.click();
  } catch {
    await browser.execute(e => e.click(), el);
  }
},

async clearSection(sectionTitleExact) {
  const section = await $(`//section[.//p[contains(@class,"filterBlock__text") and normalize-space()="${sectionTitleExact}"]]`);
  if (await section.isExisting()) {
    const clearBtn = await section.$('.chooseCompany');
    if (await clearBtn.isExisting()) {
      await clearBtn.click().catch(() => {});
    }
  }
},

// Helper: derive star rating from a result card (counts star icons or parses text)
getStarRatingFromCard: async function (card) {
 // Try icons first
const starImgs = await card.$$(selectors.resultCardStarIcons); // e.g. 'img[src*="star"]' within the card
if (starImgs.length > 0) return starImgs.length;

    // Fallback: text like "3 כוכבים" or "★★★★★" etc.
    const starTextEl = await card.$(selectors.resultCardStarText);
    if (await starTextEl.isExisting()) {
        const t = (await starTextEl.getText()) || '';
        const m = t.match(/([1-5])/);
        if (m) return parseInt(m[1], 10);
    }
    return null; // unknown
},

// Helper: extract meal/basis text from a result card
getMealFromCard: async function (card) {
    const mealEl = await card.$(selectors.packageMeal); // you already use this in your extractor
    if (await mealEl.isExisting()) {
        return (await mealEl.getText())?.trim() || '';
    }
    // Optional fallback if you want:
    const tag = await card.$(selectors.resultCardMealTag);
    if (await tag.isExisting()) return (await tag.getText())?.trim() || '';
    return '';
},

// --- Stars: open → clear → click → apply → wait → validate ---
testStarRatings: async function () {
    const options = [
        { label: '3★', value: 3, checkbox: selectors.rating3 },
        { label: '4★', value: 4, checkbox: selectors.rating4 },
        { label: '5★', value: 5, checkbox: selectors.rating5 },
    ];

    for (const opt of options) {
        // Open + clear only the "rating" section
                 await this.openMobileFlightFilters();
        const btn = await $(selectors.clearRatingFiltersButton);
        console.log('Clear button exists:', await btn.isExisting(), 'Text:', await btn.getText());
        if (await btn.isExisting()) {
            try { await btn.click(); }
            catch { await browser.execute(el => el.click(), btn); }
        }

        // Select the star checkbox
        const cb = await $(opt.checkbox);
        if (!(await cb.isExisting())) { console.warn(`⚠️ Missing checkbox for ${opt.label}, skipping`); continue; }
        await cb.scrollIntoView({ block: 'center' });
        try { await cb.click(); } catch { await browser.execute(el => el.click(), cb); }
        console.log(`✅ Selected star filter: ${opt.label}`);

        // Apply + wait results
        await this.applyMobileFlightFilters();
        await this.waitForSearchResults();

        // Validate first N cards
              const cards = await $$(selectors.packageResultCard);
        console.log(`Found ${cards.length} package cards after applying filter: ${opt.label}`);
        if (cards.length === 0) {
            console.warn(`⚠️ No package results after applying star filter: ${opt.label}`);
            continue;
        }        const toCheck = cards.slice(0, Math.min(cards.length, 8));
        for (const [i, card] of toCheck.entries()) {
            const rating = await this.getStarRatingFromCard(card);
            if (rating === null) {
                console.warn(`ℹ️ Card #${i + 1}: star rating unknown, skipping strict check`);
                continue;
            }
            if (rating !== opt.value) {
                throw new Error(`❌ Card #${i + 1} has ${rating}★ but filter is ${opt.value}★`);
            }
        }
        console.log(`✅ Star filter ${opt.label} validated on ${toCheck.length} cards`);
    }
},

// --- Basis: open → clear → click → apply → wait → validate ---
testAllBasis: async function () {
    const basis = [
        { label: 'ארוחת בוקר',    key: 'breakfast',    checkbox: selectors.basisBreakfast },
        { label: 'חצי פנסיון',    key: 'halfBoard',    checkbox: selectors.basisHalfBoard },
        { label: 'הכל כלול',      key: 'allInclusive', checkbox: selectors.basisAllInclusive },
        { label: 'פנסיון מלא',    key: 'fullBoard',    checkbox: selectors.basisFullBoard },
        { label: 'לינה בלבד',     key: 'roomOnly',     checkbox: selectors.basisRoomOnly },
    ];

    for (const b of basis) {
        await this.openMobileFlightFilters();

        // Clear only the "basis" section
        if (selectors.clearBasisFiltersButton) {
            const btn = await $(selectors.clearBasisFiltersButton);
            if (await btn.isExisting()) { try { await btn.click(); } catch { await browser.execute(el => el.click(), btn); } }
        }

        // Click the basis checkbox (if present)
        const cb = await $(b.checkbox);
        if (!(await cb.isExisting())) { console.warn(`⚠️ Basis not present: ${b.label}, skipping`); continue; }
        await cb.scrollIntoView({ block: 'center' });
        try { await cb.click(); } catch { await browser.execute(el => el.click(), cb); }
        console.log(`✅ Selected basis: ${b.label}`);

        // Apply + wait results
        await this.applyMobileFlightFilters();
        await this.waitForSearchResults();

        // Validate first N cards
        const cards = await $$(selectors.packageResultCard);
        if (cards.length === 0) throw new Error('❌ No package results after applying basis filter');

        const toCheck = cards.slice(0, Math.min(cards.length, 8));
        for (const [i, card] of toCheck.entries()) {
            const mealText = (await this.getMealFromCard(card)) || '';
            if (!mealText || !mealText.includes(b.label)) {
                throw new Error(`❌ Card #${i + 1} meal "${mealText}" does not match basis "${b.label}"`);
            }
        }
        console.log(`✅ Basis filter "${b.label}" validated on ${toCheck.length} cards`);
    }
},

async closeCookiesBanner() {
    // Try to find and click the mobile cookies accept button
    const cookieBtn = await $('button.btn-accept');
    if (await cookieBtn.isExisting() && await cookieBtn.isDisplayed()) {
        await cookieBtn.click();
        console.log('🍪 Cookies banner closed ');
    } else {
        console.log('🍪 No cookies banner displayed ');
    }
},  

selectFirstPackageAndExtractInfo: async function () {
    // Wait for package results to appear
    await browser.waitUntil(
        async () => (await $$(selectors.packageResultCard)).length > 0,
        { timeout: 15000, timeoutMsg: '❌ No package results found!' }
    );

    const packages = await $$(selectors.packageResultCard);
    const firstPackage = packages[0];

    // Extract info for later comparison
     const hotelName = await (await firstPackage.$(selectors.packageHotelName)).getText();
    const priceText = await (await firstPackage.$(selectors.packagePrice)).getText();
    const summaryPrice = parseInt(priceText.replace(/[^\d]/g, ''), 10);
    
    let meal = '';
    const mealEl = await firstPackage.$(selectors.packageMeal);
    if (await mealEl.isExisting()) {
        meal = await mealEl.getText();
    }
    
    let nights = '';
    const nightsEl = await firstPackage.$(selectors.packageNights);
    if (await nightsEl.isExisting()) {
        nights = await nightsEl.getText();
    }
    
    let departureDate = '';
    const depDateEl = await firstPackage.$(selectors.packageDepartureDate);
    if (await depDateEl.isExisting()) {
        departureDate = await depDateEl.getText();
    }
    
    let returnDate = '';
    const retDateEl = await firstPackage.$(selectors.packageReturnDate);
    if (await retDateEl.isExisting()) {
        returnDate = await retDateEl.getText();
    }
    await firstPackage.scrollIntoView();
    await browser.pause(300);

    try {
        await firstPackage.click();
    } catch (err) {
        await browser.execute(el => el.click(), firstPackage);
    }
    await browser.pause(500);

    // Return info for later comparison
    return { summaryPrice, hotelName, meal, nights, departureDate, returnDate };
},

};

module.exports = {
  flightSearch,
};
