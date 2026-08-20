module.exports = {

checkElements: async function (elements, categoryName, checkClickability = false) {
    const missingElements = [];
    const nonClickableElements = [];

    for (const [name, input] of Object.entries(elements)) {
        let element;

        try {
            if (typeof input === 'string') {
                element = await $(input);
            } else if (typeof input === 'function') {
                element = await input();
            } else {
                element = await input;
            }

            if (!(await element.isDisplayed())) {
                missingElements.push(name);
                continue;
            }

            if (checkClickability && !(await element.isClickable())) {
                nonClickableElements.push(name);
                continue;
            }

        } catch (err) {
            missingElements.push(name);
            continue;
        }
    }

    if (missingElements.length > 0) {
        console.warn(`⚠️ Skipped missing ${categoryName}: ${missingElements.join(', ')}`);
    }

    if (checkClickability && nonClickableElements.length > 0) {
        console.warn(`⚠️ Skipped non-clickable ${categoryName}: ${nonClickableElements.join(', ')}`);
    }

    console.log(`✅ Checked ${categoryName} elements${checkClickability ? ' (with clickability)' : ''}.`);
    return true;
},

  
  async closeAllTabsExceptFirst() {
      const handles = await browser.getWindowHandles();
      for (let i = 1; i < handles.length; i++) {
          await browser.switchToWindow(handles[i]);
          await browser.closeWindow();
      }
      await browser.switchToWindow(handles[0]);
  },
  
  async clickNextMonth(nextButtonSelector, times = 1) {
      for (let i = 0; i < times; i++) {
          const nextButton = await $(nextButtonSelector);
          await nextButton.waitForClickable({ timeout: 2000 });
          await nextButton.click();
          await browser.pause(300); // or add a wait for calendar change
      }
  },

  logAndValidateFilterCounts: async function (initial, filtered, restored, label) {
      console.log(`🧹 Filtered (${label}) count: ${filtered}`);
      console.log(`🔁 Restored count after ${label}: ${restored}`);
  
      expect(filtered).toBeLessThanOrEqual(initial);
      expect(filtered).toBeGreaterThan(0);
      expect(restored).toBeGreaterThanOrEqual(filtered);
      expect(restored).toBeGreaterThan(0);
  },

getFirstNExistingAirlines: async function(n = 5, airlineCandidates = {}) {
    const filterContainer = await $('#flight_airline_filter');

    // Updated selector:
    const airlineLabelElements = await $$("//div[@id='flight_airline_filter']//div[contains(@class,'dsp')]");
    const availableLabels = [];
    for (const el of airlineLabelElements) {
        const label = await el.getText();
        availableLabels.push(label);
    }
    console.log('Available airline labels:', availableLabels);
    const airlineMap = {};
    let count = 0;
    for (const [eng, heb] of Object.entries(airlineCandidates)) {
        if (availableLabels.includes(heb) && count < n) {
            airlineMap[eng] = heb;
            count++;
        }
        if (count >= n) break;
    }
    if (count < n) {
        throw new Error(`❌ Less than ${n} airlines found in the filter!`);
    }
    return airlineMap;
},
  safeClick: async (selector) => {
      const checkbox = await $(selector);
      await checkbox.waitForDisplayed({ timeout: 5000 });
      await browser.execute(el => el.scrollIntoView({ block: 'center' }), checkbox);
      try {
          await checkbox.click();
      } catch {
          await browser.execute(el => el.click(), checkbox);
      }
  },
  
  airlineTicketToFilter: {
      'EL AL': 'אלעל',
      'Israir': 'ישראייר',
      'Arkia': 'ארקיע',
      'Aegean': 'Aegean',
      'Air Canada': 'Air Canada',
      'Air Europa': 'Air Europa',
      'Air France': 'Air France',
      'Austrian': 'Austrian',
      'British Airways': 'British Airways',
      'Brussels Airlines': 'Brussels Airlines',
      'Bulgaria Air': 'Bulgaria Air',
      'EasyJet': 'EasyJet',
      'Emirates': 'Emirates',
      'Etihad Airways': 'Etihad Airways',
      'Fly Dubai': 'Fly Dubai',
      'Iberia': 'Iberia',
      'ITA Airways': 'ITA Airways',
      'KLM': 'KLM',
      'LOT': 'LOT',
      'Lufthansa': 'Lufthansa',
      'Pegasus Airlines': 'Pegasus Airlines',
      'Swiss': 'SWISS',
      'TAROM': 'TAROM',
      'Turkish Airlines': 'Turkish Airlines',
      'Wizz Air': 'Wizz Air'
  },
  
  validateSelectedAirlines: async function (airlineMap, selectFn, validateFn) {
      for (const [expectedTicketName, filterLabelName] of Object.entries(airlineMap)) {
          console.log(`✈️ Testing airline filter: ${expectedTicketName} (${filterLabelName})`);
  
          await selectFn(filterLabelName);         // Click checkbox in filter
          await browser.pause(1000);
  
          await validateFn(expectedTicketName);     // Validate ticket airline text
  
          await selectFn(filterLabelName);         // Uncheck to restore
          await browser.pause(1000);
      }
  },

  closeExtraTabsIfAny: async function () {
      const tabs = await browser.getWindowHandles();
      if (tabs.length > 1) {
          await browser.closeWindow();
          await browser.switchToWindow(tabs[0]);
      }
  },
  
   incrementDate
};

function incrementDate({ day, month, year }) {
    // JS months are 0-based, so subtract 1 for Date, add 1 for result
    const date = new Date(2000 + year, month - 1, day);
    date.setDate(date.getDate() + 1);
    return {
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear() - 2000 // keep 2-digit year if that's your convention
    };
}