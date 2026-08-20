// Add this to your Hotels test or as a utility in wallaTourspage.js

async function logHotelSearchFormHTML() {
    // Try several possible selectors for the main hotel search area
    const selectors = [
        'form', // any form
        '.hotel-search', // class
        '#hotel_search', // id
        '.search-panel', // class
        '.search', // class
        'body' // fallback: whole page
    ];
    for (const selector of selectors) {
        const el = await $(selector);
        if (await el.isExisting()) {
            const html = await el.getHTML(false);
            console.log(`--- Hotel Search Form HTML for selector "${selector}" ---\n`, html);
            return;
        }
    }
    console.log('❌ Hotel search form not found. Try a different selector.');
};
// You can place this in helper.js or directly in your test file

async function logHotelResultsHTML() {
    // Try to select the main results container, adjust selector as needed
    const selectors = [
        '.hotel-results-list', // common class for results
        '.results',            // generic
        '#results',            // id
        'body'                 // fallback: whole page
    ];
    for (const selector of selectors) {
        const el = await $(selector);
        if (await el.isExisting()) {
            const html = await el.getHTML(false);
            console.log(`--- Hotel Results HTML for selector "${selector}" ---\n`, html);
            return;
        }
    }
    console.log('❌ Hotel results container not found. Try a different selector.');
};

function getHebrewDayOfWeek(year, month, day) {
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const date = new Date(year, month - 1, day);
  return days[date.getDay()];
}

function pad(n) {
  return n < 10 ? '0' + n : n;
}

function formatLoaderDates({ departureDay, departureMonth, departureYear, returnDay, returnMonth, returnYear }) {
  const depDayOfWeek = getHebrewDayOfWeek(departureYear, departureMonth, departureDay);
  const retDayOfWeek = getHebrewDayOfWeek(returnYear, returnMonth, returnDay);
  const depDate = `${pad(departureDay)}.${pad(departureMonth)}.${String(departureYear).slice(-2)}`;
  const retDate = `${pad(returnDay)}.${pad(returnMonth)}.${String(returnYear).slice(-2)}`;
  return `${depDayOfWeek} - ${depDate} - ${retDayOfWeek} - ${retDate}`;
}
async function safeClick(target, { timeout = 5000, scroll = true, retry = 1 } = {}) {
  const el = typeof target === 'string' ? await $(target) : target;

  if (scroll) {
    await el.scrollIntoView({ block: 'center' });
  }

  await el.waitForDisplayed({ timeout });

  try {
    await el.click();
  } catch (err) {
    // JS fallback in case of intercepts/overlays
    try {
      await browser.execute(node => node.click(), el);
    } catch (fallbackErr) {
      if (retry > 0) {
        await browser.pause(250);
        return safeClick(el, { timeout, scroll, retry: retry - 1 });
      }
      throw err;
    }
  }
}

async function safeSetValue(target, value, { timeout = 5000, clear = true } = {}) {
  const el = typeof target === 'string' ? await $(target) : target;
  await el.waitForDisplayed({ timeout });
  if (clear) {
    await el.click();
    await browser.keys(['Control', 'a']); // mac: use 'Meta' if needed
    await browser.keys('Backspace');
  }
  await el.setValue(String(value));
}

module.exports = {
    logHotelSearchFormHTML,
    logHotelResultsHTML, 
    getHebrewDayOfWeek,
    formatLoaderDates,
    safeClick, safeSetValue
};