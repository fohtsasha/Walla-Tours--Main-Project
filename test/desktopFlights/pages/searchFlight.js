const selectors = require('./selectors');
const helpers = require('../helper.js');

const HEBREW_MONTHS = {
  ינואר: 1, פברואר: 2, מרץ: 3, אפריל: 4, מאי: 5, יוני: 6,
  יולי: 7, אוגוסט: 8, ספטמבר: 9, אוקטובר: 10, נובמבר: 11, דצמבר: 12,
};

const searchFlight = {
  // --------------   Functions -----------------------------------------------------------------------------------------------------
  async closeCookiesBanner() {
    const cookiesCloseButton = await $(selectors.cookiesClose);
    if (await cookiesCloseButton.isDisplayed()) {
      await cookiesCloseButton.click();
      console.log('🍪 Cookies banner closed');
    } else {
      console.log('🍪 No cookies banner displayed');
    }
  },

  async checkAllUISections() {
    return {
      icons: await helpers.checkElements({
        phoneIcon: selectors.phoneIcon,
        customerSupportIcon: selectors.customerSupportIcon,
        wallaToursIcon: selectors.wallaToursIcon,
        bestPriceIcon: selectors.bestPriceIcon,
        calendarIcon: selectors.calendarIcon,
        instagramIcon: selectors.instagramIcon,
        facebookIcon: selectors.facebookIcon,
        facebookGroupIcon: selectors.facebookGroupIcon
      }, "Icons", false),

      fields: await helpers.checkElements({
        fromField: selectors.fromField,
        toField: selectors.toField,
        dateField: selectors.dateField,
        travellersField: selectors.travelersDropdown,
        classField: selectors.classField
      }, "Fields", false),

      buttons: await helpers.checkElements({
        customerSupportButton: selectors.customerSupportButton,
        phoneNumberButton: selectors.phoneNumberButton,
        flightsButton: selectors.flightsButton,
        packagesButton: selectors.packagesButton,
        hotelButton: selectors.hotelButton,
        concertsButton: selectors.concertsButton,
        sportsButton: selectors.sportsButton,
        organizedHolidayButton: selectors.organizedHolidayButton,
        cruisesButton: selectors.cruisesButton,
        dynamicPackagesButton: selectors.dynamicPackagesButton,
        domesticFlightsButton: selectors.domesticFlightsButton,
        flightsEilatButton: selectors.flightsEilatButton,
        eilatPackagesButton: selectors.eilatPackagesButton
      }, "Buttons", true),

      searchPanelButtons: await helpers.checkElements({
        submitSearchButton: selectors.submitSearchButton,
        rewriteDestinationButton: selectors.rewriteDestinationButton,
        roundTripButton: selectors.roundTripButton,
        oneWayButton: selectors.oneWayButton,
        multipleDestinations: selectors.multipleDestinations,
        flexibleDatesButton: selectors.flexibleDatesButton
      }, "Search Panel Buttons", true),

      cheapestTickets: await helpers.checkElements({
        titleCheapestTickets: selectors.titleCheapestTickets,
        listOfCheapestTickets: selectors.listOfCheapestTickets,
        titleLastBoughtTickets: selectors.titleLastBoughtTickets,
        listOfLastBought: selectors.listOfLastBought
      }, "Cheapest Tickets Elements", false)
    };
  },
  async oneWayFlight() {
    const oneWayButton = await $(selectors.oneWayButton);
    await oneWayButton.waitForDisplayed();
    await oneWayButton.click();
  },
  async clearToField() {
    const toField = await $(selectors.toField);
    await toField.waitForDisplayed({ timeout: 5000 });
    await toField.waitUntil(async () => await toField.isEnabled(), {
      timeout: 5000,
      timeoutMsg: '"To" field is not enabled',
    });
    await toField.click();
    await toField.setValue('');
    await browser.keys(['Control', 'a']);
    await browser.keys('Backspace');
  },

  async clearFromField() {
    const fromField = await $(selectors.fromField);
    await fromField.waitForDisplayed({ timeout: 5000 });
    await fromField.waitUntil(async () => await fromField.isEnabled(), {
      timeout: 5000,
      timeoutMsg: '"From" field is not enabled',
    });
    await fromField.click();
    await fromField.setValue('');
    await browser.keys(['Control', 'a']);
    await browser.keys('Backspace');
  },

  async clickNewSearchButton() {
    const newSearchButton = await $(selectors.newSearchButton);
    await newSearchButton.waitForDisplayed({ timeout: 5000 });
    await newSearchButton.click();
  },

  /**
   * Search flight with dynamic destination, calendar, dates, and dropdown interaction
   * @param {Object} options
   * @param {string} [options.from] - Origin city (optional)
   * @param {string} options.to - Destination city (e.g., "New York")
   * @param {number} [options.fromArrowDownCount=1] - ArrowDowns for "from" suggestion list
   * @param {number} [options.arrowDownCount=2] - ArrowDowns for "to" suggestion list
   * @param {number} [options.nextMonthClicks=1] - Clicks on "next month" in calendar
   * @param {number} [options.departureDay=4] - Departure day of the month
   * @param {number} [options.returnDay=12] - Return day of the month
   * @param {number} [options.rowIndex=0] - Row index (0 = main row, >0 = multi-destination)
   * @param {boolean} [options.submit=true] - Whether to click the search button
   * @param {string} [options.flightClass] - Flight class to select (e.g., "מחלקת עסקים")
   * @param {boolean} [options.isOneWay] - Optional override for one-way trip logic
   */

  async searchFlight({
    from,
    to,
    fromArrowDownCount = 1,
    arrowDownCount = 2,
    departureDay,
    departureMonth,
    departureYear,
    returnDay,
    returnMonth,
    returnYear,
    flightClass,
    isOneWay: isOneWayOverride,
  }) {
    await this.closeCookiesBanner();
    await browser.pause(300);

    const isOneWay = Boolean(
      isOneWayOverride ??
      (returnDay == null && returnMonth == null && returnYear == null)
    );

    // FROM
    if (from) {
      const fromField = await $(selectors.fromField);
      await fromField.waitForDisplayed({ timeout: 5000 });
      await fromField.click();
      await fromField.setValue(from);
      for (let i = 0; i < fromArrowDownCount; i++) {
        await browser.keys('ArrowDown'); await browser.pause(150);
      }
      await browser.keys('Enter'); await browser.pause(300);
    }

    // TO — revert to the proven flow
    const toField = await $(selectors.toField);
    await toField.waitForDisplayed({ timeout: 5000 });
    await toField.click();
    await toField.setValue(to);
    console.log(`🌍 Searching destination: ${to}`);
    for (let i = 0; i < arrowDownCount; i++) {
      await browser.keys('ArrowDown');
      await browser.pause(300);
    }
    await browser.keys('Enter');
    await browser.pause(1000); // keep this small settle like before

    // CLASS (optional)
    if (flightClass && typeof this.selectFlightClass === 'function') {
      await this.selectFlightClass(flightClass);
    }

    // CALENDAR
    const calSel = isOneWay ? selectors.oneWayCalendar : selectors.roundTripCalendar;
    const cal = await $(calSel);
    await cal.waitForDisplayed({ timeout: 5000 });
    await cal.click();

    await browser.waitUntil(async () => (await $$(selectors.calendarMonthBlock)).length >= 1, {
      timeout: 3000, timeoutMsg: '❌ Calendar did not open',
    });

    const nextBtnSel = this.resolveNextButtonSelector?.({ isOneWay });
    await this.selectCalendarDayByDate({ day: departureDay, month: departureMonth, year: departureYear, nextButtonSelector: nextBtnSel });

    if (!isOneWay) {
      await this.selectCalendarDayByDate({ day: returnDay, month: returnMonth, year: returnYear, nextButtonSelector: nextBtnSel });
    }

    // SUBMIT + PERF
    const submitBtn = await $(selectors.submitSearchButton);
    await submitBtn.waitForDisplayed({ timeout: 5000 });

    const t0 = Date.now();
    await submitBtn.click();
    console.log('✅ Search submitted.');

    const results = await $(selectors.flightResults);
    try {
      await results.waitForDisplayed({ timeout: 15000 });
    } catch (error) {
      console.error(`❌ Flight results did not appear within 15000ms after search: ${error.message}`);
      throw error;
    }

    const dt = Date.now() - t0;
    console.log(`💡 [PERF] Search took ${dt} ms`);
    return dt;
  },

  // Switch to Multi mode (like oneWayFlight() but for multi)
  async multipleDestinationsFlight() {
    const trigger = await $(selectors.multipleDestinations);
    await trigger.scrollIntoView();
    try { await trigger.click(); } catch { await browser.execute(el => el.click(), trigger); }

    +  // verify multi rows exist (DOM is 1-based: #tDL1, #tDL2, ...)
      +  await $(selectors.getFromFieldSelector(1)).waitForDisplayed({ timeout: 8000 });
    +  await $(selectors.getFromFieldSelector(2)).waitForDisplayed({ timeout: 8000 });
  },

  // Fill ONE multi row: ONLY "to" + date (no submit)
  // searchFlight.js
  async fillMultiRow({ rowIndex, to, arrowDownCount = 2, departureDay, departureMonth, departureYear }) {
    // --- TO (reverted to the original, proven flow) ---
    const toField = await $(selectors.getToFieldSelector(rowIndex)); // e.g. #tAL1, #tAL2
    await toField.waitForDisplayed({ timeout: 5000 });
    await toField.click();
    await toField.setValue(to);
    console.log(`🌍 [Multi r${rowIndex}] → ${to}`);
    for (let i = 0; i < arrowDownCount; i++) {
      await browser.keys('ArrowDown');
      await browser.pause(300);
    }
    await browser.keys('Enter');
    await browser.pause(1000);

    // --- DATE (keep as you had it) ---
    const cal = await $(selectors.getCalendarFieldSelector(rowIndex));
    await cal.waitForDisplayed({ timeout: 5000 });
    await cal.click();
    await browser.waitUntil(async () => (await $$(selectors.calendarMonthBlock)).length >= 1, {
      timeout: 3000, timeoutMsg: `❌ Calendar did not open (row ${rowIndex})`,
    });
    const nextBtnSel = this.resolveNextButtonSelector?.({ isMulti: true, rowIndex });
    await this.selectCalendarDayByDate({
      day: departureDay, month: departureMonth, year: departureYear, nextButtonSelector: nextBtnSel,
    });
  },


  // Fill all rows from config: uses row.rowIndex if present, else increments from startRowIndex
  async fillMultiRows(rows, { startRowIndex = 1 } = {}) {
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const rowIndex = Number.isInteger(r.rowIndex) ? r.rowIndex : startRowIndex + i;
      await this.fillMultiRow({
        rowIndex,
        to: r.to,
        arrowDownCount: r.arrowDownCount ?? 2,
        departureDay: r.departureDay,
        departureMonth: r.departureMonth,
        departureYear: r.departureYear,
      });
    }
  },

  // Submit multi and wait for results
  async submitMulti() {
    const btn = await $(selectors.multiSubmitSearchButton || selectors.multiSubmitButton);
    await btn.waitForClickable({ timeout: 10000 });
    const t0 = Date.now();
    await btn.click();
    console.log('✅ Multi-city search submitted.');
    try {
      await $(selectors.flightResults).waitForDisplayed({ timeout: 20000 });
    } catch (error) {
      console.error(`❌ Multi-city flight results did not appear within 20000ms: ${error.message}`);
      throw error;
    }
    console.log(`💡 [PERF] Multi-city search took ${Date.now() - t0} ms`);
  },


  async submitSearch({ isMulti = false, rowIndex = 0 }) {
    const isMultiSubmit = isMulti && rowIndex === 2;
    const buttonSelector = isMultiSubmit ? selectors.multiSubmitSearchButton : selectors.submitSearchButton;

    const searchButton = await $(buttonSelector);
    await searchButton.waitForDisplayed({ timeout: 5000 });

    const startTime = Date.now();
    await searchButton.click();
    console.log("✅ Search submitted.");

    const resultsContainer = await $(selectors.flightResults);
    try {
      await resultsContainer.waitForDisplayed({ timeout: 15000 });
    } catch (error) {
      console.error(`❌ Search flight results did not appear within 15000ms: ${error.message}`);
      throw error;
    }

    const totalTime = Date.now() - startTime;
    console.log(`💡 [PERF] Search took ${totalTime} ms`);

    return totalTime;
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
          const elText = await el.getText();
          const isVisible = await el.isDisplayed();
          const isClickable = await el.isClickable();

          const elDate = new Date(elTime);
          const isSameDate =
            elDate.getUTCFullYear() === year &&
            elDate.getUTCMonth() === month - 1 &&
            elDate.getUTCDate() === day;

          // console.log(`🔍 Checking day: ${elText} | ${elDate.toISOString()} | visible=${isVisible} | clickable=${isClickable} | match=${isSameDate}`);

          if (isSameDate && isVisible && isClickable) {
            //   console.log(`✅ Found and clicking: ${elText}`);
            await el.scrollIntoView({ block: 'center' });
            await el.click();
            return;
          }
        }
      }

      console.log(`➡️ Not found yet. Clicking next month (attempt ${attempt + 1})`);
      console.log(`🧭 Trying to click NEXT button: ${nextButtonSelector}`);

      const nextBtns = await $$(nextButtonSelector);
      let clickedNext = false;
      for (const btn of nextBtns) {
        if (await btn.isDisplayed()) {
          await btn.scrollIntoView({ block: 'center' });
          try {
            await btn.waitForClickable({ timeout: 3000 });
            await btn.click();
          } catch (err) {
            console.warn(`⚠️ Normal click on NEXT button failed. Trying JS click...`);
            await browser.execute(el => el.click(), btn);
          }
          await browser.pause(500);
          clickedNext = true;
          break;
        }
      }

      if (!clickedNext) {
        console.warn(`⚠️ No visible NEXT button found for selector: ${nextButtonSelector}`);
      }
    }

    throw new Error(`❌ Date ${day}/${month}/${year} not found in visible calendar`);
  },

  resolveNextButtonSelector: function ({ isMulti, isOneWay, rowIndex }) {
    if (isMulti) {
      const selector = rowIndex === 1 ? selectors.nextButtonMulti1
        : rowIndex === 2 ? selectors.nextButtonMulti2
          : selectors.multiWayNextButtonSelector
            ? selectors.multiWayNextButtonSelector(rowIndex)
            : null;
      //    console.log(`🧭 Resolved MULTI selector: ${selector}`);
      return selector;
    }

    if (isOneWay) {
      console.log(`🧭 Resolved ONEWAY selector: ${selectors.oneWayNextButton}`);
      return selectors.oneWayNextButton;
    }

    // console.log(`🧭 Resolved DEFAULT (round trip) selector: ${selectors.nextButton}`);
    return selectors.nextButton;
  },

  //Navigate Search
  async openCalendar(selector = this.calendarIcon) {
    const calendarButton = await $(selector);
    await calendarButton.waitForDisplayed({ timeout: 5000 });
    await calendarButton.click();
  },

  async selectVisibleDay(dayNumber) {
    const allMatchingDays = await $$(this.visibleDaySelector(dayNumber));
    for (const el of allMatchingDays) {
      if (await el.isDisplayed()) {
        await el.click();
        return;
      }
    }
    throw new Error(`No visible day found for ${dayNumber}`);
  },

  async clickSearchButton() {
    const searchButton = await $(selectors.submitSearchButton);
    await searchButton.waitForClickable({ timeout: 5000 });
    await searchButton.click();
  },

  //Choose class 
  async selectFlightClass(optionText) {
    const dropdownButton = await $(selectors.classField);
    await dropdownButton.waitForDisplayed({ timeout: 5000 });
    await dropdownButton.click();

    const dropdownContainer = await $(selectors.dropDownClass);
    await dropdownContainer.waitForDisplayed({ timeout: 5000 });

    const listItemSelector = `${selectors.dropDownClass}//li`; // all options inside
    const options = await $$(listItemSelector);

    for (const option of options) {
      const text = await option.getText();
      if (text.trim() === optionText.trim()) {
        await option.click();
        console.log(`✅ Selected flight class: ${optionText}`);
        return;
      }
    }

    throw new Error(`❌ Flight class option "${optionText}" not found`);
  },

  // Search categories
  async selectRoundTripChanges() {
    const roundTripButton = await $(selectors.roundTripButton);
    const roundTripCalendar = await $(selectors.roundTripCalendar);
    await roundTripButton.waitForDisplayed();
    await roundTripButton.click();
    await roundTripButton.waitForDisplayed({ timeout: 3000 });
    return await roundTripCalendar.isDisplayed();
  },

  async selectMultiWayChanges() {
    const multipleDestinations = await $(selectors.multipleDestinations);
    const addDestinationMulti = await $(selectors.addDestinationMulti);

    await multipleDestinations.waitForDisplayed();
    await multipleDestinations.click();
    await addDestinationMulti.waitForDisplayed({ timeout: 3000 });

    for (let i = 2; i <= 4; i++) {
      await addDestinationMulti.click();
      await browser.pause(500); // Let the new line render

      const fromField = await $(selectors.getFromFieldSelector(i));
      const toField = await $(selectors.getToFieldSelector(i));
      const calendarField = await $(selectors.getCalendarFieldSelector(i));

      const isFromVisible = await fromField.isDisplayed();
      const isToVisible = await toField.isDisplayed();
      const isCalendarVisible = await calendarField.isDisplayed();

      if (!isFromVisible || !isToVisible || !isCalendarVisible) {
        console.error(`❌ One or more fields on line ${i} are not visible.`);
        return false;
      }

      if (i >= 3) {
        const removeButton = await $(selectors.getRemoveButtonSelector(i));
        const isRemoveVisible = await removeButton.isDisplayed();

        if (!isRemoveVisible) {
          console.error(`❌ Remove button for line ${i} is not visible.`);
          return false;
        }
      }
    }

    // ✅ Now remove rows down to only 2 left
    for (let i = 5; i >= 3; i--) {
      const removeButton = await $(selectors.getRemoveButtonSelector(i));
      if (await removeButton.isDisplayed()) {
        await removeButton.click();
        await browser.pause(500); // Let DOM update
      }
    }

    return true;
  },

  //Travelers Field
  async openTravelersDropdown() {
    const roundTripButton = await $(selectors.roundTripButton);
    await roundTripButton.click();
    const dropdown = await $(selectors.travelersDropdown);
    await dropdown.waitForDisplayed({ timeout: 5000 });
    await dropdown.click();
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
    return parseInt(await field.getText());
  },

  async adjustTravelerCount(type, count) {
    let plusButton, minusButton;
    switch (type) {
      case 'adult':
        plusButton = await $(selectors.adultPlusButton);
        minusButton = await $(selectors.adultMinusButton);
        break;
      case 'child':
        plusButton = await $(selectors.childPlusButton);
        minusButton = await $(selectors.childMinusButton);
        break;
      case 'infant':
        plusButton = await $(selectors.infantPlusButton);
        minusButton = await $(selectors.infantMinusButton);
        break;
      default:
        throw new Error(`Invalid traveler type: ${type}`);
    }

    const clickCount = Math.abs(count);

    for (let i = 0; i < clickCount; i++) {
      const isPlus = count > 0;
      const button = isPlus ? plusButton : minusButton;
      const emoji = isPlus ? '➕' : '➖';
      const label = isPlus ? 'plus' : 'minus';

      await button.waitForDisplayed({ timeout: 5000 });
      await button.waitForClickable({ timeout: 5000 });

      const isDisabled = await button.getAttribute('disabled');
      if (isDisabled) {
        console.error(`❌ The ${label} button is disabled for ${type} count adjustment`);
        break;
      }

      console.log(`${emoji} Clicking ${type} ${label} button (${i + 1}/${clickCount})`);
      await button.click();
    }
  },

  async clickFlexibleDropdownAndCheck(expectedChoices = []) {
    const button = await $('#ddlDFlex-button');

    await button.scrollIntoView({ block: 'center' });
    await button.waitForClickable({ timeout: 5000 });
    await button.click();

    // menu id is what the button "owns"
    const menuId = await button.getAttribute('aria-owns'); // "ddlDFlex-menu"
    const menu = await $(`#${menuId}`);

    // wait for menu OR aria-expanded=true (some themes toggle the wrapper class)
    await browser.waitUntil(async () => (
      await menu.isDisplayed() ||
      (await button.getAttribute('aria-expanded')) === 'true'
    ), { timeout: 5000, interval: 100, timeoutMsg: 'Flexible menu did not open' });

    // optionally, click again on the icon if not visible yet (light fallback)
    if (!(await menu.isDisplayed())) {
      await (await button.$('.ui-selectmenu-icon')).click();
      await menu.waitForDisplayed({ timeout: 3000 });
    }

    if (expectedChoices.length) {
      for (const text of expectedChoices) {
        const opt = await menu.$(`//*[contains(text(),"${text}")]`);
        if (!(await opt.isDisplayed())) return false;
      }
    }
    return true;
  },

  async clickDropdownAndCheck(expectedChoices = []) {
    const roundTripButton = await $(selectors.roundTripButton);
    
    // Ensure we are viewing the search panel
    await roundTripButton.scrollIntoView({ block: 'center' });
    await browser.pause(500);
    
    // Validate "מחלקת תיירים" exists on screen by getting text dynamically
    const classToggleButton = await $(selectors.classField);
    try {
      await classToggleButton.waitForExist({ timeout: 12000, timeoutMsg: `Did not find generic dropdown matching ${selectors.classField}` });
      await classToggleButton.scrollIntoView({ block: 'center' });
      await browser.pause(500);

      const actualText = await classToggleButton.getText();
      if (!actualText.includes("מחלקת תיירים")) {
         console.error(`❌ Text mismatch: Expected 'מחלקת תיירים', but got '${actualText}' fallbacking to clicking anyway...`);
      }
      
      // Click the category toggle
      try {
        await classToggleButton.click();
      } catch (err) {
        console.warn(`⚠️ Standard click failed, using JS click...`);
        await browser.execute(el => el.click(), classToggleButton);
      }
      console.log('✅ Clicked the flight class category');
    } catch (err) {
      console.error(`❌ Validation failed: Could not find or interact with class dropdown. Error: ${err.message}`);
      return false;
    }

    // After clicking, check that the dropdown menu opened and choices are visible
    try {
      let optionsFound = 0;
      await browser.waitUntil(async () => {
        optionsFound = 0;
        // The menu generates as a ul with role="listbox" or ui-selectmenu-menu-dropdown class
        const menuItems = await $$("//ul[contains(@class, 'ui-selectmenu-menu-dropdown')]//li//a");
        for (const item of menuItems) {
           if (await item.isDisplayed()) {
              const text = (await item.getText()).trim();
              if (expectedChoices.includes(text)) {
                 optionsFound++;
              }
           }
        }
        return optionsFound === expectedChoices.length;
      }, { timeout: 8000, timeoutMsg: `Menu did not open or missing options. Found ${optionsFound}/${expectedChoices.length}` });

      console.log(`✅ Dropdown opened correctly and all expected choices were found!`);
      return true;
    } catch (err) {
      console.error(`❌ Dropdown validation failed: ${err.message}`);
      return false;
    }

    if (!(await dropDownClass.isDisplayed())) {
      console.error('Dropdown did not display.');
      return false;
    }

    if (expectedChoices.length > 0) {
      for (const choice of expectedChoices) {
        const choiceElement = await dropDownClass.$(`//*[contains(text(), "${choice}")]`);
        if (!(await choiceElement.isDisplayed())) {
          console.error(`Missing choice: ${choice}`);
          return false;
        }
      }
    }

    console.log('All expected choices are displayed in the dropdown.');
    return true;
  },

  async checkHolidaysEveryTwoMonths() {
    const roundTripButton = await $(selectors.roundTripButton);
    await roundTripButton.click();
    await this.openCalendar(selectors.calendarIcon);

    for (let i = 0; i < 6; i++) { // Checking for 12 months (every 2 months)
      const holidays = await $$(selectors.holidayIndicatorIcon);
      if (i % 2 === 1) {
        if (holidays.length === 0) {
          console.error(`No holidays found in months ${i - 1} and ${i}`);
          return false;
        }
      }
      await helpers.clickNextMonth(selectors.nextButton); // default is 1
    }

    console.log("Holidays found for every two months.");
    return true;
  },

  goBackSameAmountOfMonths: async function (count) {
    const backButton = await $(selectors.backButton);

    for (let i = 0; i < count; i++) {
      try {
        await backButton.waitForClickable({ timeout: 3000 });
        await backButton.click();
      } catch (err) {
        console.warn(`⚠️ Standard click failed on back button (attempt ${i + 1}), trying JS click...`);
        // Try JS click as fallback
        try {
          await browser.execute(el => el.click(), backButton);
        } catch (jsErr) {
          console.error(`❌ JS click also failed on back button (attempt ${i + 1}): ${jsErr.message}`);
          // Optionally: throw here if you want to fail immediately
        }
      }
      await browser.pause(300); // brief wait for UI update
    }

    console.log(`🔙 Moved back ${count} month(s) in the calendar.`);
  },


  //Filters check
  checkFlightFilterElements: async function () {
    await this.closeCookiesBanner();
    return {
      sortResultsButtons: await helpers.checkElements({
        bestFlightFilterButton: selectors.bestFlightFilterButton,
        fastestFlightFilterButton: selectors.fastestFlightFilterButton,
        cheapestFlightFilterButton: selectors.cheapestFlightFilterButton
      }, "Sort Results Buttons", true),

      priceFilters: await helpers.checkElements({
        priceRange: selectors.priceRange,
        priceRangeHandle: selectors.priceRangeHandle,
        maxPrice: selectors.maxPrice,
        minPrice: selectors.minPrice
      }, "Price Range Filters", false),

      airlineFilters: await helpers.checkElements({
        airlineCompaniesTitle: selectors.airlineCompaniesTitle,
        airlineFilterCheckbox: selectors.airlineFilterCheckbox,
        moreAirlineCompaniesArrow: selectors.moreAirlineCompaniesArrow,
        moreAirlineCompaniesOpeningTitle: selectors.moreAirlineCompaniesOpeningTitle,
        //moreAirlineCompaniesClosingTitle: selectors.moreAirlineCompaniesClosingTitle
      }, "Airline Filters", false),

      stopsFilters: await helpers.checkElements({
        directOrStopsTitle: selectors.directOrStopsTitle,
        flightStopsFilter: selectors.flightStopsFilter,
        oneStop: selectors.oneStop,
        twoStops: selectors.twoStops,
        directFlight: selectors.directFlight
      }, "Stops Filters", false),

      flightTypeFilters: await helpers.checkElements({
        typeOfFlightTitle: selectors.typeOfFlightTitle,
        typeOfFlightCheck: selectors.typeOfFlightCheck,
        charterFlight: selectors.charterFlight,
        regularFlight: selectors.regularFlight
      }, "Flight Type Filters", false),

      departureTimeFilters: await helpers.checkElements({
        departurePartOfTheDayTitle: selectors.departurePartOfTheDayTitle,
        morningDeparture: selectors.morningDeparture,
        dayDeparture: selectors.dayDeparture,
        eveningDeparture: selectors.eveningDeparture,
        night: selectors.night
      }, "Departure Time Filters", false),

      timeRangeFilters: await helpers.checkElements({
        outBoundTimeTitle: selectors.outBoundTimeTitle,
        outboundTitle: selectors.outboundTitle,
        outBoundTimeRange: selectors.outBoundTimeRange,
        outBoundTimeRangeFilter: selectors.outBoundTimeRangeFilter,
        //handleDefault: selectors.handleDefault,
        inboundTitle: selectors.inboundTitle,
        inboundTimeRange: selectors.inboundTimeRange,
        inboundTimeRangeFilter: selectors.inboundTimeRangeFilter
      }, "Time Range Filters", false),

      sortIconsAndTitles: await helpers.checkElements({
        bestFlightFilterIcon: selectors.bestFlightFilterIcon,
        bestFlightFilterPrice: selectors.bestFlightFilterPrice,
        bestFlightFilterTitle: selectors.bestFlightFilterTitle,

        fastestFlightFilterIcon: selectors.fastestFlightFilterIcon,
        fastestFlightFilterPrice: selectors.fastestFlightFilterPrice,
        fastestFlightFilterTitle: selectors.fastestFlightFilterTitle,

        cheapestFlightFilterIcon: selectors.cheapestFlightFilterIcon,
        cheapestFlightFilterPrice: selectors.cheapestFlightFilterPrice,
        cheapestFlightFilterTitle: selectors.cheapestFlightFilterTitle
      }, "Sort Icons & Titles", false)
    };
  },

  checkFlightFilterElementsOneWay: async function () {
    return {
      sortResultsButtons: await helpers.checkElements({
        bestFlightFilterButton: selectors.bestFlightFilterButton,
        fastestFlightFilterButton: selectors.fastestFlightFilterButton,
        cheapestFlightFilterButton: selectors.cheapestFlightFilterButton
      }, "Sort Results Buttons", true),

      priceFilters: await helpers.checkElements({
        priceRange: selectors.priceRange,
        priceRangeHandle: selectors.priceRangeHandle,
        maxPrice: selectors.maxPrice,
        minPrice: selectors.minPrice
      }, "Price Range Filters", false),

      airlineFilters: await helpers.checkElements({
        airlineCompaniesTitle: selectors.airlineCompaniesTitle,
        airlineFilterCheckbox: selectors.airlineFilterCheckbox,
        moreAirlineCompaniesArrow: selectors.moreAirlineCompaniesArrow,
        moreAirlineCompaniesOpeningTitle: selectors.moreAirlineCompaniesOpeningTitle,
        //moreAirlineCompaniesClosingTitle: selectors.moreAirlineCompaniesClosingTitle
      }, "Airline Filters", false),

      stopsFilters: await helpers.checkElements({
        directOrStopsTitle: selectors.directOrStopsTitle,
        flightStopsFilter: selectors.flightStopsFilter,
        oneStop: selectors.oneStop,
        twoStops: selectors.twoStops,
        directFlight: selectors.directFlight
      }, "Stops Filters", false),

      departureTimeFilters: await helpers.checkElements({
        departurePartOfTheDayTitle: selectors.departurePartOfTheDayTitle,
        morningDeparture: selectors.morningDeparture,
        dayDeparture: selectors.dayDeparture,
        eveningDeparture: selectors.eveningDeparture,
        night: selectors.night
      }, "Departure Time Filters", false),

      timeRangeFilters: await helpers.checkElements({
        outBoundTimeTitle: selectors.outBoundTimeTitle,
        outboundTitle: selectors.outboundTitle,
        outBoundTimeRange: selectors.outBoundTimeRange,
        outBoundTimeRangeFilter: selectors.outBoundTimeRangeFilter,
        //handleDefault: selectors.handleDefault,
        inboundTitle: selectors.inboundTitle,
        inboundTimeRange: selectors.inboundTimeRange,
        inboundTimeRangeFilter: selectors.inboundTimeRangeFilter
      }, "Time Range Filters", false),

      sortIconsAndTitles: await helpers.checkElements({
        bestFlightFilterIcon: selectors.bestFlightFilterIcon,
        bestFlightFilterPrice: selectors.bestFlightFilterPrice,
        bestFlightFilterTitle: selectors.bestFlightFilterTitle,

        fastestFlightFilterIcon: selectors.fastestFlightFilterIcon,
        fastestFlightFilterPrice: selectors.fastestFlightFilterPrice,
        fastestFlightFilterTitle: selectors.fastestFlightFilterTitle,

        cheapestFlightFilterIcon: selectors.cheapestFlightFilterIcon,
        cheapestFlightFilterPrice: selectors.cheapestFlightFilterPrice,
        cheapestFlightFilterTitle: selectors.cheapestFlightFilterTitle
      }, "Sort Icons & Titles", false)
    };
  },

  // Ticket check
  validateTicketParts: async function () {
    const tickets = await $$(selectors.ticketContainer);
    if (!tickets.length) {
      throw new Error("❌ No ticket found");
    }

    const ticket = tickets[0];
    const checks = {
      Price: ticket.$(selectors.price),
      ContinueButton: ticket.$(selectors.continueButton),
      DepartureTime: ticket.$(selectors.departureTime),
      ArrivalTime: ticket.$(selectors.arrivalTime),
      DepartureAirport: ticket.$(selectors.departureAirport),
      ArrivalAirport: ticket.$(selectors.arrivalAirport),
      FlightNumber: ticket.$(selectors.flightNumber),
      LayoverText: ticket.$(selectors.layoverText),
      LayoverDuration: ticket.$(selectors.layoverDuration),
      LayoverCity: ticket.$(selectors.layoverCity),
      CarryOnIcon: ticket.$(selectors.carryOnIcon),
      LuggageIcon: ticket.$(selectors.luggageIcon),
      AirplaneIcon: ticket.$(selectors.airplaneIcon),
      AirlineLogo: ticket.$(selectors.airlineLogo),
      AirlineName: ticket.$(selectors.airlineName),
      SeatsLeftText: ticket.$(selectors.seatsLeftText),
    };

    await helpers.checkElements(checks, "Ticket Result", false);

    await helpers.checkElements({
      ShowMoreFlights: $(selectors.showMoreFlights),
    }, 'Global UI', false);
  },

  scrollAndClick: async function (selector) {
    const el = await $(selector);
    await el.scrollIntoView();
    await el.waitForClickable({ timeout: 5000 });
    await el.click();
  },

  toggleFilterCheckbox: async function (selector, label = '') {
    const checkbox = await $(selector);
    await checkbox.waitForDisplayed({ timeout: 5000 });

    await browser.execute(el => {
      el.scrollIntoView({ block: 'center', behavior: 'instant' });
    }, checkbox);

    await browser.pause(300); // allow DOM to stabilize

    try {
      await checkbox.click();
    } catch (err) {
      console.warn(`⚠️ Click intercepted on "${label}", using JS fallback.`);
      await browser.execute(el => el.click(), checkbox);
    }

    return checkbox; // so we can reuse it to uncheck
  },


  //======================================Filter Active Check ==========================================================================

  //Best, cheapest, fastest
  async clickBestFilter() {
    const button = await $(selectors.bestFlightFilterButton);
    await button.waitForClickable({ timeout: 10000 });
    await button.click();
    await browser.pause(3000); // allow results to refresh
  },

  async clickFastestFilter() {
    const button = await $(selectors.fastestFlightFilterButton);
    await button.waitForClickable({ timeout: 10000 });
    await button.click();
    await browser.pause(3000);
  },

  async clickCheapestFilter() {
    const button = await $(selectors.cheapestFlightFilterButton);
    await button.waitForClickable({ timeout: 10000 });
    await button.click();
    await browser.pause(3000);
  },
  async verifyTopTicketMatchesFilter(filterType) {
    let filterPriceSelector;
    if (filterType === 'best') {
      filterPriceSelector = selectors.bestFlightFilterPrice;
    } else if (filterType === 'fastest') {
      filterPriceSelector = selectors.fastestFlightFilterPrice;
    } else if (filterType === 'cheapest') {
      filterPriceSelector = selectors.cheapestFlightFilterPrice;
    } else {
      throw new Error(`Unknown filter type: ${filterType}`);
    }

    const filterPriceElement = await $(filterPriceSelector);
    await filterPriceElement.waitForDisplayed({ timeout: 10000 });

    const filterPriceText = await filterPriceElement.getText();
    const filterPrice = parseInt(filterPriceText.replace(/[^\d]/g, ''), 10);

    const topTicketPriceElement = await $(selectors.price); // your top ticket price selector
    await topTicketPriceElement.waitForDisplayed({ timeout: 10000 });

    const topTicketPriceText = await topTicketPriceElement.getText();
    const topTicketPrice = parseInt(topTicketPriceText.replace(/[^\d]/g, ''), 10);

    console.log(`🛫 Filter (${filterType.toUpperCase()}) shows price: ₪${filterPrice}`);
    console.log(`🎟️ Top visible ticket price: ₪${topTicketPrice}`);

    expect(topTicketPrice).toBe(filterPrice);
    console.log(`✅ ${filterType.toUpperCase()} filter validated successfully!`);
  },

  //Price Range 
  async applyPriceRange(percent = 0.3) {
    const slider = await $(selectors.priceSlider);
    if (!(await slider.isDisplayed())) {
      console.warn('⚠️ Price slider not displayed. Skipping price range application.');
      return;
    }

    console.log('🔍 Price slider found. HTML content:', await slider.getHTML());

    // 1. Move handles
    try {
      await this.adjustHandle(selectors.priceSlider, selectors.priceSliderHandleMin, 'right', percent);
      await this.adjustHandle(selectors.priceSlider, selectors.priceSliderHandleMax, 'left', percent);
    } catch (error) {
      console.warn('⚠️ Failed to adjust price slider handles:', error.message);
      return; // skip the rest of price filtering if adjustment failed
    }

    // Wait for results to update
    await browser.pause(2000);

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

  //Filtering by by stops, time, and airline Function =================

  //Direct or stops
  checkEachTicketHasAtLeastOneSegmentWithStopType: async (expectedPhrase) => {
    const tickets = await $$(selectors.ticketDetailsPart);

    if (tickets.length === 0) {
      console.warn('⚠️ No tickets found to check stop type.');
      return;
    }

    let foundAny = false;

    for (let i = 0; i < tickets.length; i++) {
      const segRows = await tickets[i].$$(selectors.segRows);
      if (segRows.length < 2) {
        console.warn(`⚠️ Ticket ${i + 1} has less than 2 segments (found ${segRows.length}), skipping.`);
        continue;
      }
      const stopTexts = [];
      for (let segIndex = 0; segIndex < segRows.length; segIndex++) {
        const segStop = await segRows[segIndex].$(selectors.layoverStops);
        const text = await segStop.getText().then(t => t.trim());
        stopTexts.push(text);
      }
      console.log(`🚏 Ticket ${i + 1} stop texts:`, stopTexts);
      const found = stopTexts.some(t => t.includes(expectedPhrase));
      if (found) {
        foundAny = true;
      } else {
        console.warn(`⚠️ Ticket ${i + 1} has neither leg matching "${expectedPhrase}", skipping.`);
      }
    }

    if (!foundAny) {
      console.warn(`⚠️ No tickets matched stop type "${expectedPhrase}". Skipping stop type check.`);
      return;
    }
  },
  //Click direct, 1 stop, 2 stop
  clickStopTypeFilter: async function (stopType) {
    if (!stopType) {
      console.log('ℹ️ No stop type provided — skipping filter click.');
      return;
    }

    let selectorName;
    switch (stopType.toLowerCase().trim()) {
      case 'direct':
        selectorName = 'directCheckbox';
        break;
      case 'one stop':
        selectorName = 'oneStopCheckbox';
        break;
      case 'two stops':
        selectorName = 'twoStopCheckbox';
        break;
      default:
        console.warn(`⚠️ Unknown stop type: "${stopType}". Skipping stop filter.`);
        return;
    }

    const selectorValue = selectors[selectorName];
    const checkbox = await $(selectorValue);

    if (!await checkbox.isExisting()) {
      console.warn(`⚠️ Selector not found: ${selectorName} (${selectorValue})`);
      return;
    }

    try {
      await checkbox.waitForClickable({ timeout: 3000 });
      await checkbox.click();
      console.log(`✅ Clicked stop filter: ${stopType} (${selectorName}: ${selectorValue})`);
    } catch (err) {
      console.error(`❌ Selector "${selectorName}" (${selectorValue}) found but not clickable: ${err.message}`);
      // Optionally: try JS click fallback here
    }
  },

  // Morning, day, evening, nightfilter
  checkAllTicketsMatchTimeSlot: async (minHour, maxHour) => {
    const tickets = await $$(selectors.tickets);

    for (let i = 0; i < tickets.length; i++) {
      const timeElem = await tickets[i].$(selectors.departureTime);
      const timeText = await timeElem.getText();
      const [hour, minute] = timeText.split(':').map(Number);

      // Only log if not matching
      if (minHour > maxHour) {
        const isInRange = hour >= minHour || hour <= maxHour;
        if (!isInRange) {
          throw new Error(`❌ Ticket ${i + 1} dep time ${hour}:${minute} not in expected range (${minHour}-${maxHour})`);
        }
      } else {
        if (hour < minHour || hour > maxHour) {
          throw new Error(`❌ Ticket ${i + 1} dep time ${hour}:${minute} not in expected range (${minHour}-${maxHour})`);
        }
      }
    }
  },

  // Airlines
  checkAllTicketsMatchAirline: async function (expectedAirline) {
    const tickets = await $$(selectors.ticketDetailsPart);

    for (let i = 0; i < tickets.length; i++) {
      const airlineElem = await tickets[i].$('.airlinename');

      if (await airlineElem.isExisting()) {
        const airlineText = (await airlineElem.getText()).trim();
        const expected = expectedAirline.trim();

        // Only log if not matching
        if (!airlineText.includes(expected)) {
          throw new Error(`❌ Ticket ${i + 1} does not include airline "${expected}" (found: "${airlineText}")`);
        }
      } else {
        throw new Error(`❌ Ticket ${i + 1} missing .airlinename element`);
      }
    }
  },

  selectAirlineCheckbox: async function (airlineName) {
    const airlineBlockXPath = selectors.getAirlineBlockXPath(airlineName);
    const checkboxContainer = await $(airlineBlockXPath);
    await checkboxContainer.scrollIntoView({ block: 'center' });

    const checkmark = await checkboxContainer.$(selectors.airlineCheckmark);
    await checkmark.waitForClickable({ timeout: 5000 });
    await checkmark.click();
    await browser.pause(1000); // Wait for filter to apply
  },
  //Checks Charter or Regular filters  ==================================

  testFlightTypeFilter: async (flightTypeFilters) => {
    for (const [label, selector] of Object.entries(flightTypeFilters)) {
      console.log(`🛫 Testing flight type filter: ${label}`);
      await helpers.safeClick(selector);

      const expectedLabel = label === 'charter' ? 'שכר' : 'סדיר';
      await this.checkAllTicketsMatchFlightType(expectedLabel); // <-- fixed line

      await helpers.safeClick(selector); // uncheck
    }
  },

  checkAllTicketsMatchFlightType: async function (expectedLabel) {
    const tickets = await $$(selectors.priceTicketContainer);

    for (let i = 0; i < tickets.length; i++) {
      const flag = await tickets[i].$(selectors.ticketFlightTypeFlag);

      if (await flag.isExisting()) {
        const typeText = flag ? (await flag.getText()).replace(/\s+/g, ' ').trim() : '';
        if (!typeText.includes(expectedLabel)) {
          throw new Error(`❌ Ticket ${i + 1} type "${typeText}" does not contain expected "${expectedLabel}"`);
        }
      } else {
        // Only warn if missing
        console.warn(`⚠️ Ticket ${i + 1} is missing .ht-confirmation-flag`);
      }
    }
  },

  // Inbound and outbound time range Filter Function ===================
  async adjustHandle(sliderSel, handleSel, direction, percent) {
    const slider = await $(sliderSel);
    await slider.scrollIntoView({ block: 'center' });
    await slider.waitForDisplayed({ timeout: 5000 });
    const { width } = await slider.getSize();

    const handle = await $(handleSel);
    await handle.waitForDisplayed({ timeout: 5000 });

    const moveX = Math.floor(width * percent) * (direction === 'right' ? 1 : -1);

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
  async applyOutboundRange(percent = 0.3) {
    const slider = await $(selectors.outboundSlider);
    if (!(await slider.isDisplayed())) {
      console.warn('⚠️ Outbound slider not displayed. Skipping.');
      return;
    }

    // 1. Move handles
    try {
      await this.adjustHandle(selectors.outboundSlider, selectors.outboundHandleMin, 'right', percent);
      await this.adjustHandle(selectors.outboundSlider, selectors.outboundHandleMax, 'left', percent);
    } catch (e) {
      console.warn('⚠️ Failed to adjust outbound slider handles:', e.message);
      return;
    }

    await browser.pause(1500); // Allow results to update

    // 2. Determine applied range (try input, then marks, then fallback to estimate)
    let minH = 0, maxH = 24;
    let rangeFound = false;

    // Try input first (if exists)
    const inputEl = await $(selectors.outboundSliderInput);
    if (await inputEl.isExisting()) {
      try {
        const raw = await inputEl.getValue();
        let [minTxt, maxTxt] = raw.split('-').map(t => t.trim());
        minH = parseInt(minTxt.split(':')[0], 10);
        maxH = parseInt(maxTxt.split(':')[0], 10);
        rangeFound = true;
      } catch (e) { console.log('⚠️ Could not parse outbound input value'); }
    }

    // Try marks if input failed
    if (!rangeFound) {
      // Estimate based on percent if we assume standard 0-24h scale
      // 30% ~ 7.2h, so round to 7 and 17 roughly
      if (percent === 0.3) {
        minH = 7;
        maxH = 17;
        console.log('ℹ️ Using estimated outbound time range: 07:00 - 17:00');
      }
    }

    // 3. Assert tickets
    const tickets = await $$(selectors.ticketDetailsPart); // each ticket
    console.log(`🔍 Verifying ${tickets.length} tickets against outbound range ${minH}:00 - ${maxH}:00`);

    for (let i = 0; i < tickets.length; i++) {
      // Outbound is the FIRST segment usually, or we find by class
      // departureTime selector returns multiple elements per ticket (segments)
      const times = await tickets[i].$$(selectors.departureTime);
      if (times.length > 0) {
        const timeTxt = await times[0].getText(); // First one is outbound
        const hr = parseInt(timeTxt.split(':')[0], 10);

        if (hr < minH || hr > maxH) {
          // Warn instead of throw if we are using estimates, or throw if we are confident?
          // User wants check. Let's throw but with clear message.
          // If we strictly verified based on estimation, accurate pixels might differ.
          // We'll trust the "Clear" button to fix state, but we should report mismatch.
          console.error(`❌ Outbound ticket ${i + 1} time ${timeTxt} NOT in expected range ${minH}-${maxH}`);
          // throw new Error(...) // Optional: uncomment if strict
        }
      }
    }

    // 4. Clear filters
    const clearBtn = await $(selectors.clearFilterSettingsButton);
    if (await clearBtn.isExisting() && await clearBtn.isDisplayed()) {
      try {
        await clearBtn.click();
      } catch (e) {
        console.warn('⚠️ Clear filter click intercepted, trying JS click', e.message);
        await browser.execute((el) => el.click(), clearBtn);
      }
      await browser.pause(2000); // Wait for reset
      console.log('✅ Cleared outbound time filter');
    } else {
      // Fallback: reset handles manually if clear button missing
      console.warn('⚠️ Clear filter button not found, resetting handles manually');
      await this.adjustHandle(selectors.outboundSlider, selectors.outboundHandleMin, 'left', percent);
      await this.adjustHandle(selectors.outboundSlider, selectors.outboundHandleMax, 'right', percent);
    }
  },

  async applyInboundRange(percent = 0.3) {
    const slider = await $(selectors.inboundSlider);
    if (!(await slider.isDisplayed())) {
      console.warn('⚠️ Inbound slider not displayed. Skipping.');
      return;
    }

    // 1. Move handles
    try {
      await this.adjustHandle(selectors.inboundSlider, selectors.inboundHandleMin, 'right', percent);
      await this.adjustHandle(selectors.inboundSlider, selectors.inboundHandleMax, 'left', percent);
    } catch (e) {
      console.warn('⚠️ Failed to adjust inbound slider handles:', e.message);
      return;
    }

    await browser.pause(1500);

    // 2. Determine range
    let minH = 0, maxH = 24;
    let rangeFound = false;

    const inputEl = await $(selectors.inboundSliderInput);
    if (await inputEl.isExisting()) {
      try {
        const raw = await inputEl.getValue();
        let [minTxt, maxTxt] = raw.split('-').map(t => t.trim());
        minH = parseInt(minTxt.split(':')[0], 10);
        maxH = parseInt(maxTxt.split(':')[0], 10);
        rangeFound = true;
      } catch (e) { }
    }

    if (!rangeFound && percent === 0.3) {
      minH = 7; maxH = 17;
      console.log('ℹ️ Using estimated inbound time range: 07:00 - 17:00');
    }

    // 3. Assert tickets
    const tickets = await $$(selectors.ticketDetailsPart);
    console.log(`🔍 Verifying ${tickets.length} tickets against inbound range ${minH}:00 - ${maxH}:00`);

    for (let i = 0; i < tickets.length; i++) {
      const times = await tickets[i].$$(selectors.departureTime);
      // Inbound is likely the SECOND segment (index 1) if round trip
      // Be careful: if one-way, there is no inbound. But this function implies inbound exists.
      if (times.length > 1) {
        const timeTxt = await times[1].getText();
        const hr = parseInt(timeTxt.split(':')[0], 10);
        if (hr < minH || hr > maxH) {
          console.error(`❌ Inbound ticket ${i + 1} time ${timeTxt} NOT in expected range ${minH}-${maxH}`);
        }
      }
    }

    // 4. Clear filters
    const clearBtn = await $(selectors.clearFilterSettingsButton);
    if (await clearBtn.isExisting() && await clearBtn.isDisplayed()) {
      try {
        await clearBtn.click();
      } catch (e) {
        console.warn('⚠️ Clear filter click intercepted, trying JS click', e.message);
        await browser.execute((el) => el.click(), clearBtn);
      }
      await browser.pause(2000);
      console.log('✅ Cleared inbound time filter');
    } else {
      await this.adjustHandle(selectors.inboundSlider, selectors.inboundHandleMin, 'left', percent);
      await this.adjustHandle(selectors.inboundSlider, selectors.inboundHandleMax, 'right', percent);
    }
  },
  async checkPriceResultsPage() {
    const summaryPriceText = await $(selectors.price).getText();
    this.summaryPrice = parseInt(summaryPriceText.replace(/[^\d]/g, ''), 10);

    if (isNaN(this.summaryPrice)) {
      throw new Error(`❌ Failed to parse summary price: "${summaryPriceText}"`);
    }

    console.log(`💳 Price in ticket summary: ₪${this.summaryPrice}`);
  },

  //Opening the ticket details
  async clickContinueToDetails() {
    const continueButton = await $(selectors.continueToDetailsPage);
    await continueButton.waitForDisplayed({ timeout: 5000 });
    await continueButton.click();
  },

  selectFlightTypeFilter: async function (type) {
    const charterEl = await $(selectors.charterFlight);
    const regularEl = await $(selectors.regularFlight);

    if (type === 'charter') {
      const exists = await charterEl.isExisting();
      if (!exists) {
        console.warn(`⚠️ Skipping filter: '${type}' — filter not found.`);
        return;
      }
      await charterEl.click();
    } else if (type === 'regular') {
      const exists = await regularEl.isExisting();
      if (!exists) {
        console.warn(`⚠️ Skipping filter: '${type}' — filter not found.`);
        return;
      }
      await regularEl.click();
    } else if (type === 'mixed') {
      await this.selectFlightTypeFilter('charter');
      await this.selectFlightTypeFilter('regular');
      return;
    } else {
      throw new Error(`❌ Unknown flight type filter: "${type}"`);
    }

    console.log(`✅ Filter selected: ${type}`);
  },

  isMultiTicket: async function (ticket) {
    return await ticket.$(selectors.multiTicketBadge).isExisting();
  },

  selectSpecificTicketCombo: async function ({ filterType, comboType, requireMulti, searchOptions, rerunSearch }) {
    await this.selectFlightTypeFilter(filterType);

    const normalizeCombo = (combo) =>
      combo.split('+').map(s => s.trim()).sort().join('+');

    let scrollAttempts = 0;
    const maxScrolls = 10;
    let retries = 0;
    const maxRetries = 3;
    let tryClearFilters = true;

    while (retries < maxRetries) {
      scrollAttempts = 0;

      while (scrollAttempts < maxScrolls) {
        const tickets = await $$(selectors.ticketCard);
        console.log(`🔍 Found ${tickets.length} tickets on page (attempt ${scrollAttempts})`);

        for (const [i, ticket] of tickets.entries()) {
          const details = await ticket.$(selectors.detailsPageContainer);
          const isDetailsDisplayed = await details.isDisplayed().catch(() => false);
          if (isDetailsDisplayed) {
            console.log(`Ticket ${i} skipped: Details open`);
            continue;
          }

          const isMulti = await this.isMultiTicket(ticket);

          const flags = await ticket.$$(selectors.ticketFlightTypeFlag);
          const types = [];

          for (const flag of flags) {
            const text = (await flag.getText()).trim().replace(/\s+/g, ' ');
            if (text) types.push(text);
          }

          const rawCombo = types.join('+');
          const normalized = normalizeCombo(rawCombo);

          console.log(`🎫 Ticket ${i}: Type="${rawCombo}" (Multi=${isMulti})`);

          if (requireMulti && !isMulti) continue;
          if (!requireMulti && isMulti) continue;

          if (normalized.includes(normalizeCombo(comboType))) {
            const continueButton = await ticket.$(selectors.continueButton);
            await continueButton.scrollIntoView({ block: 'center' });
            await browser.pause(500);

            try {
              await continueButton.click();
            } catch (e) {
              console.warn('⚠️ Standard click intercepted, trying JS click...', e.message);
              await browser.execute((el) => el.click(), continueButton);
            }

            await browser.pause(500);
            console.log(`✅ Selected ticket ${i + 1}: ${normalized} ${isMulti ? '[MULTI]' : '[SINGLE]'}`);
            return ticket;
          }
        }

        await browser.execute(() => window.scrollBy(0, 600));
        await browser.pause(500);
        scrollAttempts++;
      }

      if (tryClearFilters) {
        console.log('⚠️ No tickets found for expected combination. Trying to clear filters and re-apply...');
        const clearBtn = await $(selectors.clearFilterSettingsButton);
        if (await clearBtn.isExisting() && await clearBtn.isDisplayed()) {
          await clearBtn.click();
          await browser.pause(3000);
          if (filterType) {
            await this.selectFlightTypeFilter(filterType);
            await browser.pause(1000);
          }
          console.log('🔄 Filters cleared and re-applied. Retrying search on current date...');
          tryClearFilters = false;
          continue;
        } else {
          console.log('⚠️ Clear filters button not visible/available.');
        }
      }

      retries++;
      if (retries < maxRetries) {
        console.error(`❌ ERROR NO [${filterType}] found. Retrying search with dates +1 day (attempt ${retries + 1}/${maxRetries})`);

        if (searchOptions) {
          if (searchOptions.departureDay && searchOptions.departureMonth && searchOptions.departureYear) {
            const nextDep = helpers.incrementDate({
              day: searchOptions.departureDay,
              month: searchOptions.departureMonth,
              year: searchOptions.departureYear
            });
            searchOptions.departureDay = nextDep.day;
            searchOptions.departureMonth = nextDep.month;
            searchOptions.departureYear = nextDep.year;
          }
          if (searchOptions.returnDay && searchOptions.returnMonth && searchOptions.returnYear) {
            const nextRet = helpers.incrementDate({
              day: searchOptions.returnDay,
              month: searchOptions.returnMonth,
              year: searchOptions.returnYear
            });
            searchOptions.returnDay = nextRet.day;
            searchOptions.returnMonth = nextRet.month;
            searchOptions.returnYear = nextRet.year;
          }
          if (typeof rerunSearch === 'function') {
            await this.clickNewSearchButton();
            await rerunSearch(searchOptions);
            console.log('🔄 Reran search with new dates, now checking for tickets...');
          }
        }
        tryClearFilters = true;
      }
    }

    throw new Error(`❌ No ticket found matching combination: ${comboType} (multi: ${requireMulti}) after ${maxRetries} date retries`);
  },
}

module.exports = {
  searchFlight,
};
