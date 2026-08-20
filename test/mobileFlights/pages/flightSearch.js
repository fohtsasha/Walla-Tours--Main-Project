const selectors = require('./selectors');
const helpers = require('../helper.js');

const flightSearch = {

// ========== Modal Interaction ==========

async searchFlight({ from, to, departureDay, departureMonth, departureYear, returnDay, returnMonth, returnYear, rowIndex = 0, submit = true, flightClass = 'Economy' }) {
    const isMulti = rowIndex > 0;
    const isOneWay = returnDay == null;

    console.log(`✈️ Searching: ${from} → ${to} | ${isOneWay ? 'One-way' : 'Round-trip'} | Row: ${rowIndex}`);
  if (isOneWay) {
        const oneWayBtn = await $(selectors.oneWayButton);
        if (await oneWayBtn.isDisplayed() && await oneWayBtn.isClickable()) {
            await oneWayBtn.click();
            console.log('✅ Clicked one-way button');
        } else {
            console.warn('⚠️ One-way button not found or not clickable');
        }
    }
    await browser.pause(2000); // before `clickCityButton()` in `searchFlight()`
    await flightSearch.closeCookiesBanner();

    // FROM FIELD
    await flightSearch.clickCityButton('from');
    await flightSearch.clearCityField();
    await flightSearch.typeCity(from);
    await flightSearch.selectFirstSuggestion();
    await browser.pause(300);

    // TO FIELD
    await flightSearch.clickCityButton('to');
    await flightSearch.clearCityField();
    await flightSearch.typeCity(to);
    await flightSearch.selectFirstSuggestion();
    await browser.pause(300);

    // DATE PICKER
    await flightSearch.selectDatesByObjects(
      { day: departureDay, month: departureMonth, year: departureYear },
      isOneWay ? null : { day: returnDay, month: returnMonth, year: returnYear }
    );
    await flightSearch.confirmDateSelection();

    // FLIGHT CLASS (radio selection on mobile)
    if (flightClass) {
      const classMap = {
        'Economy': 'תיירים',
        'Business': 'עסקים',
        'Premium': 'פרימיום'
      };
      const translatedClass = classMap[flightClass] || flightClass;
      console.log(`🧭 Selecting flight class: ${translatedClass}`);
      await flightSearch.selectFlightClassRadio(translatedClass);
    }
if (submit) {
  return await flightSearch.clickSearchAndWaitForResults(); // ⏱ Return timing
} else {
  console.log('🚫 Skipping search submission');
  return null;
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

async clickCityButton(type) {
    const selector = type === 'from' ? selectors.fromCityButton : selectors.toCityButton;
    const btn = await $(selector);

    try {
        console.log(`🔎 Waiting for ${type} city button...`);

        await btn.waitForDisplayed({ timeout: 10000 });
        await btn.waitForClickable({ timeout: 10000 });
        await btn.scrollIntoView();
        await browser.pause(300); // Let animations settle

        try {
            await btn.click();
        } catch (e) {
            console.warn(`⚠️ Native click failed for ${type} button, trying JS click...`);
            await browser.execute(el => el.click(), btn);
        }

        const modal = await $(selectors.modalContainer);
        await modal.waitForDisplayed({
            timeout: 10000,
            timeoutMsg: `❌ Modal for ${type} did not appear`
        });

        console.log(`✅ Clicked "${type}" city button and modal opened`);
    } catch (err) {
        console.error(`❌ Failed to click city button (${type}):`, err.message);
        throw err; // Optional: allow test to fail, or return silently
    }
},


async clearCityField() {
    const clearBtn = await $(selectors.clearCityButton);
    await browser.waitUntil(() => clearBtn.isDisplayed(), {
        timeout: 5000,
        timeoutMsg: '❌ Clear button not visible'
    });
    await clearBtn.scrollIntoView();
    await browser.pause(200);
    try {
        await clearBtn.click();
    } catch (e) {
        await browser.execute(el => el.click(), clearBtn);
    }
},

async typeCity(cityName) {
    const input = await $(selectors.autocompleteInput);
    await input.waitForDisplayed({ timeout: 5000 });
    await input.setValue(cityName);
},

async selectFirstSuggestion() {
    const suggestion = await $(selectors.autocompleteFirstSuggestion);
    await browser.waitUntil(() => suggestion.isDisplayed(), {
        timeout: 5000,
        timeoutMsg: '❌ Suggestion not visible'
    });
    await suggestion.click();
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
    const dateBtn = await $(selectors.datePickerButton);
    await dateBtn.waitForClickable({ timeout: 5000 });
    await dateBtn.click();

    // Select departure date
    const depSelector = selectors.dayCell(departureDate.day, departureDate.month - 1);
    await browser.waitUntil(async () => (await $(depSelector)).isExisting(), {
        timeout: 5000,
        timeoutMsg: '❌ Departure day not found'
    });
    const depEl = await $(depSelector);
    await depEl.scrollIntoView();
    await depEl.click();

    // Select return date
    if (returnDate) {
        const retSelector = selectors.dayCell(returnDate.day, returnDate.month - 1);
        await browser.waitUntil(async () => (await $(retSelector)).isExisting(), {
            timeout: 5000,
            timeoutMsg: '❌ Return day not found'
        });
        const retEl = await $(retSelector);
        await retEl.scrollIntoView();
        await retEl.click();

        console.log(`✅ Selected ${departureDate.day}/${departureDate.month} to ${returnDate.day}/${returnDate.month}`);
    } else {
        console.log(`✅ Selected ${departureDate.day}/${departureDate.month} (one-way)`);
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

async selectFlightClassRadio(label) {
    const option = await $(selectors.flightClassOptionByLabel(label));
    await option.waitForDisplayed({ timeout: 5000 });
    await option.click();
},

openTravelerModalIfNeeded: async function () {
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

async adjustTravelerCount(type, count) {
    await this.openTravelerModalIfNeeded();

    const groups = await $$(selectors.appAgeGroup);
    for (const [i, group] of groups.entries()) {
        const buttons = await group.$$(selectors.countControlButton);
        console.log(`👀 Group ${i + 1} has ${buttons.length} buttons`);
    }
    const isIncrease = count > 0;
    const emoji = isIncrease ? '➕' : '➖';
    const label = isIncrease ? 'plus' : 'minus';
    const clickCount = Math.abs(count);

      for (let i = 0; i < clickCount; i++) {
        let img;
        switch (type) {
            case 'adult':
                img = await $(isIncrease ? selectors.adultPlusButton : selectors.adultMinusButton);
                break;
            case 'child':
                img = await $(isIncrease ? selectors.childPlusButton : selectors.childMinusButton);
                break;
            case 'infant':
                img = await $(isIncrease ? selectors.infantPlusButton : selectors.infantMinusButton);
                break;
            default:
                throw new Error(`❌ Invalid traveler type: "${type}"`);
        }
    
        try {
            const button = await img.parentElement();
            await button.waitForDisplayed({ timeout: 3000 });
            await button.waitForClickable({ timeout: 3000 });
    
            const isDisabled = await button.getAttribute('disabled');
            if (isDisabled) {
                console.warn(`⚠️ The ${label} button is disabled for ${type} — stopping`);
                break;
            }
    
            console.log(`${emoji} Clicking ${type} ${label} button (${i + 1}/${clickCount})`);
            await button.click();
            await browser.pause(500);
        } catch (err) {
            console.error(`❌ Failed clicking ${type} ${label} button: ${err.message}`);
        }}
    },

async getTravelerCount(type) {
    let field;
    switch (type) {
        case 'adult':
            field = await $(selectors.adultCountField);
            break;
        case 'child':
            field = await $(selectors.childCountField);
            break;
        case 'infant':
            field = await $(selectors.infantCountField);
            break;
        default:
            throw new Error(`Invalid traveler type: ${type}`);
    }

    const text = await field.getText();
    const cleaned = text.trim().replace(/[^\d]/g, '');
    const count = parseInt(cleaned, 10);

    if (isNaN(count)) {
        console.warn(`⚠️ Traveler count for "${type}" is not a number: raw="${text}"`);
        return 0;
    }

    return count;
},

async increaseTravelers({ adult = 0, child = 0, infant = 0 }) {
    await this.openTravelerModalIfNeeded();
    const targets = { adult, child, infant };
    for (const [type, count] of Object.entries(targets)) {
        if (count > 0) {
            await this.adjustTravelerCount(type, count);
            console.log(`➕ Increased ${type} by ${count}`);
        }
    }
},

async decreaseTravelers({ adult = 0, child = 0, infant = 0 }) {
    await this.openTravelerModalIfNeeded();
    
    const targets = { adult, child, infant };
    for (const [type, count] of Object.entries(targets)) {
        if (count > 0) {
            await this.adjustTravelerCount(type, -Math.abs(count));
            console.log(`➖ Decreased ${type} by ${count}`);
        }
    }
},

applyPassengerModal: async function () {
    const button = await $(selectors.doneButtonPassengerCount);
    await button.scrollIntoView();
    await browser.pause(200);
    try {
        await button.waitForClickable({ timeout: 7000 });
        await button.click();
        console.log('✅ Closed passenger modal (normal click)');
    } catch (err) {
        console.warn('⚠️ Normal click failed, trying JS click for passenger modal');
        await browser.execute(el => el.click(), button);
        console.log('✅ Closed passenger modal (JS click fallback)');
    }
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

  const startTime = Date.now(); // ⏱ Start measuring
  console.log('🚀 Clicking search button...');
  await searchBtn.click();

  await this.waitForSearchResults(); // This stays as-is

  const totalTime = Date.now() - startTime;
  console.log(`💡 [PERF] Mobile search took ${totalTime} ms`);

  return totalTime; // 👈 Add this return!
},

async waitForSearchResults() {
    console.log('⏳ Waiting for search results to load...');
    const results = await $(selectors.ticketCard);
    await results.waitForDisplayed({
        timeout: 30000,
        timeoutMsg: '❌ No results found'
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

openMobileFlightFilters: async function () {
    await browser.pause(5000);
    const openBtn = await $(selectors.openMobileFilterButton);
    await openBtn.waitForClickable({ timeout: 7000 });
    await openBtn.click();
    console.log('✅ Mobile flight filters modal opened');
},


clearAllMobileFilters: async function () {
    const clearBtn = await $(selectors.clearFlightTypeFiltersButton);
    await clearBtn.scrollIntoView();
    await browser.pause(300);

    try {
        await clearBtn.waitForClickable({ timeout: 3000 });
        await clearBtn.click();
        console.log('🧹 Cleared flight-type filters (mobile)');
    } catch (err) {
        console.warn(`⚠️ Could not click "Clear All" for flight type: ${err.message}`);
    }
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
             if (applyBtn && await applyBtn.isExisting() && await applyBtn.isDisplayed()) {
                await browser.execute(el => el.click(), applyBtn);
                console.log('✅ Applied filters with JS click fallback');
                await browser.pause(1000);
            } else {
                throw new Error('❌ Apply button not found or not interactable for JS click');
            }
            console.log('✅ Applied filters with JS click fallback');
            await browser.pause(1000);
        } catch (jsErr) {
            console.error('❌ Could not apply filters:', jsErr.message);
            throw jsErr;
        }
    }
},

resetMobileFilters: async function () {
  await this.openMobileFlightFilters();
    const resetBtn = await $(selectors.resetFiltersButton);
    const exists = await resetBtn.isExisting();
    if (!exists) {
        console.log('ℹ️ Reset button (איפוס) does not exist, skipping reset.');
        return;
    }
    const displayed = await resetBtn.isDisplayed();
    if (!displayed) {
        console.log('ℹ️ Reset button (איפוס) not displayed, skipping reset.');
        return;
    }
    // Wait until the button is enabled (not disabled)
    await browser.waitUntil(
        async () => await resetBtn.isEnabled(),
        {
            timeout: 3000,
            timeoutMsg: 'Reset button is not enabled after 3s'
        }
    );
        await resetBtn.click();
        console.log('🔄 Filters reset (איפוס) pressed');
    await browser.pause(500);
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

selectAirlineAndCheckResults: async function (airlineName) {
    await this.openMobileFlightFilters();
    await this.clearMobileFilters(['airlines']);   
    const selector = selectors.airlineCheckboxByName(airlineName);
    const checkbox = await $(selector);
    await checkbox.scrollIntoView({ block: 'center' });
    await browser.pause(300);

    // Only click if NOT already checked
    const classAttr = await checkbox.getAttribute('class');
    if (!classAttr.includes('p-highlight')) {
        try {
            await checkbox.waitForClickable({ timeout: 3000 });
            await checkbox.click();
            console.log(`✅ Selected airline: ${airlineName}`);
        } catch (err) {
            console.warn(`⚠️ Click failed for airline "${airlineName}", using JS fallback`);
            await browser.execute(el => el.click(), checkbox);
        }
    } else {
        console.log(`ℹ️ Airline "${airlineName}" was already checked after clearing filters`);
    }

    await this.applyMobileFlightFilters();
        const tickets = await $$(selectors.ticketCard);
        for (let i = 0; i < tickets.length; i++) {
            const ticket = tickets[i];
            const airlineEl = await ticket.$(selectors.ticketFlightTypeFlag);
            const airlineText = (await airlineEl.getText()).trim();
            if (!airlineText.includes(airlineName)) {
                console.error(`❌ Ticket ${i + 1} does NOT match airline "${airlineName}" (found: "${airlineText}")`);
            }
            // No log for matches
        }
    },

getAllAirlineNames: async function () {
    await this.openMobileFlightFilters();
    // Get all airline label elements in the filter
    const airlineLabels = await $$("//p[contains(@class,'filterBlock__text') and text()='חברות תעופה']/ancestor::section//label[contains(@class,'filterStop__label')]");
    const names = [];
    for (const label of airlineLabels) {
        const name = (await label.getText()).trim();
        if (name) names.push(name);
    }
    // Optionally close the filter modal here if needed
    return names;
},

//Stops Filter
testAllStopFilters: async function () {
    await this.openMobileFlightFilters();
    await this.clearMobileFilters(['stops']);

    // Map stop types to selectors and readable names
    const stopTypes = [
        { key: 'direct', selector: selectors.directFlightCheckbox, label: 'Direct' },
        { key: 'oneStop', selector: selectors.oneStopCheckbox, label: '1 Stop' },
        { key: 'twoStops', selector: selectors.twoStopsCheckbox, label: '2+ Stops' }
    ];

    // Find which stop filters are present
    const available = [];
    for (const stop of stopTypes) {
        const el = await $(stop.selector);
        if (await el.isExisting()) {
            available.push(stop);
        }
    }

    if (available.length < 2 || available.length > 3) {
        throw new Error(`❌ Expected 2 or 3 stop filters, found ${available.length}`);
    }

  for (const stop of available) {
        await this.openMobileFlightFilters();
        await this.clearMobileFilters(['stops']);

        const checkbox = await $(stop.selector);
        await checkbox.scrollIntoView({ block: 'center' });
        await browser.pause(200);

        // Click to check (always, since we just cleared)
        try {
            await checkbox.waitForClickable({ timeout: 2000 });
            await checkbox.click();
            console.log(`✅ Selected stop type: ${stop.label}`);
        } catch (err) {
            console.warn(`⚠️ Click failed for stop type "${stop.label}", using JS fallback`);
            await browser.execute(el => el.click(), checkbox);
        }

        await this.applyMobileFlightFilters();
        await this.waitForSearchResults(); // <-- Ensure results are loaded

    }
},

checkAllTicketsMatchFlightType: async function (expectedLabel) {
    const tickets = await $$(selectors.ticketCard);

    for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        // Get all flight type flags for this ticket (multi or single)
        const flags = await ticket.$$(selectors.ticketFlightTypeFlag);
        const types = [];
        for (const flag of flags) {
            let text = (await flag.getText()).trim().replace(/\s+/g, ' ');
            text = text.replace(/^[-–\s]+/, '').trim();
            if (text) types.push(text);
        }
        const combo = types.join('+');
        const match = types.some(type => type.includes(expectedLabel));

        // Only log if there is an error (mismatch)
        if (!match) {
            console.error(`❌ Ticket ${i + 1} | Types: "${combo}" does NOT match "${expectedLabel}"`);
        }
        // No log for matches
    }
},

selectFlightTypeFilter: async function (type) {
    // Desktop logic (if present)
    if (selectors.charterFlight && selectors.regularFlight) {
        const charterEl = await $(selectors.charterFlight);
        const regularEl = await $(selectors.regularFlight);

        if (type === 'charter') {
            if (await charterEl.isExisting()) {
                await charterEl.click();
                console.log(`✅ Desktop filter selected: ${type}`);
            } else {
                console.warn(`⚠️ Charter filter not found`);
            }
        } else if (type === 'regular') {
            if (await regularEl.isExisting()) {
                await regularEl.click();
                console.log(`✅ Desktop filter selected: ${type}`);
            } else {
                console.warn(`⚠️ Regular filter not found`);
            }
        } else if (type === 'mixed') {
            console.warn('⚠️ No filter for "mixed" flight type, skipping filter step.');
            return; // <-- Just skip filtering for mixed
        } else {
            throw new Error(`❌ Unknown flight type filter: "${type}"`);
        }
        return;
    }
    // ✅ MOBILE LOGIC
    if (type === 'mixed') {
        console.warn('⚠️ No filter for "mixed" flight type, skipping filter step.');
        return; // <-- Just skip filtering for mixed
    }
    const labelMap = selectors.flightTypeLabelMap;
    const labelText = labelMap[type];
    if (!labelText) throw new Error(`❌ Unknown flight type: "${type}"`);
    await this.openMobileFlightFilters();
    await this.clearAllMobileFilters();
    const checkboxSelector = selectors.flightTypeFilterCheckbox(labelText);
    const checkbox = await $(checkboxSelector);
    await checkbox.scrollIntoView({ block: 'center' });
    await browser.pause(300);
    try {
        await checkbox.waitForClickable({ timeout: 3000 });
        await checkbox.click();
        console.log(`✅ Clicked mobile checkbox: ${labelText}`);
    } catch (err) {
        console.warn(`⚠️ Click failed for "${labelText}", using JS fallback`);
        await browser.execute(el => el.click(), checkbox);
    }
    await this.applyMobileFlightFilters();
    await this.waitForSearchResults(); // <-- Ensure results are loaded
    await this.checkAllTicketsMatchFlightType(labelText);
},

isMultiTicket: async function (ticket) {
    // Use the same selector as in selectSpecificTicketCombo for consistency
    const flags = await ticket.$$(selectors.ticketFlightTypeFlag);
    return flags.length > 1;
},
testAllTimeOfDayFilters: async function () {
    await this.openMobileFlightFilters();
    await this.clearMobileFilters(['timeOfDay']);

    // Map time-of-day types to selectors and hour ranges
    const timeTypes = [
        { key: 'morning', selector: selectors.morningCheckbox, label: 'בוקר', min: 0, max: 12 },
        { key: 'noon', selector: selectors.noonCheckbox, label: 'צהריים', min: 12, max: 16 },
        { key: 'evening', selector: selectors.eveningCheckbox, label: 'ערב', min: 17, max: 21 },
        { key: 'night', selector: selectors.nightCheckbox, label: 'לילה', min: 22, max: 4 }
    ];

    // Find which time filters are present
    const available = [];
    for (const time of timeTypes) {
        const el = await $(time.selector);
        if (await el.isExisting()) {
            available.push(time);
        }
    }

    if (available.length < 2) {
        throw new Error(`❌ Expected at least 2 time-of-day filters, found ${available.length}`);
    }

    for (const time of available) {
        await this.openMobileFlightFilters();
        await this.clearMobileFilters(['timeOfDay']);

        const checkbox = await $(time.selector);
        await checkbox.scrollIntoView({ block: 'center' });
        await browser.pause(200);

        try {
            await checkbox.waitForClickable({ timeout: 2000 });
            await checkbox.click();
            console.log(`✅ Selected time of day: ${time.label}`);
        } catch (err) {
            console.warn(`⚠️ Click failed for time "${time.label}", using JS fallback`);
            await browser.execute(el => el.click(), checkbox);
        }

        await this.applyMobileFlightFilters();
        await this.waitForSearchResults();

        // Check all tickets match the time slot
        await this.checkAllTicketsMatchTimeSlot(time.min, time.max);
    }
},

checkAllTicketsMatchTimeSlot: async function (minHour, maxHour) {
    const tickets = await $$(selectors.ticketCard);

    for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        const segments = await ticket.$$('.row.ng-star-inserted');
        let foundValid = false;
        let foundTime = null;

        if (segments.length > 0) {
            const timeEls = await segments[0].$$('p.flyTo__time');
            if (timeEls.length > 1) {
                const timeText = (await timeEls[1].getText()).replace(/[^\d:]/g, '').trim();
                foundTime = timeText;
            }
        }

        if (foundTime) {
            const match = foundTime.match(/^(\d{1,2}):(\d{2})$/);
            if (match) {
                let hour = parseInt(match[1], 10);
                if (minHour > maxHour) {
                    foundValid = (hour >= minHour || hour <= maxHour);
                } else {
                    foundValid = (hour >= minHour && hour <= maxHour);
                }
            }
        }

        if (!foundValid) {
            console.error(`❌ Ticket ${i + 1} has invalid outbound takeoff time: "${foundTime}"`);
        }
        // No log for valid tickets
    }
},

handleTimeSelectionModal: async function () {
    // Wait for the modal to appear
    const modal = await $('.flight_modal.modal.show'); 
    let isModalVisible = false;
    try {
        isModalVisible = await modal.waitForDisplayed({ timeout: 5000 });
    } catch {
        // If modal doesn't appear, just skip and return false
        console.warn('ℹ️ Time selection modal did not appear after ticket click, skipping to next.');
        return false;
    }

    if (isModalVisible) {
        console.log('🕓 Time selection modal appeared — selecting flight time...');
        // Find the confirm/select button inside the modal
        let confirmBtn;
        try {
            // Try both button and div for maximum robustness
            confirmBtn = await modal.$('button=בחר שעה זו');
            if (!(await confirmBtn.isExisting())) {
                confirmBtn = await modal.$('div.buttonSelect=בחר שעה זו');
            }
            await confirmBtn.scrollIntoView();
            await confirmBtn.waitForClickable({ timeout: 3000 });
            await confirmBtn.click();
            console.log('✅ Time select button clicked');
        } catch (err) {
            console.warn('⚠️ Time confirm button not clickable — using JS click');
            try {
                await browser.execute(el => el.click(), confirmBtn);
                console.log('✅ Time select button clicked (JS fallback)');
            } catch (jsErr) {
                console.warn('❌ Could not click time select button by any method, skipping to next.');
                return false;
            }
        }
        return true;
    }
    // If modal is not visible for any reason, skip
   // console.warn('ℹ️ Time selection modal not visible, skipping to next.');
    return false;
},

selectSpecificTicketCombo: async function ({ filterType, comboType, requireMulti, searchOptions, rerunSearch }) {
    await this.selectFlightTypeFilter(filterType);

    const expectedArr = comboType.split('+').map(s => s.trim()).filter(Boolean);

    let checkedTickets = new Set();
    let found = false;
    let result = null;
    let retryCount = 0;
    const maxRetries = 1;

    while (!found && retryCount <= maxRetries) {
        const tickets = await $$(selectors.ticketCard);
        for (const [i, ticket] of tickets.entries()) {
            if (checkedTickets.has(i)) continue;
            checkedTickets.add(i);

            const details = await ticket.$(selectors.ticketDetailSection);
            const isDetailsDisplayed = await details.isDisplayed().catch(() => false);
            if (isDetailsDisplayed) continue;

            const isMulti = await this.isMultiTicket(ticket);
            if (requireMulti && !isMulti) continue;
            if (!requireMulti && isMulti) continue;

            const flags = await ticket.$$(selectors.ticketFlightTypeFlag);
            const types = [];
            for (const flag of flags) {
                let text = (await flag.getText()).trim().replace(/\s+/g, ' ');
                text = text.replace(/^[-–\s]+/, '').trim();
                if (text) types.push(text);
            }

            if (filterType === 'mixed') {
                const hasCharter = types.some(t => t.includes('שכר'));
                const hasRegular = types.some(t => t.includes('סדירה'));
                if (!(hasCharter && hasRegular)) continue;
            } else {
                const allExpectedPresent = expectedArr.every(type => types.includes(type));
                if (!allExpectedPresent) continue;
            }

            console.log(`🔎 Ticket ${i}: found=${types.join('+')}, expected=${expectedArr.join('+')}`);

            const priceEl = await ticket.$(selectors.ticketprice);
            const priceText = await priceEl.getText();
            const summaryPrice = parseInt(priceText.replace(/[^\d]/g, ''), 10);

            if (isNaN(summaryPrice)) {
                throw new Error(`❌ Could not parse summary price: "${priceText}"`);
            }
            await ticket.scrollIntoView();
            await browser.pause(300);
            try {
                await ticket.click();
            } catch (err) {
                await browser.execute(el => el.click(), ticket);
            }
            await browser.pause(500);

            await this.handleTimeSelectionModal();

            result = { ticket, summaryPrice };
            found = true;
            break;
        }

        if (found) return result;

        // Try to load more tickets if available
        const showMoreBtn = await $('button.add-more_btn');
        if (await showMoreBtn.isExisting() && await showMoreBtn.isDisplayed() && await showMoreBtn.isClickable()) {
            await showMoreBtn.scrollIntoView();
            await showMoreBtn.click();
            await browser.pause(1000);
        } else {
            // No more tickets, try to rerun search with dates +1 day
            if (retryCount < maxRetries && searchOptions && typeof rerunSearch === 'function') {
                console.warn(`❌ No [${filterType}] found. Retrying search with dates +1 day.`);
                // Safely increment departure/return dates
                const depDate = new Date(searchOptions.departureYear, searchOptions.departureMonth - 1, searchOptions.departureDay);
                depDate.setDate(depDate.getDate() + 1);
                searchOptions.departureDay = depDate.getDate();
                searchOptions.departureMonth = depDate.getMonth() + 1;
                searchOptions.departureYear = depDate.getFullYear();

                if (searchOptions.returnDay && searchOptions.returnMonth && searchOptions.returnYear) {
                    const retDate = new Date(searchOptions.returnYear, searchOptions.returnMonth - 1, searchOptions.returnDay);
                    retDate.setDate(retDate.getDate() + 1);
                    searchOptions.returnDay = retDate.getDate();
                    searchOptions.returnMonth = retDate.getMonth() + 1;
                    searchOptions.returnYear = retDate.getFullYear();
                }

                await rerunSearch(searchOptions);
                checkedTickets.clear();
                retryCount++;
                continue;
            } else {
                break;
            }
        }
    }

    throw new Error(`❌ No ticket found matching combination: ${comboType} (multi: ${requireMulti}) after retrying with different dates`);
},
  };

module.exports = {
  flightSearch,
};
